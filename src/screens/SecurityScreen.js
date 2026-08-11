import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SECTION_LABEL } from '../theme';
import { useApp } from '../contexts/AppContext';
import ScreenBackground from '../components/ScreenBackground';
import { Display, MonoLabel } from '../components/Glass';
import Press from '../components/Press';
import Icon from '../components/Icon';

const DATA_ROWS = [
  { key: 'e', icon: 'lock', title: 'Encryption', desc: 'Signatures can be encrypted in transit and at rest.' },
  { key: 'k', icon: 'vpn_key', title: 'Secure Key Storage', desc: 'Authentication is handled by Firebase and server secrets stay on the backend.' },
  { key: 's', icon: 'shield', title: 'Signature Privacy', desc: 'Your saved signature is used only when you consent to sign a petition.' },
  { key: 'd', icon: 'delete_forever', title: 'Data Deletion', desc: 'Account data can be removed through backend administration.' },
];

function Toggle({ on, onPress, color }) {
  return (
    <Press
      style={[s.track, { backgroundColor: on ? `${color}61` : 'rgba(255,255,255,.1)', justifyContent: on ? 'flex-end' : 'flex-start' }]}
      onPress={onPress}
      flat
    >
      <View style={[s.thumb, { backgroundColor: on ? color : '#94a3b8' }]} />
    </Press>
  );
}

export default function SecurityScreen({ navigation }) {
  const { user, updateUser } = useApp();
  const [phone, setPhone] = useState(user.phoneNumber || '');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState('');

  const twoFA = Boolean(user.twoFactorEnabled);
  const bio = Boolean(user.biometricEnabled);
  const verified = Boolean(user.phoneVerified);

  const sendCode = () => {
    if (!/^\+[1-9]\d{7,14}$/.test(phone.trim())) {
      setMessage('Enter a phone number in international format, like +15551234567.');
      return;
    }
    setCodeSent(true);
    setCode('');
    setMessage('Code sent. Check your phone and enter the 6-digit code.');
  };

  const verify = () => {
    if (!codeSent || code.trim().length < 6) {
      setMessage('Enter the 6-digit code first.');
      return;
    }
    updateUser({
      phoneNumber: phone.trim(),
      phoneVerified: true,
      phoneVerifiedAt: new Date().toISOString(),
      twoFactorEnabled: true,
      twoFactorMethod: 'sms',
    });
    setCodeSent(false);
    setMessage('Phone verified. Two-factor authentication is on.');
  };

  const toggle2fa = () => {
    if (!verified) { setMessage('Verify a phone number first.'); return; }
    updateUser({ twoFactorEnabled: !twoFA });
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.head}>
          <Press style={s.backBtn} onPress={() => navigation.goBack()} scale={0.9}>
            <Icon name="arrow_back" size={17} color="#fff" />
          </Press>
          <Display size={24} lineHeight={24}>Security</Display>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <LinearGradient
            colors={['rgba(78,222,163,.13)', 'rgba(27,31,43,.9)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroGlow} pointerEvents="none">
              <Svg width={180} height={180}>
                <Defs>
                  <RadialGradient id="hg" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor={COLORS.tertiary} stopOpacity="0.22" />
                    <Stop offset="0.7" stopColor={COLORS.tertiary} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx={90} cy={90} r={90} fill="url(#hg)" />
              </Svg>
            </View>
            <View style={s.heroIcon}>
              <Icon name="security" size={24} fill={1} color={COLORS.tertiary} />
            </View>
            <Display size={24} lineHeight={25.2} style={{ textAlign: 'center' }}>Your data is protected</Display>
            <Text style={s.heroSub}>
              All communications are encrypted with TLS. Signatures can be stored using AES-256 encryption at rest.
            </Text>
          </LinearGradient>

          <Text style={s.sectionLabel}>AUTHENTICATION</Text>

          <View style={s.row}>
            <View style={[s.rowIcon, { backgroundColor: 'rgba(78,222,163,.1)' }]}>
              <Icon name="phonelink_lock" size={17} color={COLORS.tertiary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.rowTitle}>Two-Factor Authentication</Text>
              <Text style={s.rowSub}>
                {verified ? `Phone verified: ${user.phoneNumber}` : 'Verify a phone number before enabling 2FA'}
              </Text>
            </View>
            <Toggle on={twoFA} onPress={toggle2fa} color={COLORS.tertiary} />
          </View>

          <View style={s.phoneCard}>
            <View style={s.phoneHead}>
              <View style={[s.rowIcon, { backgroundColor: 'rgba(78,222,163,.1)' }]}>
                <Icon name="sms" size={17} color={COLORS.tertiary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.rowTitle}>Phone Number Verification</Text>
                <Text style={s.rowSub}>Use SMS codes as your second factor</Text>
              </View>
              {verified ? (
                <View style={s.verifiedPill}>
                  <Icon name="check" size={13} weight={700} color={COLORS.onTertiary} />
                  <Text style={s.verifiedText}>Verified</Text>
                </View>
              ) : null}
            </View>

            <TextInput
              style={s.monoInput}
              placeholder="+15551234567"
              placeholderTextColor="rgba(255,255,255,.3)"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(v) => { setPhone(v); setMessage(''); setCodeSent(false); }}
            />

            {codeSent ? (
              <TextInput
                style={[s.monoInput, { letterSpacing: 4 }]}
                placeholder="6-digit code"
                placeholderTextColor="rgba(255,255,255,.3)"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />
            ) : null}

            {message ? <Text style={s.message}>{message}</Text> : null}

            <View style={s.phoneActions}>
              <Press style={s.sendBtn} onPress={sendCode} scale={0.96}>
                <Text style={s.sendText}>{codeSent ? 'Resend Code' : 'Send Code'}</Text>
              </Press>
              <Press
                style={[s.verifyBtn, !codeSent && { opacity: 0.45 }]}
                onPress={verify}
                disabled={!codeSent}
                scale={0.96}
              >
                <Text style={s.verifyText}>Verify &amp; Enable</Text>
              </Press>
            </View>
          </View>

          <View style={[s.row, { marginTop: 8 }]}>
            <View style={[s.rowIcon, { backgroundColor: 'rgba(177,197,255,.1)' }]}>
              <Icon name="fingerprint" size={17} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.rowTitle}>Biometric Login</Text>
              <Text style={s.rowSub}>Use Face ID or fingerprint to sign in</Text>
            </View>
            <Toggle on={bio} onPress={() => updateUser({ biometricEnabled: !bio })} color={COLORS.primary} />
          </View>

          <Text style={s.sectionLabel}>DATA PROTECTION</Text>
          <View style={s.dataCard}>
            {DATA_ROWS.map((d, i) => (
              <View key={d.key} style={[s.dataRow, i > 0 && s.dataDivider]}>
                <Icon name={d.icon} size={17} color="rgba(255,255,255,.5)" />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.rowTitle}>{d.title}</Text>
                  <Text style={s.rowSub}>{d.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={s.sectionLabel}>ACTIVE SESSIONS</Text>
          <View style={s.row}>
            <Icon name="smartphone" size={17} color="rgba(255,255,255,.6)" />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.rowTitle}>This device</Text>
              <MonoLabel size={11} spacing={0} style={{ marginTop: 2 }}>LAST ACTIVE: NOW</MonoLabel>
            </View>
            <View style={s.liveDot} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  backBtn: {
    width: 38, height: 38, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: SECTION_LABEL,

  hero: {
    position: 'relative', overflow: 'hidden', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: 'rgba(78,222,163,.22)', alignItems: 'center', gap: 8,
  },
  heroGlow: { position: 'absolute', top: -70, right: -50 },
  heroIcon: {
    width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(78,222,163,.14)', borderWidth: 1, borderColor: 'rgba(78,222,163,.3)',
  },
  heroSub: {
    fontFamily: FONTS.sans, fontSize: 13, lineHeight: 20.15,
    color: 'rgba(255,255,255,.55)', textAlign: 'center',
  },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,.07)',
    marginBottom: 8,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: FONTS.sansBold, fontSize: 13, color: '#fff' },
  rowSub: { fontFamily: FONTS.sans, fontSize: 11, lineHeight: 15.95, color: 'rgba(255,255,255,.45)', marginTop: 2 },

  track: { width: 46, height: 27, borderRadius: 99, padding: 3, flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 21, height: 21, borderRadius: 11 },

  phoneCard: {
    padding: 16, borderRadius: 20, gap: 12,
    backgroundColor: 'rgba(255,255,255,.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,.07)',
  },
  phoneHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  verifiedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: COLORS.tertiary,
  },
  verifiedText: { fontFamily: FONTS.sansBold, fontSize: 11, color: COLORS.onTertiary },
  monoInput: {
    height: 44, borderRadius: 14, paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,.1)',
    color: '#fff', fontFamily: FONTS.mono, fontSize: 13,
  },
  message: { fontFamily: FONTS.sans, fontSize: 11, lineHeight: 15.95, color: COLORS.tertiary },
  phoneActions: { flexDirection: 'row', gap: 8 },
  sendBtn: {
    flex: 1, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.tertiary,
  },
  sendText: { fontFamily: FONTS.sansBold, fontSize: 13, color: COLORS.onTertiary },
  verifyBtn: {
    flex: 1, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,.12)',
  },
  verifyText: { fontFamily: FONTS.sansBold, fontSize: 13, color: '#fff' },

  dataCard: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,.07)' },
  dataRow: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,.033)',
  },
  dataDivider: { borderTopWidth: 1, borderTopColor: 'rgba(10,14,25,.6)' },

  liveDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.tertiary,
    shadowColor: COLORS.tertiary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4,
  },
});
