import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, GLASS } from '../theme';

// The design's frosted pill: a translucent fill over a 16px blur, a bright
// hairline border and an inset highlight along the top edge where the light
// catches the material. Web falls back to the fill alone.
export function GlassPill({ children, style, intensity = 24, radius = 999, tint = 'dark' }) {
  const canBlur = Platform.OS !== 'web';
  return (
    <View style={[styles.pill, { borderRadius: radius }, style]}>
      {canBlur ? (
        <BlurView
          intensity={intensity}
          tint={tint}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          pointerEvents="none"
        />
      ) : null}
      <View
        style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: GLASS.fill }]}
        pointerEvents="none"
      />
      {/* inset 0 1px 0 rgba(255,255,255,.18) */}
      <View
        style={[styles.highlight, { borderRadius: radius }]}
        pointerEvents="none"
      />
      <View style={styles.pillContent}>{children}</View>
    </View>
  );
}

// Uppercase mono micro-label — the design's annotation style, always 9px with
// wide tracking.
export function MonoLabel({ children, size = 9, color = 'rgba(255,255,255,.4)', spacing = 1.9, weight = 'regular', style, numberOfLines = 1 }) {
  const family = weight === 'bold' ? FONTS.monoBold : weight === 'medium' ? FONTS.monoMedium : FONTS.mono;
  return (
    <Text
      style={[{ fontFamily: family, fontSize: size, letterSpacing: spacing, color }, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

// Instrument Serif display type. The design sets line height and tracking per
// instance, so both are props rather than derived.
export function Display({
  children,
  size = 32,
  lineHeight,
  letterSpacing = -0.3,
  color = COLORS.white,
  style,
  numberOfLines,
  italic = false,
}) {
  return (
    <Text
      style={[
        {
          fontFamily: italic ? FONTS.serifItalic : FONTS.serif,
          fontSize: size,
          lineHeight: lineHeight ?? size,
          letterSpacing,
          color,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  pill: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: GLASS.highlight,
  },
  pillContent: { flexDirection: 'row', alignItems: 'center' },
});
