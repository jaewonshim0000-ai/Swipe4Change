import { useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSnapshot } from '../data/provider';
import { Petition, Snapshot, topics, verificationLabels, verificationModes } from '../domain/model';
import { rankFeed, trendingScore } from '../domain/rules';
import { DiscoveryHero, DiscoveryFooter, FeedRecipe } from '../components/discovery-editorial';
import { SwipeDeck } from '../components/swipe-deck';
import { PetitionCard, PetitionRow } from '../components/petition-card';
import {
  Button,
  Chip,
  Empty,
  Field,
  Loading,
  Notice,
  Page,
  styles,
  colors,
} from '../components/ui';
export function Grid({ petitions, snapshot }: { petitions: Petition[]; snapshot: Snapshot }) {
  const { width } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const columns = containerWidth >= 1000 ? 3 : containerWidth >= 650 ? 2 : 1;
  const cardWidth = containerWidth
    ? (containerWidth - 24 * (columns - 1)) / columns
    : Math.min(width - 32, 400);
  return (
    <View
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, width: '100%' }}
    >
      {petitions.map((p) => (
        <View key={p.id} style={{ width: cardWidth, minWidth: 0 }}>
          <PetitionCard petition={p} snapshot={snapshot} showReason />
        </View>
      ))}
    </View>
  );
}
/** Explore browses by intent; Home ranks for you. The two screens need different section chips. */
const sections = {
  home: ['For you', 'Trending', 'Saved'],
  explore: ['Trending', 'Near you', 'Recently updated', 'Ending soon', 'Saved'],
};
const blurbs: Record<string, string> = {
  Trending:
    'Capped signature velocity, saves and discussion activity. Small samples are discounted.',
  'Recently updated': 'Organizer updates and material edits first.',
  'Ending soon': 'Closest deadline first.',
  Saved: 'Saving is how you follow a petition.',
};
/** Most recent organizer activity, falling back to when the petition was published. */
const lastTouched = (p: Petition) =>
  Math.max(
    Date.parse(p.createdAt),
    ...[...p.updates, ...p.edits].map((e) => Date.parse(e.date)).filter(Number.isFinite),
  );
export function Feed({ explore = false }: { explore?: boolean }) {
  const q = useSnapshot();
  const { width } = useWindowDimensions();
  const [now] = useState(Date.now);
  const [topic, setTopic] = useState('All topics');
  const [search, setSearch] = useState('');
  const [local, setLocal] = useState(false);
  const [sort, setSort] = useState(explore ? 'Trending' : 'For you');
  const [why, setWhy] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'swipe' | null>(null);
  const showGrid =
    explore || sort === 'Saved' || (viewMode ?? (width >= 760 ? 'grid' : 'swipe')) === 'grid';
  // The mobile design gives Home the deck alone and moves search and sections to Explore. Wider
  // viewports keep the browse controls, where a full-width grid has room for them.
  const showBrowseControls = explore || width >= 760;
  const [requirement, setRequirement] = useState('Any requirement');
  if (q.isPending) return <Loading />;
  if (q.error)
    return (
      <Page>
        <Notice error text={q.error.message} />
        <Button
          title="Retry feed"
          onPress={() => {
            void q.refetch();
          }}
        />
      </Page>
    );
  const s = q.data;
  const query = search.trim().toLowerCase();
  let petitions = rankFeed(s.petitions, s.profile, now, s.signed).filter(
    (p) =>
      (topic === 'All topics' || p.topic === topic) &&
      (!local || p.city === s.profile?.city) &&
      (!query ||
        `${p.title} ${p.summary} ${p.problem} ${p.action} ${p.recipient} ${p.city} ${p.topic} ${p.creator} ${s.communities.find((c) => c.id === p.communityId)?.name ?? ''}`
          .toLowerCase()
          .includes(query)) &&
      (requirement === 'Any requirement' || p.verification === requirement),
  );
  if (sort === 'Trending')
    petitions = petitions.sort((a, b) => trendingScore(b) - trendingScore(a));
  if (sort === 'Recently updated')
    petitions = petitions.sort((a, b) => lastTouched(b) - lastTouched(a));
  if (sort === 'Ending soon')
    petitions = petitions.sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline));
  if (sort === 'Near you') petitions = petitions.filter((p) => p.city === s.profile?.city);
  if (sort === 'Saved') petitions = petitions.filter((p) => s.saved.includes(p.id));
  const blurb = query
    ? `${petitions.length} match${petitions.length === 1 ? '' : 'es'} for “${search.trim()}” across titles, topics, cities, organizers and communities`
    : sort === 'Near you'
      ? `Approximate city match only — ${s.profile?.city ?? 'set a city in Profile'}.`
      : blurbs[sort];
  return (
    <Page
      title={explore ? 'Find a cause that feels close to home.' : undefined}
      subtitle={
        explore
          ? 'Search your community’s petitions, explore a topic, and choose your next step.'
          : undefined
      }
      eyebrow={explore ? 'EXPLORE WHAT MATTERS' : undefined}
    >
      {!explore && showBrowseControls && <DiscoveryHero snapshot={s} />}
      <View style={[styles.between, { paddingTop: 16 }]}>
        <View style={{ gap: 6 }}>
          <Text style={styles.label}>
            {explore ? 'LOOK A LITTLE CLOSER' : 'YOUR NEXT SMALL ACT'}
          </Text>
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              width < 600
                ? { fontSize: 28, lineHeight: 31, letterSpacing: -1 }
                : { fontSize: 36, lineHeight: 44, letterSpacing: -0.6 },
            ]}
          >
            {sort === 'Saved' ? 'Your saved petitions' : 'Browse active petitions'}
          </Text>
        </View>
        <Text accessibilityLiveRegion="polite" style={styles.muted}>
          {petitions.length} {petitions.length === 1 ? 'petition' : 'petitions'} to explore
        </Text>
      </View>
      {showBrowseControls && (
        <Field
          label="Search petitions"
          value={search}
          onChangeText={setSearch}
          placeholder="Search a cause, recipient, or city…"
        />
      )}
      {/* Explore's five sections overflow a phone row, so they scroll like the topic chips. */}
      {showBrowseControls && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.row, { flexWrap: 'nowrap', gap: 8 }]}
        >
          {sections[explore ? 'explore' : 'home'].map((x) => (
            <Chip key={x} label={x} selected={sort === x} onPress={() => setSort(x)} />
          ))}
        </ScrollView>
      )}
      <View style={[styles.between, { justifyContent: 'flex-start' }]}>
        <Button
          title={width < 600 ? 'Why?' : 'Why these?'}
          icon={width < 600 ? undefined : 'options-outline'}
          variant="ghost"
          onPress={() => setWhy(!why)}
        />
      </View>
      {why && <FeedRecipe />}
      {!!blurb && <Text style={styles.small}>{blurb}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, { flexWrap: 'nowrap', paddingBottom: 4 }]}
      >
        <View style={[styles.row, { flexWrap: 'nowrap' }]}>
          {['All topics', ...topics].map((t) => (
            <Chip key={t} label={t} selected={topic === t} onPress={() => setTopic(t)} />
          ))}
          {/* Explore has a "Near you" section chip already; a second one would just confuse. */}
          {s.profile && !explore && (
            <Chip label="Near me" selected={local} onPress={() => setLocal(!local)} />
          )}
        </View>
      </ScrollView>
      {explore && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.row, { flexWrap: 'nowrap', paddingBottom: 4 }]}
        >
          {(['Any requirement', ...verificationModes] as const).map((x) => (
            <Chip
              key={x}
              label={x === 'Any requirement' ? x : verificationLabels[x]}
              selected={requirement === x}
              onPress={() => setRequirement(x)}
            />
          ))}
        </ScrollView>
      )}
      {!explore && sort !== 'Saved' && (
        <View
          style={[styles.row, { paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.line }]}
        >
          <Chip label="Card view" selected={showGrid} onPress={() => setViewMode('grid')} />
          <Chip label="Swipe view" selected={!showGrid} onPress={() => setViewMode('swipe')} />
        </View>
      )}
      {petitions.length ? (
        explore && width < 760 ? (
          // A phone fits one full card or six rows; browsing wants the rows.
          <View style={{ gap: 12 }}>
            {petitions.map((p) => (
              <PetitionRow key={p.id} petition={p} snapshot={s} />
            ))}
          </View>
        ) : showGrid ? (
          <Grid petitions={petitions} snapshot={s} />
        ) : (
          <SwipeDeck
            key={`${s.profile?.id}-${topic}-${sort}-${local}`}
            petitions={petitions}
            snapshot={s}
          />
        )
      ) : (
        <View style={{ gap: 12 }}>
          <Empty
            title={query ? 'Nothing matches yet' : 'A little quiet here'}
            body={
              query
                ? 'Try a city like Riverton, a topic like Environment, or an organizer’s name.'
                : 'Try another topic, or save a petition to find it here.'
            }
          />
          {!!query && (
            <Button title="Clear search" variant="secondary" onPress={() => setSearch('')} />
          )}
        </View>
      )}
      {!explore && showBrowseControls && <DiscoveryFooter snapshot={s} />}
    </Page>
  );
}
