import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { COLORS } from '../theme';

// The design paints three elliptical radial gradients behind every screen:
//
//   radial-gradient(560px 380px at   8%  -6%, rgba(92,140,251,.20), transparent 70%)
//   radial-gradient(520px 420px at 108%  24%, rgba(78,222,163,.13), transparent 70%)
//   radial-gradient(700px 520px at  50% 118%, rgba(27,88,197,.16), transparent 72%)
//
// Expo's gradient has no radial mode, so these are drawn as SVG ellipses with
// real radial fills. Sizes are authored against the design's 402pt frame and
// scale with the device width so the composition holds on any screen.
const BASE_W = 402;

const GLOWS = [
  { id: 'g1', w: 560, h: 380, cx: 0.08, cy: -0.06, color: 'rgb(92,140,251)', opacity: 0.2, stop: 0.7 },
  { id: 'g2', w: 520, h: 420, cx: 1.08, cy: 0.24, color: 'rgb(78,222,163)', opacity: 0.13, stop: 0.7 },
  { id: 'g3', w: 700, h: 520, cx: 0.5, cy: 1.18, color: 'rgb(27,88,197)', opacity: 0.16, stop: 0.72 },
];

export default function ScreenBackground({ children, style }) {
  const { width, height } = useWindowDimensions();
  const k = width / BASE_W;

  return (
    <View style={[styles.root, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            {GLOWS.map((g) => (
              <RadialGradient key={g.id} id={g.id} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={g.color} stopOpacity={g.opacity} />
                <Stop offset={String(g.stop)} stopColor={g.color} stopOpacity="0" />
                <Stop offset="1" stopColor={g.color} stopOpacity="0" />
              </RadialGradient>
            ))}
          </Defs>
          {GLOWS.map((g) => (
            <Ellipse
              key={g.id}
              cx={g.cx * width}
              cy={g.cy * height}
              rx={(g.w / 2) * k}
              ry={(g.h / 2) * k}
              fill={`url(#${g.id})`}
            />
          ))}
        </Svg>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
});
