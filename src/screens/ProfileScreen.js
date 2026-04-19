import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, CATEGORY_STYLE } from '../theme';
import { PETITION_CATEGORIES } from '../data/petitions';
import { useApp } from '../contexts/AppContext';
import SignaturePad from '../components/SignaturePad';
import ContributionCalendar from '../components/ContributionCalendar';
import { getLevel } from '../utils/helpers';

export default function ProfileScreen({ navigation }) {
  const { user, signedIds, contributions, logout, updateUser } = useApp();
  const level = getLevel(signedIds.length);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    location: user.location || '',
    address: user.address || '',
  });

  useEffect(() => {
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      location: user.location || '',
      address: user.address || '',
    });
  }, [user]);

  const upd = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets?.[0]) {
      updateUser({ profilePic: result.assets[0].uri });
    }
  };

  const saveProfile = () => {
    updateUser(form);
    setEditing(false);
  };

  const toggleInterest = (cat) => {
    const interests = user.interests?.includes(cat)
      ? user.interests.filter((c) => c !== cat)
      : [...(user.interests || []), cat];
    updateUser({ interests });
  };

  const handleLogout = () => {
    Alert.alert('Sign out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = `${(user.firstName || 'A')[0]}${(user.lastName || 'C')[0]}`;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Profile</Text>
        <TouchableOpacity onPress={() => (editing ? saveProfile() : setEditing(true))}>
          <Text style={s.editBtn}>{editing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.avatarSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            {user.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={s.avatar} />
            ) : (
              <LinearGradient colors={[level.color, COLORS.primaryDeep]} style={s.avatar}>
                <Text style={s.avatarText}>{initials}</Text>
              </LinearGradient>
            )}
            <View style={s.cameraIcon}>
              <MaterialIcons name="camera-alt" size={12} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={s.name}>{user.firstName} {user.lastName}</Text>
          <View style={[s.levelBadge, { backgroundColor: level.color + '15', borderColor: level.color + '40' }]}>
            <MaterialCommunityIcons name="medal" size={12} color={level.color} />
            <Text style={[s.levelText, { color: level.color }]}>{level.name.toUpperCase()} - LV {level.level}</Text>
          </View>
        </View>

        <Text style={s.sectionLabel}>PERSONAL INFORMATION</Text>
        <View style={s.fieldCard}>
          <FieldRow label="First Name" value={form.firstName} onChange={(v) => upd('firstName', v)} editable={editing} />
          <FieldRow label="Last Name" value={form.lastName} onChange={(v) => upd('lastName', v)} editable={editing} />
          <FieldRow label="Email" value={form.email} onChange={(v) => upd('email', v)} editable={editing} keyboardType="email-address" />
          <FieldRow label="Location" value={form.location} onChange={(v) => upd('location', v)} editable={editing} />
          <FieldRow label="Address" value={form.address} onChange={(v) => upd('address', v)} editable={editing} last />
        </View>

        <Text style={s.sectionLabel}>INTERESTS</Text>
        <View style={s.interestsWrap}>
          {PETITION_CATEGORIES.map((cat) => {
            const active = user.interests?.includes(cat.key);
            const style = CATEGORY_STYLE[cat.key] || CATEGORY_STYLE.Climate;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  s.interestChip,
                  active && { backgroundColor: `${style.glow}18`, borderColor: `${style.glow}40` },
                ]}
                onPress={() => toggleInterest(cat.key)}
              >
                <MaterialCommunityIcons name={style.icon} size={14} color={active ? style.glow : 'rgba(255,255,255,0.4)'} />
                <Text style={[s.interestText, active && { color: style.glow }]}>{cat.key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.sectionLabel}>SIGNATURE</Text>
        <SignaturePad
          initialPath={user.signature}
          onSave={(signature) => updateUser({ signature })}
          height={170}
        />

        <Text style={s.sectionLabel}>ACTIVITY</Text>
        <ContributionCalendar contributions={contributions} />

        <Text style={s.sectionLabel}>SETTINGS</Text>
        <SettingBtn icon="security" label="Security & Privacy" onPress={() => navigation.navigate('Security')} />
        <SettingBtn icon="notifications-none" label="Notification Preferences" />
        <SettingBtn icon="help-outline" label="Help & Feedback" />
        <SettingBtn icon="logout" label="Sign Out" danger onPress={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const FieldRow = ({ label, value, onChange, editable, keyboardType, last }) => (
  <View style={[fieldS.row, !last && fieldS.border]}>
    <Text style={fieldS.label}>{label}</Text>
    {editable ? (
      <TextInput style={fieldS.input} value={value} onChangeText={onChange} keyboardType={keyboardType} />
    ) : (
      <Text style={fieldS.value} numberOfLines={1}>{value || '-'}</Text>
    )}
  </View>
);

const SettingBtn = ({ icon, label, danger, onPress }) => (
  <TouchableOpacity style={s.settingRow} onPress={onPress} activeOpacity={0.7}>
    <MaterialIcons name={icon} size={18} color={danger ? COLORS.error : 'rgba(255,255,255,0.6)'} />
    <Text style={[s.settingLabel, danger && { color: COLORS.error }]}>{label}</Text>
    <MaterialIcons name="chevron-right" size={18} color="rgba(255,255,255,0.3)" />
  </TouchableOpacity>
);

const fieldS = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 4 },
  border: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  label: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600', width: 90 },
  value: { color: 'white', fontSize: 14, flex: 1, textAlign: 'right' },
  input: { color: 'white', fontSize: 14, flex: 1, textAlign: 'right', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 10 },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  editBtn: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  avatarText: { color: 'white', fontSize: 32, fontWeight: '900' },
  cameraIcon: {
    position: 'absolute', bottom: 12, right: -2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.primaryContainer, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.surface,
  },
  name: { color: 'white', fontSize: 20, fontWeight: '900' },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, marginTop: 8,
  },
  levelText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  sectionLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginTop: 24, marginBottom: 10 },
  fieldCard: {
    backgroundColor: COLORS.surfaceContainer, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18, paddingHorizontal: 14,
  },
  interestsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  interestText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 14, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  settingLabel: { flex: 1, color: 'white', fontSize: 14, fontWeight: '500' },
});
