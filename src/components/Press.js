import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { SPRING, fadeTo, springTo, useReducedMotion } from '../utils/motion';

// The touch target and the surface that reacts are the same element. Wrapping
// the surface in a separate pressable would put an extra box in the layout,
// which changes how the control measures inside rows and scrollers — this is a
// drop-in replacement for a plain touchable, not an addition to it.
const Touchable = Animated.createAnimatedComponent(Pressable);

// A pressable that reacts the instant a finger lands rather than when it lifts.
// The moment feedback waits for touch-up, the interface stops feeling direct —
// so the depression starts on press-in and the action still commits on
// press-out, which also means dragging off the control cancels it.
//
// Props beyond the usual: `scale` sets how far it depresses, `flat` keeps the
// geometry still for surfaces where the content itself is the feedback (a card
// being dragged), and `haptic` fires on the same event as the visual so the two
// senses arrive together instead of as two separate signals.
export default function Press({
  children,
  onPress,
  onLongPress,
  style,
  disabled,
  flat = false,
  fill = false,
  scale = 0.96,
  haptic,
  hitSlop = 8,
  ...rest
}) {
  const reduced = useReducedMotion();
  const depth = useRef(new Animated.Value(0)).current;

  const to = (value) => {
    const anim = reduced || flat
      ? fadeTo(depth, value, 120)
      : springTo(depth, value, SPRING.press);
    anim.start();
  };

  // Reduced motion keeps the feedback but drops the movement: the control still
  // answers the touch, it just does it without changing size.
  const feedback = {
    opacity: depth.interpolate({ inputRange: [0, 1], outputRange: [1, flat ? 0.92 : 0.86] }),
    ...(flat || reduced
      ? null
      : { transform: [{ scale: depth.interpolate({ inputRange: [0, 1], outputRange: [1, scale] }) }] }),
  };

  return (
    <Touchable
      onPressIn={() => { if (!disabled) to(1); }}
      onPressOut={() => to(0)}
      onPress={() => {
        if (disabled) return;
        haptic?.();
        onPress?.();
      }}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={[fill && { flex: 1 }, style, feedback]}
      {...rest}
    >
      {children}
    </Touchable>
  );
}
