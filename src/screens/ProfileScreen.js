import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, Stop, Circle, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { CATEGORY_STYLE, COLORS, FONTS, SECTION_LABEL } from '../theme';
import { getLevel } from '../utils/helpers';
import { useApp } from '../contexts/AppContext';
import ScreenBackground from '../components/ScreenBackground';
import { Display, MonoLabel } from '../components/Glass';
import SignaturePad from '../components/SignaturePad';
import Press from '../components/Press';
import Icon from '../components/Icon';

// The design's placeholder signature, shown until the user draws their own.
const DEMO_SIGNATURE = 'M6 34 C 26 6, 40 6, 46 26 C 52 44, 64 44, 72 22 C 80 2, 92 8, 96 30 C 100 44, 112 40, 124 20 C 136 2, 150 10, 156 30 C 160 44, 176 42, 192 24 C 204 10, 224 12, 232 28 C 240 42, 262 38, 294 16';

export default function ProfileScreen({ navigation }) {
  const { user, signedIds, createdPetitions, petitions, updateUser, logout } = useApp();
  const level = getLevel(signedIds.length);
  const [editing, setEditing] = useState(false);
  const [redrawing, setRedrawing] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    location: user.location || '',
    address: user.address || '',
  });

  const signedPetitions = signedIds.map((id) => petitions.find((p) => p.id === id)).filter(Boolean);
  const causes = new Set(signedPetitions.map((p) => p.category)).size;
  const initials = `${(user.firstName || 'A')[0]}${(user.lastName || 'C')[0]}`.toUpperCase();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled && result.assets?.[0]) updateUser({ profilePic: result.assets[0].uri });
  };

  const save = () => { updateUser(form); setEditing(false); };

  const toggleInterest = (key) => {
    const interests = user.interests?.includes(key)
      ? user.interests.filter((c) => c !== key)
      : [...(user.interests || []), key];
    updateUser({ interests });
  };

  const confirmLogout = () => {
    Alert.alert('Sign out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const fields = [
    { key: 'firstName', label: 'First name' },
    { key: 'lastName', label: 'Last name' },
    { key: 'email', label: 'Email' },
    { key: 'location', label: 'Location' },
    { key: 'address', label: 'Address' },
  ];

  const accountRows = [
    {
      key: 'sec', icon: 'lock', title: 'Security & 2FA',
      sub: user.phoneVerified ? `Phone verified: ${user.phoneNumber}` : 'Verify a phone number to enable 2FA',
      trail: user.twoFactorEnabled ? 'On' : 'Off',
      trailColor: user.twoFactorEnabled ? COLORS.tertiary : 'rgba(255,255,255,.4)',
      onPress: () => navigation.navigate('Security'),
    },
    {
      key: 'not', icon: 'notifications', title: 'Notifications',
      sub: 'Milestones, badges, deadlines', trail: 'All',
      trailColor: 'rgba(255,255,255,.4)',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      key: 'pri', icon: 'shield_person', title: 'Privacy',
      sub: 'Signature encrypted at rest', trail: 'On', trailColor: COLORS.tertiary,
    },
    {
      key: 'out', icon: 'logout', title: 'Sign out',
      sub: 'You can sign back in anytime', trail: '', danger: true, onPress: confirmLogout,
    },
  ];

  return (
    <ScreenBackground>
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.navRow}>
          <Press style={s.backBtn} onPress={() => navigation.goBack()} scale={0.9}>
            <Icon name="arrow_back" size={17} color="#fff" />
          </Press>
          <Display size={24} lineHeight={24}>Profile</Display>
          <Press onPress={() => (editing ? save() : setEditing(true))} style={s.editBtn}>
            <Text style={s.editText}>{editing ? 'Save' : 'Edit'}</Text>
          </Press>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Avatar + name + level */}
          <View style={s.identity}>
            <Press onPress={pickImage} scale={0.96}>
              <View style={s.avatarWrap}>
                <Svg width={88} height={88} style={StyleSheet.absoluteFill}>
                  <Defs>
                    <SvgLinearGradient id="pring" x1="0" y1="1" x2="1" y2="0">
                      <Stop offset="0" stopColor="#4edea3" />
                      <Stop offset="0.35" stopColor="#5c8cfb" />
                      <Stop offset="0.7" stopColor="#a78bfa" />
                      <Stop offset="1" stopColor="#4edea3" />
                    </SvgLinearGradient>
                  </Defs>
                  <Circle cx={44} cy={44} r={42.75} stroke="url(#pring)" strokeWidth={2.5} fill="none" />
                </Svg>
                <View style={s.avatarInner}>
                  {user.profilePic ? (
                    <Image source={{ uri: user.profilePic }} style={StyleSheet.absoluteFill} />
                  ) : (
                    <Text style={s.avatarText}>{initials}</Text>
                  )}
                </View>
                <View style={s.camera}>
                  <Icon name="photo_camera" size={13} color="rgba(255,255,255,.7)" />
                </View>
              </View>
            </Press>

            <Display size={32} lineHeight={32}>{user.firstName} {user.lastName}</Display>

            <View style={[s.levelPill, { backgroundColor: `${level.color}1c`, borderColor: `${level.color}44` }]}>
              <Icon name="military_tech" size={13} fill={1} color={level.color} />
              <MonoLabel size={9} spacing={1.8} weight="bold" color={level.color}>
                {level.name.toUpperCase()} · LV {level.level}
              </MonoLabel>
            </View>
          </View>

          {/* Stat tiles */}
          <View style={s.tiles}>
            {[
              { key: 'a', value: String(signedIds.length), label: 'SIGNED', color: COLORS.tertiary },
              { key: 'b', value: String(createdPetitions.length), label: 'CREATED', color: COLORS.primary },
              { key: 'c', value: String(causes), label: 'CAUSES', color: COLORS.amber },
            ].map((t) => (
              <View key={t.key} style={s.tile}>
                <Text style={[s.tileValue, { color: t.color }]}>{t.value}</Text>
                <MonoLabel size={9} spacing={1.4}>{t.label}</MonoLabel>
              </View>
            ))}
          </View>

          <Text style={s.sectionLabel}>PERSONAL INFORMATION</Text>
          <View style={s.fieldCard}>
            {fields.map((f) => (
              <View key={f.key} style={s.fieldRow}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                {editing ? (
                  <TextInput
                    style={s.fieldInput}
                    value={form[f.key]}
                    onChangeText={(v) => setForm((c) => ({ ...c, [f.key]: v }))}
                    keyboardType={f.key === 'email' ? 'email-address' : 'default'}
                  />
                ) : (
                  <Text style={s.fieldValue} numberOfLines={1}>{user[f.key] || '—'}</Text>
                )}
              </View>
            ))}
          </View>

          <Text style={s.sectionLabel}>INTERESTS</Text>
          <View style={s.chipWrap}>
            {Object.keys(CATEGORY_STYLE).map((key) => {
              const active = user.interests?.includes(key);
              const col = CATEGORY_STYLE[key].glow;
              return (
                <Press
                  key={key}
                  style={[
                    s.chip,
                    {
                      borderColor: active ? `${col}55` : 'rgba(255,255,255,.08)',
                      backgroundColor: active ? `${col}1c` : 'rgba(255,255,255,.03)',
                    },
                  ]}
                  onPress={() => toggleInterest(key)}
                >
                  <Icon name={CATEGORY_STYLE[key].icon} size={13} fill={active ? 1 : 0} color={active ? col : 'rgba(255,255,255,.42)'} />
                  <Text style={[s.chipText, { color: active ? col : 'rgba(255,255,255,.5)' }]}>{key}</Text>
                </Press>
              );
            })}
          </View>

          <Text style={s.sectionLabel}>YOUR SIGNATURE</Text>
          <View style={s.sigCard}>
            {redrawing ? (
              <SignaturePad
                initialPath={user.signature}
                height={110}
                onSave={(signature) => updateUser({ signature })}
              />
            ) : (
              <Svg viewBox="0 0 300 46" style={s.sigSvg}>
                <Path
                  d={user.signature || DEMO_SIGNATURE}
                  fill="none"
                  stroke={COLORS.onSurface}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            )}
            <View style={s.sigFooter}>
              <MonoLabel size={9} spacing={1.4} color="rgba(255,255,255,.36)">
                SAVED · USED ON EVERY SIGN
              </MonoLabel>
              <Press onPress={() => setRedrawing((v) => !v)}>
                <Text style={s.redraw}>{redrawing ? 'Done' : 'Redraw'}</Text>
              </Press>
            </View>
          </View>

          <Text style={s.sectionLabel}>ACCOUNT</Text>
          <View style={s.accountCard}>
            {accountRows.map((r, i) => (
              <Press
                key={r.key}
                style={[s.accountRow, i > 0 && s.accountDivider]}
                onPress={r.onPress}
                flat
              >
                <Icon name={r.icon} size={17} color={r.danger ? COLORS.error : 'rgba(255,255,255,.55)'} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[s.accountTitle, r.danger && { color: COLORS.error }]}>{r.title}</Text>
                  <Text style={s.accountSub}>{r.sub}</Text>
                </View>
                {r.trail ? (
                  <MonoLabel size={11} spacing={0} color={r.trailColor}>{r.trail}</MonoLabel>
                ) : null}
              </Press>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  backBtn: {
    width: 38, height: 38, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)',
    alignItems: 'center', justifyContent: 'center',
  },
  editBtn: { marginLeft: 'auto' },
  editText: { fontFamily: FONTS.sansBold, fontSize: 13, color: COLORS.primary },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  identity: { alignItems: 'center', gap: 8, paddingTop: 8, paddingBottom: 20 },
  avatarWrap: { width: 88, height: 88 },
  avatarInner: {
    position: 'absolute', top: 2.5, left: 2.5, right: 2.5, bottom: 2.5,
    borderRadius: 44, backgroundColor: COLORS.tileTop, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: FONTS.serif, fontSize: 32, color: '#fff' },
  camera: {
    position: 'absolute', right: 0, bottom: 2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#1b1f2b', borderWidth: 2, borderColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  levelPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1,
  },

  tiles: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tile: {
    flex: 1, padding: 12, borderRadius: 18, alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,.07)',
  },
  tileValue: { fontFamily: FONTS.monoBold, fontSize: 24 },

  sectionLabel: SECTION_LABEL,

  fieldCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,.07)' },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,.033)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(10,14,25,.6)',
  },
  fieldLabel: { fontFamily: FONTS.sans, fontSize: 13, color: 'rgba(255,255,255,.45)' },
  fieldValue: { flex: 1, fontFamily: FONTS.sansBold, fontSize: 13, color: '#fff', textAlign: 'right' },
  fieldInput: {
    flex: 1, fontFamily: FONTS.sansBold, fontSize: 13, color: '#fff', textAlign: 'right',
    backgroundColor: 'rgba(255,255,255,.05)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1,
  },
  chipText: { fontFamily: FONTS.sansBold, fontSize: 13 },

  sigCard: {
    borderRadius: 20, padding: 16,
    backgroundColor: 'rgba(255,255,255,.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,.07)',
  },
  sigSvg: { width: '100%', height: 44 },
  sigFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.07)',
  },
  redraw: { fontFamily: FONTS.sansBold, fontSize: 11, color: COLORS.primary },

  accountCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,.07)' },
  accountRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    backgroundColor: 'rgba(255,255,255,.033)',
  },
  accountDivider: { borderTopWidth: 1, borderTopColor: 'rgba(10,14,25,.6)' },
  accountTitle: { fontFamily: FONTS.sansBold, fontSize: 13, color: '#fff' },
  accountSub: { fontFamily: FONTS.sans, fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 1 },
});
