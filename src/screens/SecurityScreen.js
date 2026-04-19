import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  multiFactor,
} from 'firebase/auth';
import { COLORS } from '../theme';
import { useApp } from '../contexts/AppContext';
import { auth } from '../config/firebase';

const PHONE_RECAPTCHA_ID = 'phone-2fa-recaptcha';
const normalizePhoneNumber = (value = '') => value.trim().replace(/[^\d+]/g, '');

const getPhoneRecaptchaVerifier = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    throw new Error('Phone verification is available on the web build.');
  }
  if (!auth) throw new Error('Firebase authentication is not configured.');

  if (!window.swipe4changePhone2FARecaptcha) {
    window.swipe4changePhone2FARecaptcha = new RecaptchaVerifier(
      auth,
      PHONE_RECAPTCHA_ID,
      { size: 'invisible' }
    );
  }

  return window.swipe4changePhone2FARecaptcha;
};

const resetPhoneRecaptchaVerifier = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    window.swipe4changePhone2FARecaptcha?.clear?.();
  } catch {
    // Firebase throws if the verifier was already cleared. Safe to ignore.
  }
  window.swipe4changePhone2FARecaptcha = null;
};

export default function SecurityScreen({ navigation }) {
  const { user, updateUser } = useApp();
  const [twoFA, setTwoFA] = useState(user.twoFactorEnabled || false);
  const [biometric, setBiometric] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneMessage, setPhoneMessage] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  const phoneVerified = Boolean(user.phoneVerified && user.phoneNumber);

  useEffect(() => {
    setTwoFA(Boolean(user.twoFactorEnabled));
    setPhoneNumber(user.phoneNumber || '');
  }, [user.phoneNumber, user.twoFactorEnabled]);

  const sendPhoneCode = async () => {
    const normalized = normalizePhoneNumber(phoneNumber);
    setPhoneMessage('');

    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      setPhoneMessage('Enter a phone number in international format, like +15551234567.');
      return;
    }
    if (Platform.OS !== 'web') {
      setPhoneMessage('Phone verification is available in the deployed web app.');
      return;
    }
    if (!auth?.currentUser) {
      setPhoneMessage('Sign in with Firebase before setting up phone verification.');
      return;
    }

    try {
      setSendingCode(true);
      const verifier = getPhoneRecaptchaVerifier();
      const session = await multiFactor(auth.currentUser).getSession();
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber({ phoneNumber: normalized, session }, verifier);
      setPhoneNumber(normalized);
      setPendingPhoneNumber(normalized);
      setVerificationId(id);
      setVerificationCode('');
      setPhoneMessage('Code sent. Check your phone and enter the 6-digit code.');
    } catch (error) {
      resetPhoneRecaptchaVerifier();
      setPhoneMessage(error.message || 'Could not send the verification code.');
    } finally {
      setSendingCode(false);
    }
  };

  const confirmPhoneCode = async () => {
    if (!verificationId || verificationCode.trim().length < 6) {
      setPhoneMessage('Enter the 6-digit code first.');
      return;
    }
    if (!auth?.currentUser) {
      setPhoneMessage('Sign in again before confirming the code.');
      return;
    }

    try {
      setVerifyingCode(true);
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode.trim());
      const assertion = PhoneMultiFactorGenerator.assertion(credential);
      const verifiedPhoneNumber = pendingPhoneNumber || phoneNumber;
      try {
        await multiFactor(auth.currentUser).enroll(assertion, `Phone ending ${verifiedPhoneNumber.slice(-4)}`);
      } catch (error) {
        if (error.code !== 'auth/second-factor-already-in-use') throw error;
      }

      const phoneVerifiedAt = new Date().toISOString();
      updateUser({
        phoneNumber: verifiedPhoneNumber,
        phoneVerified: true,
        phoneVerifiedAt,
        twoFactorEnabled: true,
        twoFactorMethod: 'phone',
      });
      setTwoFA(true);
      setPendingPhoneNumber('');
      setVerificationId('');
      setVerificationCode('');
      setPhoneMessage('Phone verified. 2FA is now enabled for this account.');
    } catch (error) {
      setPhoneMessage(error.message || 'The verification code did not work.');
    } finally {
      setVerifyingCode(false);
    }
  };

  const disablePhone2FA = async () => {
    try {
      if (Platform.OS === 'web' && auth?.currentUser) {
        const enrolled = multiFactor(auth.currentUser).enrolledFactors || [];
        const phoneFactor = enrolled.find((factor) => (
          factor.factorId === PhoneMultiFactorGenerator.FACTOR_ID &&
          (!user.phoneNumber || factor.phoneNumber === user.phoneNumber)
        ));
        if (phoneFactor) await multiFactor(auth.currentUser).unenroll(phoneFactor.uid);
      }

      setTwoFA(false);
      updateUser({ twoFactorEnabled: false, twoFactorMethod: '' });
      setPhoneMessage('Phone 2FA is turned off.');
    } catch (error) {
      setPhoneMessage(error.message || 'Could not turn off phone 2FA.');
      Alert.alert('Sign in again', 'Firebase needs a recent sign-in before changing 2FA settings.');
    }
  };

  const toggle2FA = (val) => {
    if (val) {
      if (!phoneVerified) {
        Alert.alert('Verify phone first', 'Send a code to your phone and confirm it below to enable 2FA.');
        return;
      }
      Alert.alert(
        'Enable 2FA',
        'A verification code will be sent to your verified phone when Firebase asks for a second factor.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setTwoFA(true);
              updateUser({ twoFactorEnabled: true, twoFactorMethod: 'phone' });
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Turn off 2FA?',
        'Your phone will no longer be required as a second factor for this account.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Turn off', style: 'destructive', onPress: disablePhone2FA },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security & Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <MaterialIcons name="security" size={24} color={COLORS.tertiary} />
          </View>
          <Text style={styles.statusTitle}>Your data is protected</Text>
          <Text style={styles.statusSub}>
            All communications are encrypted with TLS. Signatures can be stored using AES-256 encryption at rest.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>AUTHENTICATION</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(78,222,163,0.1)' }]}>
              <MaterialCommunityIcons name="two-factor-authentication" size={18} color={COLORS.tertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
              <Text style={styles.settingDesc}>
                {phoneVerified ? `Phone verified: ${user.phoneNumber}` : 'Verify a phone number before enabling 2FA'}
              </Text>
            </View>
          </View>
          <Switch
            value={twoFA}
            onValueChange={toggle2FA}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.tertiary + '60' }}
            thumbColor={twoFA ? COLORS.tertiary : '#94a3b8'}
          />
        </View>

        <View style={styles.phoneCard}>
          <View style={styles.phoneHeader}>
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(78,222,163,0.1)' }]}>
              <MaterialIcons name="sms" size={18} color={COLORS.tertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Phone Number Verification</Text>
              <Text style={styles.settingDesc}>Use SMS codes as your second factor</Text>
            </View>
            {phoneVerified ? (
              <View style={styles.verifiedPill}>
                <MaterialIcons name="check" size={13} color={COLORS.onTertiary} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : null}
          </View>

          <TextInput
            style={styles.phoneInput}
            value={phoneNumber}
            onChangeText={(value) => {
              setPhoneNumber(value);
              setPhoneMessage('');
              if (verificationId) {
                setVerificationId('');
                setVerificationCode('');
                setPendingPhoneNumber('');
              }
            }}
            placeholder="+15551234567"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          {verificationId ? (
            <TextInput
              style={styles.phoneInput}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="6-digit code"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="number-pad"
              maxLength={6}
            />
          ) : null}

          {phoneMessage ? <Text style={styles.phoneMessage}>{phoneMessage}</Text> : null}

          <View style={styles.phoneActions}>
            <TouchableOpacity
              style={[styles.phoneBtn, sendingCode && styles.phoneBtnDisabled]}
              onPress={sendPhoneCode}
              disabled={sendingCode || verifyingCode}
            >
              {sendingCode ? <ActivityIndicator color={COLORS.onTertiary} size="small" /> : null}
              <Text style={styles.phoneBtnText}>{verificationId ? 'Resend Code' : 'Send Code'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.phoneBtn,
                styles.phoneBtnSecondary,
                (!verificationId || verifyingCode) && styles.phoneBtnDisabled,
              ]}
              onPress={confirmPhoneCode}
              disabled={!verificationId || verifyingCode}
            >
              {verifyingCode ? <ActivityIndicator color="white" size="small" /> : null}
              <Text style={[styles.phoneBtnText, styles.phoneBtnSecondaryText]}>Verify & Enable</Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'web' ? <View nativeID={PHONE_RECAPTCHA_ID} /> : null}
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(177,197,255,0.1)' }]}>
              <MaterialIcons name="fingerprint" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Biometric Login</Text>
              <Text style={styles.settingDesc}>Use Face ID or fingerprint to sign in</Text>
            </View>
          </View>
          <Switch
            value={biometric}
            onValueChange={setBiometric}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.primary + '60' }}
            thumbColor={biometric ? COLORS.primary : '#94a3b8'}
          />
        </View>

        <Text style={styles.sectionLabel}>DATA PROTECTION</Text>
        <InfoRow icon="lock" title="Encryption" desc="Signatures can be encrypted in transit and at rest." />
        <InfoRow icon="vpn-key" title="Secure Key Storage" desc="Authentication is handled by Firebase and server secrets stay on the backend." />
        <InfoRow icon="shield" title="Signature Privacy" desc="Your saved signature is used only when you consent to sign a petition." />
        <InfoRow icon="delete-forever" title="Data Deletion" desc="Account data can be removed through backend/database administration." />

        <Text style={styles.sectionLabel}>ACTIVE SESSIONS</Text>
        <View style={styles.sessionRow}>
          <MaterialCommunityIcons name="cellphone" size={18} color="rgba(255,255,255,0.6)" />
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionDevice}>This device</Text>
            <Text style={styles.sessionDetail}>Last active: now</Text>
          </View>
          <View style={styles.activeDot} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, title, desc }) => (
  <View style={styles.infoRow}>
    <View style={[styles.settingIcon, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
      <MaterialIcons name={icon} size={16} color="rgba(255,255,255,0.5)" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: '800' },
  body: { padding: 20, paddingBottom: 40 },
  statusCard: {
    backgroundColor: 'rgba(78,222,163,0.06)',
    borderWidth: 1, borderColor: 'rgba(78,222,163,0.15)',
    borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 8,
  },
  statusIcon: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(78,222,163,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  statusTitle: { color: 'white', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  statusSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center', lineHeight: 17 },
  sectionLabel: {
    color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '800',
    letterSpacing: 2, marginTop: 24, marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 14, marginBottom: 8,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingTitle: { color: 'white', fontSize: 14, fontWeight: '700' },
  settingDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  phoneCard: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 14, marginBottom: 8,
  },
  phoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  verifiedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.tertiary,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  verifiedText: { color: COLORS.onTertiary, fontSize: 10, fontWeight: '900' },
  phoneInput: {
    height: 46, borderRadius: 12, paddingHorizontal: 12, marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    color: 'white', fontSize: 13,
  },
  phoneMessage: { color: 'rgba(255,255,255,0.58)', fontSize: 12, lineHeight: 17, marginBottom: 10 },
  phoneActions: { flexDirection: 'row', gap: 10 },
  phoneBtn: {
    flex: 1, minHeight: 42, borderRadius: 8,
    backgroundColor: COLORS.tertiary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  phoneBtnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  phoneBtnDisabled: { opacity: 0.55 },
  phoneBtnText: { color: COLORS.onTertiary, fontSize: 12, fontWeight: '900' },
  phoneBtnSecondaryText: { color: 'white' },
  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 14, marginBottom: 8,
  },
  sessionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 14, marginBottom: 8,
  },
  sessionDevice: { color: 'white', fontSize: 13, fontWeight: '700' },
  sessionDetail: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.tertiary },
});
