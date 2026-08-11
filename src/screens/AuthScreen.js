import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../theme';
import { useApp } from '../contexts/AppContext';
import ScreenBackground from '../components/ScreenBackground';
import { Display } from '../components/Glass';
import Press from '../components/Press';
import Icon from '../components/Icon';

export default function AuthScreen() {
  const { login, signup, firebaseEnabled } = useApp();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';

  const submit = async () => {
    if (busy) return;
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      if (isSignup) await signup({ fullName: name || email.split('@')[0], email, password });
      else await login(email, password);
    } catch (e) {
      setError(e.message || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.brand}>
            <LinearGradient
              colors={['#5c8cfb', '#1b58c5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.7, y: 1 }}
              style={s.logo}
            >
              <Icon name="bolt" size={32} fill={1} color="#fff" />
            </LinearGradient>
            <Text style={s.wordmark}>
              Swipe<Text style={{ color: COLORS.primary }}>4</Text>Change
            </Text>
            <Display size={17} lineHeight={22} italic color="rgba(255,255,255,.6)" style={{ textAlign: 'center' }}>
              Small swipes. Real pressure.
            </Display>
          </View>

          <View style={s.tabs}>
            <Press
              style={[s.tab, !isSignup && s.tabOn]}
              onPress={() => { setMode('login'); setError(''); }}
              flat
            >
              <Text style={[s.tabText, { color: !isSignup ? COLORS.onTertiary : 'rgba(255,255,255,.55)' }]}>Sign In</Text>
            </Press>
            <Press
              style={[s.tab, isSignup && s.tabOn]}
              onPress={() => { setMode('signup'); setError(''); }}
              flat
            >
              <Text style={[s.tabText, { color: isSignup ? COLORS.onTertiary : 'rgba(255,255,255,.55)' }]}>Create Account</Text>
            </Press>
          </View>

          <View style={{ gap: 12 }}>
            {isSignup ? (
              <View style={s.field}>
                <Icon name="person" size={17} color="rgba(255,255,255,.4)" />
                <TextInput
                  style={s.input}
                  placeholder="Full name"
                  placeholderTextColor="rgba(255,255,255,.35)"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            ) : null}

            <View style={s.field}>
              <Icon name="mail" size={17} color="rgba(255,255,255,.4)" />
              <TextInput
                style={s.input}
                placeholder="Email address"
                placeholderTextColor="rgba(255,255,255,.35)"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={s.field}>
              <Icon name="lock" size={17} color="rgba(255,255,255,.4)" />
              <TextInput
                style={s.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,.35)"
                secureTextEntry={!showPw}
                value={password}
                onChangeText={setPassword}
              />
              <Press onPress={() => setShowPw((v) => !v)} scale={0.9}>
                <Icon name={showPw ? 'visibility' : 'visibility_off'} size={17} color="rgba(255,255,255,.4)" />
              </Press>
            </View>

            {error ? (
              <View style={s.error}>
                <Icon name="error" size={17} fill={1} color={COLORS.error} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <Press style={s.submit} onPress={submit} scale={0.97}>
              <LinearGradient
                colors={[COLORS.tertiary, COLORS.tertiaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.6, y: 1 }}
                style={s.submitFill}
              >
                <Text style={s.submitText}>{busy ? 'Working…' : isSignup ? 'Create Account' : 'Sign In'}</Text>
                <Icon name="arrow_forward" size={17} color={COLORS.onTertiary} />
              </LinearGradient>
            </Press>

            <Text style={s.demoNote}>
              {firebaseEnabled ? 'FIREBASE AUTHENTICATION ENABLED' : 'LOCAL DEMO MODE · FIREBASE NOT CONFIGURED'}
            </Text>
          </View>

          <View style={s.divider}>
            <View style={s.rule} />
            <Text style={s.dividerText}>or continue with</Text>
            <View style={s.rule} />
          </View>

          <View style={s.social}>
            {['Google', 'Apple', 'GitHub'].map((label) => (
              <Press
                key={label}
                style={s.socialBtn}
                onPress={() => setError('Social sign-in is coming soon — use email for now.')}
              >
                <Text style={s.socialText}>{label}</Text>
              </Press>
            ))}
          </View>

          <Text style={s.terms}>
            By continuing, you agree to our
            <Text style={s.termsLink}> Terms of Service </Text>
            and
            <Text style={s.termsLink}> Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  brand: { alignItems: 'center', gap: 12, marginBottom: 24 },
  logo: {
    width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#5c8cfb', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.75, shadowRadius: 17, elevation: 12,
  },
  wordmark: { fontFamily: FONTS.sansBold, fontSize: 32, letterSpacing: -0.8, color: '#fff' },

  tabs: {
    flexDirection: 'row', gap: 4, padding: 4, borderRadius: 16, marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,.045)', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)',
  },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tabOn: { backgroundColor: COLORS.tertiary },
  tabText: { fontFamily: FONTS.sansBold, fontSize: 13 },

  field: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    height: 50, paddingHorizontal: 16, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,.045)', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)',
  },
  input: { flex: 1, minWidth: 0, color: '#fff', fontFamily: FONTS.sans, fontSize: 13, padding: 0 },

  error: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14,
    backgroundColor: 'rgba(255,180,171,.09)', borderWidth: 1, borderColor: 'rgba(255,180,171,.24)',
  },
  errorText: { flex: 1, fontFamily: FONTS.sans, fontSize: 13, lineHeight: 18.2, color: COLORS.error },

  submit: {
    height: 54, borderRadius: 18, overflow: 'hidden', marginTop: 4,
    shadowColor: COLORS.tertiary, shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.65, shadowRadius: 17, elevation: 10,
  },
  submitFill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { fontFamily: FONTS.sansBold, fontSize: 17, color: COLORS.onTertiary },
  demoNote: {
    fontFamily: FONTS.mono, fontSize: 9, lineHeight: 13.5,
    color: 'rgba(255,255,255,.35)', textAlign: 'center', marginTop: 2,
  },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, marginBottom: 16 },
  rule: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,.09)' },
  dividerText: { fontFamily: FONTS.sans, fontSize: 11, color: 'rgba(255,255,255,.4)' },

  social: { flexDirection: 'row', gap: 8 },
  socialBtn: {
    flex: 1, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)',
  },
  socialText: { fontFamily: FONTS.sansBold, fontSize: 13, color: 'rgba(255,255,255,.82)' },

  terms: {
    fontFamily: FONTS.sans, fontSize: 11, lineHeight: 17.6,
    color: 'rgba(255,255,255,.38)', textAlign: 'center', marginTop: 24,
  },
  termsLink: { fontFamily: FONTS.sansBold, color: COLORS.primary },
});
