import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useApp } from '../contexts/AppContext';
import NotificationCard from '../components/NotificationCard';

export default function NotificationsScreen({ navigation }) {
  const { notifications, markNotificationRead } = useApp();

  const handlePress = (notif) => {
    markNotificationRead(notif.id);
    if (notif.petitionId) {
      navigation.navigate('PetitionDetail', { petitionId: notif.petitionId });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="notifications-none" size={28} color="rgba(255,255,255,0.4)" />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySub}>
              You'll be notified when petitions you signed hit milestones, your level changes, and more.
            </Text>
          </View>
        ) : (
          notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} onPress={handlePress} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  title: { color: 'white', fontSize: 20, fontWeight: '900' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { color: 'white', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  emptySub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', lineHeight: 19 },
});
