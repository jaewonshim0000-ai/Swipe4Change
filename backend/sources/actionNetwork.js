// Action Network integration — hosts this app's petitions as real petitions
// and records real signatures via the OSDI API.
// Docs: https://actionnetwork.org/docs/  (API key: Start Organizing → Details → API & Sync)
// Dormant until ACTION_NETWORK_API_KEY is set.

const API_BASE = 'https://actionnetwork.org/api/v2';
const API_KEY = (process.env.ACTION_NETWORK_API_KEY || '').trim();
const CACHE_TTL_MS = 5 * 60 * 1000;

const ACTION_NETWORK_ENABLED = Boolean(API_KEY);

const anFetch = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'OSDI-API-Token': API_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Action Network ${path} responded ${response.status}: ${body.slice(0, 200)}`);
  }
  return response.json();
};

const idFromResource = (resource) => {
  const ids = resource?.identifiers || [];
  const own = ids.find((identifier) => identifier.startsWith('action_network:'));
  return own ? own.split(':')[1] : null;
};

const stripHtml = (value = '') => String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const toPetition = (resource, signatureCount = 0) => {
  const anId = idFromResource(resource);
  const description = stripHtml(resource.description || '');
  return {
    id: `an_${anId}`,
    actionNetworkId: anId,
    title: resource.title,
    summary: description.slice(0, 160) || resource.title,
    why: description || resource.title,
    ask: stripHtml(resource.petition_text || '') || 'Add your signature to this petition.',
    category: 'Human Rights',
    organization: 'Swipe4Change on Action Network',
    location: 'United States',
    urgency: 'medium',
    recipient: (resource.target || []).map((target) => target.name).join(', ') || 'Decision makers',
    tags: ['action-network'],
    goal: 1000,
    signed: signatureCount,
    weeklyIncrease: 0,
    daysLeft: 30,
    verified: true,
    status: 'active',
    external: true,
    canSignInApp: true,
    source: 'actionnetwork.org',
    sourceLabel: 'ACTION NETWORK',
    externalUrl: resource.browser_url,
    actionLabel: 'Sign this petition',
  };
};

let cache = { at: 0, petitions: [] };

async function getActionNetworkPetitions() {
  if (!ACTION_NETWORK_ENABLED) return [];
  if (Date.now() - cache.at < CACHE_TTL_MS) return cache.petitions;

  try {
    const body = await anFetch('/petitions/');
    const resources = body?._embedded?.['osdi:petitions'] || [];
    const petitions = await Promise.all(resources.map(async (resource) => {
      const anId = idFromResource(resource);
      let count = 0;
      try {
        const signatures = await anFetch(`/petitions/${anId}/signatures/`);
        count = Number(signatures.total_records || 0);
      } catch (error) {
        console.warn('Action Network signature count failed:', error.message);
      }
      return toPetition(resource, count);
    }));
    cache = { at: Date.now(), petitions };
    return petitions;
  } catch (error) {
    console.warn('Action Network fetch failed:', error.message);
    return cache.petitions;
  }
}

// Mirrors an app-created petition to Action Network. Returns { anId, browserUrl } or null.
async function createActionNetworkPetition(petition) {
  if (!ACTION_NETWORK_ENABLED) return null;
  try {
    const body = await anFetch('/petitions/', {
      method: 'POST',
      body: JSON.stringify({
        title: petition.title,
        description: petition.why || petition.description || petition.summary,
        petition_text: petition.ask || petition.summary,
        target: petition.recipient ? [{ name: petition.recipient }] : [],
      }),
    });
    const anId = idFromResource(body);
    cache = { at: 0, petitions: [] }; // force refresh so the new petition shows up
    return anId ? { anId, browserUrl: body.browser_url } : null;
  } catch (error) {
    console.warn('Action Network petition create failed:', error.message);
    return null;
  }
}

// Records a real signature on an Action Network petition.
async function signActionNetworkPetition(anId, { name = '', email, comment = '', location = '' }) {
  if (!ACTION_NETWORK_ENABLED) throw new Error('Action Network is not configured.');
  if (!email) throw new Error('A signer email is required.');

  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const person = {
    given_name: parts[0] || 'Supporter',
    family_name: parts.slice(1).join(' ') || '',
    email_addresses: [{ address: email }],
  };
  if (location) person.postal_addresses = [{ locality: location }];

  await anFetch(`/petitions/${anId}/signatures/`, {
    method: 'POST',
    body: JSON.stringify({ ...(comment ? { comments: comment } : {}), person }),
  });
  cache = { at: 0, petitions: [] };
  return true;
}

module.exports = {
  ACTION_NETWORK_ENABLED,
  getActionNetworkPetitions,
  createActionNetworkPetition,
  signActionNetworkPetition,
};
