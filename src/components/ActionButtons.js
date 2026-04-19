import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../theme';

export default function ActionButtons({ onSkip, onInfo, onSign, disabled }) {
  const tap = (fn, haptic = Haptics.ImpactFeedbackStyle.Light) => () => {
    if (disabled) return;
    Haptics.impactAsync(haptic).catch(() => {});
    fn();
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.btn, styles.skip]}
        onPress={tap(onSkip)}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <MaterialIcons name="close" size={24} color={COLORS.error} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.info]}
        onPress={tap(onInfo)}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <MaterialIcons name="info-outline" size={18} color={COLORS.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.sign]}
        onPress={tap(onSign, Haptics.ImpactFeedbackStyle.Medium)}
        disabled={disabled}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[COLORS.tertiary, COLORS.tertiaryContainer]}
          style={styles.signGrad}
        >
          <MaterialIcons name="favorite" size={22} color={COLORS.onTertiary} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    paddingVertical: 16,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  skip: {
    width: 56, height: 56,
    backgroundColor: 'rgba(255,180,171,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,180,171,0.3)',
  },
  info: {
    width: 44, height: 44,
    backgroundColor: 'rgba(177,197,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(177,197,255,0.3)',
  },
  sign: {
    width: 56, height: 56,
    overflow: 'hidden',
    shadowColor: COLORS.tertiary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  signGrad: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
  },
});
