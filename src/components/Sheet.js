import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, KeyboardAvoidingView, Modal, PanResponder,
  Platform, Pressable, StyleSheet, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS } from '../theme';
import {
  SPRING, fadeTo, project, rubberband, springTo, toVelocityPerSecond, useReducedMotion,
} from '../utils/motion';

// A bottom sheet that can be grabbed at any point, including while it is still
// arriving or already leaving. Modal's own `animationType` is deliberately off:
// a canned slide cannot be caught mid-flight, and catching it is the whole
// point — a sheet the user reaches for again should follow the finger, not
// finish closing first and then reopen.
//
// It also always leaves the way it came. Sliding up from the bottom and then
// dismissing in some other direction breaks the sense of where things live.
export default function Sheet({
  visible,
  onClose,
  header,
  children,
  maxHeight = '88%',
  dismissible = true,
}) {
  const [mounted, setMounted] = useState(visible);
  const [sheetH, setSheetH] = useState(0);
  const y = useRef(new Animated.Value(0)).current;
  const height = useRef(0);
  const measured = useRef(false);
  const closing = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (visible) {
      closing.current = false;
      setMounted(true);
    } else if (mounted) {
      animateOut();
    }
  }, [visible]);

  const animateIn = () => {
    if (reduced) {
      y.setValue(0);
      return;
    }
    springTo(y, 0, SPRING.sheet).start();
  };

  const animateOut = (then) => {
    if (closing.current) return;
    closing.current = true;
    const target = height.current || 600;
    const anim = reduced ? fadeTo(y, target, 160) : springTo(y, target, SPRING.move);
    anim.start(({ finished }) => {
      if (!finished) return;
      measured.current = false;
      setMounted(false);
      setSheetH(0);
      then?.();
    });
  };

  // A drag that decides to close still owns the motion: the sheet keeps going
  // at the speed the finger left it at rather than restarting from zero.
  const dismissWith = (velocity) => {
    if (closing.current) return;
    closing.current = true;
    springTo(y, height.current || 600, SPRING.move, velocity).start(({ finished }) => {
      if (!finished) return;
      measured.current = false;
      setMounted(false);
      setSheetH(0);
      onClose?.();
    });
  };

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => dismissible,
    onMoveShouldSetPanResponder: (_, g) => dismissible && Math.abs(g.dy) > 6,
    onPanResponderGrant: () => {
      // Pick up from wherever the sheet is painted right now, so grabbing one
      // that is still settling does not make it jump.
      y.stopAnimation();
      y.extractOffset();
      closing.current = false;
    },
    onPanResponderMove: (_, g) => {
      // Downward is the sheet's axis and tracks the finger exactly. Upward has
      // nowhere to go, so it resists rather than stopping dead.
      y.setValue(g.dy >= 0 ? g.dy : rubberband(g.dy, height.current || 600));
    },
    onPanResponderRelease: (_, g) => {
      y.flattenOffset();
      const velocity = toVelocityPerSecond(g.vy);
      const current = g.dy;
      const projected = current + project(velocity, 0.99);
      // Where the throw is heading decides this, not where it was released.
      if (projected > (height.current || 600) * 0.4) dismissWith(velocity);
      else springTo(y, 0, SPRING.settle, velocity).start();
    },
    onPanResponderTerminate: () => {
      y.flattenOffset();
      springTo(y, 0, SPRING.settle).start();
    },
  }), [dismissible, reduced]);

  const onLayout = (e) => {
    const h = e.nativeEvent.layout.height;
    if (!h || measured.current) return;
    measured.current = true;
    height.current = h;
    setSheetH(h);
    y.setValue(h);
    requestAnimationFrame(animateIn);
  };

  if (!mounted) return null;

  // The scrim tracks the drag, so pulling the sheet down lets the app behind it
  // come back gradually instead of switching on at the end.
  const scrimOpacity = sheetH
    ? y.interpolate({ inputRange: [0, sheetH], outputRange: [1, 0], extrapolate: 'clamp' })
    : 0;

  return (
    <Modal transparent visible animationType="none" onRequestClose={() => animateOut(onClose)} statusBarTranslucent>
      <View style={s.root}>
        <Animated.View style={[s.scrim, { opacity: scrimOpacity }]} pointerEvents="none">
          {Platform.OS !== 'web' ? <BlurView tint="dark" intensity={18} style={StyleSheet.absoluteFill} /> : null}
        </Animated.View>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => dismissible && animateOut(onClose)} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.wrap}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[s.sheet, { maxHeight, opacity: sheetH ? 1 : 0, transform: [{ translateY: y }] }]}
            onLayout={onLayout}
          >
            <LinearGradient
              colors={[COLORS.sheetTop, COLORS.sheetBottom]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View {...pan.panHandlers}>
              <View style={s.grab} />
              {header}
            </View>
            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,6,12,.62)' },
  wrap: { width: '100%' },
  // background:linear-gradient(180deg,#141a29,#0d1220); radius 30 30 0 0;
  // border-top 1px rgba(255,255,255,.12); shadow 0 -24px 60px rgba(0,0,0,.7)
  sheet: {
    overflow: 'hidden',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,.12)',
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -24 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    elevation: 24,
  },
  grab: {
    width: 38, height: 4, borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,.2)',
    alignSelf: 'center', marginBottom: 14,
  },
});
