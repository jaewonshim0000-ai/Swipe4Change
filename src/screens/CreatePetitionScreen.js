import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORY_STYLE, COLORS, FONTS, SECTION_LABEL, fmt } from '../theme';
import { GOAL_OPTIONS } from '../data/petitions';
import { apiRequest, API_BASE_URL } from '../config/api';
import { useApp } from '../contexts/AppContext';
import ScreenBackground from '../components/ScreenBackground';
import { Display, MonoLabel } from '../components/Glass';
import Press from '../components/Press';
import Icon from '../components/Icon';

const STEP_TITLES = ['Pick a cause', 'Write the ask', 'Review & publish'];

export default function CreatePetitionScreen({ navigation }) {
  const { user, createPetition, setCelebration } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ category: '', title: '', location: '', ask: '', goal: 1000 });
  const [aiTopic, setAiTopic] = useState('');
  const [aiBusy, setAiBusy] = useState(false);

  const cat = form.category ? CATEGORY_STYLE[form.category] : CATEGORY_STYLE.Climate;
  const set = (patch) => setForm((c) => ({ ...c, ...patch }));

  const valid = step === 0
    ? Boolean(form.category)
    : step === 1
      ? form.title.length > 4 && form.location.length > 1 && form.ask.length > 9
      : true;

  const back = () => {
    if (step === 0) navigation.goBack();
    else setStep((v) => v - 1);
  };

  const runAi = async () => {
    if (!aiTopic.trim() || aiBusy) return;
    setAiBusy(true);
    const topic = aiTopic.trim();
    const fallback = () => {
      set({
        category: form.category || 'Housing',
        title: topic.charAt(0).toUpperCase() + topic.slice(1),
        location: user.location || 'Los Angeles, CA',
        ask: `We call on the city to act on ${topic} within the next budget cycle, with a published timeline and public reporting.`,
      });
      setStep(1);
    };

    if (!API_BASE_URL) {
      setTimeout(() => { fallback(); setAiBusy(false); }, 1400);
      return;
    }

    try {
      const result = await apiRequest('/api/ai/draft', {
        method: 'POST',
        body: JSON.stringify({ topic }),
      });
      const draft = result?.draft;
      if (draft?.title) {
        set({
          category: draft.category || form.category || 'Housing',
          title: draft.title,
          location: draft.location || user.location || 'Los Angeles, CA',
          ask: draft.ask || '',
        });
        setStep(1);
      } else {
        fallback();
      }
    } catch {
      fallback();
    } finally {
      setAiBusy(false);
    }
  };

  const next = () => {
    if (!valid) return;
    if (step < 2) { setStep((v) => v + 1); return; }

    createPetition({
      title: form.title,
      summary: form.ask.slice(0, 120),
      ask: form.ask,
      category: form.category,
      organization: `${user.firstName} ${user.lastName}`.trim() || 'Community',
      location: form.location,
      goal: form.goal,
      urgency: 'medium',
      recipient: 'Under review',
      why: form.ask,
      affects: [],
      tags: [],
      verified: false,
      image: `https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=900&q=60&fit=crop`,
    });

    navigation.goBack();
    setCelebration({
      icon: 'rocket_launch',
      kicker: 'SUBMITTED FOR REVIEW',
      title: 'Petition filed',
      sub: 'We’ll review it within 24 hours and drop it into the feed.',
    });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.head}>
          <View style={s.headRow}>
            <Press style={s.backBtn} onPress={back} scale={0.9}>
              <Icon name={step === 0 ? 'close' : 'arrow_back'} size={17} color="#fff" />
            </Press>
            <View style={{ flex: 1 }}>
              <MonoLabel size={9} spacing={1.8}>STEP {step + 1} OF 3</MonoLabel>
              <Display size={24} lineHeight={26.4} style={{ marginTop: 2 }}>{STEP_TITLES[step]}</Display>
            </View>
          </View>
          <View style={s.steps}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[s.stepBar, { backgroundColor: i <= step ? COLORS.tertiary : 'rgba(255,255,255,.1)' }]}
              />
            ))}
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {step === 0 ? (
              <View>
                <View style={s.aiCard}>
                  <View style={s.aiHead}>
                    <Icon name="auto_awesome" size={17} fill={1} color={COLORS.primary} />
                    <MonoLabel size={9} spacing={1.6} color={COLORS.primary}>AI DRAFT ASSISTANT</MonoLabel>
                  </View>
                  <Text style={s.aiBody}>
                    Describe the change you want in a sentence. We&apos;ll draft the category, ask, recipient and goal for you.
                  </Text>
                  <View style={s.aiRow}>
                    <TextInput
                      style={s.aiInput}
                      placeholder="e.g. safer bike lanes on Sunset Blvd"
                      placeholderTextColor="rgba(255,255,255,.35)"
                      value={aiTopic}
                      onChangeText={setAiTopic}
                    />
                    <Press style={s.aiBtn} onPress={runAi} scale={0.95}>
                      <LinearGradient
                        colors={['#5c8cfb', '#1b58c5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0.7, y: 1 }}
                        style={s.aiBtnFill}
                      >
                        <Text style={s.aiBtnText}>{aiBusy ? 'Drafting…' : 'Draft'}</Text>
                      </LinearGradient>
                    </Press>
                  </View>
                </View>

                <Text style={s.sectionLabel}>OR PICK A CATEGORY</Text>
                <View style={s.grid}>
                  {Object.keys(CATEGORY_STYLE).map((key) => {
                    const c = CATEGORY_STYLE[key];
                    const active = form.category === key;
                    return (
                      <Press
                        key={key}
                        style={[
                          s.catCard,
                          {
                            borderColor: active ? `${c.glow}66` : 'rgba(255,255,255,.07)',
                            backgroundColor: active ? `${c.glow}1f` : 'rgba(255,255,255,.03)',
                          },
                        ]}
                        onPress={() => set({ category: key })}
                        scale={0.96}
                      >
                        <Icon name={c.icon} size={24} fill={1} color={active ? c.glow : 'rgba(255,255,255,.5)'} />
                        <Text style={[s.catLabel, { color: active ? '#fff' : 'rgba(255,255,255,.72)' }]}>{key}</Text>
                        <MonoLabel size={9} spacing={1.2} color="rgba(255,255,255,.34)">SDG {c.sdg.n}</MonoLabel>
                      </Press>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {step === 1 ? (
              <View style={{ gap: 16 }}>
                <Field label="Petition name" placeholder="What are you asking for?" value={form.title} onChange={(v) => set({ title: v })} />
                <Field label="Location" placeholder="City, state or 'National'" value={form.location} onChange={(v) => set({ location: v })} />
                <View>
                  <Text style={s.fieldLabel}>The ask</Text>
                  <TextInput
                    style={s.textarea}
                    placeholder="One clear, specific demand the recipient can act on."
                    placeholderTextColor="rgba(255,255,255,.35)"
                    multiline
                    value={form.ask}
                    onChangeText={(v) => set({ ask: v })}
                  />
                </View>
                <View>
                  <Text style={s.fieldLabel}>Signature goal</Text>
                  <View style={s.goalRow}>
                    {GOAL_OPTIONS.map((g) => {
                      const active = form.goal === g;
                      return (
                        <Press
                          key={g}
                          style={[
                            s.goalBtn,
                            {
                              borderColor: active ? 'rgba(78,222,163,.45)' : 'rgba(255,255,255,.08)',
                              backgroundColor: active ? 'rgba(78,222,163,.12)' : 'rgba(255,255,255,.03)',
                            },
                          ]}
                          onPress={() => set({ goal: g })}
                          scale={0.95}
                        >
                          <Text style={[s.goalText, { color: active ? COLORS.tertiary : 'rgba(255,255,255,.5)' }]}>
                            {fmt(g)}
                          </Text>
                        </Press>
                      );
                    })}
                  </View>
                </View>
              </View>
            ) : null}

            {step === 2 ? (
              <View>
                <Text style={[s.sectionLabel, { marginTop: 0 }]}>HOW IT WILL LOOK IN THE FEED</Text>
                <View style={s.preview}>
                  <LinearGradient
                    colors={[cat.from, cat.to]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.7, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(6,9,17,.7)', COLORS.surfaceDeep]}
                    locations={[0.3, 0.7, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={s.previewChip}>
                    <Icon name={cat.icon} size={13} fill={1} color={cat.glow} />
                    <MonoLabel size={9} spacing={1.5} weight="bold" color="#fff">
                      {(form.category || 'Climate').toUpperCase()}
                    </MonoLabel>
                  </View>
                  <View style={s.previewFoot}>
                    <MonoLabel size={9} spacing={1.4} color="rgba(255,255,255,.6)" style={{ marginBottom: 8 }}>
                      {`${user.firstName} ${user.lastName}`.trim().toUpperCase()} · {(form.location || 'Location').toUpperCase()}
                    </MonoLabel>
                    <Display size={32} lineHeight={32}>{form.title || 'Your petition title'}</Display>
                    <Text style={s.previewAsk}>{form.ask || 'Your ask appears here.'}</Text>
                    <View style={s.previewBar} />
                    <View style={s.previewMeta}>
                      <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.5)">0 SIGNATURES</MonoLabel>
                      <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.5)">GOAL {fmt(form.goal)}</MonoLabel>
                    </View>
                  </View>
                </View>

                <View style={s.reviewNote}>
                  <Icon name="verified_user" size={17} fill={1} color={COLORS.tertiary} />
                  <Text style={s.reviewText}>
                    Community petitions are reviewed within 24 hours before they enter the feed.
                  </Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={s.footer}>
            <Press style={[s.cta, !valid && s.ctaOff]} onPress={next} disabled={!valid} scale={0.97}>
              <LinearGradient
                colors={[COLORS.tertiary, COLORS.tertiaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.6, y: 1 }}
                style={s.ctaFill}
              >
                <Text style={s.ctaText}>{step < 2 ? 'Continue' : 'Publish petition'}</Text>
              </LinearGradient>
            </Press>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const Field = ({ label, placeholder, value, onChange }) => (
  <View>
    <Text style={s.fieldLabel}>{label}</Text>
    <TextInput
      style={s.input}
      placeholder={placeholder}
      placeholderTextColor="rgba(255,255,255,.35)"
      value={value}
      onChangeText={onChange}
    />
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1 },
  head: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: {
    width: 38, height: 38, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)',
    alignItems: 'center', justifyContent: 'center',
  },
  steps: { flexDirection: 'row', gap: 4 },
  stepBar: { flex: 1, height: 3, borderRadius: 99 },

  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  sectionLabel: SECTION_LABEL,

  aiCard: {
    borderRadius: 20, padding: 16, marginBottom: 16,
    backgroundColor: 'rgba(124,92,255,.10)', borderWidth: 1, borderColor: 'rgba(177,197,255,.2)',
  },
  aiHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiBody: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 19.5, color: 'rgba(255,255,255,.6)', marginBottom: 12 },
  aiRow: { flexDirection: 'row', gap: 8 },
  aiInput: {
    flex: 1, minWidth: 0, height: 42, borderRadius: 14, paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,.1)',
    color: '#fff', fontFamily: FONTS.sans, fontSize: 13,
  },
  aiBtn: { height: 42, borderRadius: 14, overflow: 'hidden' },
  aiBtnFill: { height: '100%', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  aiBtnText: { fontFamily: FONTS.sansBold, fontSize: 13, color: '#fff' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catCard: { width: '48.5%', paddingVertical: 16, paddingHorizontal: 12, borderRadius: 18, gap: 8, borderWidth: 1 },
  catLabel: { fontFamily: FONTS.sansBold, fontSize: 13 },

  fieldLabel: { fontFamily: FONTS.sansBold, fontSize: 13, color: 'rgba(255,255,255,.8)', marginBottom: 8 },
  input: {
    height: 46, borderRadius: 15, paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,.045)', borderWidth: 1, borderColor: 'rgba(255,255,255,.1)',
    color: '#fff', fontFamily: FONTS.sans, fontSize: 13,
  },
  textarea: {
    height: 88, borderRadius: 15, padding: 12, textAlignVertical: 'top',
    backgroundColor: 'rgba(255,255,255,.045)', borderWidth: 1, borderColor: 'rgba(255,255,255,.1)',
    color: '#fff', fontFamily: FONTS.sans, fontSize: 13, lineHeight: 19.5,
  },
  goalRow: { flexDirection: 'row', gap: 8 },
  goalBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  goalText: { fontFamily: FONTS.monoBold, fontSize: 13 },

  preview: {
    position: 'relative', height: 300, borderRadius: 26, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,.1)',
  },
  previewChip: {
    position: 'absolute', top: 14, left: 14,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    backgroundColor: 'rgba(12,17,28,.42)', borderWidth: 1, borderColor: 'rgba(255,255,255,.2)',
  },
  previewFoot: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  previewAsk: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 18.85, color: 'rgba(255,255,255,.62)', marginTop: 8 },
  previewBar: { height: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,.14)', marginTop: 12 },
  previewMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },

  reviewNote: {
    flexDirection: 'row', gap: 12, marginTop: 16, padding: 12, borderRadius: 16,
    backgroundColor: 'rgba(78,222,163,.07)', borderWidth: 1, borderColor: 'rgba(78,222,163,.2)',
  },
  reviewText: { flex: 1, fontFamily: FONTS.sans, fontSize: 11, lineHeight: 16.5, color: 'rgba(255,255,255,.6)' },

  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  cta: {
    height: 52, borderRadius: 19, overflow: 'hidden',
    shadowColor: COLORS.tertiary, shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.6, shadowRadius: 15, elevation: 10,
  },
  ctaOff: { opacity: 0.35, shadowOpacity: 0 },
  ctaFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontFamily: FONTS.sansBold, fontSize: 13, color: COLORS.onTertiary },
});
