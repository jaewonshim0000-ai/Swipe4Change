# Swipe4Change

Swipe4Change is a civic engagement platform that makes it easier for people to discover, sign, create, save, and track petitions connected to real social issues and the United Nations Sustainable Development Goals.

The app uses a swipe-based petition feed, personalized recommendations, petition creation tools, AI-assisted drafting, activity tracking, reporting, and secure account features to make civic participation faster and more approachable.

## UN Sustainable Development Goals Connection

Swipe4Change is designed around the idea that global change can start with simple local action.

The strongest SDG connections are:

- **Goal 16: Peace, Justice, and Strong Institutions** - petitions help people participate in public issues, raise concerns, request accountability, and support justice-centered causes.
- **Goal 17: Partnerships for the Goals** - the platform connects users, communities, petition creators, recipients, and organizations around shared goals.

The petition categories also support other SDGs:

- **Goal 3: Good Health and Well-Being** - health, mental health, public health, and care access petitions.
- **Goal 4: Quality Education** - school funding, student support, accessibility, and education policy petitions.
- **Goal 10: Reduced Inequalities** - human rights, civil rights, equity, workers, and safety petitions.
- **Goal 11: Sustainable Cities and Communities** - housing, transit, local safety, and community petitions.
- **Goal 13: Climate Action** - clean energy, emissions, public lands, resilience, and climate justice petitions.
- **Goal 14: Life Below Water** - ocean, plastic pollution, coastal, and marine life petitions.
- **Goal 15: Life on Land** - wildlife, habitat, biodiversity, and conservation petitions.

## What The App Does

Swipe4Change turns petitions into an interactive, mobile-friendly experience:

1. Users create an account and choose their interests.
2. The app personalizes the petition feed based on selected categories.
3. Users swipe through petition cards, open petition details, save petitions, report unsafe petitions, or sign petitions.
4. Users can create their own petitions with structured fields and controlled tags.
5. Users can generate an AI petition draft from a short topic idea.
6. The app tracks signing activity, daily challenges, badges, levels, and notifications.

## Features

### Authentication

- Firebase email/password authentication.
- Local demo fallback mode for development.
- Multi-user session isolation for profile, signature, signed petitions, saved petitions, notifications, and activity.
- Firebase phone-number verification support for two-factor authentication on web.

### Personalized Swiping Feed

- Swipe-style petition cards.
- Feed ranking based on user interests.
- Feed resets when interests change so the new order is visible immediately.
- Petition cards show category, location, urgency, signatures, progress, and quick actions.

### Petition Creation

Users can create petitions with:

- Petition name.
- Category.
- Location.
- Situation description.
- What the petition is asking for.
- Urgency tag.
- Recipient.
- Signature goal.
- Controlled tag picker.
- Petition card preview.

### AI Petition Draft Generator

- Users can enter a topic or idea.
- Backend calls OpenRouter to generate a structured petition draft.
- AI output is clamped to app-supported categories, tags, urgency values, and field lengths.
- The OpenRouter API key stays on the backend and is never exposed to the frontend.

### Petition Detail Page

The petition detail view includes:

- Image.
- Category.
- Location.
- Petition name.
- Proposer/organization.
- Signed amount.
- Weekly increase.
- Urgency.
- Progress bar.
- Situation.
- Requested action.
- Recipient.
- Bookmark button.
- Sign button.
- Report button.

### Petition Signing

- Loads profile name, email, location, and saved signature.
- Asks for an optional comment.
- Requires consent before signing.
- Prevents duplicate signatures for the same user and petition.
- Updates signing activity and petition signature counts.

### Reporting System

- Users can report false, malicious, spam, impersonation, harassment, or unsafe petitions.
- Reports are stored through the backend.
- Report emails can be sent to an admin inbox through Resend when `RESEND_API_KEY` is configured.

### Discover

- Search petitions by keyword.
- Filter by category.
- Sort by trending, urgent, or newest.

### Saved Petitions

- Shows only petitions bookmarked by the current user.
- Saved petitions are synced per account.

### Activity And Gamification

- Daily challenge progress.
- Signing contribution calendar.
- Badges.
- Level system.
- Recent signing history.
- Total signed count.

### Notifications

Notifications can be used for:

- Petition goal reached.
- Badge earned.
- Level up.
- Daily challenge completion.
- Petition created.
- Petition reported.

### Profile

Profile data includes:

- First name.
- Last name.
- Email.
- Address.
- Location.
- Interests.
- Profile picture.
- Saved handwritten signature.

### Security And Privacy

- Firebase authentication.
- Phone verification for 2FA.
- Optional signature encryption at rest with `ENCRYPTION_KEY`.
- TLS in production through hosting providers.
- Backend-only secrets for Supabase service role, OpenRouter, and Resend.

## Tech Stack

### Frontend

- Expo SDK 54
- React Native
- React Native Web
- React 19
- React Navigation
- Firebase Authentication
- Supabase client
- AsyncStorage

### Backend

- Node.js
- Express
- Supabase
- OpenRouter API
- Resend email API

### Deployment Targets

- Firebase Hosting for the exported web app.
- Render for the Express backend API.
- Supabase for database persistence.
- Firebase Authentication for user accounts.

## Project Structure

```text
swipe4change/
├── App.js
├── app.json
├── package.json
├── firebase.json
├── render.yaml
├── README.md
├── src/
│   ├── components/
│   │   ├── PetitionCard.js
│   │   ├── PetitionListItem.js
│   │   ├── ReportModal.js
│   │   ├── SignModal.js
│   │   ├── SignaturePad.js
│   │   └── SwipeDeck.js
│   ├── config/
│   │   ├── api.js
│   │   ├── firebase.js
│   │   └── supabase.js
│   ├── contexts/
│   │   └── AppContext.js
│   ├── data/
│   │   └── petitions.js
│   ├── navigation/
│   │   └── AppNavigator.js
│   ├── screens/
│   │   ├── ActivityGamificationScreen.js
│   │   ├── AuthScreen.js
│   │   ├── CreatePetitionScreen.js
│   │   ├── DiscoverScreen.js
│   │   ├── NotificationsScreen.js
│   │   ├── PetitionDetailScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── SavedPetitionsScreen.js
│   │   ├── SecurityScreen.js
│   │   └── SwipeFeedScreen.js
│   ├── theme/
│   │   └── index.js
│   └── utils/
│       └── helpers.js
└── backend/
    ├── package.json
    ├── schema.sql
    └── server.js
```

## Getting Started

### Prerequisites

Install:

- Node.js
- npm
- Expo CLI through `npx expo`

Optional services for full production behavior:

- Firebase project
- Supabase project
- Render account
- OpenRouter API key
- Resend API key

## Local Development

Install frontend dependencies:

```bash
npm install
npx expo install --check
```

Install backend dependencies:

```bash
cd backend
npm install
```

Create a local environment file:

```bash
cd ..
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start the backend API:

```bash
cd backend
npm run dev
```

Start the Expo app in another terminal:

```bash
npm start
```

Run the web app:

```bash
npm run web
```

The local web app usually runs at:

```text
http://localhost:8081
```

The backend API usually runs at:

```text
http://localhost:3001
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values you need.

Expo frontend variables must start with `EXPO_PUBLIC_`:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

Backend-only variables:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ENCRYPTION_KEY=

OPENROUTER_API_KEY=
OPENROUTER_MODEL=google/gemini-2.5-flash
OPENROUTER_SITE_URL=http://localhost:8081
OPENROUTER_APP_NAME=Swipe4Change

REPORT_EMAIL_TO=
REPORT_EMAIL_FROM=
RESEND_API_KEY=

CORS_ORIGIN=*
```

Do not commit `.env` to GitHub. Keep API keys and service role keys private.

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication.
3. Enable Email/Password sign-in.
4. Enable Phone authentication if you want phone verification and 2FA.
5. Enable SMS-based multi-factor authentication if using Firebase MFA.
6. Add `localhost` and your deployed domain to Firebase Authentication authorized domains.
7. Copy the Firebase web app config into the Expo environment variables.

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run the SQL in `backend/schema.sql`.
4. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` for the frontend.
5. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the backend.

The schema enables Row Level Security. The frontend can read visible petitions, while sensitive writes are intended to go through the backend using the Supabase service role key.

## OpenRouter AI Setup

The AI petition draft generator uses OpenRouter through the backend.

Add these backend variables:

```bash
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=google/gemini-2.5-flash
OPENROUTER_SITE_URL=https://your-deployed-site-url
OPENROUTER_APP_NAME=Swipe4Change
```

The frontend calls:

```text
POST /api/ai/petition-draft
```

The API key is never sent to the browser.

## Report Email Setup

Report emails use Resend.

```bash
REPORT_EMAIL_TO=your-admin-email@example.com
REPORT_EMAIL_FROM=Swipe4Change <onboarding@resend.dev>
RESEND_API_KEY=re_...
```

For production, verify a sending domain in Resend and use an email address on that domain. If `RESEND_API_KEY` is missing, reports are still saved, but email alerts are not sent.

## Backend API

The Express API includes:

```text
GET  /health
GET  /api/petitions
GET  /api/petitions/:id
POST /api/petitions
POST /api/sign
POST /api/save
POST /api/report
POST /api/user
GET  /api/user/:firebaseUid
GET  /api/user/:firebaseUid/signatures
GET  /api/user/:firebaseUid/saved
GET  /api/user/:firebaseUid/notifications
POST /api/ai/petition-draft
```

## Build For Web

Create a production web export:

```bash
npm run build:web
```

The static output is generated in:

```text
dist/
```

## Firebase Hosting Deployment

Build and deploy:

```bash
npm run deploy:firebase
```

Or run the steps manually:

```bash
npm run build:web
firebase deploy
```

`firebase.json` serves the `dist/` folder and rewrites routes to `index.html`.

## Render Backend Deployment

The repo includes `render.yaml`.

Manual Render settings:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

After deploying the backend, set the frontend variable:

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-render-service.onrender.com
```

Run one shared backend service for the deployed website. Do not start one backend per user. Express handles simultaneous requests, Firebase identifies the browser session, and Supabase stores account-specific data by user id.

## Testing And Verification

Useful checks:

```bash
npx expo install --check
npm run build:web
node --check backend/server.js
```

Check the backend health endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "healthy",
  "database": "memory"
}
```

If Supabase is configured, the database value should show `supabase`.

## Troubleshooting

### `EADDRINUSE: address already in use :::3001`

The backend is already running on port `3001`.

Stop the old backend process, or run the API on a different port:

```bash
PORT=3002 npm run dev
```

On Windows PowerShell:

```powershell
$env:PORT=3002
npm run dev
```

### App Cannot Connect To Server

Make sure:

- The backend is running.
- `EXPO_PUBLIC_API_BASE_URL` points to the backend URL.
- The frontend was restarted after changing `.env`.
- Render allows requests from the deployed frontend domain through `CORS_ORIGIN`.

### AI Draft Says Missing Authentication Header

This usually means the OpenRouter API key is missing, malformed, or being sent to the wrong endpoint.

Make sure the key is configured only on the backend:

```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

### Phone 2FA Does Not Send Code

Make sure:

- Firebase Phone Auth is enabled.
- Firebase SMS multi-factor authentication is enabled.
- The current domain is listed in Firebase authorized domains.
- You are testing in the web build.

### Multiple Tabs Log Into The Same Account

This is normal browser behavior. Firebase shares auth state across tabs in the same browser profile. To test multiple users on one computer, use:

- A normal browser window and an incognito/private window.
- Two different browsers.
- Separate Chrome profiles.

## Current Status

Swipe4Change is a full MVP. It supports local development, web export, backend deployment, database persistence, AI drafting, report handling, and Firebase authentication.

For production use, configure Firebase, Supabase, Render, OpenRouter, and Resend with real deployed environment variables.

## License

MIT
