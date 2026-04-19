import { Platform } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
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
