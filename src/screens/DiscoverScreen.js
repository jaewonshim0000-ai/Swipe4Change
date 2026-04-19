import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, CATEGORY_STYLE } from '../theme';
import { PETITION_CATEGORIES } from '../data/petitions';
import { useApp } from '../contexts/AppContext';
import AppHeader from '../components/AppHeader';
import PetitionListItem from '../components/PetitionListItem';
import ReportModal from '../components/ReportModal';

const URGENCY_RANK = { low: 1, medium: 2, high: 3, critical: 4 };

export default function DiscoverScreen({ navigation }) {
  const { petitions, reportPetition } = useApp();
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [sortBy, setSortBy] = useState('trending');
  const [pendingReport, setPendingReport] = useState(null);

  const filtered = useMemo(() => {
    let result = [...petitions];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((p) => (
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.organization.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags || []).some((tag) => tag.toLowerCase().includes(q))
      ));
    }

    if (selectedCat) {
      result = result.filter((p) => p.category === selectedCat);
    }

    if (sortBy === 'urgent') {
      result.sort((a, b) => (URGENCY_RANK[b.urgency] || 0) - (URGENCY_RANK[a.urgency] || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    } else {
      result.sort((a, b) => (b.weeklyIncrease || 0) - (a.weeklyIncrease || 0));
    }

    return result;
  }, [petitions, query, selectedCat, sortBy]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader
        onProfilePress={() => navigation.navigate('ProfileTab')}
        onNotifPress={() => navigation.navigate('Notifications')}
      />

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.sub}>Find petitions that matter to you</Text>
      </View>

      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={18} color="rgba(255,255,255,0.4)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search petitions, tags, organizations..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <MaterialIcons name="close" size={16} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        <TouchableOpacity
          style={[styles.chip, !selectedCat && styles.chipActive]}
          onPress={() => setSelectedCat(null)}
        >
          <Text style={[styles.chipText, !selectedCat && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>

        {PETITION_CATEGORIES.map((cat) => {
          const active = selectedCat === cat.key;
          const s = CATEGORY_STYLE[cat.key] || CATEGORY_STYLE.Climate;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.chip, active && { backgroundColor: `${s.glow}20`, borderColor: `${s.glow}40` }]}
              onPress={() => setSelectedCat(active ? null : cat.key)}
            >
              <MaterialCommunityIcons name={s.icon} size={13} color={active ? s.glow : 'rgba(255,255,255,0.5)'} />
              <Text style={[styles.chipText, active && { color: s.glow }]}>{cat.key}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={styles.resultCount}>{filtered.length} petitions</Text>
        <View style={styles.sortBtns}>
          {[
            { key: 'trending', label: 'Trending', icon: 'trending-up' },
            { key: 'urgent', label: 'Urgent', icon: 'local-fire-department' },
            { key: 'newest', label: 'Newest', icon: 'schedule' },
          ].map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.sortBtn, sortBy === s.key && styles.sortBtnActive]}
              onPress={() => setSortBy(s.key)}
            >
              <MaterialIcons name={s.icon} size={12} color={sortBy === s.key ? COLORS.primary : 'rgba(255,255,255,0.4)'} />
              <Text style={[styles.sortBtnText, sortBy === s.key && { color: COLORS.primary }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.results} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="search-off" size={32} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTitle}>No petitions found</Text>
            <Text style={styles.emptySub}>Try different keywords or remove filters.</Text>
          </View>
        ) : (
          filtered.map((p) => (
            <PetitionListItem
              key={p.id}
              petition={p}
              meta={`${p.organization} - ${p.location}`}
              onPress={() => navigation.navigate('PetitionDetail', { petitionId: p.id })}
              onReport={(petition) => setPendingReport(petition)}
            />
          ))
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  titleBlock: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 8 },
  title: { color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  sub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, color: 'white', fontSize: 14 },
  chipsRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  chipActive: { backgroundColor: 'rgba(177,197,255,0.12)', borderColor: 'rgba(177,197,255,0.3)' },
  chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: COLORS.primary },
  sortRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  resultCount: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700' },
  sortBtns: { flexDirection: 'row', gap: 6 },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  sortBtnActive: { backgroundColor: 'rgba(177,197,255,0.1)' },
  sortBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700' },
  results: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyTitle: { color: 'white', fontSize: 16, fontWeight: '800' },
  emptySub: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
});
