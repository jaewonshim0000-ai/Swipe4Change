import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp } from '../contexts/AppContext';
import AppHeader from '../components/AppHeader';
import PetitionListItem from '../components/PetitionListItem';

export default function SavedPetitionsScreen({ navigation }) {
  const { savedIds, getPetitionById } = useApp();
  const items = savedIds.map(getPetitionById).filter(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader onProfilePress={() => navigation.navigate('ProfileTab')} onNotifPress={() => navigation.navigate('Notifications')} />

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Saved</Text>
        <Text style={styles.sub}>
          {savedIds.length} {savedIds.length === 1 ? 'petition' : 'petitions'} saved for later
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="bookmark-border" size={28} color="rgba(255,255,255,0.4)" />
            </View>
            <Text style={styles.emptyTitle}>No saved petitions yet</Text>
            <Text style={styles.emptySub}>
              Bookmark from the detail view to come back to petitions later.
            </Text>
          </View>
        ) : (
          items.map((p) => (
            <PetitionListItem
              key={p.id}
              petition={p}
              meta={`${p.organization} · ${p.daysLeft}d left`}
              onPress={() => navigation.navigate('PetitionDetail', { petitionId: p.id })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  titleBlock: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 8 },
  title: { color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  sub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { color: 'white', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  emptySub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
