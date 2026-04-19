<<<<<<< HEAD
import { Platform } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
=======
// Firebase Configuration
// Replace with your Firebase project credentials from:
// https://console.firebase.google.com → Project Settings → General → Your apps
//
// Setup steps:
// 1. Create a Firebase project at console.firebase.google.com
// 2. Enable Authentication → Sign-in methods → Email/Password + Google
// 3. Copy config values below
// 4. Run: npx expo install firebase

import { initializeApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
>>>>>>> 05775e151d80f152aef53ed06bc50aff42569ebe
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
<<<<<<< HEAD
  apiKey: "AIzaSyAPI6G1W4qqoFOWAkxKTzKV1oaB0nXqoyM",
  authDomain: "project-e85c9709-7b5b-43-babf2.firebaseapp.com",
  projectId: "project-e85c9709-7b5b-43-babf2",
  storageBucket: "project-e85c9709-7b5b-43-babf2.firebasestorage.app",
  messagingSenderId: "875748736147",
  appId: "1:875748736147:web:91468f60a9b7bce22ca166",
};

export const FIREBASE_ENABLED = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app = null;
let auth = null;

if (FIREBASE_ENABLED) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      auth = getAuth(app);
    }
  }
}

export { app, auth };
=======
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Prevent re-initialization in dev hot-reload
let app;
let auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

export { app, auth };

// Whether Firebase is configured (set to true after adding real keys)
export const FIREBASE_ENABLED =
  firebaseConfig.apiKey !== 'YOUR_API_KEY';
>>>>>>> 05775e151d80f152aef53ed06bc50aff42569ebe
