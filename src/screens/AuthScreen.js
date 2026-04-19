import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import {
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
} from 'firebase/auth';
import { COLORS } from '../theme';
import { useApp } from '../contexts/AppContext';
import { auth } from '../config/firebase';

const LOGIN_RECAPTCHA_ID = 'login-2fa-recaptcha';

const getLoginRecaptchaVerifier = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    throw new Error('Phone 2FA sign-in is available on the web build.');
  }
  if (!auth) throw new Error('Firebase authentication is not configured.');

  if (!window.swipe4changeLogin2FARecaptcha) {
    window.swipe4changeLogin2FARecaptcha = new RecaptchaVerifier(
      auth,
      LOGIN_RECAPTCHA_ID,
      { size: 'invisible' }
    );
  }

  return window.swipe4changeLogin2FARecaptcha;
};

const resetLoginRecaptchaVerifier = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    window.swipe4changeLogin2FARecaptcha?.clear?.();
  } catch {
    // Firebase throws if the verifier was already cleared. Safe to ignore.
  }
  window.swipe4changeLogin2FARecaptcha = null;
};

export default function AuthScreen() {
  const { login, signup, firebaseEnabled } = useApp();
  const [mode, setMode] = useState('login'); // login | signup
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mfaResolver, setMfaResolver] = useState(null);
  const [mfaHint, setMfaHint] = useState(null);
  const [mfaVerificationId, setMfaVerificationId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSending, setMfaSending] = useState(false);

  const resetMfaState = () => {
    setMfaResolver(null);
    setMfaHint(null);
    setMfaVerificationId('');
    setMfaCode('');
  };

  const sendMfaCode = async (resolver = mfaResolver, hint = mfaHint) => {
    if (!resolver || !hint) return;

    try {
      setMfaSending(true);
      const verifier = getLoginRecaptchaVerifier();
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(
        { multiFactorHint: hint, session: resolver.session },
        verifier
      );
      setMfaVerificationId(id);
      setError(`Code sent to ${hint.phoneNumber || 'your verified phone'}.`);
    } catch (err) {
      resetLoginRecaptchaVerifier();
      setError(err.message || 'Could not send your 2FA code.');
    } finally {
      setMfaSending(false);
    }
  };

  const handleMfaSubmit = async () => {
    if (!mfaVerificationId || mfaCode.trim().length < 6) {
      setError('Enter the 6-digit code from your phone.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const credential = PhoneAuthProvider.credential(mfaVerificationId, mfaCode.trim());
      const assertion = PhoneMultiFactorGenerator.assertion(credential);
      await mfaResolver.resolveSignIn(assertion);
      resetMfaState();
    } catch (err) {
      setError(err.message || 'That 2FA code did not work.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    try {
      setLoading(true);
      resetMfaState();
      if (mode === 'signup') {
        await signup({ fullName: name.trim(), email: email.trim(), password });
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      if (err.code === 'auth/multi-factor-auth-required' && auth) {
        const resolver = getMultiFactorResolver(auth, err);
        const phoneHint = resolver.hints.find((hint) => (
          hint.factorId === PhoneMultiFactorGenerator.FACTOR_ID
        )) || resolver.hints[0];
        setMfaResolver(resolver);
        setMfaHint(phoneHint);
        setMfaCode('');
        await sendMfaCode(resolver, phoneHint);
        return;
      }
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand */}
          <View style={styles.brand}>
            <LinearGradient
              colors={[COLORS.primaryDeep, COLORS.primaryContainer]}
              style={styles.logoBox}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={28} color="white" />
            </LinearGradient>
            <Text style={styles.appName}>
              Swipe<Text style={{ color: COLORS.primary }}>4</Text>Change
            </Text>
            <Text style={styles.tagline}>
              Your voice. Your petition. Your impact.
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Tab toggle */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, mode === 'login' && styles.tabActive]}
                onPress={() => { setMode('login'); setError(''); resetMfaState(); }}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === 'signup' && styles.tabActive]}
                onPress={() => { setMode('signup'); setError(''); resetMfaState(); }}
              >
                <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Fields */}
            <View style={styles.fields}>
              {mode === 'signup' && (
                <View style={styles.inputWrap}>
                  <MaterialIcons name="person-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}
              <View style={styles.inputWrap}>
                <MaterialIcons name="email" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputWrap}>
                <MaterialIcons name="lock-outline" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                  <MaterialIcons name={showPw ? 'visibility' : 'visibility-off'} size={18} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <MaterialIcons name="error-outline" size={14} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {mfaResolver ? (
                <View style={styles.mfaBox}>
                  <Text style={styles.mfaTitle}>Phone verification required</Text>
                  <Text style={styles.mfaSub}>
                    Enter the code sent to {mfaHint?.phoneNumber || 'your verified phone'}.
                  </Text>
                  <View style={styles.inputWrap}>
                    <MaterialIcons name="sms" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="6-digit code"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={mfaCode}
                      onChangeText={setMfaCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                  <View style={styles.mfaActions}>
                    <TouchableOpacity
                      style={[styles.mfaButton, mfaSending && styles.mfaButtonDisabled]}
                      onPress={() => sendMfaCode()}
                      disabled={mfaSending || loading}
                    >
                      <Text style={styles.mfaButtonText}>{mfaSending ? 'Sending...' : 'Resend Code'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.mfaButton, styles.mfaButtonPrimary, loading && styles.mfaButtonDisabled]}
                      onPress={handleMfaSubmit}
                      disabled={loading}
                    >
                      <Text style={[styles.mfaButtonText, styles.mfaButtonPrimaryText]}>
                        {loading ? 'Checking...' : 'Verify'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.9}>
                <LinearGradient
                  colors={[COLORS.tertiary, COLORS.tertiaryContainer]}
                  style={styles.submitBtn}
                >
                  <Text style={styles.submitText}>
                    {loading ? 'Working...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                  <MaterialIcons name="arrow-forward" size={18} color={COLORS.onTertiary} />
                </LinearGradient>
              </TouchableOpacity>

              {!firebaseEnabled && (
                <Text style={styles.devMode}>
                  Local demo mode. Add Firebase env values to enable real authentication.
                </Text>
              )}

              {Platform.OS === 'web' ? <View nativeID={LOGIN_RECAPTCHA_ID} /> : null}
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              {['google', 'apple', 'github'].map((s) => (
                <TouchableOpacity key={s} style={styles.socialBtn} activeOpacity={0.8}>
                  <MaterialCommunityIcons name={s} size={20} color="white" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', paddingVertical: 40 },

  brand: { alignItems: 'center', marginBottom: 36 },
  logoBox: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: COLORS.primaryContainer, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  appName: { color: 'white', fontSize: 28, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  tagline: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 6, fontWeight: '500' },

  card: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    padding: 24, marginBottom: 20,
  },

  tabs: { flexDirection: 'row', marginBottom: 24, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 3 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  tabText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: 'white' },

  fields: { gap: 12 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, paddingHorizontal: 14, height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: 'white', fontSize: 14 },
  eyeBtn: { padding: 4 },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  errorText: { color: COLORS.error, fontSize: 12, flex: 1 },

  mfaBox: {
    borderWidth: 1, borderColor: 'rgba(78,222,163,0.18)',
    backgroundColor: 'rgba(78,222,163,0.06)',
    borderRadius: 14, padding: 12, gap: 10,
  },
  mfaTitle: { color: 'white', fontSize: 13, fontWeight: '800' },
  mfaSub: { color: 'rgba(255,255,255,0.55)', fontSize: 11, lineHeight: 16 },
  mfaActions: { flexDirection: 'row', gap: 10 },
  mfaButton: {
    flex: 1, minHeight: 40, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  mfaButtonPrimary: { backgroundColor: COLORS.tertiary, borderColor: COLORS.tertiary },
  mfaButtonDisabled: { opacity: 0.55 },
  mfaButtonText: { color: 'white', fontSize: 12, fontWeight: '800' },
  mfaButtonPrimaryText: { color: COLORS.onTertiary },

  submitBtn: {
    height: 52, borderRadius: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
    shadowColor: COLORS.tertiary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },
  submitText: { color: COLORS.onTertiary, fontWeight: '900', fontSize: 15 },
  devMode: { color: 'rgba(255,255,255,0.35)', fontSize: 11, lineHeight: 16, textAlign: 'center' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  dividerText: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '600', marginHorizontal: 12 },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  socialBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  terms: { color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  link: { color: COLORS.primary, fontWeight: '600' },
});
