import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { CATEGORY_STYLE, COLORS } from '../theme';
import { fmtNumber } from '../utils/helpers';

export default function PetitionListItem({ petition, onPress, meta, rightIcon, onReport }) {
  const cat = CATEGORY_STYLE[petition.category] || CATEGORY_STYLE.Climate;
  const pct = Math.min(100, (petition.signed / petition.goal) * 100);

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onPress(petition)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[cat.from, cat.to]}
        style={styles.thumb}
      >
        <MaterialCommunityIcons name={cat.icon} size={24} color="white" />
      </LinearGradient>

      <View style={styles.body}>
        <Text style={[styles.category, { color: cat.glow }]}>{petition.category.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>{petition.title}</Text>
        {meta && <Text style={styles.meta} numberOfLines={1}>{meta}</Text>}
        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: cat.glow }]} />
          </View>
          <Text style={styles.progressText}>{fmtNumber(petition.signed)}</Text>
        </View>
        {onReport && (
          <TouchableOpacity
            style={styles.reportRow}
            onPress={(event) => {
              event?.stopPropagation?.();
              onReport(petition);
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="flag" size={12} color={COLORS.error} />
            <Text style={styles.reportText}>Report false or malicious petition</Text>
          </TouchableOpacity>
        )}
      </View>

      {rightIcon && <View style={styles.rightSlot}>{rightIcon}</View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1, borderColor: COLORS.outline,
    borderRadius: 20,
    padding: 14,
    gap: 14,
    alignItems: 'stretch',
  },
  thumb: {
    width: 56, height: 56,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  category: { fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 2 },
  title: { color: 'white', fontWeight: '700', fontSize: 14, lineHeight: 18, marginBottom: 4 },
  meta: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBarBg: {
    flex: 1, height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 2 },
  progressText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700' },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 8 },
  reportText: { color: COLORS.error, fontSize: 11, fontWeight: '700' },
  rightSlot: { alignSelf: 'center' },
});
