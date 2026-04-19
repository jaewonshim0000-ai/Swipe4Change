# Swipe4Change — Full MVP

A Tinder-style civic engagement app. Swipe to sign petitions, create your own, track impact.

**Stack:** Expo SDK 54 · React Native 0.81 · React 19.1 · Firebase Auth · Supabase DB · Render API

---

## Quick Start

```bash
cd swipe4change
npm install
npx expo install --fix
npx expo start --tunnel --clear
```

Scan the QR code with Expo Go on your phone.

---

## Deployment

### Firebase (Authentication)
1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication → Email/Password
3. Copy config into `src/config/firebase.js`

### Supabase (Database + Storage)
1. Create project at [supabase.com](https://supabase.com)
2. Run `backend/schema.sql` in SQL Editor
3. Copy URL + anon key into `src/config/supabase.js`

### Render (Backend API)
1. Create Web Service at [render.com](https://render.com)
2. Point to the `backend/` folder
3. Build: `npm install` · Start: `node server.js`

### Vercel (Admin Dashboard — optional)
For a future web admin panel to moderate petitions.

---

## Project Structure

```
swipe4change/
├── App.js
├── package.json
├── src/
│   ├── config/
│   │   ├── firebase.js          ← Firebase auth config
│   │   └── supabase.js          ← Supabase client config
│   ├── navigation/
│   │   └── AppNavigator.js      ← tabs + stack + auth gate
│   ├── screens/
│   │   ├── AuthScreen.js        ← login / signup
│   │   ├── SwipeFeedScreen.js   ← personalized swipe feed
│   │   ├── DiscoverScreen.js    ← search + filter directory
│   │   ├── CreatePetitionScreen.js ← 7-step wizard
│   │   ├── PetitionDetailScreen.js ← full detail view
│   │   ├── SavedPetitionsScreen.js ← bookmarked petitions
│   │   ├── ActivityGamificationScreen.js ← calendar + badges + level
│   │   ├── ProfileScreen.js     ← full profile + signature
│   │   ├── NotificationsScreen.js ← notification feed
│   │   └── SecurityScreen.js    ← 2FA + encryption
│   ├── components/
│   │   ├── PetitionCard.js
│   │   ├── SwipeDeck.js         ← PanResponder swipe
│   │   ├── SignModal.js         ← sign with consent + signature
│   │   ├── SignaturePad.js      ← SVG drawing pad
│   │   ├── ActionButtons.js
│   │   ├── PetitionListItem.js
│   │   ├── LevelProgress.js
│   │   ├── ContributionCalendar.js ← GitHub-style heatmap
│   │   ├── BadgeCard.js         ← badge display
│   │   ├── NotificationCard.js  ← structured notification
│   │   └── AppHeader.js         ← brand header + bell
│   ├── contexts/
│   │   └── AppContext.js        ← all app state
│   ├── data/
│   │   └── petitions.js         ← seed data + badges
│   ├── theme/
│   │   └── index.js             ← design tokens
│   └── utils/
│       └── helpers.js
├── backend/
│   ├── server.js                ← Express API for Render
│   ├── schema.sql               ← Supabase tables
│   └── package.json
└── README.md
```

---

## Feature Checklist

| # | Feature | Status |
|---|---------|--------|
| 0 | Authentication (Firebase) | ✅ |
| 1 | Swiping (personalized by interests) | ✅ |
| 1.1 | Daily challenge tracker | ✅ |
| 2 | Create Petition (7-step wizard) | ✅ |
| 2.1 | Name, category, location | ✅ |
| 2.2 | Situation + ask + tags | ✅ |
| 2.3 | Urgency tag selector | ✅ |
| 2.4 | Recipient + goal | ✅ |
| 2.5 | Preview card + T&C | ✅ |
| 3 | Petition Detail Card | ✅ |
| 3.1 | Image, category, location, proposer | ✅ |
| 3.2 | Signed count + weekly increase | ✅ |
| 3.3 | Urgency badge + progress bar | ✅ |
| 3.4 | Situation + ask + recipient | ✅ |
| 3.5 | Bookmark + sign buttons | ✅ |
| 4 | Sign Petition | ✅ |
| 4.1 | Auto-loaded profile info | ✅ |
| 4.2 | Signature from profile | ✅ |
| 4.3 | Comment + consent | ✅ |
| 5 | Notifications | ✅ |
| 5.1 | Level up, goal reached, badge | ✅ |
| 5.2 | Petition support, created | ✅ |
| 5.3 | Structured detail cards | ✅ |
| 6 | Discover | ✅ |
| 6.1 | Search bar | ✅ |
| 6.2 | Category filter chips | ✅ |
| 6.3 | Sort: trending/urgent/newest | ✅ |
| 7 | Saved (bookmarked only) | ✅ |
| 8 | Activity | ✅ |
| 8.1 | Contribution calendar (30 days) | ✅ |
| 8.2 | 10 badges system | ✅ |
| 8.3 | Petition sign count | ✅ |
| 8.4 | Recent signatures list | ✅ |
| 8.5 | Level progress (1-5) | ✅ |
| 9 | Profile | ✅ |
| 9.1 | First/last name, email, address | ✅ |
| 9.2 | Signature pad (SVG drawing) | ✅ |
| 9.3 | Interests selector | ✅ |
| 9.4 | Profile picture (image picker) | ✅ |
| 10 | Security & Privacy | ✅ |
| 10.1 | 2FA toggle | ✅ |
| 10.2 | Encryption info display | ✅ |
| 10.3 | Biometric toggle | ✅ |
| 10.4 | Session management | ✅ |

---

## License

MIT
