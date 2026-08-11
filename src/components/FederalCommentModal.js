import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, CATEGORY_STYLE, FONTS } from '../theme';
import { useApp } from '../contexts/AppContext';
import { apiRequest } from '../config/api';
import Sheet from './Sheet';
import Press from './Press';
import Icon from './Icon';

// Submits an official public comment on a federal proposed rule through the
// backend (Regulations.gov eRulemaking API).
export default function FederalCommentModal({ visible, petition, onClose, onSubmitted }) {
  const { user } = useApp();
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState(null);

  if (!petition) return null;
  const cat = CATEGORY_STYLE[petition.category] || CATEGORY_STYLE.Climate;

  const reset = () => {
    setComment(''); setConsent(false); setSubmitting(false); setError(''); setTracking(null);
  };
  const close = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!consent || submitting || comment.trim().length < 10) {
      if (comment.trim().length < 10) setError('Please write at least a sentence.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await apiRequest('/api/regulations/comment', {
        method: 'POST',
        body: JSON.stringify({
          petitionId: petition.id,
          comment: comment.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          city: user.location,
        }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTracking(result?.trackingNumber || 'submitted');
      onSubmitted?.(comment.trim());
    } catch (err) {
      setError(err.message || 'Submission failed. You can still comment on the official site.');
    } finally {
      setSubmitting(false);
    }
  };

  const header = tracking ? null : (
    <View style={s.header}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={[s.kicker, { color: cat.glow }]}>OFFICIAL PUBLIC COMMENT</Text>
        <Text style={s.title} numberOfLines={2}>{petition.title}</Text>
      </View>
      <Press style={s.closeBtn} onPress={close} scale={0.88}>
        <Icon name="close" size={18} fill={1} color="white" />
      </Press>
    </View>
  );

  return (
    <Sheet visible={visible} onClose={close} header={header}>
      {tracking ? (
        <View style={s.successBox}>
          <LinearGradient colors={[cat.from, cat.to]} style={s.successIcon}>
            <Icon name="how_to_reg" size={44} fill={1} color="white" />
          </LinearGradient>
          <Text style={s.successTitle}>Comment submitted</Text>
          <Text style={s.successSub}>
            Your comment is now part of the official public record.
            {tracking !== 'submitted' ? `\nTracking number: ${tracking}` : ''}
          </Text>
          <Press style={s.doneBtn} onPress={close}>
            <Text style={s.doneText}>Done</Text>
          </Press>
        </View>
      ) : (
        <>
          <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
            <Text style={s.fieldLabel}>Your comment to the {petition.recipient}</Text>
            <TextInput
              style={s.textarea}
              placeholder="What do you want the agency to know? Personal stories and specific reasoning carry the most weight."
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              numberOfLines={5}
              maxLength={5000}
              value={comment}
              onChangeText={setComment}
            />

            {error ? (
              <View style={s.errorBox}>
                <Icon name="error" size={14} fill={1} color={COLORS.error} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <Press style={s.consentBox} onPress={() => setConsent(!consent)} flat>
              <View style={[s.checkbox, consent && { borderColor: COLORS.tertiary, backgroundColor: COLORS.tertiary }]}>
                {consent ? <Icon name="check" size={14} fill={1} color={COLORS.onTertiary} /> : null}
              </View>
              <Text style={s.consentText}>
                I understand this comment, with my name{user.email ? ' and email' : ''}, is submitted to
                Regulations.gov and becomes part of the
                <Text style={s.consentStrong}> permanent public record</Text>.
              </Text>
            </Press>

            <Press
              style={s.altLink}
              flat
              onPress={() => petition.externalUrl && Linking.openURL(petition.externalUrl).catch(() => {})}
            >
              <Icon name="ios_share" size={13} fill={1} color="rgba(255,255,255,0.45)" />
              <Text style={s.altLinkText}>Prefer the official site? Comment on Regulations.gov instead</Text>
            </Press>
          </ScrollView>

          <View style={s.actions}>
            <Press style={s.cancelBtn} onPress={close}>
              <Text style={s.cancelText}>Cancel</Text>
            </Press>
            <Press
              style={[s.submitBtn, (!consent || submitting) && { opacity: 0.4 }]}
              onPress={handleSubmit}
              disabled={!consent || submitting}
              scale={0.97}
            >
              <LinearGradient colors={[COLORS.tertiary, COLORS.tertiaryContainer]} style={s.submitGrad}>
                <Text style={s.submitText}>{submitting ? 'Submitting...' : 'Submit comment'}</Text>
              </LinearGradient>
            </Press>
          </View>
        </>
      )}
    </Sheet>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row', alignItems: 'flex-start',
  },
  kicker: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.9, marginBottom: 4 },
  title: { fontFamily: FONTS.serif, fontSize: 24, lineHeight: 26, letterSpacing: -0.5, color: 'white' },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center',
  },
  body: { paddingHorizontal: 24, paddingTop: 16, maxHeight: 420 },
  fieldLabel: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.7, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  textarea: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12,
    color: 'white', fontFamily: FONTS.sans, fontSize: 14, minHeight: 110,
    textAlignVertical: 'top', marginBottom: 12,
  },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  errorText: { color: COLORS.error, fontFamily: FONTS.sans, fontSize: 12, flex: 1 },
  consentBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18, padding: 16, marginBottom: 10,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  consentText: { flex: 1, fontFamily: FONTS.sans, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
  consentStrong: { fontFamily: FONTS.sansBold, color: 'rgba(255,255,255,0.9)' },
  altLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, justifyContent: 'center' },
  altLinkText: { color: 'rgba(255,255,255,0.45)', fontFamily: FONTS.sans, fontSize: 12, textDecorationLine: 'underline' },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingTop: 16 },
  cancelBtn: {
    flex: 1, height: 50, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { color: 'rgba(255,255,255,0.7)', fontFamily: FONTS.sansBold, fontSize: 14 },
  submitBtn: { flex: 2, height: 50, borderRadius: 999, overflow: 'hidden' },
  submitGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: COLORS.onTertiary, fontFamily: FONTS.sansBold, fontSize: 14 },
  successBox: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 36 },
  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  successTitle: { color: 'white', fontFamily: FONTS.serif, fontSize: 28, letterSpacing: -0.6, marginBottom: 8 },
  successSub: {
    color: 'rgba(255,255,255,0.6)', fontFamily: FONTS.sans, fontSize: 14,
    textAlign: 'center', lineHeight: 20, marginBottom: 20,
  },
  doneBtn: {
    paddingHorizontal: 36, height: 46, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center',
  },
  doneText: { color: 'white', fontFamily: FONTS.sansBold, fontSize: 14 },
});
