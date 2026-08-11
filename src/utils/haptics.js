import * as Haptics from 'expo-haptics';

// Thin wrappers so call sites read clearly and never throw on web/unsupported.
export const hTap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
export const hPress = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
export const hSelect = () => Haptics.selectionAsync().catch(() => {});
export const hSuccess = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
export const hWarn = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
