// Regulations.gov integration — pulls proposed federal rules that are open
// for public comment and maps them into the app's petition shape.
// Docs: https://open.gsa.gov/api/regulationsgov/  (free key: api.data.gov/signup)

const API_BASE = 'https://api.regulations.gov/v4';
const API_KEY = (process.env.REGULATIONS_GOV_API_KEY || 'DEMO_KEY').trim();
const CACHE_TTL_MS = 30 * 60 * 1000; // DEMO_KEY is heavily rate-limited; cache aggressively.
const PAGE_SIZE = 25;

// Agency → app category. Keyword fallback below handles the rest.
const AGENCY_CATEGORY = {
  EPA: 'Climate', DOE: 'Climate', FERC: 'Climate',
  FWS: 'Wildlife', APHIS: 'Wildlife', BLM: 'Wildlife', FS: 'Wildlife', NPS: 'Wildlife',
  NOAA: 'Ocean', USCG: 'Ocean',
  ED: 'Education',
  HHS: 'Health', CMS: 'Health', FDA: 'Health', CDC: 'Health', SAMHSA: 'Health',
  HUD: 'Housing', FHFA: 'Housing',
  DOJ: 'Human Rights', EEOC: 'Human Rights', DOL: 'Human Rights', OSHA: 'Human Rights', USCIS: 'Human Rights',
  FTC: 'Privacy', FCC: 'Privacy',
};

const AGENCY_NAMES = {
  EPA: 'Environmental Protection Agency', DOE: 'Department of Energy', FERC: 'Federal Energy Regulatory Commission',
  FWS: 'U.S. Fish and Wildlife Service', APHIS: 'Animal and Plant Health Inspection Service',
  BLM: 'Bureau of Land Management', FS: 'U.S. Forest Service', NPS: 'National Park Service',
  NOAA: 'National Oceanic and Atmospheric Administration', USCG: 'U.S. Coast Guard',
  ED: 'Department of Education', HHS: 'Department of Health and Human Services',
  CMS: 'Centers for Medicare & Medicaid Services', FDA: 'Food and Drug Administration',
  CDC: 'Centers for Disease Control and Prevention', SAMHSA: 'Substance Abuse and Mental Health Services Administration',
  HUD: 'Department of Housing and Urban Development', FHFA: 'Federal Housing Finance Agency',
  DOJ: 'Department of Justice', EEOC: 'Equal Employment Opportunity Commission',
  DOL: 'Department of Labor', OSHA: 'Occupational Safety and Health Administration',
  USCIS: 'U.S. Citizenship and Immigration Services',
  FTC: 'Federal Trade Commission', FCC: 'Federal Communications Commission',
  FAA: 'Federal Aviation Administration', DOT: 'Department of Transportation',
  IRS: 'Internal Revenue Service', SEC: 'Securities and Exchange Commission',
};

const KEYWORD_CATEGORY = [
  [/climat|carbon|emission|energy|pollut|clean air|clean water/i, 'Climate'],
  [/endangered|wildlife|species|habitat|grizzly|wolf|migratory/i, 'Wildlife'],
  [/fisher|ocean|marine|coastal|vessel|reef/i, 'Ocean'],
  [/school|student|education|teacher|loan/i, 'Education'],
  [/health|medicare|medicaid|drug|hospital|mental|insur/i, 'Health'],
  [/housing|rent|mortgage|homeless/i, 'Housing'],
  [/privacy|data|surveillance|telecom|broadband/i, 'Privacy'],
  [/civil rights|discriminat|labor|worker|wage|immigr/i, 'Human Rights'],
];

const categorize = (agencyId, title) => {
  if (AGENCY_CATEGORY[agencyId]) return AGENCY_CATEGORY[agencyId];
  const match = KEYWORD_CATEGORY.find(([pattern]) => pattern.test(title));
  return match ? match[1] : 'Human Rights';
};

const urgencyFromDays = (days) => {
  if (days <= 7) return 'critical';
  if (days <= 14) return 'high';
  if (days <= 30) return 'medium';
  return 'low';
};

const toPetition = (doc) => {
  const a = doc.attributes;
  const daysLeft = Math.max(0, Math.ceil((new Date(a.commentEndDate) - Date.now()) / 86400000));
  const agency = AGENCY_NAMES[a.agencyId] || a.agencyId;
  const closes = new Date(a.commentEndDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return {
    id: `reg_${doc.id}`,
    title: a.title.length > 110 ? `${a.title.slice(0, 107)}...` : a.title,
    summary: `Proposed federal rule from the ${agency}. Public comments are open until ${closes}.`,
    why: `${a.title}\n\nThis is a real proposed rule published in the Federal Register. During the open comment period, anyone can submit an official public comment that the agency is required to consider before finalizing the rule.`,
    ask: 'Read the proposal and submit an official public comment before the deadline.',
    category: categorize(a.agencyId, a.title),
    organization: agency,
    location: 'United States',
    urgency: urgencyFromDays(daysLeft),
    recipient: agency,
    tags: ['federal-register', 'public-comment'],
    goal: 0,
    signed: 0,
    weeklyIncrease: 0,
    daysLeft,
    verified: true,
    status: 'active',
    external: true,
    source: 'regulations.gov',
    sourceLabel: 'REGULATIONS.GOV',
    externalUrl: `https://www.regulations.gov/commenton/${doc.id}`,
    actionLabel: 'Submit a public comment',
  };
};

let cache = { at: 0, petitions: [] };
let inflight = null;

async function fetchFresh() {
  const url = `${API_BASE}/documents?filter%5BdocumentType%5D=Proposed%20Rule&sort=-postedDate&page%5Bsize%5D=${PAGE_SIZE}`;
  const response = await fetch(url, { headers: { 'X-Api-Key': API_KEY } });
  if (!response.ok) throw new Error(`Regulations.gov responded ${response.status}`);
  const body = await response.json();
  // Routine technical notices (aircraft directives, airspace tweaks) flood the
  // Federal Register but aren't meaningful civic actions — keep them out.
  const NOISE = /airworthiness directive|airspace designation|special conditions:|drawbridge operation|safety zone|amendment of class [a-z] airspace/i;

  return (body.data || [])
    .filter((doc) => doc.attributes?.openForComment && !doc.attributes?.withdrawn && doc.attributes?.commentEndDate)
    .filter((doc) => !NOISE.test(doc.attributes.title))
    .map(toPetition);
}

async function getRegulationsPetitions() {
  if (Date.now() - cache.at < CACHE_TTL_MS) return cache.petitions;
  if (inflight) return inflight;

  inflight = fetchFresh()
    .then((petitions) => {
      cache = { at: Date.now(), petitions };
      return petitions;
    })
    .catch((error) => {
      console.warn('Regulations.gov fetch failed:', error.message);
      return cache.petitions; // serve stale data rather than nothing
    })
    .finally(() => { inflight = null; });

  return inflight;
}

// Submits a real public comment through the official eRulemaking API.
// Two-step flow: obtain a one-time submission key, then post the comment.
// The comment becomes part of the federal public record.
async function submitRegulationsComment({ documentId, comment, firstName, lastName, email, city }) {
  if (!documentId || !comment?.trim()) throw new Error('documentId and comment are required.');

  const keyResponse = await fetch(`${API_BASE}/submission-keys`, {
    method: 'POST',
    headers: { 'X-Api-Key': API_KEY, 'Content-Type': 'application/vnd.api+json' },
    body: JSON.stringify({ data: { type: 'submission-keys' } }),
  });
  if (!keyResponse.ok) throw new Error(`Submission key request failed (${keyResponse.status})`);
  const keyBody = await keyResponse.json();
  const submissionKey = keyBody?.data?.attributes?.submissionKey;
  if (!submissionKey) throw new Error('No submission key returned.');

  const attributes = {
    commentOnDocumentId: documentId,
    comment: String(comment).slice(0, 5000),
    submissionType: 'API',
    submissionKey,
  };
  if (firstName) attributes.firstName = String(firstName).slice(0, 25);
  if (lastName) attributes.lastName = String(lastName).slice(0, 25);
  if (city) attributes.city = String(city).slice(0, 50);
  if (email) {
    attributes.email = email;
    attributes.sendEmailReceipt = true;
  }

  const response = await fetch(`${API_BASE}/comments`, {
    method: 'POST',
    headers: { 'X-Api-Key': API_KEY, 'Content-Type': 'application/vnd.api+json' },
    body: JSON.stringify({ data: { attributes, type: 'comments' } }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body?.errors?.[0]?.detail || body?.errors?.[0]?.title || `status ${response.status}`;
    throw new Error(`Comment submission failed: ${detail}`);
  }

  return {
    trackingNumber: body?.data?.attributes?.trackingNumber || body?.data?.id || null,
  };
}

module.exports = { getRegulationsPetitions, submitRegulationsComment };
