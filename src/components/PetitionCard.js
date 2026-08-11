import React from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, CATEGORY_STYLE, FONTS, URGENCY_COLOR, fmt } from '../theme';
import { GlassPill, MonoLabel } from './Glass';
import Icon from './Icon';

// The feed card, laid out exactly as the design's deck card: full-bleed photo,
// category tint and legibility scrim, glass chrome across the top, then an
// editorial block pinned to the bottom.
export default function PetitionCard({ petition, signOpacity, skipOpacity }) {
  const cat = CATEGORY_STYLE[petition.category] || CATEGORY_STYLE.Climate;
  const urg = URGENCY_COLOR[petition.urgency] || URGENCY_COLOR.medium;
  const pct = Math.min(100, (petition.signed / petition.goal) * 100);
  const soon = petition.daysLeft <= 7;

  return (
    <View style={s.shell}>
      <Image source={{ uri: petition.image }} style={s.photo} resizeMode="cover" />

      {/* linear-gradient(150deg, from cc, to 22 55%, transparent) */}
      <LinearGradient
        colors={[`${cat.from}cc`, `${cat.to}22`, 'transparent']}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* linear-gradient(180deg, .55 / transparent 26% / .55 58% / #05070d) */}
      <LinearGradient
        colors={['rgba(6,9,17,0.55)', 'transparent', 'rgba(6,9,17,0.55)', COLORS.surfaceDeep]}
        locations={[0, 0.26, 0.58, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* top chrome */}
      <View style={s.topRow} pointerEvents="none">
        <View style={s.topLeft}>
          <GlassPill style={s.catPill}>
            <Icon name={cat.icon} size={13} fill={1} color={cat.glow} />
            <MonoLabel size={9} spacing={1.5} weight="bold" color="#fff" style={{ marginLeft: 8 }}>
              {petition.category.toUpperCase()}
            </MonoLabel>
          </GlassPill>

          <View style={[s.sdgPill, { backgroundColor: `${cat.sdg.color}33`, borderColor: `${cat.sdg.color}88` }]}>
            <MonoLabel size={9} spacing={0.4} weight="bold" color="#fff">SDG {cat.sdg.n}</MonoLabel>
            <Text style={s.sdgName} numberOfLines={1}>{cat.sdg.name}</Text>
          </View>
        </View>

        <View style={[s.urgPill, { backgroundColor: `${urg}2e`, borderColor: `${urg}80` }]}>
          <View style={[s.urgDot, { backgroundColor: urg, shadowColor: urg }]} />
          <MonoLabel size={9} spacing={1.2} weight="bold" color="#fff">
            {soon ? `${petition.daysLeft}D LEFT` : petition.urgency.toUpperCase()}
          </MonoLabel>
        </View>
      </View>

      {/* drag stamps */}
      <Animated.View style={[s.stamp, s.signStamp, { opacity: signOpacity ?? 0 }]} pointerEvents="none">
        <Text style={[s.stampText, { color: COLORS.tertiary }]}>SIGN</Text>
      </Animated.View>
      <Animated.View style={[s.stamp, s.skipStamp, { opacity: skipOpacity ?? 0 }]} pointerEvents="none">
        <Text style={[s.stampText, { color: COLORS.error }]}>SKIP</Text>
      </Animated.View>

      {/* editorial block */}
      <View style={s.content} pointerEvents="none">
        <View style={s.orgRow}>
          <LinearGradient
            colors={[cat.from, cat.to]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.orgDot}
          >
            <Text style={s.orgInitial}>{petition.organization[0]}</Text>
          </LinearGradient>
          <MonoLabel size={9} spacing={1.3} color="rgba(255,255,255,.66)" style={s.orgName}>
            {petition.organization.toUpperCase()}
          </MonoLabel>
          {petition.verified ? <Icon name="verified" size={13} fill={1} color={COLORS.tertiary} /> : null}
        </View>

        <Text style={s.title} numberOfLines={3}>{petition.title}</Text>
        <Text style={s.summary} numberOfLines={2}>{petition.summary}</Text>

        <View style={s.statStrip}>
          <View style={s.stat}>
            <Text style={s.statValue}>{fmt(petition.signed)}</Text>
            <MonoLabel size={9} spacing={1.3} color="rgba(255,255,255,.42)">SIGNATURES</MonoLabel>
          </View>
          <View style={s.statDivider} />
          <View style={[s.stat, s.statPad]}>
            <Text style={[s.statValue, { color: COLORS.tertiary }]}>+{fmt(petition.weeklyIncrease)}</Text>
            <MonoLabel size={9} spacing={1.3} color="rgba(255,255,255,.42)">THIS WEEK</MonoLabel>
          </View>
          <View style={s.statDivider} />
          <View style={[s.stat, s.statPad]}>
            <Text style={[s.statValue, { color: soon ? urg : '#fff' }]}>{petition.daysLeft}d</Text>
            <MonoLabel size={9} spacing={1.3} color="rgba(255,255,255,.42)">TO DEADLINE</MonoLabel>
          </View>
        </View>

        <View style={s.progressTrack}>
          <LinearGradient
            colors={[cat.glow, '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[s.progressFill, { width: `${pct}%`, shadowColor: cat.glow }]}
          />
        </View>

        <View style={s.progressMeta}>
          <View style={s.joinRow}>
            <View style={s.avatars}>
              <LinearGradient colors={['#5c8cfb', '#1b58c5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.av} />
              <LinearGradient colors={['#4edea3', '#00a572']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.av, s.avOverlap]} />
              <LinearGradient colors={['#f472b6', '#a78bfa']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.av, s.avOverlap]} />
            </View>
            <Text style={s.joinLabel}>Join {fmt(petition.signed)} people</Text>
          </View>
          <Text style={[s.pctLabel, { color: cat.glow }]}>{pct.toFixed(0)}%</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  shell: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.10)',
  },
  photo: { ...StyleSheet.absoluteFillObject },

  topRow: {
    position: 'absolute', top: 14, left: 14, right: 14,
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
  },
  topLeft: { gap: 8, alignItems: 'flex-start', flexShrink: 1 },
  catPill: { paddingVertical: 8, paddingLeft: 8, paddingRight: 12 },
  sdgPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 4, paddingHorizontal: 8,
    borderRadius: 999, borderWidth: 1,
  },
  sdgName: { fontFamily: FONTS.sansBold, fontSize: 9, color: 'rgba(255,255,255,.8)' },
  urgPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 999, borderWidth: 1,
  },
  urgDot: {
    width: 6, height: 6, borderRadius: 3,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4,
  },

  stamp: {
    position: 'absolute', top: 88,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 3, borderRadius: 12,
  },
  signStamp: { left: 22, borderColor: COLORS.tertiary, backgroundColor: 'rgba(0,165,114,.16)', transform: [{ rotate: '-14deg' }] },
  skipStamp: { right: 22, borderColor: COLORS.error, backgroundColor: 'rgba(147,0,10,.18)', transform: [{ rotate: '14deg' }] },
  stampText: { fontFamily: FONTS.sansBold, fontSize: 24, letterSpacing: 2 },

  content: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 20 },
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  orgDot: { width: 18, height: 18, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  orgInitial: { fontFamily: FONTS.sansBold, fontSize: 9, color: '#fff' },
  orgName: { flexShrink: 1 },

  // font-size:40px; line-height:.96; letter-spacing:-.5px
  title: { fontFamily: FONTS.serif, fontSize: 40, lineHeight: 38.4, letterSpacing: -0.5, color: '#fff', marginBottom: 8 },
  summary: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 18.85, color: 'rgba(255,255,255,.66)', marginBottom: 12 },

  statStrip: {
    flexDirection: 'row', alignItems: 'stretch', marginBottom: 12, paddingVertical: 8,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,.12)',
  },
  stat: { flex: 1, gap: 2 },
  statPad: { paddingLeft: 12 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,.12)' },
  statValue: { fontFamily: FONTS.monoBold, fontSize: 17, color: '#fff', letterSpacing: -0.3 },

  progressTrack: {
    height: 7, borderRadius: 99, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,.12)', marginBottom: 8,
  },
  progressFill: {
    height: '100%', borderRadius: 99,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 6,
  },
  progressMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  joinRow: { flexDirection: 'row', alignItems: 'center' },
  avatars: { flexDirection: 'row' },
  av: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#0b0f1a' },
  avOverlap: { marginLeft: -7 },
  joinLabel: { fontFamily: FONTS.sans, fontSize: 11, color: 'rgba(255,255,255,.6)', marginLeft: 8 },
  pctLabel: { fontFamily: FONTS.monoBold, fontSize: 11 },
});
