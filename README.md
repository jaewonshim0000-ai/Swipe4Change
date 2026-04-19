# Swipe4Change

A Tinder-style civic engagement app for discovering, saving, creating, and signing petitions.

## Stack

- Expo SDK 54 / React Native / React Native Web
- Firebase Authentication
- Supabase database and storage-ready schema
- Render-ready Express API
- Firebase Hosting-ready static web export

## Local Development

```bash
npm install
npx expo install --check
npm start
```

Run the backend locally:

```bash
cd backend
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in the services you want to use.

## Environment Variables

Expo variables must start with `EXPO_PUBLIC_`:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_BASE_URL`

Backend-only variables for Render:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `OPENROUTER_SITE_URL`
- `OPENROUTER_APP_NAME`
- `REPORT_EMAIL_TO`
- `REPORT_EMAIL_FROM`
- `RESEND_API_KEY`
- `CORS_ORIGIN`

If Firebase is not configured, the app runs in local demo auth mode. If the Render API URL is not configured, writes stay local except pending petition creation can use Supabase directly when Supabase env vars are present.

## Features

- Firebase-backed login and signup with local fallback mode
- Multi-user session isolation for profile, signature, saved petitions, signed petitions, notifications, and activity
- Personalized swipe feed based on profile interests
- Feed resets automatically when interests change so the reordered deck is visible right away
- Daily challenge progress and completion notifications
- Create petition wizard with category, title, location, situation, ask, urgency, recipient, goal, tags, and preview
- AI petition draft generator from a short topic prompt, powered by the backend OpenRouter API integration
- Controlled tag picker by category to avoid duplicate freeform tags
- Petition report flow for false, malicious, spam, impersonation, or unsafe content
- Report email alerts to the admin inbox when `RESEND_API_KEY` is configured
- Petition detail view with image/category/location/proposer/signature counts/weekly growth/urgency/progress/situation/ask/recipients/bookmark/sign actions
- Signing modal that loads profile name, email, location, and signature, then asks for comment and consent
- Notifications for goals, levels, badges, created petitions, and daily challenge milestones
- Discover search with category filters and trending/urgent/newest sorting
- Saved petitions view for bookmarked petitions
- Activity tab with contribution calendar, badges, recent signatures, signed count, created count, and level progress
- Profile with email, address, location, name, signature pad, interests, profile picture, and sign out
- Security & Privacy screen with Firebase phone-number verification for 2FA, biometric toggle, session status, and data protection notes

## Supabase Setup

1. Create a Supabase project.
2. Run `backend/schema.sql` in the Supabase SQL Editor.
3. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` for the app.
4. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Render for server-side writes.

The schema enables RLS. Public clients can read visible petitions and submit pending petitions; user, signature, saved, and notification writes are intended to go through the Render API with the service role key.

## Firebase Auth Setup

1. Create a Firebase project.
2. Enable Email/Password authentication.
3. Enable Phone authentication.
4. Enable SMS-based multi-factor authentication in Firebase Authentication settings.
5. Add your local and deployed web domains to Firebase Authentication authorized domains.
6. Add a web app and copy its config values into the Expo env variables.

Phone 2FA uses Firebase's web reCAPTCHA verifier. It works in the web build, including Firebase Hosting or a local `localhost` run, after the domain is authorized in Firebase.

## Render API Deployment

The included `render.yaml` deploys `backend/` as a web service.

Manual settings:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

After deployment, set `EXPO_PUBLIC_API_BASE_URL` to the Render service URL.

Run one shared backend service for the website. Do not start a separate backend per user; Express handles many simultaneous users on the same deployed Render URL, while Firebase identifies each browser session and Supabase stores account-specific data by user id.

## AI Draft Setup

Add this to the backend environment, either locally in `backend/.env` tooling or in Render:

```bash
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=google/gemini-2.5-flash
OPENROUTER_SITE_URL=https://your-web-app-url
OPENROUTER_APP_NAME=Swipe4Change
```

The OpenRouter key must stay on the backend. The Expo app calls `/api/ai/petition-draft`; it never receives the key. You can change `OPENROUTER_MODEL` to any OpenRouter model that supports structured outputs.

## Report Email Setup

Reports are stored through the backend and can email the admin inbox with Resend:

```bash
REPORT_EMAIL_TO=jaewonshim0000@gmail.com
REPORT_EMAIL_FROM=Swipe4Change <onboarding@resend.dev>
RESEND_API_KEY=re_...
```

For production, verify your sending domain in Resend and replace `REPORT_EMAIL_FROM` with an address on that domain. Without `RESEND_API_KEY`, reports are still saved, but no email is sent.

## Firebase Hosting Deployment

```bash
npm run build:web
firebase deploy
```

`firebase.json` serves the generated `dist/` directory and rewrites routes to `index.html`.

## Verification

Useful checks:

```bash
npx expo install --check
npm run build:web
node --check backend/server.js
```
