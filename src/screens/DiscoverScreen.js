import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORY_STYLE, COLORS, FONTS, fmt } from '../theme';
import { hSelect } from '../utils/haptics';
import { useApp } from '../contexts/AppContext';
import ScreenBackground from '../components/ScreenBackground';
import { Display, MonoLabel } from '../components/Glass';
import AppHeader from '../components/AppHeader';
import PetitionListItem from '../components/PetitionListItem';
import Press from '../components/Press';
import Icon from '../components/Icon';

const URGENCY_RANK = { low: 1, medium: 2, high: 3, critical: 4 };
const SORTS = [
  { key: 'trending', label: 'Trending' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'newest', label: 'Newest' },
];

export default function DiscoverScreen({ navigation }) {
  const { petitions } = useApp();
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState(null);
  const [sort, setSort] = useState('trending');

  const open = (id) => navigation.navigate('PetitionDetail', { petitionId: id });
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    let res = petitions.filter((p) => {
      if (filterCat && p.category !== filterCat) return false;
      if (!q) return true;
      return `${p.title}${p.summary}${p.organization}${p.location}${p.category}${(p.tags || []).join(' ')}`
        .toLowerCase()
        .includes(q);
    });
    if (sort === 'urgent') res = [...res].sort((a, b) => (URGENCY_RANK[b.urgency] || 0) - (URGENCY_RANK[a.urgency] || 0));
    else if (sort === 'newest') res = [...res].sort((a, b) => String(b.id).localeCompare(String(a.id)));
    else res = [...res].sort((a, b) => (b.weeklyIncrease || 0) - (a.weeklyIncrease || 0));
    return res;
  }, [petitions, q, filterCat, sort]);

  const closingSoon = useMemo(
    () => petitions.filter((p) => p.daysLeft <= 7).sort((a, b) => a.daysLeft - b.daysLeft),
    [petitions],
  );
  const showRail = !q && !filterCat;

  const chips = [{ key: null, label: 'All', icon: 'apps' },
    ...Object.keys(CATEGORY_STYLE).map((k) => ({ key: k, label: k, icon: CATEGORY_STYLE[k].icon }))];

  return (
    <ScreenBackground>
      <SafeAreaView style={s.container} edges={['top']}>
        <AppHeader
          onProfilePress={() => navigation.navigate('Profile')}
          onNotifPress={() => navigation.navigate('Notifications')}
        />

        <View style={s.head}>
          <Display size={32} lineHeight={32}>Discover</Display>
          <Text style={s.sub}>{petitions.length} live campaigns across 8 causes</Text>

          <View style={s.search}>
            <Icon name="search" size={17} color="rgba(255,255,255,.4)" />
            <TextInput
              style={s.searchInput}
              placeholder="Search petitions, tags, organizations"
              placeholderTextColor="rgba(255,255,255,.3)"
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </View>

        {/* Category rail. A horizontal scroller with auto height collapses its
            own children, so the rail is given the chip height outright. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.chipScroll}
          contentContainerStyle={s.chipRow}
        >
          {chips.map((c) => {
            const active = filterCat === c.key;
            const col = c.key ? CATEGORY_STYLE[c.key].glow : COLORS.primary;
            return (
              <Press
                key={c.label}
                style={[
                  s.chip,
                  {
                    borderColor: active ? `${col}55` : 'rgba(255,255,255,.08)',
                    backgroundColor: active ? `${col}1f` : 'rgba(255,255,255,.03)',
                  },
                ]}
                onPress={() => { hSelect(); setFilterCat(active ? null : c.key); }}
              >
                <Icon name={c.icon} size={13} fill={active ? 1 : 0} color={active ? col : 'rgba(255,255,255,.45)'} />
                <Text style={[s.chipText, { color: active ? col : 'rgba(255,255,255,.5)' }]}>{c.label}</Text>
              </Press>
            );
          })}
        </ScrollView>

        <View style={s.sortRow}>
          <MonoLabel size={9} spacing={1.4}>{results.length} PETITIONS</MonoLabel>
          <View style={s.sortGroup}>
            {SORTS.map((so) => {
              const active = sort === so.key;
              return (
                <Press
                  key={so.key}
                  style={[s.sortBtn, active && s.sortBtnActive]}
                  onPress={() => { hSelect(); setSort(so.key); }}
                  scale={0.94}
                >
                  <Text style={[s.sortText, { color: active ? COLORS.primary : 'rgba(255,255,255,.42)' }]}>
                    {so.label}
                  </Text>
                </Press>
              );
            })}
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {showRail && closingSoon.length ? (
            <View style={s.railWrap}>
              <View style={s.railHead}>
                <Icon name="hourglass_bottom" size={13} fill={1} color={COLORS.orange} />
                <MonoLabel size={9} spacing={1.9} color={COLORS.orange}>CLOSING SOON</MonoLabel>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.railRow}>
                {closingSoon.map((p) => {
                  const cat = CATEGORY_STYLE[p.category] || CATEGORY_STYLE.Climate;
                  return (
                    <Press key={p.id} style={s.railCard} onPress={() => open(p.id)} scale={0.97}>
                      <Image source={{ uri: p.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                      <LinearGradient
                        colors={[`${cat.from}cc`, `${cat.to}33`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(6,9,17,.85)', COLORS.surfaceDeep]}
                        locations={[0.2, 0.72, 1]}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={s.railBadge}>
                        <MonoLabel size={9} spacing={0.6} weight="bold" color="#fff">
                          {p.daysLeft === 0 ? 'LAST DAY' : `${p.daysLeft}D LEFT`}
                        </MonoLabel>
                      </View>
                      <View style={s.railBody}>
                        <Icon name={cat.icon} size={17} fill={1} color={cat.glow} />
                        <Text style={s.railTitle} numberOfLines={2}>{p.title}</Text>
                        <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.55)" style={{ marginTop: 4 }}>
                          {fmt(p.signed)} SIGNATURES
                        </MonoLabel>
                      </View>
                    </Press>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <View style={s.list}>
            {results.map((p) => (
              <PetitionListItem key={p.id} petition={p} onPress={() => open(p.id)} />
            ))}

            {results.length === 0 ? (
              <View style={s.empty}>
                <Icon name="search_off" size={32} color="rgba(255,255,255,.28)" />
                <Display size={24} lineHeight={24}>Nothing matches</Display>
                <Text style={s.emptySub}>Try different keywords or clear the category filter.</Text>
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
  head: { paddingHorizontal: 20, paddingBottom: 12 },
  sub: { fontFamily: FONTS.sans, fontSize: 13, color: 'rgba(255,255,255,.45)', marginTop: 3 },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
    height: 44, paddingHorizontal: 12, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,.045)', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)',
  },
  searchInput: { flex: 1, minWidth: 0, color: '#fff', fontFamily: FONTS.sans, fontSize: 13, padding: 0 },

  chipScroll: { flexGrow: 0, flexShrink: 0, height: 37, marginBottom: 12 },
  chipRow: { gap: 8, paddingHorizontal: 20, alignItems: 'center' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    height: 35, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1,
  },
  chipText: { fontFamily: FONTS.sansBold, fontSize: 11 },

  sortRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  sortGroup: {
    flexDirection: 'row', gap: 3, padding: 3, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,.045)', borderWidth: 1, borderColor: 'rgba(255,255,255,.07)',
  },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9 },
  sortBtnActive: { backgroundColor: 'rgba(177,197,255,.14)' },
  sortText: { fontFamily: FONTS.sansBold, fontSize: 11 },

  scroll: { paddingBottom: 96 },
  railWrap: { marginBottom: 20 },
  railHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 8 },
  railRow: { gap: 12, paddingHorizontal: 20 },
  railCard: {
    position: 'relative', width: 168, height: 186, borderRadius: 22, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,.09)',
  },
  railBadge: {
    position: 'absolute', top: 11, right: 11,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
    backgroundColor: 'rgba(249,115,22,.85)',
  },
  railBody: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  railTitle: { fontFamily: FONTS.sansBold, fontSize: 13, lineHeight: 16.25, color: '#fff', marginTop: 4 },

  list: { paddingHorizontal: 20, gap: 12 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 48, paddingHorizontal: 32 },
  emptySub: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 19.5, color: 'rgba(255,255,255,.45)', textAlign: 'center' },
});
