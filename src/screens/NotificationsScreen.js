import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../theme';
import { NOTIFICATION_TYPES } from '../data/petitions';
import { useApp } from '../contexts/AppContext';
import ScreenBackground from '../components/ScreenBackground';
import { Display, MonoLabel } from '../components/Glass';
import Press from '../components/Press';
import Icon from '../components/Icon';

export default function NotificationsScreen({ navigation }) {
  const { notifications, markNotificationRead } = useApp();

  // Opening the list clears the header badge, as the design does.
  useEffect(() => {
    notifications.filter((n) => !n.read).forEach((n) => markNotificationRead(n.id));
  }, []);

  return (
    <ScreenBackground>
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.head}>
          <Press style={s.backBtn} onPress={() => navigation.goBack()} scale={0.9}>
            <Icon name="arrow_back" size={17} color="#fff" />
          </Press>
          <Display size={24} lineHeight={24}>Notifications</Display>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {notifications.map((n) => {
            const meta = NOTIFICATION_TYPES[n.type] || NOTIFICATION_TYPES.milestone;
            const details = n.details
              || [
                n.recipient && { icon: 'person', label: 'RECIPIENT', value: n.recipient },
                n.ask && { icon: 'campaign', label: 'ASKING FOR', value: n.ask },
              ].filter(Boolean);

            return (
              <View
                key={n.id}
                style={[
                  s.card,
                  n.read
                    ? { backgroundColor: 'rgba(255,255,255,.03)', borderColor: 'rgba(255,255,255,.055)' }
                    : { backgroundColor: 'rgba(177,197,255,.045)', borderColor: 'rgba(177,197,255,.16)' },
                ]}
              >
                {n.verified ? (
                  <View style={s.verified}>
                    <Icon name="verified" size={13} fill={1} color={COLORS.tertiary} />
                    <MonoLabel size={9} spacing={1.5} color={COLORS.tertiary}>VERIFIED ORGANIZATION</MonoLabel>
                  </View>
                ) : null}

                <View style={s.topRow}>
                  <View style={[s.iconWrap, { backgroundColor: `${meta.color}20` }]}>
                    <Icon name={meta.icon} size={24} fill={1} color={meta.color} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={s.metaRow}>
                      <MonoLabel size={9} spacing={1.6} weight="bold" color={meta.color}>{meta.label}</MonoLabel>
                      <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.3)">{n.when || 'now'}</MonoLabel>
                    </View>
                    <Text style={s.title}>{n.title}</Text>
                  </View>
                  {!n.read ? <View style={s.dot} /> : null}
                </View>

                <Text style={s.body}>{n.body}</Text>

                {details.length ? (
                  <View style={s.detailCard}>
                    {details.map((d) => (
                      <View key={d.label} style={s.detailRow}>
                        <Icon name={d.icon} size={13} color="rgba(255,255,255,.4)" />
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <MonoLabel size={9} spacing={1.5} style={{ marginBottom: 2 }}>{d.label}</MonoLabel>
                          <Text style={s.detailValue}>{d.value}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
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
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 8 },
  card: { gap: 12, padding: 16, borderRadius: 20, borderWidth: 1 },
  verified: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10,
    backgroundColor: 'rgba(78,222,163,.08)', borderWidth: 1, borderColor: 'rgba(78,222,163,.2)',
  },
  topRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 },
  title: { fontFamily: FONTS.sansBold, fontSize: 17, lineHeight: 21.25, color: '#fff' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 8 },
  body: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 19.5, color: 'rgba(255,255,255,.68)' },
  detailCard: {
    borderRadius: 14, padding: 12, gap: 12,
    backgroundColor: 'rgba(255,255,255,.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,.06)',
  },
  detailRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  detailValue: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 17.55, color: 'rgba(255,255,255,.85)' },
});
