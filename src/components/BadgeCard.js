import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function BadgeCard({ badge, earned }) {
  return (
    <View style={[styles.card, !earned && styles.locked]}>
      <View style={[styles.iconWrap, earned ? styles.iconEarned : styles.iconLocked]}>
        <MaterialCommunityIcons
          name={badge.icon}
          size={22}
          color={earned ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
        />
      </View>
      <Text style={[styles.name, !earned && styles.textLocked]} numberOfLines={1}>{badge.name}</Text>
      <Text style={[styles.desc, !earned && styles.textLocked]} numberOfLines={2}>{badge.desc}</Text>
      {earned && (
        <View style={styles.earnedTag}>
          <MaterialCommunityIcons name="check-circle" size={10} color="#4edea3" />
          <Text style={styles.earnedText}>EARNED</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18, padding: 14, alignItems: 'center', gap: 6,
  },
  locked: { opacity: 0.5 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconEarned: { backgroundColor: 'rgba(251,191,36,0.15)' },
  iconLocked: { backgroundColor: 'rgba(255,255,255,0.04)' },
  name: { color: 'white', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  desc: { color: 'rgba(255,255,255,0.5)', fontSize: 10, textAlign: 'center', lineHeight: 14 },
  textLocked: { color: 'rgba(255,255,255,0.3)' },
  earnedTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(78,222,163,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
  },
  earnedText: { color: '#4edea3', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
});
