// Seed content ported verbatim from the Swipe4Change design (`P`, `COMMENTS`,
// `BADGES`, `NOTIFS`). Copy, numbers, image ids and ordering match the design.

// The design points every card at a specific Unsplash photo rather than
// choosing one from the category.
const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=900&q=60&fit=crop`;

export const SEED_PETITIONS = [
  {
    id: 'p1',
    title: 'Protect the Arctic Refuge',
    summary: 'Stop oil drilling in vital habitats before irreversible damage is done.',
    category: 'Climate',
    organization: 'World Wildlife Fund',
    location: 'Alaska, USA',
    signed: 842000,
    goal: 1000000,
    urgency: 'critical',
    daysLeft: 2,
    weeklyIncrease: 34200,
    image: IMG('1466611653911-95081537e5b7'),
    why: 'The Arctic National Wildlife Refuge spans 19.6 million acres supporting polar bears, caribou, and migratory birds. Proposed drilling would damage fragile tundra that takes centuries to recover.',
    ask: 'Permanently ban fossil fuel development in the Arctic Refuge.',
    affects: ["Indigenous Gwich'in communities", 'Global climate carbon sinks', 'Polar bear denning habitat'],
    tags: ['drilling', 'arctic', 'wildlife', 'oil'],
    verified: true,
    recipient: 'U.S. Department of the Interior',
  },
  {
    id: 'p2',
    title: 'Mandate Mental Health Days in Schools',
    summary: 'Give students the same recognition for mental health as physical health.',
    category: 'Health',
    organization: 'Mind Forward Alliance',
    location: 'National',
    signed: 124500,
    goal: 250000,
    urgency: 'high',
    daysLeft: 18,
    weeklyIncrease: 8900,
    image: IMG('1576091160399-112ba8d25d1d'),
    why: 'One in five adolescents experiences a serious mental health condition. This petition asks for mandatory counselor ratios and excused mental health absences.',
    ask: 'Require schools to allow excused mental health absences and hire more counselors.',
    affects: ['54M K-12 students', 'School counselors', 'Families of at-risk youth'],
    tags: ['mental-health', 'schools', 'students'],
    verified: true,
    recipient: 'U.S. Department of Education',
  },
  {
    id: 'p3',
    title: 'Ban Single-Use Plastics in Coastal Zones',
    summary: 'Phase out takeout plastics within five miles of the coastline.',
    category: 'Ocean',
    organization: 'Blue Horizon Coalition',
    location: 'Coastal US',
    signed: 318200,
    goal: 500000,
    urgency: 'high',
    daysLeft: 6,
    weeklyIncrease: 21400,
    image: IMG('1583212292454-1fe6229603b7'),
    why: 'Plastic pollution kills 100,000 marine mammals annually. A staged ban gives businesses time to transition without shocking local economies.',
    ask: 'Implement a 24-month phaseout of single-use plastics in coastal areas.',
    affects: ['Marine ecosystems', 'Coastal fishing communities', 'Seabird populations'],
    tags: ['plastic', 'ocean', 'coastal'],
    verified: true,
    recipient: 'EPA Administrator',
  },
  {
    id: 'p4',
    title: 'Digital Privacy Act for Minors',
    summary: 'Prohibit targeted advertising to users under sixteen.',
    category: 'Privacy',
    organization: 'Digital Rights Now',
    location: 'Federal',
    signed: 67000,
    goal: 150000,
    urgency: 'medium',
    daysLeft: 31,
    weeklyIncrease: 3200,
    image: IMG('1510511459019-5dda7724fd87'),
    why: "Children's behavioral data is collected at unprecedented rates, then used to build advertising profiles before they can legally consent.",
    ask: 'Require opt-in data collection and ban targeted ads for minors.',
    affects: ['Minors online', 'Parents and guardians', 'Ad-tech industry'],
    tags: ['privacy', 'children', 'data'],
    verified: true,
    recipient: 'Federal Trade Commission',
  },
  {
    id: 'p5',
    title: 'Affordable Housing Emergency Declaration',
    summary: 'Unlock federal funds for rapid rehousing and rent stabilization.',
    category: 'Housing',
    organization: 'Home for All',
    location: 'Urban metros',
    signed: 456800,
    goal: 750000,
    urgency: 'critical',
    daysLeft: 4,
    weeklyIncrease: 28700,
    image: IMG('1570129477492-45c003edd2be'),
    why: 'Rents have outpaced wages by 3x in the past decade, pushing essential workers out of the cities they serve.',
    ask: 'Declare a housing emergency and release stalled voucher funding.',
    affects: ['Renters in top 20 metros', 'Unhoused families', 'Essential workers'],
    tags: ['housing', 'rent', 'affordable'],
    verified: false,
    recipient: 'HUD Secretary',
  },
  {
    id: 'p6',
    title: 'Protect Migratory Bird Corridors',
    summary: 'Designate twelve critical flyway corridors as protected land.',
    category: 'Wildlife',
    organization: 'Audubon Defense League',
    location: 'Multi-state',
    signed: 92400,
    goal: 200000,
    urgency: 'medium',
    daysLeft: 22,
    weeklyIncrease: 4100,
    image: IMG('1474511320723-9a56873867b5'),
    why: 'Bird populations dropped 29% since 1970. Flyway corridors are the connective tissue that keeps migration viable.',
    ask: 'Permanently designate flyway corridors as protected land against development.',
    affects: ['3 billion birds annually', 'Wetland ecosystems', 'Eco-tourism economies'],
    tags: ['birds', 'migration', 'wildlife'],
    verified: true,
    recipient: 'U.S. Fish and Wildlife Service',
  },
  {
    id: 'p7',
    title: 'Teacher Pay Parity Initiative',
    summary: 'Bring starting teacher salaries in line with comparable professions.',
    category: 'Education',
    organization: 'Teach Forward',
    location: 'National',
    signed: 201300,
    goal: 400000,
    urgency: 'high',
    daysLeft: 11,
    weeklyIncrease: 12800,
    image: IMG('1503676260728-1c00da094a0b'),
    why: 'Teachers earn 23% less than similarly-educated professionals, driving a shortage that hits rural districts hardest.',
    ask: 'Align starting teacher salaries with entry-level engineering and nursing.',
    affects: ['3.7M public school teachers', '50M students', 'Rural school districts'],
    tags: ['teachers', 'salary', 'education'],
    verified: true,
    recipient: 'Congressional Education Committee',
  },
  {
    id: 'p8',
    title: 'End Solitary Confinement for Youth',
    summary: 'Prohibit prolonged isolation for anyone under eighteen.',
    category: 'Human Rights',
    organization: 'Youth Justice Project',
    location: 'Federal',
    signed: 38900,
    goal: 100000,
    urgency: 'high',
    daysLeft: 14,
    weeklyIncrease: 2400,
    image: IMG('1573152958734-1922c188fba3'),
    why: 'Solitary confinement causes measurable brain development harm in adolescents and raises recidivism.',
    ask: 'Establish a federal ban on solitary confinement for minors.',
    affects: ['Incarcerated youth', 'Reentry programs', 'Juvenile justice reform'],
    tags: ['youth', 'justice', 'solitary'],
    verified: false,
    recipient: 'DOJ Office of Juvenile Justice',
  },
];

export const COMMENTS = {
  p1: [
    { name: 'Maya R.', text: 'My family has hunted these lands for generations. Drilling here is not progress.', when: '2h' },
    { name: 'Devin O.', text: 'Once the tundra goes, it does not come back in our lifetime.', when: '6h' },
  ],
  p2: [
    { name: 'Priya S.', text: 'I teach ninth grade. Half my students are running on empty and there is one counselor for 600 kids.', when: '1h' },
    { name: 'Jordan L.', text: 'A sick day for your head should be as normal as one for your throat.', when: '9h' },
  ],
  p3: [
    { name: 'Kai M.', text: 'Cleaned 400 lbs of plastic off one beach last month. We cannot volunteer our way out of this.', when: '3h' },
  ],
  p4: [
    { name: 'Sam T.', text: 'My 11 year old gets ads for things she searched once. That is not okay.', when: '4h' },
  ],
  p5: [
    { name: 'Rosa V.', text: 'Two jobs, still one rent increase from my car. This is an emergency.', when: '30m' },
    { name: 'Chris B.', text: 'The vouchers exist. They are just sitting there unspent.', when: '5h' },
  ],
  p6: [
    { name: 'Nina W.', text: 'The spring count was the quietest morning I have had in twenty years of birding.', when: '8h' },
  ],
  p7: [
    { name: 'Ellie K.', text: 'Third year teaching, second job on weekends. I love it and I cannot afford it.', when: '2h' },
  ],
  p8: [
    { name: 'Marcus D.', text: 'I did 40 days in isolation at 16. I still feel it.', when: '12h' },
  ],
};

// The design's profile screen fields.
export const MOCK_USER = {
  firstName: 'Alex',
  lastName: 'Chen',
  email: 'alex.chen@example.com',
  location: 'Los Angeles, CA',
  address: '123 Main St, 90012',
  interests: ['Climate', 'Education', 'Human Rights'],
  signature: null,
  profilePic: null,
  onboarded: true,
};

export const PETITION_CATEGORIES = [
  { key: 'Climate', label: 'Climate & Environment' },
  { key: 'Human Rights', label: 'Human Rights' },
  { key: 'Education', label: 'Education' },
  { key: 'Privacy', label: 'Digital Privacy' },
  { key: 'Housing', label: 'Housing' },
  { key: 'Health', label: 'Health' },
  { key: 'Wildlife', label: 'Wildlife' },
  { key: 'Ocean', label: 'Ocean & Marine' },
];

export const URGENCY_LEVELS = [
  { key: 'low', label: 'Low', color: '#94a3b8' },
  { key: 'medium', label: 'Medium', color: '#fbbf24' },
  { key: 'high', label: 'High', color: '#f97316' },
  { key: 'critical', label: 'Critical', color: '#ef4444' },
];

// The design's create wizard offers four fixed signature goals.
export const GOAL_OPTIONS = [500, 1000, 10000, 100000];

export const PETITION_TAG_OPTIONS = {
  Climate: ['drilling', 'arctic', 'emissions', 'oil', 'renewables'],
  'Human Rights': ['youth', 'justice', 'solitary', 'equality'],
  Education: ['teachers', 'salary', 'education', 'schools'],
  Privacy: ['privacy', 'children', 'data', 'surveillance'],
  Housing: ['housing', 'rent', 'affordable', 'vouchers'],
  Health: ['mental-health', 'schools', 'students', 'care'],
  Wildlife: ['birds', 'migration', 'wildlife', 'habitat'],
  Ocean: ['plastic', 'ocean', 'coastal', 'marine'],
};
export const ALL_PETITION_TAGS = Array.from(new Set(Object.values(PETITION_TAG_OPTIONS).flat())).sort();

// Eight badges, in the design's order, with its icon names and copy.
export const BADGES = [
  { id: 'b1', name: 'First Sign', icon: 'draw', desc: 'Signed your first petition', test: (c) => c.signed >= 1 },
  { id: 'b2', name: 'Engaged', icon: 'how_to_reg', desc: 'Signed 10 petitions', test: (c) => c.signed >= 10 },
  { id: 'b3', name: 'Advocate', icon: 'campaign', desc: 'Signed 25 petitions', test: (c) => c.signed >= 25 },
  { id: 'b4', name: 'Champion', icon: 'emoji_events', desc: 'Signed 50 petitions', test: (c) => c.signed >= 50 },
  { id: 'b5', name: 'Catalyst', icon: 'local_fire_department', desc: 'Signed 100 petitions', test: (c) => c.signed >= 100 },
  { id: 'b6', name: 'Creator', icon: 'edit_document', desc: 'Created a petition', test: (c) => c.created >= 1 },
  { id: 'b7', name: 'Streak 7', icon: 'event_available', desc: '7 days in a row', test: (c) => c.streak >= 7 },
  { id: 'b8', name: 'Multi-cause', icon: 'grid_view', desc: 'Signed in 5 categories', test: (c) => c.causes >= 5 },
];

// Notification types and their chrome, from the design's TYPE_META.
export const NOTIFICATION_TYPES = {
  goal_reached: { icon: 'flag_circle', color: '#4edea3', label: 'GOAL REACHED' },
  level_up: { icon: 'emoji_events', color: '#fbbf24', label: 'LEVEL UP' },
  petition_acknowledged: { icon: 'reply', color: '#60a5fa', label: 'ACKNOWLEDGED' },
  milestone: { icon: 'show_chart', color: '#a78bfa', label: 'MILESTONE' },
  petition_created: { icon: 'description', color: '#b1c5ff', label: 'SUBMITTED' },
};

export const SEED_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'goal_reached',
    title: 'Protect the Arctic Refuge hit its goal',
    body: '1,000,000 signatures reached. The petition now heads to its recipient.',
    when: '12m',
    read: false,
    verified: true,
    details: [
      { icon: 'person', label: 'RECIPIENT', value: 'U.S. Department of the Interior' },
      { icon: 'campaign', label: 'ASKING FOR', value: 'Permanently ban fossil fuel development in the Arctic Refuge.' },
    ],
  },
  {
    id: 'n2',
    type: 'level_up',
    title: 'You reached Supporter',
    body: 'Level 2 unlocked. Keep signing to reach Advocate at 21 signatures.',
    when: '2h',
    read: false,
  },
  {
    id: 'n3',
    type: 'milestone',
    title: 'Housing is surging this week',
    body: 'Petitions in your causes gained 28,700 signatures over the last 7 days.',
    when: '6h',
    read: true,
  },
  {
    id: 'n4',
    type: 'petition_acknowledged',
    title: 'HUD acknowledged your petition',
    body: '"Affordable Housing Emergency Declaration" received a response from the recipient’s office.',
    when: '1d',
    read: true,
  },
];

export const REPORT_REASONS = [
  'False information',
  'Malicious or harmful',
  'Spam or scam',
  'Harassment or hate',
  'Impersonation',
  'Other concern',
];

// The design's 30-cell contribution history.
export const CONTRIB_BASE = [0, 1, 0, 0, 2, 1, 0, 3, 1, 0, 0, 2, 4, 1, 0, 1, 0, 0, 2, 3, 1, 0, 0, 1, 2, 0, 1, 3, 2, 0];
