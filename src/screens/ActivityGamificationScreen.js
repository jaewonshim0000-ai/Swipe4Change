import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CATEGORY_STYLE, COLORS, CONTRIB_STEPS, FONTS, LEVELS, SECTION_LABEL,
} from '../theme';
import { BADGES, CONTRIB_BASE } from '../data/petitions';
import { getLevel, getNextLevel } from '../utils/helpers';
import { useApp } from '../contexts/AppContext';
import ScreenBackground from '../components/ScreenBackground';
import { Display, MonoLabel } from '../components/Glass';
import AppHeader from '../components/AppHeader';
import PetitionListItem from '../components/PetitionListItem';
import Icon from '../components/Icon';

// The level card's corner bloom, drawn as a real radial like the design's
// `radial-gradient(circle, <level>33, transparent 70%)`.
function CornerGlow({ color, size = 200, top = -70, right = -50 }) {
  return (
    <View style={{ position: 'absolute', top, right, width: size, height: size }} pointerEvents="none">
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="cg" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity="0.2" />
            <Stop offset="0.7" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#cg)" />
      </Svg>
    </View>
  );
}

function StatTiles({ signed, created, causes }) {
  const tiles = [
    { key: 'a', value: String(signed), label: 'SIGNED', color: COLORS.tertiary },
    { key: 'b', value: String(created), label: 'CREATED', color: COLORS.primary },
    { key: 'c', value: String(causes), label: 'CAUSES', color: COLORS.amber },
  ];
  return (
    <View style={s.tiles}>
      {tiles.map((t) => (
        <View key={t.key} style={s.tile}>
          <Text style={[s.tileValue, { color: t.color }]}>{t.value}</Text>
          <MonoLabel size={9} spacing={1.4}>{t.label}</MonoLabel>
        </View>
      ))}
    </View>
  );
}

export default function ActivityGamificationScreen({ navigation }) {
  const {
    petitions, signedIds, createdPetitions, contributions, dailyCount, streak, badgeCounts,
  } = useApp();

  const level = getLevel(signedIds.length);
  const next = getNextLevel(level);
  const signedPetitions = signedIds.map((id) => petitions.find((p) => p.id === id)).filter(Boolean);
  const causes = new Set(signedPetitions.map((p) => p.category)).size;

  const lvPct = next
    ? ((signedIds.length - level.min) / (next.min - level.min)) * 100
    : 100;

  // The design shifts its fixed 30-day history by today's signatures.
  const cells = useMemo(() => {
    const recent = Object.keys(contributions).sort().slice(-30);
    return CONTRIB_BASE.map((base, i) => {
      const key = recent[i];
      const live = key ? contributions[key] || 0 : 0;
      const value = i >= 27 ? Math.min(4, base + dailyCount) : Math.max(base, live);
      return { key: i, value: Math.min(value, 4) };
    });
  }, [contributions, dailyCount]);

  // UN goals advanced, aggregated from what has actually been signed.
  const sdgTiles = useMemo(() => {
    const agg = {};
    signedPetitions.forEach((p) => {
      const g = (CATEGORY_STYLE[p.category] || CATEGORY_STYLE.Climate).sdg;
      agg[g.n] = agg[g.n] || { ...g, count: 0 };
      agg[g.n].count += 1;
    });
    return Object.values(agg).sort((a, b) => b.count - a.count);
  }, [signedPetitions]);

  const earned = BADGES.filter((b) => b.test(badgeCounts));

  return (
    <ScreenBackground>
      <SafeAreaView style={s.container} edges={['top']}>
        <AppHeader
          onProfilePress={() => navigation.navigate('Profile')}
          onNotifPress={() => navigation.navigate('Notifications')}
        />

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Display size={32} lineHeight={32}>Activity</Display>
          <Text style={s.sub}>Track your impact and level up</Text>

          {/* Level card */}
          <LinearGradient
            colors={[`${level.color}26`, 'rgba(27,31,43,.9)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={[s.levelCard, { shadowColor: level.color }]}
          >
            <CornerGlow color={level.color} />
            <View style={s.levelKicker}>
              <Icon name="military_tech" size={13} fill={1} color={level.color} />
              <MonoLabel size={9} spacing={1.8} weight="bold" color={level.color}>
                LEVEL {level.level}
              </MonoLabel>
            </View>
            <Display size={32} lineHeight={32}>{level.name}</Display>
            <Text style={s.levelSub}>
              {next
                ? `${signedIds.length} signed · ${next.min - signedIds.length} to ${next.name}`
                : `${signedIds.length} signed · max level`}
            </Text>
            <View style={s.levelTrack}>
              <LinearGradient
                colors={[level.color, '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.levelFill, { width: `${Math.max(3, Math.min(100, lvPct))}%` }]}
              />
            </View>
            <View style={s.levelEnds}>
              <MonoLabel size={9} spacing={1.5}>{level.name.toUpperCase()}</MonoLabel>
              <MonoLabel size={9} spacing={1.5}>{next ? next.name.toUpperCase() : 'MAX'}</MonoLabel>
            </View>
          </LinearGradient>

          <StatTiles signed={signedIds.length} created={createdPetitions.length} causes={causes} />

          {/* Streaks */}
          <LinearGradient
            colors={['rgba(251,191,36,.10)', 'rgba(249,115,22,.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={s.streakCard}
          >
            <View style={s.streakHalf}>
              <Icon name="local_fire_department" size={24} fill={1} color={COLORS.amber} />
              <View>
                <Text style={s.streakValue}>{streak.current} days</Text>
                <MonoLabel size={9} spacing={1.4} style={{ marginTop: 1 }}>CURRENT STREAK</MonoLabel>
              </View>
            </View>
            <View style={s.streakDivider} />
            <View style={s.streakHalf}>
              <Icon name="emoji_events" size={24} fill={1} color={COLORS.amber} />
              <View>
                <Text style={s.streakValue}>{streak.best} days</Text>
                <MonoLabel size={9} spacing={1.4} style={{ marginTop: 1 }}>BEST STREAK</MonoLabel>
              </View>
            </View>
          </LinearGradient>

          {/* Contributions */}
          <View style={s.contribCard}>
            <View style={s.contribHead}>
              <Text style={s.cardTitle}>Contributions</Text>
              <MonoLabel size={9} spacing={0}>LAST 30 DAYS</MonoLabel>
            </View>
            <View style={s.grid}>
              {cells.map((c) => (
                <View
                  key={c.key}
                  style={[
                    s.cell,
                    { backgroundColor: CONTRIB_STEPS[c.value] },
                    c.value > 2 && { shadowColor: COLORS.tertiary, shadowOpacity: 0.35, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
                  ]}
                />
              ))}
            </View>
            <View style={s.legend}>
              <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.3)">LESS</MonoLabel>
              {CONTRIB_STEPS.map((bg) => <View key={bg} style={[s.legendCell, { backgroundColor: bg }]} />)}
              <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.3)">MORE</MonoLabel>
            </View>
          </View>

          {sdgTiles.length ? (
            <>
              <Text style={s.sectionLabel}>GLOBAL GOALS YOU&apos;VE ADVANCED</Text>
              <View style={{ gap: 8 }}>
                {sdgTiles.map((g) => (
                  <View key={g.n} style={[s.sdgRow, { borderColor: `${g.color}55` }]}>
                    <View style={[s.sdgNum, { backgroundColor: g.color }]}>
                      <Text style={s.sdgNumText}>{g.n}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.cardTitle}>{g.name}</Text>
                      <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.42)" style={{ marginTop: 2 }}>
                        {g.count} SIGNATURE{g.count === 1 ? '' : 'S'}
                      </MonoLabel>
                    </View>
                    <Icon name="chevron_right" size={17} color="rgba(255,255,255,.25)" />
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <Text style={s.sectionLabel}>BADGES {earned.length}/{BADGES.length}</Text>
          <View style={s.badgeGrid}>
            {BADGES.map((b) => {
              const ok = b.test(badgeCounts);
              return (
                <View
                  key={b.id}
                  style={[
                    s.badge,
                    ok
                      ? { backgroundColor: 'rgba(251,191,36,.08)', borderColor: 'rgba(251,191,36,.28)' }
                      : { backgroundColor: 'rgba(255,255,255,.028)', borderColor: 'rgba(255,255,255,.055)' },
                  ]}
                >
                  <View style={[s.badgeIcon, { backgroundColor: ok ? 'rgba(251,191,36,.16)' : 'rgba(255,255,255,.04)' }]}>
                    <Icon name={b.icon} size={24} fill={1} color={ok ? COLORS.amber : 'rgba(255,255,255,.18)'} />
                  </View>
                  <Text style={[s.badgeName, { color: ok ? '#fff' : 'rgba(255,255,255,.35)' }]}>{b.name}</Text>
                  <Text style={[s.badgeDesc, { color: ok ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.25)' }]}>
                    {b.desc}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={s.sectionLabel}>RECENT SIGNATURES</Text>
          <View style={{ gap: 12 }}>
            {signedPetitions.slice(0, 6).map((p) => (
              <PetitionListItem
                key={p.id}
                petition={p}
                variant="signed"
                onPress={() => navigation.navigate('PetitionDetail', { petitionId: p.id })}
              />
            ))}
            {signedPetitions.length === 0 ? (
              <View style={s.noSign}>
                <Icon name="history" size={24} color="rgba(255,255,255,.28)" />
                <Text style={s.cardTitle}>No activity yet</Text>
                <Text style={s.noSignSub}>Swipe right on a petition to sign it.</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 96 },
  sub: { fontFamily: FONTS.sans, fontSize: 13, color: 'rgba(255,255,255,.45)', marginTop: 3, marginBottom: 16 },
  sectionLabel: SECTION_LABEL,

  levelCard: {
    position: 'relative', overflow: 'hidden', borderRadius: 26, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,.09)',
    shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.5, shadowRadius: 22, elevation: 10,
  },
  levelKicker: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  levelSub: { fontFamily: FONTS.sans, fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 8, marginBottom: 16 },
  levelTrack: { height: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,.1)', overflow: 'hidden', marginBottom: 8 },
  levelFill: { height: '100%', borderRadius: 99 },
  levelEnds: { flexDirection: 'row', justifyContent: 'space-between' },

  tiles: { flexDirection: 'row', gap: 8, marginTop: 12 },
  tile: {
    flex: 1, padding: 12, borderRadius: 18, alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,.07)',
  },
  tileValue: { fontFamily: FONTS.monoBold, fontSize: 24 },

  streakCard: {
    flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 12, borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(251,191,36,.22)',
  },
  streakHalf: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  streakDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,.09)' },
  streakValue: { fontFamily: FONTS.monoBold, fontSize: 17, color: '#fff' },

  contribCard: {
    marginTop: 12, padding: 16, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,.07)',
  },
  contribHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { fontFamily: FONTS.sansBold, fontSize: 13, color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { width: '8.8%', aspectRatio: 1, borderRadius: 5 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 12 },
  legendCell: { width: 11, height: 11, borderRadius: 3 },

  sdgRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,.035)', borderWidth: 1,
  },
  sdgNum: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sdgNumText: { fontFamily: FONTS.monoBold, fontSize: 13, color: '#fff' },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    width: '48.5%', padding: 12, borderRadius: 18, borderWidth: 1,
    alignItems: 'center', gap: 4,
  },
  badgeIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeName: { fontFamily: FONTS.sansBold, fontSize: 13, textAlign: 'center' },
  badgeDesc: { fontFamily: FONTS.sans, fontSize: 11, lineHeight: 14.85, textAlign: 'center' },

  noSign: {
    alignItems: 'center', gap: 8, paddingVertical: 24, paddingHorizontal: 32,
    borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,.1)',
  },
  noSignSub: { fontFamily: FONTS.sans, fontSize: 13, color: 'rgba(255,255,255,.45)', textAlign: 'center' },
});
