import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, CATEGORY_STYLE } from '../theme';

const TYPE_META = {
  goal_reached:          { icon: 'flag-checkered',  color: '#4edea3', label: 'GOAL REACHED' },
  level_up:              { icon: 'trophy',          color: '#fbbf24', label: 'LEVEL UP' },
  petition_acknowledged: { icon: 'message-reply',   color: '#60a5fa', label: 'ACKNOWLEDGED' },
  milestone:             { icon: 'chart-line',      color: '#a78bfa', label: 'MILESTONE' },
  petition_created:      { icon: 'file-document',   color: '#b1c5ff', label: 'SUBMITTED' },
};

export default function NotificationCard({ notification, onPress }) {
  const meta = TYPE_META[notification.type] || TYPE_META.milestone;
  const isUnread = !notification.read;
  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <TouchableOpacity
      style={[styles.card, isUnread && styles.unread]}
      onPress={() => onPress(notification)}
      activeOpacity={0.8}
    >
      {/* Verified badge */}
      {notification.verified && (
        <View style={styles.verifiedBanner}>
          <MaterialIcons name="verified" size={13} color={COLORS.tertiary} />
          <Text style={styles.verifiedText}>VERIFIED ORGANIZATION</Text>
        </View>
      )}

      {/* Header row */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${meta.color}20` }]}>
          <MaterialCommunityIcons name={meta.icon} size={18} color={meta.color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={[styles.typeLabel, { color: meta.color }]}>{meta.label}</Text>
            <Text style={styles.time}>{timeAgo}</Text>
          </View>
          <Text style={styles.title}>{notification.title}</Text>
        </View>
        {isUnread && <View style={styles.dot} />}
      </View>

      {/* Body */}
      <Text style={styles.body}>{notification.body}</Text>

      {/* Structured detail fields */}
      {notification.recipient && (
        <View style={styles.detailSection}>
          <DetailRow icon="person" label="Recipient" value={notification.recipient} />
          {notification.ask && <DetailRow icon="campaign" label="Asking for" value={notification.ask} />}
          {notification.situation && <DetailRow icon="description" label="Situation" value={notification.situation} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <MaterialIcons name={icon} size={14} color="rgba(255,255,255,0.4)" />
    <View style={{ flex: 1 }}>
      <Text style={styles.detailLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20, padding: 16, gap: 12,
  },
  unread: {
    borderColor: 'rgba(177,197,255,0.15)',
    backgroundColor: 'rgba(177,197,255,0.04)',
  },

  verifiedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(78,222,163,0.08)',
    borderWidth: 1, borderColor: 'rgba(78,222,163,0.2)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  verifiedText: { color: COLORS.tertiary, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },

  header: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconCircle: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  typeLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  time: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '600' },
  title: { color: 'white', fontSize: 16, fontWeight: '800' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 6 },

  body: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 19 },

  detailSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, padding: 12, gap: 10,
  },
  detailRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  detailLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 2 },
  detailValue: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 17 },
});
