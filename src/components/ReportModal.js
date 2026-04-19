import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const REPORT_REASONS = [
  'False information',
  'Malicious or harmful',
  'Spam or scam',
  'Harassment or hate',
  'Impersonation',
  'Other concern',
];

export default function ReportModal({ visible, petition, onClose, onSubmit }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const reset = () => {
    setReason(REPORT_REASONS[0]);
    setDetails('');
    setSubmitting(false);
    setMessage('');
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (submitting) return;
    setMessage('');
    setSubmitting(true);
    try {
      const result = await onSubmit({ reason, details });
      setMessage(result?.emailSent ? 'Report sent. Thank you.' : 'Report saved. Email alerts need backend email setup.');
      setTimeout(close, 900);
    } catch (error) {
      setMessage(error.message || 'Could not submit report.');
      setSubmitting(false);
    }
  };

  if (!petition) return null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={close} statusBarTranslucent>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.kicker}>REPORT PETITION</Text>
                <Text style={styles.title} numberOfLines={2}>{petition.title}</Text>
              </View>
              <TouchableOpacity onPress={close} style={styles.closeBtn}>
                <MaterialIcons name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Reason</Text>
              <View style={styles.reasons}>
                {REPORT_REASONS.map((item) => {
                  const active = reason === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.reasonChip, active && styles.reasonChipActive]}
                      onPress={() => setReason(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.reasonText, active && styles.reasonTextActive]}>{item}</Text>
                      {active && <MaterialIcons name="check" size={13} color={COLORS.error} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Details</Text>
              <TextInput
                style={styles.textarea}
                value={details}
                onChangeText={setDetails}
                placeholder="Tell us what looks false, malicious, or unsafe."
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                maxLength={800}
              />
              <Text style={styles.note}>Reports are sent to the Swipe4Change admin email for review.</Text>
              {message ? <Text style={styles.message}>{message}</Text> : null}
            </ScrollView>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={close}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={submit} disabled={submitting}>
                <MaterialIcons name="flag" size={16} color="white" />
                <Text style={styles.submitText}>{submitting ? 'Sending...' : 'Submit report'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  wrap: { width: '100%' },
  sheet: { backgroundColor: COLORS.surfaceLow, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', maxHeight: '90%' },
  header: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 14, flexDirection: 'row', gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  kicker: { color: COLORS.error, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 5 },
  title: { color: 'white', fontSize: 18, fontWeight: '900', lineHeight: 22 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  body: { padding: 24, gap: 10 },
  label: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginTop: 4 },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reasonChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.04)' },
  reasonChipActive: { borderColor: 'rgba(255,180,171,0.5)', backgroundColor: 'rgba(255,180,171,0.12)' },
  reasonText: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '700' },
  reasonTextActive: { color: COLORS.error },
  textarea: { minHeight: 110, textAlignVertical: 'top', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', color: 'white', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  note: { color: 'rgba(255,255,255,0.38)', fontSize: 12, lineHeight: 17 },
  message: { color: COLORS.tertiary, fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  cancelBtn: { flex: 1, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  cancelText: { color: 'rgba(255,255,255,0.75)', fontWeight: '800' },
  submitBtn: { flex: 2, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: 'rgba(186,26,26,0.9)' },
  submitText: { color: 'white', fontWeight: '900' },
});
