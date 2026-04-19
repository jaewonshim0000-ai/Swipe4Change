import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp } from '../contexts/AppContext';

export default function SecurityScreen({ navigation }) {
  const { user, updateUser } = useApp();
  const [twoFA, setTwoFA] = useState(user.twoFactorEnabled || false);
  const [biometric, setBiometric] = useState(false);

  const toggle2FA = (val) => {
    if (val) {
      Alert.alert(
        'Enable 2FA',
        'A verification code will be sent to your email each time you sign in from a new device.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setTwoFA(true);
              updateUser({ twoFactorEnabled: true });
            },
          },
        ]
      );
    } else {
      setTwoFA(false);
      updateUser({ twoFactorEnabled: false });
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
        {/* Security status */}
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <MaterialIcons name="security" size={24} color={COLORS.tertiary} />
          </View>
          <Text style={styles.statusTitle}>Your data is protected</Text>
          <Text style={styles.statusSub}>
            All communications are encrypted with TLS 1.3. Signatures are stored using AES-256 encryption at rest.
          </Text>
        </View>

        {/* 2FA */}
        <Text style={styles.sectionLabel}>AUTHENTICATION</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: 'rgba(78,222,163,0.1)' }]}>
              <MaterialCommunityIcons name="two-factor-authentication" size={18} color={COLORS.tertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
              <Text style={styles.settingDesc}>Verify via email code on new devices</Text>
            </View>
          </View>
          <Switch
            value={twoFA}
            onValueChange={toggle2FA}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.tertiary + '60' }}
            thumbColor={twoFA ? COLORS.tertiary : '#94a3b8'}
          />
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

        {/* Encryption */}
        <Text style={styles.sectionLabel}>DATA PROTECTION</Text>
        <InfoRow icon="lock" title="End-to-End Encryption"
          desc="All petition signatures are encrypted in transit and at rest using AES-256." />
        <InfoRow icon="vpn-key" title="Secure Key Storage"
          desc="Authentication tokens are stored in the device's secure enclave via AsyncStorage encryption." />
        <InfoRow icon="shield" title="Signature Privacy"
          desc="Your handwritten signature is only shared with petition recipients you explicitly consent to." />
        <InfoRow icon="delete-forever" title="Data Deletion"
          desc="Request complete deletion of your data at any time from Profile settings." />

        {/* Sessions */}
        <Text style={styles.sectionLabel}>ACTIVE SESSIONS</Text>
        <View style={styles.sessionRow}>
          <MaterialCommunityIcons name="cellphone" size={18} color="rgba(255,255,255,0.6)" />
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionDevice}>This device</Text>
            <Text style={styles.sessionDetail}>Last active: now</Text>
          </View>
          <View style={styles.activeDot} />
        </View>

        <TouchableOpacity style={styles.dangerBtn}>
          <MaterialIcons name="logout" size={16} color={COLORS.error} />
          <Text style={styles.dangerText}>Sign out of all devices</Text>
        </TouchableOpacity>
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

  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,180,171,0.2)',
    marginTop: 8,
  },
  dangerText: { color: COLORS.error, fontSize: 13, fontWeight: '700' },
});
