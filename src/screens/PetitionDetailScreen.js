import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, CATEGORY_STYLE } from '../theme';
import { URGENCY_LEVELS } from '../data/petitions';
import { useApp } from '../contexts/AppContext';
import { fmtNumber } from '../utils/helpers';
import SignModal from '../components/SignModal';
import ReportModal from '../components/ReportModal';

export default function PetitionDetailScreen({ route, navigation }) {
  const { petitionId } = route.params;
  const { getPetitionById, signedIds, savedIds, toggleSave, signPetition, reportPetition } = useApp();
  const petition = getPetitionById(petitionId);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);

  if (!petition) {
    return (
      <SafeAreaView style={s.container}>
        <Text style={{ color: 'white', padding: 20 }}>Petition not found</Text>
      </SafeAreaView>
    );
  }

  const cat = CATEGORY_STYLE[petition.category] || CATEGORY_STYLE.Climate;
  const pct = Math.min(100, ((petition.signed || 0) / (petition.goal || 1)) * 100);
  const isSigned = signedIds.includes(petition.id);
  const isSaved = savedIds.includes(petition.id);
  const urgency = URGENCY_LEVELS.find((u) => u.key === petition.urgency) || URGENCY_LEVELS[1];

  const handleSign = (signedPetition, comment) => {
    signPetition(signedPetition.id, { comment });
    setModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[cat.from, cat.to]} style={s.hero}>
          <MaterialCommunityIcons name={cat.icon} size={220} color="rgba(255,255,255,0.1)" style={s.heroWater} />
          {petition.imageUrl ? <Image source={{ uri: petition.imageUrl }} style={StyleSheet.absoluteFill} /> : null}
          <LinearGradient colors={['transparent', COLORS.surface]} style={s.heroFade} pointerEvents="none" />
          <SafeAreaView edges={['top']} style={s.heroTop}>
            <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={s.iconBtn}>
              <MaterialIcons name="ios-share" size={18} color="white" />
            </TouchableOpacity>
          </SafeAreaView>
          <View style={s.heroContent}>
            <View style={s.tagRow}>
              <View style={s.catTag}>
                <MaterialCommunityIcons name={cat.icon} size={11} color="white" />
                <Text style={s.catTagText}>{petition.category.toUpperCase()}</Text>
              </View>
              <View style={[s.catTag, { backgroundColor: urgency.color + '30' }]}>
                <View style={[s.urgencyDot, { backgroundColor: urgency.color }]} />
                <Text style={[s.catTagText, { color: urgency.color }]}>{urgency.label.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={s.heroTitle}>{petition.title}</Text>
          </View>
        </LinearGradient>

        <View style={s.body}>
          <View style={s.orgRow}>
            <LinearGradient colors={[cat.from, cat.to]} style={s.orgIcon}>
              <MaterialCommunityIcons name="office-building" size={18} color="white" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <View style={s.inlineRow}>
                <Text style={s.orgName}>{petition.organization}</Text>
                {petition.verified ? (
                  <View style={s.verified}><MaterialIcons name="check" size={10} color={COLORS.onTertiary} /></View>
                ) : null}
              </View>
              <Text style={s.orgSub}>{petition.verified ? 'VERIFIED ORGANIZATION' : 'COMMUNITY PETITION'}</Text>
            </View>
          </View>

          <View style={s.metaChip}>
            <MaterialIcons name="place" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={s.metaText}>{petition.location}</Text>
          </View>

          <View style={s.statsCard}>
            <View style={s.statsHeader}>
              <View>
                <Text style={[s.statsVal, { color: cat.glow }]}>{fmtNumber(petition.signed || 0)}</Text>
                <Text style={s.statsLabel}>SIGNATURES</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.statsGoal}>of {fmtNumber(petition.goal || 0)}</Text>
                <View style={s.inlineRow}>
                  <MaterialIcons name="trending-up" size={12} color={COLORS.tertiary} />
                  <Text style={s.weekText}>+{fmtNumber(petition.weeklyIncrease || 0)} this week</Text>
                </View>
              </View>
            </View>
            <View style={s.progressBg}>
              <LinearGradient colors={[cat.glow, '#ffffff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.progressFill, { width: `${pct}%` }]} />
            </View>
            <Text style={s.progressPct}>{pct.toFixed(0)}% of goal</Text>
          </View>

          <Text style={[s.sectionLabel, { color: cat.glow }]}>SITUATION</Text>
          <Text style={s.sectionBody}>{petition.why || petition.summary}</Text>

          <Text style={s.sectionLabel}>WHAT WE'RE ASKING FOR</Text>
          <View style={s.askBox}>
            <MaterialIcons name="campaign" size={16} color={COLORS.primary} />
            <Text style={s.askText}>{petition.ask || petition.summary}</Text>
          </View>

          <Text style={s.sectionLabel}>RECIPIENT</Text>
          <View style={s.recipientBox}>
            <MaterialIcons name="person" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={s.recipientText}>{petition.recipient}</Text>
          </View>

          {petition.tags?.length ? (
            <>
              <Text style={s.sectionLabel}>TAGS</Text>
              <View style={s.tagsRow}>
                {petition.tags.map((tag) => (
                  <View key={tag} style={s.tagChip}><Text style={s.tagChipText}>#{tag}</Text></View>
                ))}
              </View>
            </>
          ) : null}

          <TouchableOpacity style={s.reportBox} onPress={() => setReportVisible(true)} activeOpacity={0.85}>
            <MaterialIcons name="flag" size={16} color={COLORS.error} />
            <View style={{ flex: 1 }}>
              <Text style={s.reportTitle}>Report this petition</Text>
              <Text style={s.reportSub}>Flag false, malicious, spam, or unsafe content for review.</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={s.actionWrap}>
        <LinearGradient colors={['transparent', COLORS.surface]} style={s.actionFade} pointerEvents="none" />
        <View style={s.actionBar}>
          <TouchableOpacity style={s.saveBtn} onPress={() => toggleSave(petition.id)}>
            <MaterialIcons name={isSaved ? 'bookmark' : 'bookmark-border'} size={24} color={isSaved ? COLORS.primary : 'white'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.signBtn, isSigned && s.signedBtn]}
            disabled={isSigned}
            onPress={() => setModalVisible(true)}
          >
            {isSigned ? (
              <View style={s.signGrad}>
                <MaterialIcons name="check" size={18} color={COLORS.tertiary} />
                <Text style={[s.signText, { color: COLORS.tertiary }]}>Signed</Text>
              </View>
            ) : (
              <LinearGradient colors={[COLORS.tertiary, COLORS.tertiaryContainer]} style={s.signGrad}>
                <Text style={s.signText}>Sign this petition</Text>
                <MaterialIcons name="edit" size={18} color={COLORS.onTertiary} />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <SignModal
        visible={modalVisible}
        petition={petition}
        onConfirm={handleSign}
        onCancel={() => setModalVisible(false)}
      />
      <ReportModal
        visible={reportVisible}
        petition={petition}
        onClose={() => setReportVisible(false)}
        onSubmit={reportPetition}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  hero: { height: 280, position: 'relative', overflow: 'hidden' },
  heroWater: { position: 'absolute', right: -30, top: 50, transform: [{ rotate: '-12deg' }] },
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 100 },
  heroTop: { paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { position: 'absolute', left: 24, right: 24, bottom: 20 },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  catTag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, gap: 5 },
  catTagText: { color: 'white', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  urgencyDot: { width: 6, height: 6, borderRadius: 3 },
  heroTitle: { color: 'white', fontSize: 26, fontWeight: '900', lineHeight: 30, letterSpacing: -0.5 },
  body: { paddingHorizontal: 24, paddingTop: 20 },
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  orgIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orgName: { color: 'white', fontWeight: '700', fontSize: 14 },
  verified: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.tertiary, alignItems: 'center', justifyContent: 'center' },
  orgSub: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 2 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  metaText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  statsCard: { backgroundColor: COLORS.surfaceContainer, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, marginBottom: 20 },
  statsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  statsVal: { fontSize: 28, fontWeight: '900' },
  statsLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 2 },
  statsGoal: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  weekText: { color: COLORS.tertiary, fontSize: 11, fontWeight: '700' },
  progressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressPct: { color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'right' },
  sectionLabel: { color: COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 2, marginTop: 16, marginBottom: 10 },
  sectionBody: { color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 23, marginBottom: 8 },
  askBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(177,197,255,0.06)', borderWidth: 1, borderColor: 'rgba(177,197,255,0.15)', borderRadius: 14, padding: 14, marginBottom: 8 },
  askText: { flex: 1, color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 20 },
  recipientBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surfaceContainer, borderRadius: 14, padding: 14, marginBottom: 8 },
  recipientText: { color: 'white', fontSize: 14, fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tagChip: { backgroundColor: 'rgba(177,197,255,0.1)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  tagChipText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  reportBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: 'rgba(255,180,171,0.08)', borderWidth: 1, borderColor: 'rgba(255,180,171,0.2)', borderRadius: 14, padding: 14, marginTop: 18 },
  reportTitle: { color: COLORS.error, fontSize: 13, fontWeight: '900', marginBottom: 2 },
  reportSub: { color: 'rgba(255,255,255,0.52)', fontSize: 12, lineHeight: 17 },
  actionWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface },
  actionFade: { position: 'absolute', top: -40, left: 0, right: 0, height: 40 },
  actionBar: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  saveBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  signBtn: { flex: 1, height: 56, borderRadius: 28, overflow: 'hidden', shadowColor: COLORS.tertiary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10 },
  signedBtn: { backgroundColor: 'rgba(78,222,163,0.15)', borderWidth: 1, borderColor: 'rgba(78,222,163,0.3)', shadowOpacity: 0 },
  signGrad: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  signText: { color: COLORS.onTertiary, fontWeight: '900', fontSize: 15 },
});
