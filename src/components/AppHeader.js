import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp } from '../contexts/AppContext';
import { getLevel } from '../utils/helpers';

export default function AppHeader({ onProfilePress, onNotifPress }) {
  const { user, signedIds, unreadCount } = useApp();
  const level = getLevel(signedIds.length);
<<<<<<< HEAD
  const initials = `${(user.firstName || 'U')[0]}${(user.lastName || '')[0]}`.toUpperCase();
=======
  const initials = user.name.split(' ').map(n => n[0]).join('');
>>>>>>> 05775e151d80f152aef53ed06bc50aff42569ebe

  return (
    <View style={styles.header}>
      <LinearGradient colors={[COLORS.primaryDeep, COLORS.primaryContainer]} style={styles.logoBox}>
        <MaterialCommunityIcons name="lightning-bolt" size={18} color="white" />
      </LinearGradient>

      <Text style={styles.title}>
        Swipe<Text style={{ color: COLORS.primary }}>4</Text>Change
      </Text>

      <View style={styles.right}>
        {onNotifPress && (
          <TouchableOpacity onPress={onNotifPress} style={styles.bellBtn} activeOpacity={0.8}>
            <MaterialIcons name="notifications-none" size={20} color="rgba(255,255,255,0.7)" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8}>
          <LinearGradient colors={[level.color, COLORS.primaryDeep]} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 10,
  },
  logoBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primaryContainer, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  title: { color: 'white', fontSize: 22, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.error,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: '#690005', fontSize: 9, fontWeight: '900' },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: { color: 'white', fontWeight: '900', fontSize: 11 },
});
