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
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
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
