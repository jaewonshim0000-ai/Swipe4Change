import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, CATEGORY_STYLE, FONTS } from '../theme';
import { fmtNumber } from '../utils/helpers';
import { petitionImage } from '../utils/categoryImages';

// Rendered offscreen and captured with react-native-view-shot when the user
// shares a petition — a square social-media-ready card.
const SIZE = 540;

export default function ShareCard({ petition }) {
  const cat = CATEGORY_STYLE[petition.category] || CATEGORY_STYLE.Climate;
  const pct = petition.goal > 0 ? Math.min(100, (petition.signed / petition.goal) * 100) : 0;

  return (
    <View style={s.card}>
      <LinearGradient colors={[cat.from, cat.to]} style={StyleSheet.absoluteFill} />
      <Image source={{ uri: petitionImage(petition) }} style={[StyleSheet.absoluteFill, { opacity: 0.5 }]} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(10,14,25,0.85)', '#0a0e19']}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={s.topRow}>
        <View style={s.catChip}>
          <MaterialCommunityIcons name={cat.icon} size={14} color="white" />
          <Text style={s.catText}>{petition.category.toUpperCase()}</Text>
        </View>
      </View>

      <View style={s.bottom}>
        <Text style={s.org}>{(petition.organization || '').toUpperCase()}</Text>
        <Text style={s.title} numberOfLines={3}>{petition.title}</Text>

        {petition.goal > 0 ? (
          <>
            <View style={s.statsRow}>
              <Text style={s.signed}>{fmtNumber(petition.signed)}</Text>
              <Text style={s.goal}>of {fmtNumber(petition.goal)} signatures</Text>
            </View>
            <View style={s.barBg}>
              <View style={[s.barFill, { width: `${pct}%`, backgroundColor: cat.glow }]} />
            </View>
          </>
        ) : (
          <Text style={[s.goal, { color: cat.glow }]}>
            PUBLIC COMMENT OPEN{petition.daysLeft != null ? ` · CLOSES IN ${petition.daysLeft} DAYS` : ''}
          </Text>
        )}

        <View style={s.footer}>
          <View style={s.logoBox}>
            <MaterialCommunityIcons name="lightning-bolt" size={14} color="white" />
          </View>
          <Text style={s.brand}>Swipe4Change</Text>
          <Text style={s.cta}>· Swipe. Sign. Change.</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { width: SIZE, height: SIZE, borderRadius: 0, overflow: 'hidden', backgroundColor: COLORS.surface },
  topRow: { position: 'absolute', top: 28, left: 28 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7,
  },
  catText: { color: 'white', fontSize: 12, fontFamily: FONTS.sansBlack, letterSpacing: 2 },
  bottom: { position: 'absolute', left: 28, right: 28, bottom: 28 },
  org: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: FONTS.sansBold, letterSpacing: 2, marginBottom: 8 },
  title: { color: 'white', fontSize: 34, fontFamily: FONTS.sansBlack, lineHeight: 38, letterSpacing: -0.8, marginBottom: 14 },
  statsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  signed: { color: 'white', fontSize: 24, fontFamily: FONTS.sansBlack, },
  goal: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: FONTS.sansBold, },
  barBg: { height: 7, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, overflow: 'hidden', marginBottom: 18 },
  barFill: { height: '100%', borderRadius: 999 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  logoBox: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  brand: { color: 'white', fontSize: 15, fontFamily: FONTS.sansBlack, fontStyle: 'italic' },
  cta: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: FONTS.sansSemi, },
});
