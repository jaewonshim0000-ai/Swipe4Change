import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORY_STYLE, COLORS, FONTS, URGENCY_COLOR, fmt } from '../theme';
import { MonoLabel } from './Glass';
import Press from './Press';
import Icon from './Icon';

// The design's `thumb()` row, shared by Discover results, Saved and the
// recent-signature list.
function Thumb({ petition, cat, size = 62, radius = 16 }) {
  return (
    <View style={[styles.thumb, { width: size, height: size, borderRadius: radius }]}>
      <Image source={{ uri: petition.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient
        colors={[`${cat.from}bb`, `${cat.to}44`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

export default function PetitionListItem({ petition, onPress, onUnsave, variant = 'result' }) {
  const cat = CATEGORY_STYLE[petition.category] || CATEGORY_STYLE.Climate;
  const urg = URGENCY_COLOR[petition.urgency] || URGENCY_COLOR.medium;
  const pct = Math.min(100, (petition.signed / petition.goal) * 100);

  if (variant === 'signed') {
    return (
      <Press style={styles.signedRow} onPress={onPress}>
        <Thumb petition={petition} cat={cat} size={48} radius={14} />
        <View style={styles.body}>
          <Text style={styles.signedTitle} numberOfLines={2}>{petition.title}</Text>
          <View style={styles.signedMeta}>
            <Icon name="check_circle" size={13} fill={1} color={COLORS.tertiary} />
            <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.42)">
              SIGNED · {petition.organization}
            </MonoLabel>
          </View>
        </View>
      </Press>
    );
  }

  return (
    <Press style={styles.row} onPress={onPress}>
      <Thumb petition={petition} cat={cat} />

      <View style={styles.body}>
        <View style={styles.topLine}>
          <Icon name={cat.icon} size={13} fill={1} color={cat.glow} />
          <MonoLabel size={9} spacing={1.3} weight="bold" color={cat.glow}>
            {petition.category.toUpperCase()}
          </MonoLabel>
          {variant === 'result' ? (
            <>
              <View style={[styles.urgDot, { backgroundColor: urg }]} />
              <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.4)" style={styles.days}>
                {petition.daysLeft}D LEFT
              </MonoLabel>
            </>
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={2}>{petition.title}</Text>

        {variant === 'result' ? (
          <Text style={styles.meta} numberOfLines={1}>
            {petition.organization} · {petition.location}
          </Text>
        ) : null}

        <View style={styles.barRow}>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: cat.glow }]} />
          </View>
          <MonoLabel size={9} spacing={0} weight="bold" color="rgba(255,255,255,.62)">
            {fmt(petition.signed)}
          </MonoLabel>
        </View>
      </View>

      {onUnsave ? (
        <Press style={styles.unsave} onPress={onUnsave} scale={0.9}>
          <Icon name="bookmark" size={13} fill={1} color={COLORS.primary} />
        </Press>
      ) : null}
    </Press>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', gap: 12, padding: 12, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,.07)',
  },
  signedRow: {
    flexDirection: 'row', gap: 12, padding: 12, borderRadius: 20, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,.035)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,.07)',
  },
  thumb: { overflow: 'hidden', position: 'relative' },
  body: { flex: 1, minWidth: 0 },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  urgDot: { width: 5, height: 5, borderRadius: 2.5 },
  days: { marginLeft: 'auto' },
  title: { fontFamily: FONTS.sansBold, fontSize: 13, lineHeight: 16.6, color: '#fff' },
  meta: { fontFamily: FONTS.sans, fontSize: 11, color: 'rgba(255,255,255,.42)', marginTop: 3 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  barTrack: { flex: 1, height: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,.09)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99 },
  unsave: {
    position: 'absolute', top: 10, right: 10,
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(177,197,255,.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  signedTitle: { fontFamily: FONTS.sansBold, fontSize: 13, lineHeight: 16.25, color: '#fff' },
  signedMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
});
