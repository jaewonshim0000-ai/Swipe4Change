import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';
import { hTap, hPress } from '../utils/haptics';
import Press from './Press';
import Icon from './Icon';

// The design's four feed controls: undo (44), skip (56), info (48), sign (56),
// 16pt apart.
export default function ActionButtons({ onSkip, onInfo, onSign, onUndo, canUndo, disabled }) {
  return (
    <View style={s.row}>
      <Press
        style={[s.undo, canUndo ? s.undoOn : s.undoOff]}
        onPress={onUndo}
        haptic={hTap}
        disabled={!canUndo}
        scale={0.9}
      >
        <Icon name="undo" size={17} color={canUndo ? COLORS.amber : 'rgba(255,255,255,.2)'} />
      </Press>

      <Press style={s.skip} onPress={onSkip} haptic={hTap} disabled={disabled} scale={0.93}>
        <Icon name="close" size={24} color={COLORS.error} />
      </Press>

      <Press style={s.info} onPress={onInfo} haptic={hTap} disabled={disabled} scale={0.9}>
        <Icon name="info" size={17} color={COLORS.primary} />
      </Press>

      <Press style={s.sign} onPress={onSign} haptic={hPress} disabled={disabled} scale={0.93}>
        <LinearGradient
          colors={[COLORS.tertiary, COLORS.tertiaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 1 }}
          style={s.signFill}
        >
          <Icon name="how_to_reg" size={24} fill={1} color={COLORS.onTertiary} />
        </LinearGradient>
      </Press>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 16, paddingTop: 16, paddingBottom: 12,
  },
  undo: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  undoOn: { backgroundColor: 'rgba(251,191,36,.09)', borderColor: 'rgba(251,191,36,.3)' },
  undoOff: { backgroundColor: 'rgba(255,255,255,.03)', borderColor: 'rgba(255,255,255,.07)' },
  skip: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,180,171,.09)', borderWidth: 1, borderColor: 'rgba(255,180,171,.30)',
    shadowColor: COLORS.error, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
  },
  info: {
    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(177,197,255,.09)', borderWidth: 1, borderColor: 'rgba(177,197,255,.28)',
  },
  sign: {
    width: 56, height: 56, borderRadius: 28, overflow: 'hidden',
    shadowColor: COLORS.tertiary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6, shadowRadius: 13, elevation: 12,
  },
  signFill: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
});
