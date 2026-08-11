import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Stop, Circle, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { COLORS, FONTS } from '../theme';
import { useApp } from '../contexts/AppContext';
import { getLevel } from '../utils/helpers';
import Press from './Press';
import Icon from './Icon';

// The avatar's ring is a conic gradient in the design. React Native has no
// conic gradient, so it is drawn as an SVG circle stroked with a gradient that
// runs through the same four stops.
function AvatarRing({ size = 44, children }) {
  const r = (size - 2.5) / 2;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id="ring" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor="#4edea3" />
            <Stop offset="0.35" stopColor="#5c8cfb" />
            <Stop offset="0.7" stopColor="#a78bfa" />
            <Stop offset="1" stopColor="#4edea3" />
          </SvgLinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="url(#ring)" strokeWidth={2.5} fill="none" />
      </Svg>
      <View style={[styles.avatarInner, { margin: 2.5, borderRadius: size / 2 }]}>{children}</View>
    </View>
  );
}

export default function AppHeader({ onProfilePress, onNotifPress }) {
  const { signedIds, notifications, user } = useApp();
  const level = getLevel(signedIds.length);
  const unread = notifications.filter((n) => !n.read).length;
  const initials = `${(user.firstName || 'A')[0]}${(user.lastName || 'C')[0]}`.toUpperCase();

  return (
    <View style={styles.row}>
      <LinearGradient
        colors={['#5c8cfb', '#1b58c5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={styles.logo}
      >
        <Icon name="bolt" size={17} fill={1} weight={700} color="#fff" />
      </LinearGradient>

      <View style={styles.brand}>
        <Text style={styles.wordmark}>
          Swipe<Text style={{ color: COLORS.primary }}>4</Text>Change
        </Text>
        <Text style={styles.sub}>{level.name.toUpperCase()} · LV {level.level}</Text>
      </View>

      <View style={styles.actions}>
        <Press style={styles.iconBtn} onPress={onNotifPress} scale={0.92}>
          <Icon name="notifications" size={17} color="rgba(255,255,255,.72)" />
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          ) : null}
        </Press>

        <Press onPress={onProfilePress} scale={0.92}>
          <AvatarRing size={44}>
            <Text style={styles.initials}>{initials}</Text>
          </AvatarRing>
        </Press>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  logo: {
    width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#5c8cfb', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65, shadowRadius: 9, elevation: 8,
  },
  brand: { flex: 1, minWidth: 0, gap: 1 },
  wordmark: { fontFamily: FONTS.sansBold, fontSize: 17, letterSpacing: -0.5, color: '#fff', lineHeight: 17 },
  sub: { fontFamily: FONTS.mono, fontSize: 9, letterSpacing: 1.6, color: 'rgba(255,255,255,.34)' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)',
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16,
    paddingHorizontal: 4, borderRadius: 8, backgroundColor: COLORS.error,
    borderWidth: 2, borderColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontFamily: FONTS.monoBold, fontSize: 9, color: COLORS.onError },
  avatarInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.tileTop,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  initials: { fontFamily: FONTS.sansBold, fontSize: 11, letterSpacing: 0.3, color: '#fff' },
});
