import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, CATEGORY_STYLE } from '../theme';
import { PETITION_CATEGORIES, URGENCY_LEVELS } from '../data/petitions';
import { useApp } from '../contexts/AppContext';
import { fmtNumber } from '../utils/helpers';

const STEPS = ['Category', 'Name & Location', 'Situation', 'What We Ask', 'Urgency & Recipient', 'Goal', 'Review'];

export default function CreatePetitionScreen({ navigation }) {
  const { createPetition, user } = useApp();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    category: '', title: '', location: '', organization: `${user.firstName} ${user.lastName}`,
    summary: '', why: '', ask: '', tags: [], tagInput: '',
    urgency: 'medium', recipient: '', goal: '', agreed: false,
  });
  const u = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const valid = () => {
    switch (step) {
      case 0: return !!f.category;
      case 1: return f.title.length >= 5 && f.location.length >= 2;
      case 2: return f.summary.length >= 10 && f.why.length >= 20;
      case 3: return f.ask.length >= 10 && f.tags.length >= 1;
      case 4: return !!f.urgency && f.recipient.length >= 3;
      case 5: return Number(f.goal) >= 100;
      case 6: return f.agreed;
      default: return false;
    }
  };

  const next = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); if (step < 6) setStep(step + 1); else submit(); };
  const back = () => { if (step > 0) setStep(step - 1); else navigation.goBack(); };

  const addTag = () => {
    const t = f.tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (t && !f.tags.includes(t) && f.tags.length < 6) { u('tags', [...f.tags, t]); u('tagInput', ''); }
  };

  const submit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    createPetition({
      category: f.category, title: f.title, location: f.location,
      summary: f.summary, why: f.why, ask: f.ask, tags: f.tags,
      urgency: f.urgency, recipient: f.recipient, goal: Number(f.goal),
      organization: f.organization, affects: [], verified: false, imageUrl: null,
      weeklyIncrease: 0,
    });
    navigation.goBack();
  };

  const cat = CATEGORY_STYLE[f.category] || {};

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={back}>
          <MaterialIcons name={step === 0 ? 'close' : 'arrow-back'} size={20} color="white" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Create Petition</Text>
        <Text style={s.stepLabel}>{step + 1}/{STEPS.length}</Text>
      </View>

      <View style={s.progressRow}>
        {STEPS.map((_, i) => <View key={i} style={[s.progressDot, i <= step && { backgroundColor: COLORS.tertiary }]} />)}
      </View>
      <Text style={s.stepName}>{STEPS[step]}</Text>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <StepWrap q="What kind of petition?" h="Choose the category that best fits.">
              {PETITION_CATEGORIES.map((c) => {
                const active = f.category === c.key; const cs = CATEGORY_STYLE[c.key];
                return (
                  <TouchableOpacity key={c.key} style={[s.catItem, active && { borderColor: cs.glow, backgroundColor: cs.glow + '10' }]} onPress={() => u('category', c.key)} activeOpacity={0.8}>
                    <View style={[s.catIcon, { backgroundColor: active ? cs.glow + '20' : 'rgba(255,255,255,0.05)' }]}>
                      <MaterialCommunityIcons name={cs.icon} size={20} color={active ? cs.glow : 'rgba(255,255,255,0.5)'} />
                    </View>
                    <Text style={[s.catLabel, active && { color: 'white' }]}>{c.label}</Text>
                    {active && <MaterialIcons name="check-circle" size={20} color={cs.glow} />}
                  </TouchableOpacity>
                );
              })}
            </StepWrap>
          )}
          {step === 1 && (
            <StepWrap q="Name your petition" h="A clear, compelling title.">
              <Field label="Title" value={f.title} onChange={(v) => u('title', v)} placeholder="e.g. Protect Local Wetlands" max={80} />
              <Field label="Location" value={f.location} onChange={(v) => u('location', v)} placeholder="e.g. Portland, OR" />
              <Field label="Proposer name" value={f.organization} onChange={(v) => u('organization', v)} placeholder="Your name or org" />
            </StepWrap>
          )}
          {step === 2 && (
            <StepWrap q="Describe the situation" h="Help people understand the problem.">
              <Field label="Short summary" value={f.summary} onChange={(v) => u('summary', v)} placeholder="One or two sentences" multi max={160} />
              <Field label="Full situation" value={f.why} onChange={(v) => u('why', v)} placeholder="What's happening, why it matters, what's at stake" multi tall max={800} />
            </StepWrap>
          )}
          {step === 3 && (
            <StepWrap q="What are we asking for?" h="Clearly state the ask and add tags.">
              <Field label="The ask" value={f.ask} onChange={(v) => u('ask', v)} placeholder="What action do you want taken?" multi max={300} />
              <Text style={s.fieldLabel}>TAGS</Text>
              <View style={s.tagInputRow}>
                <TextInput style={s.tagInput} placeholder="Add tag…" placeholderTextColor="rgba(255,255,255,0.3)" value={f.tagInput} onChangeText={(v) => u('tagInput', v)} onSubmitEditing={addTag} maxLength={24} />
                <TouchableOpacity style={s.tagAddBtn} onPress={addTag}>
                  <MaterialIcons name="add" size={18} color={COLORS.onTertiary} />
                </TouchableOpacity>
              </View>
              <View style={s.tagsWrap}>
                {f.tags.map((t) => (
                  <TouchableOpacity key={t} style={s.tag} onPress={() => u('tags', f.tags.filter((x) => x !== t))}>
                    <Text style={s.tagText}>#{t}</Text>
                    <MaterialIcons name="close" size={12} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                ))}
              </View>
            </StepWrap>
          )}
          {step === 4 && (
            <StepWrap q="Urgency & Recipient" h="How urgent is this and who receives it?">
              <Text style={s.fieldLabel}>URGENCY</Text>
              <View style={s.urgencyRow}>
                {URGENCY_LEVELS.map((lv) => (
                  <TouchableOpacity
                    key={lv.key}
                    style={[s.urgencyChip, f.urgency === lv.key && { borderColor: lv.color, backgroundColor: lv.color + '15' }]}
                    onPress={() => u('urgency', lv.key)}
                  >
                    <View style={[s.urgencyDot, { backgroundColor: lv.color }]} />
                    <Text style={[s.urgencyText, f.urgency === lv.key && { color: lv.color }]}>{lv.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Field label="Recipient" value={f.recipient} onChange={(v) => u('recipient', v)} placeholder="e.g. City Council, EPA" />
            </StepWrap>
          )}
          {step === 5 && (
            <StepWrap q="Set your signature goal" h="How many signatures do you need?">
              <Field label="Goal" value={f.goal} onChange={(v) => u('goal', v.replace(/[^0-9]/g, ''))} placeholder="e.g. 10000" keyboard="numeric" />
              {f.goal ? <Text style={s.goalPreview}>Target: {fmtNumber(Number(f.goal))} signatures</Text> : null}
            </StepWrap>
          )}
          {step === 6 && (
            <StepWrap q="Review your petition" h="Check everything before submitting.">
              <View style={s.preview}>
                {cat.glow && (
                  <View style={[s.previewCat, { backgroundColor: cat.glow + '15' }]}>
                    <MaterialCommunityIcons name={cat.icon} size={12} color={cat.glow} />
                    <Text style={{ color: cat.glow, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 }}>{f.category.toUpperCase()}</Text>
                  </View>
                )}
                <Text style={s.previewTitle}>{f.title || 'Untitled'}</Text>
                <Text style={s.previewSummary}>{f.summary}</Text>
                <RRow icon="person" v={f.recipient} />
                <RRow icon="place" v={f.location} />
                <RRow icon="flag" v={`${fmtNumber(Number(f.goal || 0))} signatures`} />
                <RRow icon="warning" v={f.urgency} />
                {f.tags.length > 0 && (
                  <View style={s.previewTags}>
                    {f.tags.map((t) => <View key={t} style={s.previewTag}><Text style={s.previewTagText}>#{t}</Text></View>)}
                  </View>
                )}
              </View>
              <TouchableOpacity style={s.termsRow} onPress={() => u('agreed', !f.agreed)} activeOpacity={0.8}>
                <View style={[s.checkbox, f.agreed && { borderColor: COLORS.tertiary, backgroundColor: COLORS.tertiary }]}>
                  {f.agreed && <MaterialIcons name="check" size={14} color={COLORS.onTertiary} />}
                </View>
                <Text style={s.termsText}>
                  I confirm this petition is truthful and agree to the{' '}
                  <Text style={{ color: COLORS.primary }}>Terms of Service</Text> and{' '}
                  <Text style={{ color: COLORS.primary }}>Community Guidelines</Text>.
                </Text>
              </TouchableOpacity>
            </StepWrap>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={s.footer}>
        <TouchableOpacity onPress={next} disabled={!valid()} activeOpacity={0.9} style={{ flex: 1 }}>
          <LinearGradient
            colors={valid() ? [COLORS.tertiary, COLORS.tertiaryContainer] : ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.06)']}
            style={s.nextBtn}
          >
            <Text style={[s.nextText, !valid() && { color: 'rgba(255,255,255,0.3)' }]}>{step === 6 ? 'Submit' : 'Continue'}</Text>
            <MaterialIcons name={step === 6 ? 'check' : 'arrow-forward'} size={18} color={valid() ? COLORS.onTertiary : 'rgba(255,255,255,0.3)'} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const StepWrap = ({ q, h, children }) => (
  <View>
    <Text style={s.question}>{q}</Text>
    <Text style={s.hint}>{h}</Text>
    <View style={{ gap: 8, marginTop: 8 }}>{children}</View>
  </View>
);

const Field = ({ label, value, onChange, placeholder, multi, tall, max, keyboard }) => (
  <View>
    <Text style={s.fieldLabel}>{label.toUpperCase()}</Text>
    <TextInput
      style={[s.fieldInput, multi && { minHeight: tall ? 120 : 70, textAlignVertical: 'top', paddingTop: 12 }]}
      value={value} onChangeText={onChange} placeholder={placeholder}
      placeholderTextColor="rgba(255,255,255,0.25)" multiline={multi} maxLength={max} keyboardType={keyboard}
    />
    {max && <Text style={s.charCount}>{(value || '').length}/{max}</Text>}
  </View>
);

const RRow = ({ icon, v }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <MaterialIcons name={icon} size={14} color="rgba(255,255,255,0.4)" />
    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{v}</Text>
  </View>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: '800' },
  stepLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '700', width: 40, textAlign: 'right' },
  progressRow: { flexDirection: 'row', gap: 3, paddingHorizontal: 20, marginBottom: 6 },
  progressDot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  stepName: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, paddingHorizontal: 20, marginBottom: 8 },
  body: { padding: 20, paddingBottom: 24 },
  question: { color: 'white', fontSize: 22, fontWeight: '900', marginBottom: 4 },
  hint: { color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  catItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14 },
  catIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catLabel: { flex: 1, color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  fieldLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6, marginTop: 10 },
  fieldInput: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingHorizontal: 14, height: 48, color: 'white', fontSize: 14 },
  charCount: { textAlign: 'right', color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 4 },
  tagInputRow: { flexDirection: 'row', gap: 8 },
  tagInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingHorizontal: 14, height: 48, color: 'white', fontSize: 14 },
  tagAddBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.tertiary, alignItems: 'center', justifyContent: 'center' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(177,197,255,0.12)', borderWidth: 1, borderColor: 'rgba(177,197,255,0.25)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  tagText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  urgencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  urgencyChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  urgencyDot: { width: 8, height: 8, borderRadius: 4 },
  urgencyText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '700' },
  goalPreview: { color: COLORS.tertiary, fontSize: 13, fontWeight: '700', marginTop: 8 },
  preview: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 18, gap: 8 },
  previewCat: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  previewTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  previewSummary: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 18 },
  previewTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  previewTag: { backgroundColor: 'rgba(177,197,255,0.1)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  previewTagText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 20 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  termsText: { flex: 1, color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 17 },
  footer: { paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  nextBtn: { height: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  nextText: { color: COLORS.onTertiary, fontWeight: '900', fontSize: 15 },
});
