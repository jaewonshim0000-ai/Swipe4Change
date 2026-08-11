import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FONTS } from '../theme';
import { useApp } from '../contexts/AppContext';
import ScreenBackground from '../components/ScreenBackground';
import { Display } from '../components/Glass';
import AppHeader from '../components/AppHeader';
import PetitionListItem from '../components/PetitionListItem';
import Icon from '../components/Icon';

export default function SavedPetitionsScreen({ navigation }) {
  const { petitions, savedIds, toggleSave } = useApp();
  const saved = savedIds.map((id) => petitions.find((p) => p.id === id)).filter(Boolean);

  return (
    <ScreenBackground>
      <SafeAreaView style={s.container} edges={['top']}>
        <AppHeader
          onProfilePress={() => navigation.navigate('Profile')}
          onNotifPress={() => navigation.navigate('Notifications')}
        />

        <View style={s.head}>
          <Display size={32} lineHeight={32}>Saved</Display>
          <Text style={s.sub}>
            {saved.length} {saved.length === 1 ? 'petition' : 'petitions'} saved for later
          </Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {saved.map((p) => (
            <PetitionListItem
              key={p.id}
              petition={p}
              variant="saved"
              onPress={() => navigation.navigate('PetitionDetail', { petitionId: p.id })}
              onUnsave={() => toggleSave(p.id)}
            />
          ))}

          {saved.length === 0 ? (
            <View style={s.empty}>
              <View style={s.emptyIcon}>
                <Icon name="bookmark" size={24} color="rgba(255,255,255,.4)" />
              </View>
              <Display size={24} lineHeight={24}>Nothing saved yet</Display>
              <Text style={s.emptySub}>
                Bookmark a petition from its detail page to come back to it later.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  head: { paddingHorizontal: 20, paddingBottom: 12 },
  sub: { fontFamily: FONTS.sans, fontSize: 13, color: 'rgba(255,255,255,.45)', marginTop: 3 },
  scroll: { paddingHorizontal: 20, paddingBottom: 96, gap: 12 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 64, paddingHorizontal: 32 },
  emptyIcon: {
    width: 62, height: 62, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)',
    alignItems: 'center', justifyContent: 'center',
  },
  emptySub: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 19.5, color: 'rgba(255,255,255,.45)', textAlign: 'center' },
});
