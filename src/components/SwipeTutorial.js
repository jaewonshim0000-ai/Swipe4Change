import React from 'react';
import {
  View, Text, StyleSheet,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';
import Press from './Press';

// One-time coach-marks explaining the swipe gestures. Shown on the first
// visit to the feed and dismissed forever.
const HINTS = [
  { icon: 'gesture-swipe-right', lib: 'mci', color: COLORS.tertiary, title: 'Swipe right to sign', body: 'Back a petition you support.' },
  { icon: 'gesture-swipe-left', lib: 'mci', color: COLORS.error, title: 'Swipe left to skip', body: 'Not for you? Move to the next.' },
  { icon: 'gesture-tap', lib: 'mci', color: COLORS.primary, title: 'Tap for details', body: 'Read the full story before deciding.' },
  { icon: 'undo', lib: 'mi', color: '#fbbf24', title: 'Undo a swipe', body: 'Changed your mind? Rewind the last card.' },
];

export default function SwipeTutorial({ onDismiss }) {
  return (
    <View style={s.overlay}>
      <View style={s.sheet}>
        <View style={s.handIcon}>
          <MaterialCommunityIcons name="hand-back-right" size={30} color={COLORS.primary} />
        </View>
        <Text style={s.title}>How Swipe4Change works</Text>
        <Text style={s.sub}>Four gestures, that's it.</Text>

        <View style={s.hints}>
          {HINTS.map((h) => (
            <View key={h.title} style={s.hintRow}>
              <View style={[s.hintIcon, { backgroundColor: `${h.color}22` }]}>
                {h.lib === 'mci'
                  ? <MaterialCommunityIcons name={h.icon} size={22} color={h.color} />
                  : <MaterialIcons name={h.icon} size={22} color={h.color} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.hintTitle}>{h.title}</Text>
                <Text style={s.hintBody}>{h.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Press style={s.btn} onPress={onDismiss}>
          <Text style={s.btnText}>Got it</Text>
        </Press>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 28, zIndex: 500 },
  sheet: {
    width: '100%', maxWidth: 380,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    padding: 24,
  },
  handIcon: {
    width: 56, height: 56, borderRadius: 28, alignSelf: 'center',
    backgroundColor: 'rgba(177,197,255,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  title: { color: COLORS.white, fontFamily: FONTS.serif, fontSize: 28, textAlign: 'center' },
  sub: {
    color: 'rgba(255,255,255,0.5)', fontFamily: FONTS.sans, fontSize: 13,
    textAlign: 'center', marginTop: 5, marginBottom: 20,
  },
  hints: { gap: 14, marginBottom: 22 },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  hintIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  hintTitle: { color: COLORS.white, fontFamily: FONTS.sansBold, fontSize: 15 },
  hintBody: { color: 'rgba(255,255,255,0.55)', fontFamily: FONTS.sans, fontSize: 13, marginTop: 2 },
  btn: { height: 50, borderRadius: 14, backgroundColor: COLORS.tertiary, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: COLORS.onTertiary, fontFamily: FONTS.sansBold, fontSize: 15 },
});
