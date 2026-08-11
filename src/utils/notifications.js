import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local notifications only — remote push needs a development build, which
// comes later. Everything here is a safe no-op on web.
let Notifications = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line global-require
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

const REMINDER_FLAG = 'swipe4change:dailyReminderScheduled';

export async function requestNotificationPermission() {
  if (!Notifications) return false;
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const request = await Notifications.requestPermissionsAsync();
    return Boolean(request.granted);
  } catch {
    return false;
  }
}

// Fires an immediate local notification (mirrors in-app events like badges,
// goals reached, level ups so they land in the system tray too).
export async function pushLocal(title, body) {
  if (!Notifications) return;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch {
    // Expo Go has partial notification support; never let this break the app.
  }
}

// Evening reminder to keep the streak alive. Scheduled once.
export async function ensureDailyReminder() {
  if (!Notifications) return;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;
    const scheduled = await AsyncStorage.getItem(REMINDER_FLAG);
    if (scheduled) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Keep your streak alive 🔥',
        body: 'A quick swipe today keeps your signing streak going.',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 18, minute: 0 },
    });
    await AsyncStorage.setItem(REMINDER_FLAG, new Date().toISOString());
  } catch {
    // Same guard as above.
  }
}
