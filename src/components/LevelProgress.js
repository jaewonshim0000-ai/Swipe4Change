import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getLevel, getNextLevel } from '../utils/helpers';
import { COLORS, FONTS } from '../theme';

export default function LevelProgress({ signedCount }) {
  const current = getLevel(signedCount);
  const next = getNextLevel(current);
  const pct = next
    ? ((signedCount - current.min) / (next.min - current.min)) * 100
    : 100;

  return (
    <View style={[styles.card, { shadowColor: current.color }]}>
      <LinearGradient
        colors={[`${current.color}25`, COLORS.surfaceContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.grad}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="trophy" size={14} color={current.color} />
          <Text style={[styles.levelLabel, { color: current.color }]}>
            LEVEL {current.level}
          </Text>
        </View>
        <Text style={styles.name}>{current.name}</Text>
        <Text style={styles.sub}>
          {signedCount} {signedCount === 1 ? 'petition' : 'petitions'} signed
          {next ? ` · ${next.min - signedCount} to ${next.name}` : ' · Max level'}
        </Text>

        <View style={styles.progressBarBg}>
          <LinearGradient
            colors={[current.color, '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${Math.min(pct, 100)}%` }]}
          />
        </View>

        <View style={styles.labels}>
          <Text style={styles.milestone}>{current.name.toUpperCase()}</Text>
          {next && <Text style={styles.milestone}>{next.name.toUpperCase()}</Text>}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  grad: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  levelLabel: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.9 },
  name: { color: COLORS.white, fontFamily: FONTS.serif, fontSize: 30, marginBottom: 4 },
  sub: { color: 'rgba(255,255,255,0.5)', fontFamily: FONTS.sans, fontSize: 13, marginBottom: 20 },
  progressBarBg: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3, overflow: 'hidden', marginBottom: 8,
  },
  progressBarFill: { height: '100%', borderRadius: 3 },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  milestone: { color: 'rgba(255,255,255,0.4)', fontFamily: FONTS.mono, fontSize: 8.5, letterSpacing: 1.5 },
});
