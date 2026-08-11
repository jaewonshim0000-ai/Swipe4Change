import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, DAILY_GOAL } from '../theme';
import { getLevel } from '../utils/helpers';
import { useApp } from '../contexts/AppContext';
import ScreenBackground from '../components/ScreenBackground';
import { MonoLabel } from '../components/Glass';
import AppHeader from '../components/AppHeader';
import SwipeDeck from '../components/SwipeDeck';
import ActionButtons from '../components/ActionButtons';
import SignModal from '../components/SignModal';
import Icon from '../components/Icon';

export default function SwipeFeedScreen({ navigation }) {
  const {
    petitions,
    deckIndex,
    dailyCount,
    advanceDeck,
    rewindDeck,
    resetDeck,
    signPetition,
    signedIds,
    streak,
  } = useApp();

  const level = getLevel(signedIds.length);
  const deckRef = useRef(null);
  const [pendingSign, setPendingSign] = useState(null);

  // The design's deck is every petition the user has not signed yet.
  const deck = useMemo(
    () => petitions.filter((p) => !signedIds.includes(p.id)),
    [petitions, signedIds],
  );
  const cards = deck.slice(deckIndex, deckIndex + 3);
  const current = cards[0];

  const handleConfirm = (petition, comment) => {
    signPetition(petition.id, { comment });
    setPendingSign(null);
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={s.container} edges={['top']}>
        <AppHeader
          onProfilePress={() => navigation.navigate('Profile')}
          onNotifPress={() => navigation.navigate('Notifications')}
        />

        {/* DAILY IMPACT bar */}
        <View style={s.hud}>
          <View style={s.hudTop}>
            <View style={s.hudLeft}>
              <MonoLabel size={9} spacing={1.8} color="rgba(255,255,255,.42)">DAILY IMPACT</MonoLabel>
              <MonoLabel size={9} spacing={1.4} weight="bold" color="#fff">
                {dailyCount}/{DAILY_GOAL}
              </MonoLabel>
            </View>
            <View style={s.hudRight}>
              <View style={s.streakChip}>
                <Icon name="local_fire_department" size={11} fill={1} color={COLORS.amber} />
                <MonoLabel size={9} spacing={0.6} weight="bold" color={COLORS.amber}>
                  {streak.current}D
                </MonoLabel>
              </View>
              <View style={s.levelChip}>
                <Icon name="military_tech" size={11} fill={1} color={COLORS.primary} />
                <MonoLabel size={9} spacing={0.6} weight="bold" color={COLORS.primary}>
                  LV {level.level}
                </MonoLabel>
              </View>
            </View>
          </View>

          <View style={s.track}>
            <View style={s.segments} pointerEvents="none">
              {[0, 1, 2, 3].map((i) => <View key={i} style={s.segment} />)}
              <View style={{ flex: 1 }} />
            </View>
            <View style={[s.fill, { width: `${Math.min(100, (dailyCount / DAILY_GOAL) * 100)}%` }]} />
          </View>
        </View>

        <View style={s.deckArea}>
          <SwipeDeck
            ref={deckRef}
            cards={cards}
            onSignSwipe={(petition) => {
              // Federal comment periods cannot be signed in the sheet; they
              // open their detail page, where the official action lives.
              if (petition.external && petition.canSignInApp === false) {
                advanceDeck();
                navigation.navigate('PetitionDetail', { petitionId: petition.id });
                return;
              }
              setPendingSign(petition);
            }}
            onSkipSwipe={() => advanceDeck()}
            onTap={(petition) => navigation.navigate('PetitionDetail', { petitionId: petition.id })}
            onReset={resetDeck}
          />
        </View>

        <ActionButtons
          onUndo={rewindDeck}
          canUndo={deckIndex > 0}
          onSkip={() => deckRef.current?.flick(-1)}
          onInfo={() => current && navigation.navigate('PetitionDetail', { petitionId: current.id })}
          onSign={() => deckRef.current?.flick(1)}
          disabled={!current}
        />

        <SignModal
          visible={Boolean(pendingSign)}
          petition={pendingSign}
          onCancel={() => setPendingSign(null)}
          onConfirm={handleConfirm}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  hud: { paddingHorizontal: 20, paddingBottom: 12 },
  hudTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  hudLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hudRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
    backgroundColor: 'rgba(251,191,36,.10)', borderWidth: 1, borderColor: 'rgba(251,191,36,.26)',
  },
  levelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
    backgroundColor: 'rgba(177,197,255,.10)', borderWidth: 1, borderColor: 'rgba(177,197,255,.24)',
  },
  track: { position: 'relative', height: 5, borderRadius: 99, backgroundColor: 'rgba(255,255,255,.06)', overflow: 'hidden' },
  segments: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', opacity: 0.5 },
  segment: { flex: 1, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.14)' },
  fill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 99,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 5,
  },
  deckArea: { flex: 1, marginHorizontal: 16, minHeight: 0 },
});
