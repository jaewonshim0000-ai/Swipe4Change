import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { CATEGORY_STYLE, COLORS } from '../theme';
import { fmtNumber } from '../utils/helpers';

export default function PetitionListItem({ petition, onPress, meta, rightIcon, onReport }) {
  const cat = CATEGORY_STYLE[petition.category] || CATEGORY_STYLE.Climate;
  const pct = Math.min(100, ((petition.signed || 0) / (petition.goal || 1)) * 100);

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onPress?.(petition)}
      activeOpacity={0.7}
    >
      <LinearGradient colors={[cat.from, cat.to]} style={styles.thumb}>
        <MaterialCommunityIcons name={cat.icon} size={24} color="white" />
      </LinearGradient>

      <View style={styles.body}>
        <Text style={[styles.category, { color: cat.glow }]}>{petition.category.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>{petition.title}</Text>
        {meta ? <Text style={styles.meta} numberOfLines={1}>{meta}</Text> : null}

        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: cat.glow }]} />
          </View>
          <Text style={styles.progressText}>{fmtNumber(petition.signed || 0)}</Text>
        </View>

        {onReport ? (
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
        ) : null}
      </View>

      <View style={styles.rightSlot}>
        {rightIcon || <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.32)" />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 12,
  },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  category: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 3 },
  title: { color: 'white', fontSize: 14, fontWeight: '800', lineHeight: 18 },
  meta: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 4 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  progressBarBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 2 },
  progressText: { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '800' },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  reportText: { color: COLORS.error, fontSize: 10, fontWeight: '800' },
  rightSlot: { alignSelf: 'center' },
});
