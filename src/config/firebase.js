import { Platform } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: YOUR_APIKEY,
  authDomain: YOUR_AUTHDOMAIN,
  projectId: YOUR_PROJECTID,
  storageBucket: YOUR_STORAGEBUCKET,
  messagingSenderId: YOUR_MESSAGINGSENDERID,
  appId: YOUR_APPID,
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
