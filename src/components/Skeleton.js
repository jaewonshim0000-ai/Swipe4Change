import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

// A single shimmering placeholder block. Loops a soft opacity pulse.
export default function Skeleton({ width = '100%', height = 16, radius = 8, style }) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.block,
        { width, height, borderRadius: radius, opacity: pulse },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: 'rgba(255,255,255,0.08)' },
});
