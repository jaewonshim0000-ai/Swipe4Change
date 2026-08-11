import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, Animated, PanResponder, Easing, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, clamp } from '../theme';
import Press from './Press';
import PetitionCard from './PetitionCard';
import Icon from './Icon';

// Motion constants exactly as the design sets them:
//   drag      translate(dx, dy*0.35) rotate(dx/20.1 deg)
//   stamps    opacity clamp(±dx/110, 0, 1)
//   next card scale(0.94 + 0.06t) translateY((1-t)*12), opacity 0.6 + 0.4t
//             where t = clamp(|dx|/140, 0, 1)
//   commit    |dx| > 100
//   fly out   translate(dir*563, dy*0.35) rotate(dir*28) opacity 0 over 280ms linear
//   snap back 420ms cubic-bezier(.22,1.3,.4,1)
const DRAG_Y_DAMP = 0.35;
const ROTATE_DIVISOR = 20.1;
const STAMP_RANGE = 110;
const NEXT_RANGE = 140;
const COMMIT_DX = 100;
const FLY_X = 563;
const FLY_ROTATE = 28;
const FLY_MS = 280;
const SNAP_MS = 420;
const SNAP_EASING = Easing.bezier(0.22, 1.3, 0.4, 1);

function SwipeDeck({ cards, onSignSwipe, onSkipSwipe, onTap, onReset }, ref) {
  // A single 0..1 progress value drives the whole deck. Positive x is a sign
  // gesture, negative a skip.
  const dx = useRef(new Animated.Value(0)).current;
  const dy = useRef(new Animated.Value(0)).current;
  const gone = useRef(new Animated.Value(0)).current;
  const drag = useRef(null);
  const busy = useRef(false);

  const top = cards[0];

  const reset = () => {
    dx.setValue(0);
    dy.setValue(0);
    gone.setValue(0);
    busy.current = false;
  };

  const settle = () => {
    Animated.parallel([
      Animated.timing(dx, { toValue: 0, duration: SNAP_MS, easing: SNAP_EASING, useNativeDriver: false }),
      Animated.timing(dy, { toValue: 0, duration: SNAP_MS, easing: SNAP_EASING, useNativeDriver: false }),
    ]).start();
  };

  const fly = (dir, item) => {
    if (busy.current || !item) return;
    busy.current = true;
    Animated.parallel([
      Animated.timing(dx, { toValue: dir * FLY_X, duration: FLY_MS, easing: Easing.linear, useNativeDriver: false }),
      Animated.timing(gone, { toValue: 1, duration: FLY_MS, easing: Easing.linear, useNativeDriver: false }),
    ]).start(() => {
      reset();
      if (dir > 0) onSignSwipe?.(item);
      else onSkipSwipe?.(item);
    });
  };

  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) => !busy.current && (Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4),
    onPanResponderGrant: () => { drag.current = { moved: false }; },
    onPanResponderMove: (_, g) => {
      if (busy.current) return;
      if (Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4) drag.current = { moved: true };
      dx.setValue(g.dx);
      dy.setValue(g.dy);
    },
    onPanResponderRelease: (_, g) => {
      if (busy.current) return;
      if (Math.abs(g.dx) > COMMIT_DX) {
        const dir = g.dx > 0 ? 1 : -1;
        Haptics.impactAsync(
          dir > 0 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
        ).catch(() => {});
        fly(dir, top);
      } else {
        settle();
      }
    },
    onPanResponderTerminate: () => settle(),
  }), [top, onSignSwipe, onSkipSwipe]);

  useImperativeHandle(ref, () => ({
    // The action buttons run the same fly-out the gesture does, with the
    // matching stamp already fully shown.
    flick: (dir) => {
      if (!top || busy.current) return;
      dx.setValue(dir * COMMIT_DX);
      fly(dir, top);
    },
  }), [top]);

  const rotate = dx.interpolate({
    inputRange: [-FLY_X, 0, FLY_X],
    outputRange: [`${-FLY_X / ROTATE_DIVISOR}deg`, '0deg', `${FLY_X / ROTATE_DIVISOR}deg`],
  });
  const signOpacity = dx.interpolate({ inputRange: [0, STAMP_RANGE], outputRange: [0, 1], extrapolate: 'clamp' });
  const skipOpacity = dx.interpolate({ inputRange: [-STAMP_RANGE, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  // t = clamp(|dx| / 140, 0, 1)
  const t = dx.interpolate({ inputRange: [-NEXT_RANGE, 0, NEXT_RANGE], outputRange: [1, 0, 1], extrapolate: 'clamp' });

  if (!top) {
    return (
      <View style={s.empty}>
        <View style={s.emptyIcon}>
          <Icon name="task_alt" size={32} fill={1} color={COLORS.tertiary} />
        </View>
        <Text style={s.emptyTitle}>You&apos;re all caught up</Text>
        <Text style={s.emptySub}>
          You&apos;ve been through today&apos;s feed. Reset the deck or head to Discover for more causes.
        </Text>
        <Press style={s.resetBtn} onPress={onReset}>
          <Text style={s.resetText}>Reset feed</Text>
        </Press>
      </View>
    );
  }

  return (
    <View style={s.deck}>
      {cards.slice(0, 3).map((item, depth) => {
        if (depth === 0) {
          return (
            <Animated.View
              key={item.id}
              style={[
                s.slot,
                {
                  zIndex: 10,
                  opacity: gone.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                  transform: [
                    { translateX: dx },
                    { translateY: Animated.multiply(dy, DRAG_Y_DAMP) },
                    { rotate },
                  ],
                },
              ]}
              {...pan.panHandlers}
            >
              <Press
                flat
                fill
                style={{ flex: 1 }}
                onPress={() => { if (!drag.current?.moved) onTap?.(item); }}
              >
                <PetitionCard petition={item} signOpacity={signOpacity} skipOpacity={skipOpacity} />
              </Press>
            </Animated.View>
          );
        }

        // The card directly behind rises toward the front as the top one leaves.
        if (depth === 1) {
          return (
            <Animated.View
              key={item.id}
              style={[
                s.slot,
                {
                  zIndex: 9,
                  opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
                  transform: [
                    { scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
                    { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
                  ],
                },
              ]}
              pointerEvents="none"
            >
              <PetitionCard petition={item} />
            </Animated.View>
          );
        }

        return (
          <View
            key={item.id}
            style={[s.slot, { zIndex: 8, opacity: 0.28, transform: [{ scale: 0.88 }, { translateY: 24 }] }]}
            pointerEvents="none"
          >
            <PetitionCard petition={item} />
          </View>
        );
      }).reverse()}
    </View>
  );
}

export default forwardRef(SwipeDeck);

const s = StyleSheet.create({
  deck: { flex: 1, position: 'relative' },
  slot: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 22,
    backgroundColor: 'rgba(78,222,163,.10)',
    borderWidth: 1, borderColor: 'rgba(78,222,163,.26)',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontFamily: FONTS.serif, fontSize: 32, lineHeight: 32, color: '#fff', textAlign: 'center' },
  emptySub: {
    fontFamily: FONTS.sans, fontSize: 13, lineHeight: 19.5,
    color: 'rgba(255,255,255,.5)', textAlign: 'center',
  },
  resetBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999,
    backgroundColor: 'rgba(177,197,255,.12)', borderWidth: 1, borderColor: 'rgba(177,197,255,.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  resetText: { fontFamily: FONTS.sansBold, fontSize: 13, color: COLORS.primary },
});
