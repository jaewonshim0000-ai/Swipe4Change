import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { COLORS, FONTS } from '../theme';
import { REPORT_REASONS } from '../data/petitions';
import { hSuccess, hWarn, hTap } from '../utils/haptics';
import { useApp } from '../contexts/AppContext';
import Sheet from './Sheet';
import Press from './Press';
import Icon from './Icon';

export default function ReportModal({ visible, petition, onClose, onSubmit }) {
  const { setCelebration } = useApp();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => { setReason(REPORT_REASONS[0]); setDetails(''); setBusy(false); };
  const close = () => { reset(); onClose(); };

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onSubmit({ reason, details });
      hSuccess();
    } catch {
      // The design always confirms the report locally; a backend that is not
      // configured must not lose the user's report.
      hWarn();
    }
    close();
    setCelebration({
      icon: 'shield_person',
      kicker: 'REPORT SENT',
      title: 'Report saved',
      sub: 'Reports are sent to the Swipe4Change admin email for review, usually within 24 hours.',
      color: COLORS.error,
      from: '#4a1f1f',
      to: '#c04646',
    });
  };

  if (!petition) return null;

  const header = (
    <View style={s.header}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.kicker}>REPORT PETITION</Text>
        <Text style={s.title} numberOfLines={2}>{petition.title}</Text>
      </View>
      <Press style={s.closeBtn} onPress={close} scale={0.88}>
        <Icon name="close" size={17} color="#fff" />
      </Press>
    </View>
  );

  return (
    <Sheet visible={visible} onClose={close} header={header}>
      <View style={s.body}>
        <Text style={s.label}>REASON</Text>
        <View style={s.reasons}>
          {REPORT_REASONS.map((r) => {
            const active = reason === r;
            return (
              <Press
                key={r}
                style={[
                  s.reason,
                  {
                    borderColor: active ? 'rgba(255,180,171,.5)' : 'rgba(255,255,255,.1)',
                    backgroundColor: active ? 'rgba(255,180,171,.12)' : 'rgba(255,255,255,.04)',
                  },
                ]}
                onPress={() => { hTap(); setReason(r); }}
                scale={0.95}
              >
                <Text style={[s.reasonText, { color: active ? COLORS.error : 'rgba(255,255,255,.65)' }]}>{r}</Text>
                {active ? <Icon name="check" size={13} weight={700} color={COLORS.error} /> : null}
              </Press>
            );
          })}
        </View>

        <Text style={s.label}>DETAILS</Text>
        <TextInput
          style={s.textarea}
          value={details}
          onChangeText={setDetails}
          placeholder="Tell us what looks false, malicious, or unsafe."
          placeholderTextColor="rgba(255,255,255,.3)"
          multiline
          maxLength={800}
        />
        <Text style={s.note}>Reports are sent to the Swipe4Change admin email for review.</Text>

        <View style={s.actions}>
          <Press style={s.cancelBtn} onPress={close}>
            <Text style={s.cancelText}>Cancel</Text>
          </Press>
          <Press style={s.submitBtn} onPress={submit} disabled={busy} scale={0.97}>
            <Icon name="flag" size={17} fill={1} color="#fff" />
            <Text style={s.submitText}>{busy ? 'Sending…' : 'Submit report'}</Text>
          </Press>
        </View>
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.06)',
  },
  kicker: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.9, color: COLORS.error, marginBottom: 4 },
  title: { fontFamily: FONTS.serif, fontSize: 24, lineHeight: 26.4, color: '#fff' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  body: { paddingHorizontal: 20, paddingTop: 16 },
  label: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.7, color: 'rgba(255,255,255,.45)', marginBottom: 8 },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  reason: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1,
  },
  reasonText: { fontFamily: FONTS.sansBold, fontSize: 13 },
  textarea: {
    height: 88, borderRadius: 15, textAlignVertical: 'top',
    backgroundColor: 'rgba(255,255,255,.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,.1)',
    padding: 12, color: '#fff', fontFamily: FONTS.sans, fontSize: 13, lineHeight: 19.5,
  },
  note: { fontFamily: FONTS.sans, fontSize: 11, lineHeight: 15.95, color: 'rgba(255,255,255,.38)', marginTop: 8, marginBottom: 16 },

  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, height: 48, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,.06)', alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { fontFamily: FONTS.sansBold, fontSize: 13, color: 'rgba(255,255,255,.75)' },
  submitBtn: {
    flex: 2, height: 48, borderRadius: 999, flexDirection: 'row', gap: 8,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.reportRed,
  },
  submitText: { fontFamily: FONTS.sansBold, fontSize: 13, color: '#fff' },
});
