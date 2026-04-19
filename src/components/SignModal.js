import React, { useState } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { COLORS, CATEGORY_STYLE } from '../theme';
import { fmtNumber } from '../utils/helpers';

export default function SignModal({ visible, petition, user, onClose, onConfirm }) {
  const [consent, setConsent] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!petition) return null;
  const cat = CATEGORY_STYLE[petition.category] || CATEGORY_STYLE.Climate;

  const resetAndClose = () => { setConsent(false); setComment(''); setSubmitting(false); setConfirmed(false); onClose(); };

  const handleSubmit = () => {
    if (!consent || submitting) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSubmitting(true);
    setTimeout(() => {
      setConfirmed(true);
      setTimeout(() => { onConfirm(petition, comment); setTimeout(() => { setConsent(false); setComment(''); setSubmitting(false); setConfirmed(false); }, 100); }, 1200);
    }, 500);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={resetAndClose} statusBarTranslucent>
      <View style={s.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={resetAndClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.sheetWrap}>
          <View style={s.sheet}>
            {confirmed ? (
              <View style={s.successBox}>
                <LinearGradient colors={[cat.from, cat.to]} style={s.successIcon}>
                  <MaterialIcons name="check" size={48} color="white" />
                </LinearGradient>
                <Text style={s.successTitle}>Signed!</Text>
                <Text style={s.successSub}>Your voice joined {fmtNumber(petition.signed + 1)} others.</Text>
              </View>
            ) : (
              <>
                <View style={s.grab} />
                <View style={s.header}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={[s.kicker, { color: cat.glow }]}>SIGNING PETITION</Text>
                    <Text style={s.title}>{petition.title}</Text>
                  </View>
                  <TouchableOpacity onPress={resetAndClose} style={s.closeBtn}>
                    <MaterialIcons name="close" size={18} color="white" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
                  {/* Profile info */}
                  <View style={s.infoBox}>
                    <View style={s.infoHeader}>
                      <MaterialCommunityIcons name="auto-fix" size={13} color={COLORS.primary} />
                      <Text style={s.infoHeaderText}>LOADED FROM PROFILE</Text>
                    </View>
                    <Row label="Name" value={`${user.firstName} ${user.lastName}`} />
                    <Row label="Email" value={user.email} />
                    <Row label="Location" value={user.location} />
                  </View>

                  {/* Signature preview */}
                  {user.signature ? (
                    <View style={s.sigBox}>
                      <Text style={s.sigLabel}>YOUR SIGNATURE</Text>
                      <View style={s.sigPreview}>
                        <Svg height={50} width="100%">
                          <Path d={user.signature} stroke="white" strokeWidth={2} fill="none" strokeLinecap="round" />
                        </Svg>
                      </View>
                    </View>
                  ) : (
                    <View style={s.sigMissing}>
                      <MaterialIcons name="draw" size={16} color="rgba(255,255,255,0.3)" />
                      <Text style={s.sigMissingText}>Add a signature in your Profile for faster signing</Text>
                    </View>
                  )}

                  {/* Comment */}
                  <Text style={s.fieldLabel}>Add a comment <Text style={{ color: 'rgba(255,255,255,0.3)' }}>(optional)</Text></Text>
                  <TextInput
                    style={s.textarea}
                    placeholder="Why does this matter to you?"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline numberOfLines={3} maxLength={240}
                    value={comment} onChangeText={setComment}
                  />

                  {/* Consent */}
                  <TouchableOpacity style={s.consentBox} onPress={() => setConsent(!consent)} activeOpacity={0.8}>
                    <View style={[s.checkbox, consent && { borderColor: COLORS.tertiary, backgroundColor: COLORS.tertiary }]}>
                      {consent && <MaterialIcons name="check" size={14} color={COLORS.onTertiary} />}
                    </View>
                    <Text style={s.consentText}>
                      I agree to the <Text style={{ fontWeight: '700', color: 'rgba(255,255,255,0.9)' }}>Terms & Conditions</Text> and consent to share my information with <Text style={{ fontWeight: '700', color: 'rgba(255,255,255,0.9)' }}>{petition.organization}</Text>.
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                <View style={s.actions}>
                  <TouchableOpacity style={s.cancelBtn} onPress={resetAndClose} activeOpacity={0.8}>
                    <Text style={s.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.signBtn, !consent && { opacity: 0.4 }]} onPress={handleSubmit} disabled={!consent || submitting} activeOpacity={0.9}>
                    <LinearGradient colors={[COLORS.tertiary, COLORS.tertiaryContainer]} style={s.signGrad}>
                      <Text style={s.signText}>{submitting ? 'Signing...' : 'Sign Petition'}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const Row = ({ label, value }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
    <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)' }}>{label.toUpperCase()}</Text>
    <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500' }} numberOfLines={1}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheetWrap: { width: '100%' },
  sheet: { backgroundColor: COLORS.surfaceLow, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingBottom: 24, maxHeight: '90%' },
  grab: { width: 48, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginTop: 10, borderRadius: 2 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', alignItems: 'flex-start' },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '900', color: 'white', lineHeight: 24 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 24, paddingTop: 16, maxHeight: 400 },
  infoBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 16, marginBottom: 14 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  infoHeaderText: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: COLORS.primary },
  sigBox: { marginBottom: 14 },
  sigLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', marginBottom: 6 },
  sigPreview: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  sigMissing: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, padding: 12, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12 },
  sigMissingText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  textarea: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 18, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, color: 'white', fontSize: 14, minHeight: 70, textAlignVertical: 'top', marginBottom: 14 },
  consentBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 18, padding: 16 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  consentText: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingTop: 16 },
  cancelBtn: { flex: 1, height: 50, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', fontSize: 14 },
  signBtn: { flex: 2, height: 50, borderRadius: 999, overflow: 'hidden' },
  signGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  signText: { color: COLORS.onTertiary, fontWeight: '900', fontSize: 14 },
  successBox: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 40 },
  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { color: 'white', fontSize: 28, fontWeight: '900', marginBottom: 8 },
  successSub: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
