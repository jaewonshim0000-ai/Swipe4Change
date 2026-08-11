import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { CATEGORY_STYLE, COLORS, FONTS, fmt } from '../theme';
import { useApp } from '../contexts/AppContext';
import Sheet from './Sheet';
import Press from './Press';
import Icon from './Icon';

const DEMO_SIGNATURE = 'M6 34 C 26 6, 40 6, 46 26 C 52 44, 64 44, 72 22 C 80 2, 92 8, 96 30 C 100 44, 112 40, 124 20 C 136 2, 150 10, 156 30 C 160 44, 176 42, 192 24 C 204 10, 224 12, 232 28 C 240 42, 262 38, 294 16';

// The design's sign flow: form -> "Signing…" for 520ms -> the confirmation
// panel for 1150ms -> back to the caller.
const SAVING_MS = 520;
const DONE_MS = 1150;

export default function SignModal({ visible, petition, onCancel, onClose, onConfirm }) {
  const { user } = useApp();
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [stage, setStage] = useState('form');

  const dismiss = onCancel || onClose || (() => {});

  if (!petition) return null;
  const cat = CATEGORY_STYLE[petition.category] || CATEGORY_STYLE.Climate;

  const reset = () => { setComment(''); setConsent(false); setStage('form'); };
  const cancel = () => { reset(); dismiss(); };

  const confirm = () => {
    if (!consent || stage !== 'form') return;
    setStage('saving');
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setStage('done');
      setTimeout(() => {
        onConfirm(petition, comment);
        reset();
      }, DONE_MS);
    }, SAVING_MS);
  };

  const header = stage === 'done' ? null : (
    <View style={s.header}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[s.kicker, { color: cat.glow }]}>SIGNING PETITION</Text>
        <Text style={s.title}>{petition.title}</Text>
      </View>
      <Press style={s.closeBtn} onPress={cancel} scale={0.88}>
        <Icon name="close" size={17} color="#fff" />
      </Press>
    </View>
  );

  return (
    <Sheet visible={visible} onClose={cancel} header={header} dismissible={stage === 'form'}>
      {stage === 'done' ? (
        <View style={s.done}>
          <View style={s.doneBadgeWrap}>
            <View style={s.doneRing} />
            <LinearGradient
              colors={[COLORS.tertiary, COLORS.tertiaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.6, y: 1 }}
              style={s.doneBadge}
            >
              <Icon name="check" size={40} fill={1} weight={700} color={COLORS.onTertiary} />
            </LinearGradient>
          </View>
          <Text style={s.doneTitle}>Signed.</Text>
          <Text style={s.doneSub}>
            Your voice joined {fmt(petition.signed + 1)} others backing this campaign.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView style={s.body} contentContainerStyle={{ gap: 12, paddingBottom: 4 }} showsVerticalScrollIndicator={false}>
            {/* Autofill card */}
            <View style={s.autofill}>
              <View style={s.autofillHead}>
                <Icon name="auto_fix_high" size={13} color={COLORS.primary} />
                <Text style={s.autofillLabel}>AUTOFILLED FROM PROFILE</Text>
              </View>
              <View style={{ gap: 8 }}>
                <Row label="Name" value={`${user.firstName} ${user.lastName}`.trim()} />
                <Row label="Email" value={user.email} />
                <Row label="Location" value={user.location || '—'} />
              </View>
              <View style={s.sigBlock}>
                <Text style={s.sigLabel}>YOUR SIGNATURE</Text>
                <Svg viewBox="0 0 300 46" style={s.sigSvg}>
                  <Path
                    d={user.signature || DEMO_SIGNATURE}
                    fill="none"
                    stroke={COLORS.onSurface}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
            </View>

            <View>
              <Text style={s.fieldLabel}>
                Add a comment <Text style={s.fieldOptional}>(optional)</Text>
              </Text>
              <TextInput
                style={s.textarea}
                placeholder="Why does this matter to you?"
                placeholderTextColor="rgba(255,255,255,.3)"
                multiline
                maxLength={240}
                value={comment}
                onChangeText={setComment}
              />
            </View>

            <Press style={s.consentRow} onPress={() => setConsent((v) => !v)} flat>
              <View style={[s.checkbox, consent && { borderColor: COLORS.tertiary, backgroundColor: COLORS.tertiary }]}>
                {consent ? <Icon name="check" size={13} weight={700} color={COLORS.onTertiary} /> : null}
              </View>
              <Text style={s.consentText}>
                I agree to the
                <Text style={s.consentStrong}> Terms &amp; Conditions </Text>
                and consent to share my information with
                <Text style={s.consentStrong}> {petition.organization}</Text>.
              </Text>
            </Press>
          </ScrollView>

          <View style={s.actions}>
            <Press style={s.cancelBtn} onPress={cancel}>
              <Text style={s.cancelText}>Cancel</Text>
            </Press>
            <Press
              style={[s.confirmBtn, !consent && s.confirmOff]}
              onPress={confirm}
              disabled={!consent || stage !== 'form'}
              scale={0.97}
            >
              <LinearGradient
                colors={[COLORS.tertiary, COLORS.tertiaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.6, y: 1 }}
                style={s.confirmFill}
              >
                <Text style={s.confirmText}>{stage === 'saving' ? 'Signing…' : 'Sign petition'}</Text>
              </LinearGradient>
            </Press>
          </View>
        </>
      )}
    </Sheet>
  );
}

const Row = ({ label, value }) => (
  <View style={s.row}>
    <Text style={s.rowLabel}>{label}</Text>
    <Text style={s.rowValue} numberOfLines={1}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 20, paddingBottom: 16 },
  kicker: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.8, marginBottom: 4 },
  title: { fontFamily: FONTS.serif, fontSize: 24, lineHeight: 25.2, color: '#fff' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  body: { paddingHorizontal: 20, maxHeight: 380 },
  autofill: {
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)',
    backgroundColor: 'rgba(255,255,255,.03)', paddingHorizontal: 16, paddingVertical: 12,
  },
  autofillHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  autofillLabel: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.6, color: COLORS.primary },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { fontFamily: FONTS.sans, fontSize: 13, color: 'rgba(255,255,255,.45)' },
  rowValue: { fontFamily: FONTS.sansBold, fontSize: 13, color: '#fff', flexShrink: 1, textAlign: 'right' },
  sigBlock: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.07)' },
  sigLabel: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.6, color: 'rgba(255,255,255,.38)', marginBottom: 4 },
  sigSvg: { width: '100%', height: 42 },

  fieldLabel: { fontFamily: FONTS.sansBold, fontSize: 13, color: 'rgba(255,255,255,.8)', marginBottom: 8 },
  fieldOptional: { fontFamily: FONTS.sans, color: 'rgba(255,255,255,.3)' },
  textarea: {
    height: 74, borderRadius: 16, textAlignVertical: 'top',
    backgroundColor: 'rgba(255,255,255,.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,.1)',
    padding: 12, color: '#fff', fontFamily: FONTS.sans, fontSize: 13, lineHeight: 18.85,
  },

  consentRow: {
    flexDirection: 'row', gap: 12, padding: 12, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)',
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 7, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,.25)', alignItems: 'center', justifyContent: 'center',
  },
  consentText: { flex: 1, fontFamily: FONTS.sans, fontSize: 11, lineHeight: 16.5, color: 'rgba(255,255,255,.6)' },
  consentStrong: { fontFamily: FONTS.sansBold, color: 'rgba(255,255,255,.9)' },

  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 16 },
  cancelBtn: {
    paddingHorizontal: 24, paddingVertical: 16, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { fontFamily: FONTS.sansBold, fontSize: 13, color: 'rgba(255,255,255,.7)' },
  confirmBtn: {
    flex: 1, height: 50, borderRadius: 18, overflow: 'hidden',
    shadowColor: COLORS.tertiary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6, shadowRadius: 14, elevation: 8,
  },
  confirmOff: { opacity: 0.35, shadowOpacity: 0 },
  confirmFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontFamily: FONTS.sansBold, fontSize: 13, color: COLORS.onTertiary },

  done: { alignItems: 'center', gap: 12, paddingTop: 24, paddingBottom: 32, paddingHorizontal: 20 },
  doneBadgeWrap: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  doneRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 44, borderWidth: 2, borderColor: 'rgba(78,222,163,.5)',
  },
  doneBadge: {
    width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.tertiary, shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7, shadowRadius: 20, elevation: 12,
  },
  doneTitle: { fontFamily: FONTS.serif, fontSize: 32, lineHeight: 32, color: '#fff' },
  doneSub: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 19.5, color: 'rgba(255,255,255,.6)', textAlign: 'center' },
});
