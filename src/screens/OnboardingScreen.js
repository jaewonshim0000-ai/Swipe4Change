import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CATEGORY_LABEL, CATEGORY_STYLE, COLORS, FONTS } from '../theme';
import { useApp } from '../contexts/AppContext';
import ScreenBackground from '../components/ScreenBackground';
import { Display, MonoLabel } from '../components/Glass';
import Press from '../components/Press';
import Icon from '../components/Icon';

export default function OnboardingScreen() {
  const { user, updateUser } = useApp();
  const [picked, setPicked] = useState(user.interests?.length ? user.interests : ['Climate', 'Education', 'Human Rights']);

  const toggle = (key) => {
    Haptics.selectionAsync().catch(() => {});
    setPicked((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  };

  const finish = () => {
    if (!picked.length) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    updateUser({ interests: picked, onboarded: true });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.logoRow}>
            <LinearGradient
              colors={['#5c8cfb', '#1b58c5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.7, y: 1 }}
              style={s.logo}
            >
              <Icon name="bolt" size={24} fill={1} color="#fff" />
            </LinearGradient>
          </View>

          <Display size={40} lineHeight={40} letterSpacing={-0.5} style={{ textAlign: 'center' }}>
            What do you care about?
          </Display>
          <Text style={s.sub}>
            Pick the causes that matter to you. We&apos;ll tune your feed around them — you can change these anytime in your profile.
          </Text>

          <View style={s.grid}>
            {Object.keys(CATEGORY_STYLE).map((key) => {
              const c = CATEGORY_STYLE[key];
              const active = picked.includes(key);
              return (
                <Press
                  key={key}
                  style={[
                    s.card,
                    {
                      borderColor: active ? c.glow : 'rgba(255,255,255,.08)',
                      backgroundColor: active ? `${c.glow}18` : 'rgba(255,255,255,.03)',
                    },
                  ]}
                  onPress={() => toggle(key)}
                  scale={0.96}
                >
                  <View style={[s.cardIcon, { backgroundColor: active ? `${c.glow}30` : 'rgba(255,255,255,.05)' }]}>
                    <Icon name={c.icon} size={24} fill={1} color={active ? c.glow : 'rgba(255,255,255,.6)'} />
                  </View>
                  <Text style={[s.cardLabel, { color: active ? '#fff' : 'rgba(255,255,255,.85)' }]}>
                    {CATEGORY_LABEL[key]}
                  </Text>
                  <MonoLabel size={9} spacing={1.2} style={{ marginTop: 3 }}>UN SDG {c.sdg.n}</MonoLabel>
                  {active ? (
                    <View style={[s.check, { backgroundColor: c.glow }]}>
                      <Icon name="check" size={13} weight={700} color="#0f131e" />
                    </View>
                  ) : null}
                </Press>
              );
            })}
          </View>
        </ScrollView>

        <View style={s.footer}>
          <MonoLabel size={11} spacing={1.4} color="rgba(255,255,255,.45)" style={{ textAlign: 'center', marginBottom: 12 }}>
            {picked.length} SELECTED
          </MonoLabel>
          <Press
            style={[s.cta, !picked.length && { opacity: 0.4 }]}
            onPress={finish}
            disabled={!picked.length}
            scale={0.97}
          >
            <LinearGradient
              colors={[COLORS.tertiary, COLORS.tertiaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.6, y: 1 }}
              style={s.ctaFill}
            >
              <Text style={s.ctaText}>Start exploring</Text>
              <Icon name="arrow_forward" size={17} color={COLORS.onTertiary} />
            </LinearGradient>
          </Press>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 20 },
  logoRow: { alignItems: 'center', marginBottom: 24 },
  logo: {
    width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#5c8cfb', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7, shadowRadius: 13, elevation: 10,
  },
  sub: {
    fontFamily: FONTS.sans, fontSize: 13, lineHeight: 20.15,
    color: 'rgba(255,255,255,.55)', textAlign: 'center', marginTop: 12, marginBottom: 24,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', borderRadius: 20, padding: 16, borderWidth: 1 },
  cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardLabel: { fontFamily: FONTS.sansBold, fontSize: 13, lineHeight: 15.6 },
  check: {
    position: 'absolute', top: 12, right: 12,
    width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.06)',
    backgroundColor: 'rgba(10,14,25,.9)',
  },
  cta: { height: 54, borderRadius: 17, overflow: 'hidden' },
  ctaFill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontFamily: FONTS.sansBold, fontSize: 17, color: COLORS.onTertiary },
});
