import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

const INTENSITY = [
  'rgba(255,255,255,0.04)',  // 0 — empty
  'rgba(78,222,163,0.2)',    // 1
  'rgba(78,222,163,0.4)',    // 2
  'rgba(78,222,163,0.65)',   // 3
  'rgba(78,222,163,0.9)',    // 4+
];

const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

export default function ContributionCalendar({ contributions }) {
  const grid = useMemo(() => {
    // Build last 30 days in a 5-column × 7-row grid (weeks as columns, days as rows)
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = contributions[key] || 0;
      const dayOfWeek = d.getDay(); // 0=Sun
      days.push({ key, count, dayOfWeek, date: d.getDate(), month: d.getMonth() });
    }

    // Group into weeks (columns)
    const weeks = [];
    let currentWeek = [];
    days.forEach((day) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length) weeks.push(currentWeek);

    return { days, weeks };
  }, [contributions]);

  const totalSigned = Object.values(contributions).reduce((a, b) => a + b, 0);
  const activeDays = Object.values(contributions).filter((v) => v > 0).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.sub}>Last 30 days</Text>
      </View>

      {/* Stats strip */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{totalSigned}</Text>
          <Text style={styles.statLabel}>SIGNED</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statVal}>{activeDays}</Text>
          <Text style={styles.statLabel}>ACTIVE DAYS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statVal}>
            {activeDays > 0 ? Math.max(...Object.values(contributions)) : 0}
          </Text>
          <Text style={styles.statLabel}>BEST DAY</Text>
        </View>
      </View>

      {/* Grid */}
      <View style={styles.gridContainer}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {DAYS.map((d, i) => (
            <Text key={i} style={styles.dayLabel}>{d}</Text>
          ))}
        </View>

        {/* Cells — render as flat 30-cell row, wrapped */}
        <View style={styles.grid}>
          {grid.days.map((day) => {
            const level = Math.min(day.count, 4);
            return (
              <View
                key={day.key}
                style={[styles.cell, { backgroundColor: INTENSITY[level] }]}
              />
            );
          })}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {INTENSITY.map((color, i) => (
          <View key={i} style={[styles.legendCell, { backgroundColor: color }]} />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const CELL_SIZE = 28;
const CELL_GAP = 4;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24, padding: 18,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  title: { color: 'white', fontSize: 16, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600' },

  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { color: COLORS.tertiary, fontSize: 20, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.06)' },

  gridContainer: { flexDirection: 'row', gap: 6 },
  dayLabels: { justifyContent: 'space-between', paddingVertical: 2 },
  dayLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '700', height: CELL_SIZE, lineHeight: CELL_SIZE },

  grid: {
    flex: 1, flexDirection: 'row', flexWrap: 'wrap',
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE, height: CELL_SIZE,
    borderRadius: 6,
  },

  legend: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    gap: 4, marginTop: 12,
  },
  legendText: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '600', marginHorizontal: 2 },
  legendCell: { width: 12, height: 12, borderRadius: 3 },
});
