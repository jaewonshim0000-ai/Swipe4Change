import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme';
import { useApp } from '../contexts/AppContext';
import AppHeader from '../components/AppHeader';
import SwipeDeck from '../components/SwipeDeck';
import ActionButtons from '../components/ActionButtons';
import SignModal from '../components/SignModal';
<<<<<<< HEAD
import ReportModal from '../components/ReportModal';
=======
>>>>>>> 05775e151d80f152aef53ed06bc50aff42569ebe

export default function SwipeFeedScreen({ navigation }) {
  const {
    user, petitions, deckIndex, dailyCount, DAILY_GOAL,
<<<<<<< HEAD
    advanceDeck, signPetition, resetDeck, reportPetition,
  } = useApp();

  const [pendingSign, setPendingSign] = useState(null);
  const [pendingReport, setPendingReport] = useState(null);
=======
    advanceDeck, signPetition, resetDeck,
  } = useApp();

  const [pendingSign, setPendingSign] = useState(null);
>>>>>>> 05775e151d80f152aef53ed06bc50aff42569ebe
  const [modalVisible, setModalVisible] = useState(false);

  const handleSwipeRight = (petition) => {
    setPendingSign(petition);
    setModalVisible(true);
  };
  const handleSwipeLeft = () => advanceDeck();
  const handleTap = (petition) => navigation.navigate('PetitionDetail', { petitionId: petition.id });

<<<<<<< HEAD
  const handleConfirmSign = (petition, comment) => {
    signPetition(petition.id, { comment });
=======
  const handleConfirmSign = (petition) => {
    signPetition(petition.id);
>>>>>>> 05775e151d80f152aef53ed06bc50aff42569ebe
    setModalVisible(false);
    setPendingSign(null);
    advanceDeck();
  };
  const handleCancelSign = () => {
    setModalVisible(false);
    setPendingSign(null);
    advanceDeck();
  };

  const triggerSwipe = (dir) => {
    if (SwipeDeck.triggerSwipe) SwipeDeck.triggerSwipe(dir);
  };

  const currentPetition = petitions[deckIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader
        onProfilePress={() => navigation.navigate('ProfileTab')}
        onNotifPress={() => navigation.navigate('Notifications')}
      />

      <View style={styles.hud}>
        <View style={styles.hudHeader}>
          <Text style={styles.hudLabel}>DAILY IMPACT</Text>
          <Text style={styles.hudCount}>{dailyCount}/{DAILY_GOAL}</Text>
        </View>
        <View style={styles.hudBarBg}>
          <View style={[styles.hudBarFill, { width: `${(dailyCount / DAILY_GOAL) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.deckArea}>
        <SwipeDeck
          data={petitions}
          index={deckIndex}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          onTap={handleTap}
<<<<<<< HEAD
          onReport={(petition) => setPendingReport(petition)}
=======
>>>>>>> 05775e151d80f152aef53ed06bc50aff42569ebe
          onReset={resetDeck}
        />
      </View>

      {deckIndex < petitions.length && (
        <ActionButtons
          onSkip={() => triggerSwipe('left')}
          onInfo={() => currentPetition && handleTap(currentPetition)}
          onSign={() => triggerSwipe('right')}
        />
      )}

      <SignModal
        visible={modalVisible}
        petition={pendingSign}
        user={user}
        onClose={handleCancelSign}
        onConfirm={handleConfirmSign}
      />
<<<<<<< HEAD
      <ReportModal
        visible={!!pendingReport}
        petition={pendingReport}
        onClose={() => setPendingReport(null)}
        onSubmit={(payload) => reportPetition(pendingReport.id, payload)}
      />
=======
>>>>>>> 05775e151d80f152aef53ed06bc50aff42569ebe
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  hud: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 8 },
  hudHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 2 },
  hudLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  hudCount: { color: 'white', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  hudBarBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  hudBarFill: {
    height: '100%', backgroundColor: COLORS.primary, borderRadius: 2,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 4,
  },
  deckArea: { flex: 1, paddingHorizontal: 16, paddingVertical: 12 },
});
