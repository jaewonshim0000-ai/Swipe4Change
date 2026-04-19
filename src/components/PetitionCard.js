import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, CATEGORY_STYLE, RADII } from '../theme';
import { fmtNumber } from '../utils/helpers';

const { width: SCREEN_W } = Dimensions.get('window');

export default function PetitionCard({ petition, dragX = 0, onReport }) {  const cat = CATEGORY_STYLE[petition.category] || CATEGORY_STYLE.Climate;
  const signedPct = Math.min(100, (petition.signed / petition.goal) * 100);

  // Overlay label opacity based on drag
  const signOpacity = Math.max(0, Math.min(1, dragX / 120));
  const skipOpacity = Math.max(0, Math.min(1, -dragX / 120));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[cat.from, cat.to]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      >
        {/* Watermark icon */}
        <View style={styles.watermark} pointerEvents="none">
          <MaterialCommunityIcons
            name={cat.icon}
            size={280}
            color="rgba(255,255,255,0.08)"
          />
        </View>

        {/* Dark bottom gradient for readability */}
        <LinearGradient
          colors={['transparent', 'rgba(10,14,25,0.75)', '#0a0e19']}
          locations={[0, 0.55, 1]}
          style={styles.bottomFade}
          pointerEvents="none"
        />

        {/* Category tag */}
        <View style={styles.catTag}>
          <MaterialCommunityIcons name={cat.icon} size={12} color="white" />
          <Text style={styles.catTagText}>{petition.category.toUpperCase()}</Text>
        </View>

        {/* Urgency badge */}
        {petition.daysLeft <= 7 && (
          <View style={styles.urgencyBadge}>
            <MaterialIcons name="schedule" size={13} color="white" />
            <Text style={styles.urgencyText}>{petition.daysLeft}D LEFT</Text>
          </View>
        )}

        {/* SIGN / SKIP overlays */}
        <View
          style={[
            styles.actionLabel,
            styles.signLabel,
            { opacity: signOpacity, transform: [{ rotate: '-14deg' }, { scale: 0.8 + signOpacity * 0.3 }] },
          ]}
          pointerEvents="none"
        >
          <Text style={[styles.actionLabelText, { color: COLORS.tertiary }]}>SIGN</Text>
        </View>
        <View
          style={[
            styles.actionLabel,
            styles.skipLabel,
            { opacity: skipOpacity, transform: [{ rotate: '14deg' }, { scale: 0.8 + skipOpacity * 0.3 }] },
          ]}
          pointerEvents="none"
        >
          <Text style={[styles.actionLabelText, { color: COLORS.error }]}>SKIP</Text>
        </View>

        {/* Bottom content */}
        <View style={styles.content}>
          <View style={styles.orgRow}>
            <MaterialCommunityIcons name="office-building" size={11} color="rgba(255,255,255,0.7)" />
            <Text style={styles.org}>{petition.organization.toUpperCase()}</Text>
          </View>

          <Text style={styles.title}>{petition.title}</Text>
          <Text style={styles.summary}>{petition.summary}</Text>

          <View style={styles.progressWrap}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressCount}>{fmtNumber(petition.signed)}</Text>
              <Text style={styles.progressGoal}>of {fmtNumber(petition.goal)}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={[cat.glow, '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${signedPct}%` }]}
              />
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.tapHint}>
              <MaterialIcons name="info-outline" size={11} color="rgba(255,255,255,0.4)" />
              <Text style={styles.tapHintText}>TAP FOR DETAILS</Text>
            </View>
            {onReport && (
              <TouchableOpacity
                style={styles.reportBtn}
                onPress={(event) => {
                  event?.stopPropagation?.();
                  onReport(petition);
                }}
                activeOpacity={0.85}
              >
                <MaterialIcons name="flag" size={12} color={COLORS.error} />
                <Text style={styles.reportText}>Report</Text>
              </TouchableOpacity>
            )}          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  bg: { flex: 1 },
  watermark: {
    position: 'absolute',
    right: -40,
    top: '28%',
    transform: [{ rotate: '-12deg' }],
  },
  bottomFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%' },

  catTag: {
    position: 'absolute',
    top: 20, left: 20,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: RADII.full,
    paddingVertical: 7, paddingHorizontal: 14, gap: 6,
  },
  catTagText: { color: 'white', fontSize: 10, fontWeight: '800', letterSpacing: 2 },

  urgencyBadge: {
    position: 'absolute',
    top: 20, right: 20,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(147,0,10,0.8)',
    borderWidth: 1, borderColor: 'rgba(255,180,171,0.4)',
    borderRadius: RADII.full,
    paddingVertical: 7, paddingHorizontal: 12, gap: 5,
  },
  urgencyText: { color: 'white', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },

  actionLabel: {
    position: 'absolute',
    top: 60,
    paddingHorizontal: 18, paddingVertical: 6,
    borderWidth: 4, borderRadius: 12,
  },
  signLabel: { left: 30, borderColor: COLORS.tertiary },
  skipLabel: { right: 30, borderColor: COLORS.error },
  actionLabelText: { fontSize: 26, fontWeight: '900', letterSpacing: 2 },

  content: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 28, paddingTop: 60,
  },
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  org: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  title: { color: 'white', fontSize: 30, fontWeight: '900', lineHeight: 33, letterSpacing: -0.8, marginBottom: 10 },
  summary: { color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 20, marginBottom: 20, fontWeight: '500' },

  progressWrap: { marginBottom: 18 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  progressCount: { color: 'white', fontSize: 18, fontWeight: '900' },
  progressGoal: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADII.full, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: RADII.full },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  tapHint: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  tapHintText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,180,171,0.12)', borderWidth: 1, borderColor: 'rgba(255,180,171,0.25)' },
  reportText: { color: COLORS.error, fontSize: 10, fontWeight: '800' },});
