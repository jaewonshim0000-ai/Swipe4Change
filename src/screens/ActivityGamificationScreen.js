import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { BADGES } from '../data/petitions';
import { useApp } from '../contexts/AppContext';
import AppHeader from '../components/AppHeader';
import LevelProgress from '../components/LevelProgress';
import ContributionCalendar from '../components/ContributionCalendar';
import BadgeCard from '../components/BadgeCard';
import PetitionListItem from '../components/PetitionListItem';
import ReportModal from '../components/ReportModal';

export default function ActivityGamificationScreen({ navigation }) {
  const { signedIds, getPetitionById, contributions, earnedBadges, createdPetitions, reportPetition } = useApp();
  const [pendingReport, setPendingReport] = useState(null);
  const items = signedIds.map(getPetitionById).filter(Boolean);
  const uniqueCats = new Set(items.map((i) => i.category)).size;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <AppHeader
        onProfilePress={() => navigation.navigate('ProfileTab')}
        onNotifPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Activity</Text>
        <Text style={s.sub}>Track your impact and level up</Text>

        <View style={{ marginTop: 12 }}>
          <LevelProgress signedCount={signedIds.length} />
        </View>

        <View style={s.stats}>
          <StatChip value={signedIds.length} label="SIGNED" color={COLORS.tertiary} />
          <StatChip value={createdPetitions.length} label="CREATED" color={COLORS.primary} />
          <StatChip value={uniqueCats} label="CAUSES" color="#fbbf24" />
        </View>

        <View style={{ marginTop: 4 }}>
          <ContributionCalendar contributions={contributions} />
        </View>

        <Text style={s.section}>BADGES ({earnedBadges.length}/{BADGES.length})</Text>
        <View style={s.badgeGrid}>
          {BADGES.map((b) => (
            <BadgeCard key={b.id} badge={b} earned={earnedBadges.some((e) => e.id === b.id)} />
          ))}
        </View>

        <Text style={s.section}>RECENT SIGNATURES</Text>
        {items.length === 0 ? (
          <View style={s.empty}>
            <MaterialIcons name="history" size={28} color="rgba(255,255,255,0.3)" />
            <Text style={s.emptyTitle}>No activity yet</Text>
            <Text style={s.emptySub}>Swipe right on a petition to sign it.</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {items.slice(0, 10).map((p) => (
              <PetitionListItem
                key={p.id}
                petition={p}
                meta={`Signed - ${p.organization}`}
                onPress={() => navigation.navigate('PetitionDetail', { petitionId: p.id })}
                onReport={(petition) => setPendingReport(petition)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <ReportModal
        visible={Boolean(pendingReport)}
        petition={pendingReport}
        onClose={() => setPendingReport(null)}
        onSubmit={reportPetition}
      />
    </SafeAreaView>
  );
}

const StatChip = ({ value, label, color }) => (
  <View style={s.chip}>
    <Text style={[s.chipVal, { color }]}>{value}</Text>
    <Text style={s.chipLabel}>{label}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  sub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 8 },
  chip: {
    flex: 1, backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 14, alignItems: 'center',
  },
  chipVal: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  chipLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  section: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginTop: 24, marginBottom: 12 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  empty: { alignItems: 'center', paddingTop: 30, gap: 6 },
  emptyTitle: { color: 'white', fontSize: 16, fontWeight: '800' },
  emptySub: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
});
