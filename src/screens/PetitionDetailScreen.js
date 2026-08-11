import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { CATEGORY_STYLE, COLORS, FONTS, SECTION_LABEL, URGENCY_COLOR, fmt } from '../theme';
import { COMMENTS } from '../data/petitions';
import { hTap } from '../utils/haptics';
import { useApp } from '../contexts/AppContext';
import { MonoLabel } from '../components/Glass';
import SignModal from '../components/SignModal';
import ReportModal from '../components/ReportModal';
import FederalCommentModal from '../components/FederalCommentModal';
import Press from '../components/Press';
import Icon from '../components/Icon';

export default function PetitionDetailScreen({ route, navigation }) {
  const { petitionId } = route.params || {};
  const { petitions, savedIds, signedIds, toggleSave, signPetition, reportPetition } = useApp();
  const [signing, setSigning] = useState(false);
  const [reporting, setReporting] = useState(false);

  const p = petitions.find((item) => item.id === petitionId);
  if (!p) return null;

  const cat = CATEGORY_STYLE[p.category] || CATEGORY_STYLE.Climate;
  const urg = URGENCY_COLOR[p.urgency] || URGENCY_COLOR.medium;
  const pct = Math.min(100, (p.signed / p.goal) * 100);
  const isSaved = savedIds.includes(p.id);
  const isSigned = signedIds.includes(p.id);
  const weeksLeft = Math.max(1, Math.round((p.goal - p.signed) / (p.weeklyIncrease || 1)));
  const comments = COMMENTS[p.id] || [];
  // Federal comment periods pulled in from Regulations.gov are not signable —
  // the design's one action button submits an official public comment instead.
  const isFederal = Boolean(p.external) && p.canSignInApp === false;

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Image source={{ uri: p.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient
            colors={[`${cat.from}cc`, `${cat.to}22`, 'transparent']}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(6,9,17,.6)', 'transparent', 'rgba(10,14,25,.72)', COLORS.surface]}
            locations={[0, 0.34, 0.76, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={s.heroNav}>
            <Press style={s.glassBtn} onPress={() => navigation.goBack()} scale={0.9}>
              <Icon name="arrow_back" size={17} color="#fff" />
            </Press>
            <View style={s.heroNavRight}>
              <Press
                style={[s.glassBtn, isSaved && s.glassBtnOn]}
                onPress={() => { hTap(); toggleSave(p.id); }}
                scale={0.9}
              >
                <Icon name="bookmark" size={24} fill={isSaved ? 1 : 0} color={isSaved ? COLORS.primary : '#fff'} />
              </Press>
              <Press
                style={s.glassBtn}
                onPress={() => Share.share({ message: `${p.title} — ${p.summary}` }).catch(() => {})}
                scale={0.9}
              >
                <Icon name="ios_share" size={17} color="#fff" />
              </Press>
            </View>
          </View>

          <View style={s.heroFoot}>
            <View style={s.heroChips}>
              <View style={s.catChip}>
                <Icon name={cat.icon} size={13} fill={1} color={cat.glow} />
                <MonoLabel size={9} spacing={1.3} weight="bold" color="#fff">
                  {p.category.toUpperCase()}
                </MonoLabel>
              </View>
              <View style={[s.urgChip, { backgroundColor: `${urg}2e`, borderColor: `${urg}70` }]}>
                <View style={[s.urgDot, { backgroundColor: urg }]} />
                <MonoLabel size={9} spacing={1.3} weight="bold" color={urg}>
                  {p.urgency.toUpperCase()}
                </MonoLabel>
              </View>
            </View>
            <Text style={s.title}>{p.title}</Text>
          </View>
        </View>

        <View style={s.body}>
          {/* Organisation */}
          <View style={s.orgRow}>
            <LinearGradient
              colors={[cat.from, cat.to]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.7, y: 1 }}
              style={[s.orgTile, { shadowColor: cat.to }]}
            >
              <Icon name="corporate_fare" size={17} fill={1} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={s.orgName}>
                <Text style={s.orgTitle}>{p.organization}</Text>
                {p.verified ? <Icon name="verified" size={13} fill={1} color={COLORS.tertiary} /> : null}
              </View>
              <MonoLabel size={9} spacing={1.4} style={{ marginTop: 2 }}>
                {p.verified ? 'VERIFIED ORGANIZATION' : 'COMMUNITY PETITION'}
              </MonoLabel>
            </View>
            <View style={s.placeChip}>
              <Icon name="place" size={13} color="rgba(255,255,255,.5)" />
              <Text style={s.placeText}>{p.location}</Text>
            </View>
          </View>

          {/* Signature stat card */}
          <View style={s.statCard}>
            <View style={s.statGlow} pointerEvents="none">
              <Svg width={180} height={180}>
                <Defs>
                  <RadialGradient id="sg" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor={cat.glow} stopOpacity="0.14" />
                    <Stop offset="0.7" stopColor={cat.glow} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx={90} cy={90} r={90} fill="url(#sg)" />
              </Svg>
            </View>

            <View style={s.statHead}>
              <View>
                <Text style={[s.bigCount, { color: cat.glow }]}>{p.signed.toLocaleString()}</Text>
                <MonoLabel size={9} spacing={1.6} style={{ marginTop: 4 }}>
                  SIGNATURES OF {fmt(p.goal)}
                </MonoLabel>
              </View>
              <View style={s.weekChip}>
                <Icon name="trending_up" size={13} color={COLORS.tertiary} />
                <MonoLabel size={11} spacing={0} weight="bold" color={COLORS.tertiary}>
                  +{fmt(p.weeklyIncrease)}/wk
                </MonoLabel>
              </View>
            </View>

            <View style={s.progressTrack}>
              <LinearGradient
                colors={[cat.glow, '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.progressFill, { width: `${pct}%`, shadowColor: cat.glow }]}
              />
            </View>
            <View style={s.progressMeta}>
              <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.45)">{pct.toFixed(0)}% OF GOAL</MonoLabel>
              <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.45)">~{weeksLeft} WEEKS TO GOAL</MonoLabel>
            </View>
          </View>

          {/* UN goal */}
          <View style={[s.sdgCard, { backgroundColor: `${cat.sdg.color}1f`, borderColor: `${cat.sdg.color}55` }]}>
            <View style={[s.sdgNum, { backgroundColor: cat.sdg.color }]}>
              <Text style={s.sdgNumText}>{cat.sdg.n}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <MonoLabel size={9} spacing={1.5} color="rgba(255,255,255,.5)">
                UN SUSTAINABLE DEVELOPMENT GOAL
              </MonoLabel>
              <Text style={s.sdgName}>{cat.sdg.name}</Text>
            </View>
          </View>

          <View>
            <Text style={s.sectionLabel}>THE SITUATION</Text>
            <Text style={s.para}>{p.why}</Text>
          </View>

          <View>
            <Text style={s.sectionLabel}>WHAT WE&apos;RE ASKING FOR</Text>
            <View style={s.askCard}>
              <Icon name="campaign" size={17} fill={1} color={COLORS.primary} />
              <Text style={s.askText}>{p.ask}</Text>
            </View>
          </View>

          <View>
            <Text style={s.sectionLabel}>WHO THIS AFFECTS</Text>
            <View style={s.listCard}>
              {(p.affects || []).map((a, i) => (
                <View key={a} style={[s.affectRow, i > 0 && s.rowDivider]}>
                  <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.32)">
                    {String(i + 1).padStart(2, '0')}
                  </MonoLabel>
                  <Text style={s.affectText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>

          <View>
            <Text style={s.sectionLabel}>DELIVERED TO</Text>
            <View style={s.recipientCard}>
              <Icon name="account_balance" size={17} color="rgba(255,255,255,.55)" />
              <Text style={s.recipientText}>{p.recipient}</Text>
            </View>
          </View>

          {comments.length ? (
            <View>
              <Text style={s.sectionLabel}>WHY PEOPLE SIGNED</Text>
              <View style={{ gap: 8 }}>
                {comments.map((c) => (
                  <View key={c.name} style={s.commentCard}>
                    <View style={s.commentHead}>
                      <View style={[s.commentAv, { backgroundColor: `${cat.glow}30` }]}>
                        <Text style={[s.commentInitial, { color: cat.glow }]}>{c.name[0]}</Text>
                      </View>
                      <Text style={s.commentName}>{c.name}</Text>
                      <MonoLabel size={9} spacing={0} color="rgba(255,255,255,.32)" style={{ marginLeft: 'auto' }}>
                        {c.when}
                      </MonoLabel>
                    </View>
                    <Text style={s.commentText}>{c.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={s.tagWrap}>
            {(p.tags || []).map((t) => (
              <View key={t} style={s.tag}>
                <MonoLabel size={11} spacing={0} color={COLORS.primary}>#{t}</MonoLabel>
              </View>
            ))}
          </View>

          <Press style={s.reportCard} onPress={() => setReporting(true)} flat>
            <Icon name="flag" size={17} fill={1} color={COLORS.error} />
            <View style={{ flex: 1 }}>
              <Text style={s.reportTitle}>Report this petition</Text>
              <Text style={s.reportSub}>Flag false, malicious, spam or unsafe content for review.</Text>
            </View>
          </Press>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={s.bar}>
        <LinearGradient
          colors={['transparent', 'rgba(10,14,25,.92)']}
          locations={[0, 0.26]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Press
          style={[s.saveBig, isSaved && s.saveBigOn]}
          onPress={() => { hTap(); toggleSave(p.id); }}
          scale={0.94}
        >
          <Icon name="bookmark" size={24} fill={isSaved ? 1 : 0} color={isSaved ? COLORS.primary : '#fff'} />
        </Press>

        {isSigned ? (
          <View style={s.signedBtn}>
            <Icon name="check_circle" size={24} fill={1} color={COLORS.tertiary} />
            <Text style={[s.signLabel, { color: COLORS.tertiary }]}>Signed</Text>
          </View>
        ) : (
          <Press style={s.signBtn} onPress={() => setSigning(true)} scale={0.97}>
            <LinearGradient
              colors={[COLORS.tertiary, COLORS.tertiaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.6, y: 1 }}
              style={s.signFill}
            >
              <Icon name={isFederal ? 'campaign' : 'draw'} size={24} fill={1} color={COLORS.onTertiary} />
              <Text style={[s.signLabel, { color: COLORS.onTertiary }]}>
                {isFederal ? 'Submit a public comment' : 'Sign this petition'}
              </Text>
            </LinearGradient>
          </Press>
        )}
      </View>

      {isFederal ? (
        <FederalCommentModal
          visible={signing}
          petition={p}
          onClose={() => setSigning(false)}
          onSubmitted={(comment) => signPetition(p.id, { comment })}
        />
      ) : (
        <SignModal
          visible={signing}
          petition={p}
          onCancel={() => setSigning(false)}
          onConfirm={(petition, comment) => { signPetition(petition.id, { comment }); setSigning(false); }}
        />
      )}
      <ReportModal
        visible={reporting}
        petition={p}
        onClose={() => setReporting(false)}
        onSubmit={(payload) => reportPetition(p.id, payload)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { paddingBottom: 120 },

  hero: { height: 290, overflow: 'hidden' },
  heroNav: {
    position: 'absolute', top: 52, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  heroNavRight: { flexDirection: 'row', gap: 8 },
  glassBtn: {
    width: 38, height: 38, borderRadius: 13,
    backgroundColor: 'rgba(8,11,20,.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  glassBtnOn: { backgroundColor: 'rgba(177,197,255,.2)', borderColor: 'rgba(177,197,255,.45)' },
  heroFoot: { position: 'absolute', left: 20, right: 20, bottom: 18 },
  heroChips: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999,
    backgroundColor: 'rgba(12,17,28,.45)', borderWidth: 1, borderColor: 'rgba(255,255,255,.2)',
  },
  urgChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1,
  },
  urgDot: { width: 6, height: 6, borderRadius: 3 },
  // font-size:32px; line-height:.98; letter-spacing:-.4px
  title: { fontFamily: FONTS.serif, fontSize: 32, lineHeight: 31.4, letterSpacing: -0.4, color: '#fff' },

  body: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orgTile: {
    width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 6,
  },
  orgName: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orgTitle: { fontFamily: FONTS.sansBold, fontSize: 13, color: '#fff' },
  placeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,.09)',
  },
  placeText: { fontFamily: FONTS.sans, fontSize: 11, color: 'rgba(255,255,255,.66)' },

  statCard: {
    position: 'relative', overflow: 'hidden', borderRadius: 22, padding: 20,
    backgroundColor: 'rgba(255,255,255,.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,.08)',
  },
  statGlow: { position: 'absolute', top: -60, right: -40 },
  statHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 },
  bigCount: { fontFamily: FONTS.monoBold, fontSize: 32, letterSpacing: -1.5, lineHeight: 32 },
  weekChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
    backgroundColor: 'rgba(78,222,163,.12)', borderWidth: 1, borderColor: 'rgba(78,222,163,.28)',
  },
  progressTrack: { height: 9, borderRadius: 99, backgroundColor: 'rgba(255,255,255,.07)', overflow: 'hidden', marginBottom: 8 },
  progressFill: {
    height: '100%', borderRadius: 99,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.67, shadowRadius: 7,
  },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  sdgCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 16, borderWidth: 1,
  },
  sdgNum: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sdgNumText: { fontFamily: FONTS.monoBold, fontSize: 13, color: '#fff' },
  sdgName: { fontFamily: FONTS.sansBold, fontSize: 13, color: '#fff', marginTop: 1 },

  sectionLabel: { ...SECTION_LABEL, marginTop: 0, marginBottom: 8 },
  para: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 20.8, color: 'rgba(255,255,255,.74)' },

  askCard: {
    flexDirection: 'row', gap: 12, padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(177,197,255,.06)', borderWidth: 1, borderColor: 'rgba(177,197,255,.16)',
  },
  askText: { flex: 1, fontFamily: FONTS.sans, fontSize: 13, lineHeight: 19.5, color: 'rgba(255,255,255,.85)' },

  listCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,.07)' },
  affectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,.03)',
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: 'rgba(10,14,25,.6)' },
  affectText: { fontFamily: FONTS.sans, fontSize: 13, color: 'rgba(255,255,255,.8)' },

  recipientCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,.07)',
  },
  recipientText: { fontFamily: FONTS.sansBold, fontSize: 13, color: '#fff', flex: 1 },

  commentCard: {
    padding: 12, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,.06)',
  },
  commentHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  commentAv: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  commentInitial: { fontFamily: FONTS.sansBold, fontSize: 11 },
  commentName: { fontFamily: FONTS.sansBold, fontSize: 11, color: 'rgba(255,255,255,.82)' },
  commentText: { fontFamily: FONTS.sans, fontSize: 13, lineHeight: 19.5, color: 'rgba(255,255,255,.66)' },

  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(177,197,255,.09)' },

  reportCard: {
    flexDirection: 'row', gap: 12, padding: 12, borderRadius: 16,
    backgroundColor: 'rgba(255,180,171,.06)', borderWidth: 1, borderColor: 'rgba(255,180,171,.18)',
  },
  reportTitle: { fontFamily: FONTS.sansBold, fontSize: 13, color: COLORS.error },
  reportSub: { fontFamily: FONTS.sans, fontSize: 11, lineHeight: 15.95, color: 'rgba(255,255,255,.5)', marginTop: 2 },

  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32,
  },
  saveBig: {
    width: 54, height: 54, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,.11)',
    alignItems: 'center', justifyContent: 'center',
  },
  saveBigOn: { backgroundColor: 'rgba(177,197,255,.16)', borderColor: 'rgba(177,197,255,.4)' },
  signBtn: {
    flex: 1, height: 54, borderRadius: 19, overflow: 'hidden',
    shadowColor: COLORS.tertiary, shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.6, shadowRadius: 15, elevation: 10,
  },
  signFill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  signedBtn: {
    flex: 1, height: 54, borderRadius: 19, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(78,222,163,.14)', borderWidth: 1, borderColor: 'rgba(78,222,163,.34)',
  },
  signLabel: { fontFamily: FONTS.sansBold, fontSize: 13, letterSpacing: -0.2 },
});
