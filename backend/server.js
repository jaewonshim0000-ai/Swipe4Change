<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const OPENROUTER_API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();
const OPENROUTER_MODEL = (process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash').trim();
const OPENROUTER_SITE_URL = (process.env.OPENROUTER_SITE_URL || 'http://localhost:8081').trim();
const OPENROUTER_APP_NAME = (process.env.OPENROUTER_APP_NAME || 'Swipe4Change').trim();
const REPORT_EMAIL_TO = (process.env.REPORT_EMAIL_TO || 'jaewonshim0000@gmail.com').trim();
const REPORT_EMAIL_FROM = (process.env.REPORT_EMAIL_FROM || 'Swipe4Change <onboarding@resend.dev>').trim();
const RESEND_API_KEY = (process.env.RESEND_API_KEY || '').trim();
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const DB_PATH = path.join(__dirname, 'data', 'local-db.json');
const defaultMemory = {
  petitions: [],
  users: [],
  signatures: [],
  saved: [],
  notifications: [],
  reports: [],
};

const loadMemory = () => {
  try {
    if (!fs.existsSync(DB_PATH)) return { ...defaultMemory };
    return { ...defaultMemory, ...JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) };
  } catch (error) {
    console.warn('Local DB load failed:', error.message);
    return { ...defaultMemory };
  }
};

const memory = loadMemory();

const persistMemory = () => {
  if (supabase) return;
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(memory, null, 2));
  } catch (error) {
    console.warn('Local DB save failed:', error.message);
  }
};

const DEFAULT_TAG_OPTIONS = {
  Climate: ['clean-energy', 'emissions', 'public-lands', 'climate-justice', 'transit', 'resilience'],
  'Human Rights': ['justice', 'equity', 'civil-rights', 'youth', 'workers', 'safety'],
  Education: ['schools', 'students', 'teachers', 'funding', 'accessibility', 'curriculum'],
  Privacy: ['data-rights', 'children', 'consent', 'surveillance', 'security', 'transparency'],
  Housing: ['affordable-housing', 'renters', 'homelessness', 'zoning', 'tenant-rights', 'vouchers'],
  Health: ['mental-health', 'public-health', 'care-access', 'prevention', 'counseling', 'insurance'],
  Wildlife: ['habitat', 'migration', 'endangered-species', 'conservation', 'public-lands', 'biodiversity'],
  Ocean: ['plastic', 'coastal', 'marine-life', 'fishing', 'water-quality', 'reef-protection'],
};

const CATEGORIES = Object.keys(DEFAULT_TAG_OPTIONS);
const URGENCIES = ['low', 'medium', 'high', 'critical'];

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));

const required = (body, fields) => fields.filter((field) => !body?.[field]);

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const splitName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'New',
    lastName: parts.slice(1).join(' ') || 'User',
  };
};

const encryptSensitive = (value) => {
  if (!value || !ENCRYPTION_KEY) return value || null;

  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
};

const decryptSensitive = (value) => {
  if (!value || !ENCRYPTION_KEY || !String(value).startsWith('enc:v1:')) return value || null;
  try {
    const [, , iv64, tag64, encrypted64] = String(value).split(':');
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv64, 'base64'));
    decipher.setAuthTag(Buffer.from(tag64, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted64, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch (error) {
    console.warn('Signature decrypt failed:', error.message);
    return null;
  }
};

const extractChatContent = (response) => {
  const content = response?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => part.text || part.content || '')
      .join('\n')
      .trim();
  }
  return '';
};

const clampDraft = (draft, fallbackCategory, tagOptions) => {
  const category = CATEGORIES.includes(draft.category) ? draft.category : fallbackCategory;
  const allowedTags = tagOptions[category] || DEFAULT_TAG_OPTIONS[category] || [];
  const urgency = URGENCIES.includes(draft.urgency) ? draft.urgency : 'medium';

  return {
    category,
    title: String(draft.title || '').slice(0, 80),
    location: String(draft.location || '').slice(0, 80),
    summary: String(draft.summary || '').slice(0, 160),
    why: String(draft.why || draft.description || '').slice(0, 800),
    ask: String(draft.ask || '').slice(0, 300),
    urgency,
    recipient: String(draft.recipient || '').slice(0, 120),
    goal: Math.max(100, Math.min(10000000, Number(draft.goal || 1000))),
    tags: (draft.tags || []).filter((tag) => allowedTags.includes(tag)).slice(0, 4),
  };
};

const petitionToRow = (petition) => ({
  title: petition.title,
  summary: petition.summary,
  description: petition.why || petition.description || petition.summary,
  ask: petition.ask,
  image_url: petition.imageUrl || petition.image_url || null,
  category: petition.category,
  organization: petition.organization,
  location: petition.location,
  urgency: petition.urgency || 'medium',
  recipient: petition.recipient,
  tags: petition.tags || [],
  signature_goal: Number(petition.goal || petition.signature_goal || 100),
  current_signatures: Number(petition.signed || petition.current_signatures || 0),
  weekly_increase: Number(petition.weeklyIncrease || petition.weekly_increase || 0),
  verified: Boolean(petition.verified),
  status: petition.status || 'pending',
});

const rowToPetition = (row) => ({
  id: row.id,
  title: row.title,
  summary: row.summary,
  why: row.description,
  ask: row.ask,
  imageUrl: row.image_url,
  category: row.category,
  organization: row.organization,
  location: row.location,
  urgency: row.urgency,
  recipient: row.recipient,
  tags: row.tags || [],
  goal: row.signature_goal,
  signed: row.current_signatures,
  weeklyIncrease: row.weekly_increase,
  verified: row.verified,
  status: row.status,
  daysLeft: 30,
});

const rowToUser = (row) => row && ({
  id: row.firebase_uid || row.id,
  dbId: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  location: row.location,
  address: row.address,
  interests: row.interests || [],
  signature: decryptSensitive(row.signature),
  profilePic: row.profile_pic_url,
  twoFactorEnabled: Boolean(row.two_factor_enabled),
  twoFactorMethod: row.two_factor_method,
  phoneNumber: row.phone_number,
  phoneVerified: Boolean(row.phone_verified),
  phoneVerifiedAt: row.phone_verified_at,
});

const sendReportEmail = async ({ report, petition, reporter }) => {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not configured; report email was not sent.');
    return false;
  }

  const subject = `[Swipe4Change Report] ${report.reason} - ${petition.title}`;
  const html = `
    <h2>Petition Report</h2>
    <p><strong>Reason:</strong> ${escapeHtml(report.reason)}</p>
    <p><strong>Details:</strong> ${escapeHtml(report.details || 'No details provided.')}</p>
    <hr />
    <p><strong>Petition:</strong> ${escapeHtml(petition.title)}</p>
    <p><strong>Category:</strong> ${escapeHtml(petition.category)}</p>
    <p><strong>Location:</strong> ${escapeHtml(petition.location)}</p>
    <p><strong>Organization:</strong> ${escapeHtml(petition.organization)}</p>
    <p><strong>Recipient:</strong> ${escapeHtml(petition.recipient)}</p>
    <p><strong>Petition ID:</strong> ${escapeHtml(report.petitionId)}</p>
    <hr />
    <p><strong>Reporter:</strong> ${escapeHtml(reporter.name)}</p>
    <p><strong>Reporter email:</strong> ${escapeHtml(reporter.email)}</p>
    <p><strong>Reporter ID:</strong> ${escapeHtml(report.reporterFirebaseUid)}</p>
    <p><strong>Created:</strong> ${escapeHtml(report.createdAt)}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: REPORT_EMAIL_FROM,
      to: [REPORT_EMAIL_TO],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Resend email failed with ${response.status}`);
  }

  return true;
};

async function ensureUser(profile = {}) {
  const firebaseUid = profile.firebaseUid || profile.firebase_uid;
  if (!firebaseUid) return null;

  const name = splitName(profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`);
  const existing = memory.users.find((user) => user.firebase_uid === firebaseUid);
  const row = {
    firebase_uid: firebaseUid,
    first_name: profile.firstName || existing?.first_name || name.firstName,
    last_name: profile.lastName || existing?.last_name || name.lastName,
    email: profile.email || existing?.email || `${firebaseUid}@swipe4change.local`,
    updated_at: new Date().toISOString(),
  };

  if (profile.location !== undefined) row.location = profile.location;
  if (profile.address !== undefined) row.address = profile.address;
  if (profile.interests !== undefined) row.interests = profile.interests;
  if (profile.signature !== undefined) row.signature = encryptSensitive(profile.signature);
  if (profile.profilePicUrl !== undefined) row.profile_pic_url = profile.profilePicUrl;
  if (profile.twoFactorEnabled !== undefined) row.two_factor_enabled = Boolean(profile.twoFactorEnabled);
  if (profile.twoFactorMethod !== undefined) row.two_factor_method = profile.twoFactorMethod;
  if (profile.phoneNumber !== undefined) row.phone_number = profile.phoneNumber;
  if (profile.phoneVerified !== undefined) row.phone_verified = Boolean(profile.phoneVerified);
  if (profile.phoneVerifiedAt !== undefined) row.phone_verified_at = profile.phoneVerifiedAt;

  if (!supabase) {
    if (existing) Object.assign(existing, row);
    else memory.users.push({ id: `u_${memory.users.length + 1}`, ...row });
    persistMemory();
    return memory.users.find((user) => user.firebase_uid === firebaseUid);
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(row, { onConflict: 'firebase_uid' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'swipe4change-api',
    database: supabase ? 'supabase' : 'memory',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: supabase ? 'supabase' : 'memory' });
});

app.get('/api/petitions', async (req, res, next) => {
  try {
    const { category, search, sort = 'trending' } = req.query;
    let rows;

    if (supabase) {
      let query = supabase.from('petitions').select('*').in('status', ['approved', 'active', 'pending']);
      if (category) query = query.eq('category', category);
      if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,organization.ilike.%${search}%,location.ilike.%${search}%`);
      const order = sort === 'newest' ? 'created_at' : sort === 'urgent' ? 'urgency' : 'current_signatures';
      const { data, error } = await query.order(order, { ascending: sort === 'urgent' ? true : false });
      if (error) throw error;
      rows = data;
    } else {
      rows = [...memory.petitions];
      if (category) rows = rows.filter((petition) => petition.category === category);
      if (search) {
        const q = String(search).toLowerCase();
        rows = rows.filter((petition) => (
          petition.title.toLowerCase().includes(q) ||
          petition.summary.toLowerCase().includes(q) ||
          petition.organization.toLowerCase().includes(q) ||
          petition.location.toLowerCase().includes(q)
        ));
      }
    }

    res.json({ petitions: rows.map(rowToPetition) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/petitions/:id', async (req, res, next) => {
  try {
    if (!supabase) {
      const petition = memory.petitions.find((item) => item.id === req.params.id);
      if (!petition) return res.status(404).json({ error: 'Petition not found' });
      return res.json({ petition: rowToPetition(petition) });
    }

    const { data, error } = await supabase.from('petitions').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    return res.json({ petition: rowToPetition(data) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/petitions', async (req, res, next) => {
  try {
    const petition = req.body.petition || req.body;
    const missing = required(petition, ['title', 'summary', 'ask', 'category', 'location', 'recipient']);
    if (missing.length) return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });

    const row = petitionToRow(petition);
    if (!supabase) {
      const saved = { id: petition.id || `p_${Date.now()}`, ...row };
      memory.petitions.unshift(saved);
      persistMemory();
      return res.status(201).json({ petition: rowToPetition(saved) });
    }

    const user = await ensureUser({ firebaseUid: req.body.firebaseUid, ...(req.body.user || {}) });
    const { data, error } = await supabase
      .from('petitions')
      .insert({ ...row, created_by: user?.id || null })
      .select()
      .single();
    if (error) throw error;

    return res.status(201).json({ petition: rowToPetition(data) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/ai/petition-draft', async (req, res, next) => {
  try {
    const { topic, notes = '', category, interests = [], location = '', tagOptions = DEFAULT_TAG_OPTIONS } = req.body;
    if (!topic || String(topic).trim().length < 3) {
      return res.status(400).json({ error: 'Topic is required.' });
    }
    if (!OPENROUTER_API_KEY || !OPENROUTER_API_KEY.startsWith('sk-or-v1-')) {
      return res.status(503).json({
        error: 'OPENROUTER_API_KEY is missing or malformed. It should start with sk-or-v1-.',
      });
    }

    const fallbackCategory = CATEGORIES.includes(category)
      ? category
      : interests.find((interest) => CATEGORIES.includes(interest)) || 'Climate';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': OPENROUTER_SITE_URL,
        'X-OpenRouter-Title': OPENROUTER_APP_NAME,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: [
              'You draft civic petitions for Swipe4Change.',
              'Return a practical, truthful petition draft based only on the user input.',
              'Do not invent exact statistics, laws, or named events unless provided by the user.',
              'Choose exactly one category from the provided categories.',
              'Choose tags only from the allowed tags for that category.',
              'Use clear, public-facing language suitable for a petition card.',
            ].join(' '),
          },
          {
            role: 'user',
            content: JSON.stringify({
              topic,
              notes,
              category: fallbackCategory,
              interests,
              location,
              categories: CATEGORIES,
              allowedTagsByCategory: tagOptions,
            }),
          },
        ],
        max_tokens: 900,
        temperature: 0.4,
        provider: {
          require_parameters: true,
        },
        plugins: [
          { id: 'response-healing' },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'petition_draft',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['category', 'title', 'location', 'summary', 'why', 'ask', 'urgency', 'recipient', 'goal', 'tags'],
              properties: {
                category: { type: 'string', enum: CATEGORIES },
                title: { type: 'string' },
                location: { type: 'string' },
                summary: { type: 'string' },
                why: { type: 'string' },
                ask: { type: 'string' },
                urgency: { type: 'string', enum: URGENCIES },
                recipient: { type: 'string' },
                goal: { type: 'integer' },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      }),
    });

    const body = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: body.error?.message || 'OpenRouter request failed.' });
    }

    const text = extractChatContent(body);
    const draft = clampDraft(JSON.parse(text), fallbackCategory, tagOptions);
    return res.json({ draft });
  } catch (error) {
    next(error);
  }
});

app.post('/api/sign', async (req, res, next) => {
  try {
    const { firebaseUid, petitionId, comment, signer = {} } = req.body;
    if (!firebaseUid || !petitionId) return res.status(400).json({ error: 'firebaseUid and petitionId are required' });

    const user = await ensureUser({ firebaseUid, ...signer });

    if (!supabase) {
      if (!memory.signatures.some((item) => item.firebaseUid === firebaseUid && item.petitionId === petitionId)) {
        memory.signatures.push({ firebaseUid, petitionId, comment, created_at: new Date().toISOString() });
        const petition = memory.petitions.find((item) => item.id === petitionId);
        if (petition) {
          petition.current_signatures = Number(petition.current_signatures || 0) + 1;
          petition.weekly_increase = Number(petition.weekly_increase || 0) + 1;
        }
        persistMemory();
      }
      return res.status(201).json({ signed: true });
    }

    const { error: insertError } = await supabase
      .from('signatures')
      .insert({ user_id: user.id, petition_id: petitionId, comment });
    if (insertError && insertError.code !== '23505') throw insertError;

    if (!insertError) {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: totalCount, error: totalError } = await supabase
        .from('signatures')
        .select('id', { count: 'exact', head: true })
        .eq('petition_id', petitionId);
      if (totalError) throw totalError;

      const { count: weeklyCount, error: weeklyError } = await supabase
        .from('signatures')
        .select('id', { count: 'exact', head: true })
        .eq('petition_id', petitionId)
        .gte('created_at', weekAgo);
      if (weeklyError) throw weeklyError;

      const { error: updateError } = await supabase
        .from('petitions')
        .update({
          current_signatures: Number(totalCount || 0),
          weekly_increase: Number(weeklyCount || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', petitionId);
      if (updateError) throw updateError;
    }

    return res.status(201).json({ signed: true, duplicate: insertError?.code === '23505' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/report', async (req, res, next) => {
  try {
    const { petitionId, reason, details = '', reporter = {}, firebaseUid } = req.body;
    if (!petitionId || !reason) {
      return res.status(400).json({ error: 'petitionId and reason are required' });
    }

    const reporterFirebaseUid = firebaseUid || reporter.id || 'anonymous';
    const reporterName = reporter.name || `${reporter.firstName || ''} ${reporter.lastName || ''}`.trim() || 'Anonymous reporter';
    const reporterEmail = reporter.email || 'unknown';
    const createdAt = new Date().toISOString();

    let petition;
    if (supabase) {
      const { data, error } = await supabase
        .from('petitions')
        .select('*')
        .eq('id', petitionId)
        .maybeSingle();
      if (error) throw error;
      petition = data ? rowToPetition(data) : req.body.petition;
    } else {
      const row = memory.petitions.find((item) => item.id === petitionId);
      petition = row ? rowToPetition(row) : req.body.petition;
    }

    if (!petition) return res.status(404).json({ error: 'Petition not found' });

    const report = {
      id: `r_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      petitionId,
      reason,
      details,
      reporterFirebaseUid,
      reporterEmail,
      createdAt,
      status: 'pending',
    };

    let storedReport = report;
    if (supabase) {
      const user = reporterFirebaseUid !== 'anonymous'
        ? await ensureUser({
            firebaseUid: reporterFirebaseUid,
            firstName: reporter.firstName,
            lastName: reporter.lastName,
            email: reporterEmail,
          })
        : null;

      const { data, error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user?.id || null,
          reporter_email: reporterEmail,
          reported_item_type: 'petition',
          reported_item_id: petitionId,
          reason,
          details,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      storedReport = { ...report, id: data.id };
    } else {
      memory.reports.unshift(report);
      persistMemory();
    }

    let emailSent = false;
    try {
      emailSent = await sendReportEmail({
        report,
        petition,
        reporter: { name: reporterName, email: reporterEmail },
      });
    } catch (emailError) {
      console.warn('Report email failed:', emailError.message);
    }

    return res.status(201).json({ report: storedReport, emailSent });
  } catch (error) {
    next(error);
  }
});

app.post('/api/user', async (req, res, next) => {
  try {
    const user = await ensureUser(req.body);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

app.get('/api/user/:firebaseUid', async (req, res, next) => {
  try {
    if (!supabase) {
      const user = memory.users.find((item) => item.firebase_uid === req.params.firebaseUid);
      return res.json({ user: rowToUser(user) || null });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', req.params.firebaseUid)
      .maybeSingle();
    if (error) throw error;
    return res.json({ user: rowToUser(data) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/save', async (req, res, next) => {
  try {
    const { firebaseUid, petitionId, saved = true } = req.body;
    if (!firebaseUid || !petitionId) return res.status(400).json({ error: 'firebaseUid and petitionId are required' });
    const user = await ensureUser({ firebaseUid });

    if (!supabase) {
      memory.saved = memory.saved.filter((item) => !(item.firebaseUid === firebaseUid && item.petitionId === petitionId));
      if (saved) memory.saved.push({ firebaseUid, petitionId, created_at: new Date().toISOString() });
      persistMemory();
      return res.json({ saved });
    }

    const request = saved
      ? supabase.from('saved_petitions').upsert({ user_id: user.id, petition_id: petitionId })
      : supabase.from('saved_petitions').delete().match({ user_id: user.id, petition_id: petitionId });
    const { error } = await request;
    if (error) throw error;
    return res.json({ saved });
  } catch (error) {
    next(error);
  }
});

app.get('/api/user/:firebaseUid/signatures', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.json({ signatures: memory.signatures.filter((item) => item.firebaseUid === req.params.firebaseUid) });
    }

    const user = await ensureUser({ firebaseUid: req.params.firebaseUid });
    const { data, error } = await supabase.from('signatures').select('*').eq('user_id', user.id);
    if (error) throw error;
    return res.json({ signatures: data });
  } catch (error) {
    next(error);
  }
});

app.get('/api/user/:firebaseUid/saved', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.json({ saved: memory.saved.filter((item) => item.firebaseUid === req.params.firebaseUid) });
    }

    const user = await ensureUser({ firebaseUid: req.params.firebaseUid });
    const { data, error } = await supabase.from('saved_petitions').select('*').eq('user_id', user.id);
    if (error) throw error;
    return res.json({ saved: data });
  } catch (error) {
    next(error);
  }
});

app.get('/api/user/:firebaseUid/notifications', async (req, res, next) => {
  try {
    if (!supabase) {
      return res.json({ notifications: memory.notifications.filter((item) => item.firebaseUid === req.params.firebaseUid) });
    }

    const user = await ensureUser({ firebaseUid: req.params.firebaseUid });
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ notifications: data });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
=======
// Swipe4Change Backend API — Deploy to Render.com
// Setup: Create a new Web Service on Render, point to this folder,
// set build command: npm install, start command: node server.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', service: 'swipe4change-api' }));
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

// --- API Routes (connect to Supabase in production) ---

// Petitions
app.get('/api/petitions', (req, res) => {
  // In production: query Supabase petitions table with filters
  res.json({ message: 'GET /api/petitions — connect to Supabase' });
});

app.get('/api/petitions/:id', (req, res) => {
  res.json({ message: `GET /api/petitions/${req.params.id}` });
});

app.post('/api/petitions', (req, res) => {
  // Create petition — validate, save to Supabase
  res.json({ message: 'POST /api/petitions', data: req.body });
});

// Signatures
app.post('/api/sign', (req, res) => {
  // Record signature — increment count, save to signatures table
  res.json({ message: 'POST /api/sign', data: req.body });
});

app.get('/api/user/:id/signatures', (req, res) => {
  res.json({ message: `GET /api/user/${req.params.id}/signatures` });
});

// Users
app.post('/api/user', (req, res) => {
  res.json({ message: 'POST /api/user', data: req.body });
});

app.get('/api/user/:id', (req, res) => {
  res.json({ message: `GET /api/user/${req.params.id}` });
});

// Saved
app.post('/api/save', (req, res) => {
  res.json({ message: 'POST /api/save', data: req.body });
});

app.get('/api/user/:id/saved', (req, res) => {
  res.json({ message: `GET /api/user/${req.params.id}/saved` });
});

// Notifications
app.get('/api/user/:id/notifications', (req, res) => {
  res.json({ message: `GET /api/user/${req.params.id}/notifications` });
});

// Comments
app.post('/api/comment', (req, res) => {
  res.json({ message: 'POST /api/comment', data: req.body });
>>>>>>> 05775e151d80f152aef53ed06bc50aff42569ebe
});

app.listen(PORT, () => {
  console.log(`Swipe4Change API running on port ${PORT}`);
});
