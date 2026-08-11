import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Easing, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS } from '../theme';
import { useApp } from '../contexts/AppContext';
import Press from './Press';
import Icon from './Icon';

const CONFETTI_COLORS = ['#4edea3', '#b1c5ff', '#fbbf24', '#ff8a8a', '#8cbcff', '#e5a9ff'];
const PIECES = 34;

// One confetti piece: falls the height of the screen while spinning 560deg,
// over 2.2–3.4s after a stagger of up to 0.6s — the design's `s4c-confetti`.
function Confetti({ piece, height }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: piece.duration,
      delay: piece.delay,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -60,
        left: piece.left,
        width: piece.size,
        height: piece.size * 1.4,
        backgroundColor: piece.color,
        borderRadius: piece.round ? piece.size : 2,
        opacity: t.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, height + 120] }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '560deg'] }) },
        ],
      }}
      pointerEvents="none"
    />
  );
}

export default function CelebrationOverlay() {
  const { celebration, clearCelebration } = useApp();
  const { width, height } = useWindowDimensions();

  // s4c-pop: scale .4 -> 1.08 -> 1 with a fade in.
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!celebration) { pop.setValue(0); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.timing(pop, {
      toValue: 1,
      duration: 500,
      easing: Easing.bezier(0.22, 1.3, 0.4, 1),
      useNativeDriver: true,
    }).start();
  }, [celebration]);

  const pieces = useMemo(
    () => Array.from({ length: PIECES }, (_, i) => {
      const size = 6 + Math.random() * 8;
      return {
        key: i,
        left: Math.random() * width,
        size,
        round: Math.random() > 0.5,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        duration: (2.2 + Math.random() * 1.2) * 1000,
        delay: Math.random() * 600,
      };
    }),
    [celebration, width],
  );

  if (!celebration) return null;

  const from = celebration.from || '#0b4d44';
  const to = celebration.to || '#06a77d';
  const accent = celebration.color || COLORS.tertiary;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={clearCelebration} statusBarTranslucent>
      <Press style={s.root} onPress={clearCelebration} flat>
        {pieces.map((p) => <Confetti key={p.key} piece={p} height={height} />)}

        <Animated.View
          style={[
            s.card,
            {
              opacity: pop,
              transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
            },
          ]}
        >
          <LinearGradient
            colors={[from, to]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={s.badge}
          >
            <Icon name={celebration.icon || 'star'} size={40} fill={1} color="#fff" />
          </LinearGradient>

          <Text style={[s.kicker, { color: accent }]}>{celebration.kicker}</Text>
          <Text style={s.title}>{celebration.title}</Text>
          <Text style={s.sub}>{celebration.sub}</Text>

          <Press style={s.btn} onPress={clearCelebration}>
            <Text style={s.btnText}>Amazing</Text>
          </Press>
        </Animated.View>
      </Press>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,.55)',
  },
  card: {
    width: '82%', maxWidth: 330, padding: 24, borderRadius: 28,
    backgroundColor: 'rgba(27,31,43,.99)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,.1)',
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.9, shadowRadius: 40, elevation: 24,
  },
  badge: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  kicker: { fontFamily: FONTS.monoBold, fontSize: 9, letterSpacing: 2, marginBottom: 8 },
  title: { fontFamily: FONTS.serif, fontSize: 32, lineHeight: 33.6, color: '#fff', marginBottom: 8, textAlign: 'center' },
  sub: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 20.15, color: 'rgba(255,255,255,.6)', marginBottom: 20, textAlign: 'center' },
  btn: {
    height: 46, paddingHorizontal: 40, borderRadius: 999,
    backgroundColor: COLORS.tertiary, alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontFamily: FONTS.sansBold, fontSize: 13, color: COLORS.onTertiary },
});
