// Motion system.
//
// Everything that moves in this app is driven from here so the feel is
// consistent and defensible. The model is Apple's, from "Designing Fluid
// Interfaces": instead of thinking in mass/stiffness/damping or in fixed
// durations, a motion is described by two numbers a designer can reason about.
//
//   damping ratio — how much it overshoots. 1.0 settles with no bounce,
//                   below 1.0 overshoots and oscillates.
//   response      — roughly how long (seconds) it takes to reach the target.
//                   Not a duration: a spring has no fixed end, the settle time
//                   emerges from the parameters.
//
// A spring is used rather than a timing curve because a spring can be
// retargeted mid-flight without a visual seam, which is what makes an
// interaction interruptible.
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

// Converts (damping ratio, response) into the physics triplet RN's Animated
// spring actually wants. With mass fixed at 1:
//   angular frequency  w = 2*pi / response
//   stiffness          k = w^2
//   damping            c = 2 * zeta * w
export function spring(dampingRatio, response) {
  const w = (2 * Math.PI) / response;
  return {
    mass: 1,
    stiffness: w * w,
    damping: 2 * dampingRatio * w,
  };
}

// The house springs. Critically damped is the default — overshoot on something
// the user didn't throw reads as sloppy, not lively. Bounce is reserved for
// motion that continues a gesture the user already gave momentum to.
export const SPRING = {
  // Repositioning something under its own steam: sheets settling, pills sliding.
  move: spring(1.0, 0.4),
  // Fast, non-negotiable feedback: a button reacting to a finger.
  press: spring(1.0, 0.22),
  // Snapping back after a gesture that didn't commit.
  settle: spring(1.0, 0.32),
  // Continuing a flick or a throw. The only place bounce is earned.
  momentum: spring(0.8, 0.4),
  // A drawer or sheet arriving — slightly under-damped per Apple's own numbers.
  sheet: spring(0.8, 0.3),
};

// RN's PanResponder reports velocity in pixels per millisecond; Animated's
// spring wants pixels per second. Getting this wrong is a silent 1000x error
// that makes every handoff look either dead or explosive.
export const toVelocityPerSecond = (v) => v * 1000;

// Where a flick would come to rest if you just let it decelerate. This is the
// same exponential-decay model scroll views use — not the textbook
// v^2/(2*a) — and it is what makes a small flick feel like it throws the card
// rather than nudging it.
//
// velocity is px/sec. decelerationRate 0.998 is normal scroll feel; lower is
// snappier.
export function project(velocity, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

// Progressive resistance past a boundary. A hard stop reads as "frozen"; this
// reads as "responsive, but there is nothing more this way". Returns the
// distance the element should actually travel for a given overshoot.
export function rubberband(overshoot, dimension, constant = 0.55) {
  if (!dimension) return overshoot;
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

// Starts a spring on an Animated value, handing off the gesture's release
// velocity so there is no visible seam between dragging and animating.
// `velocity` is px/sec, or {x, y} for an AnimatedValueXY.
export function springTo(value, toValue, config, velocity) {
  return Animated.spring(value, {
    toValue,
    ...config,
    ...(velocity !== undefined ? { velocity } : {}),
    useNativeDriver: false,
    restDisplacementThreshold: 0.4,
    restSpeedThreshold: 0.4,
  });
}

// Reduced motion is not "no feedback" — it is a gentler, non-vestibular
// equivalent. Callers swap springs and slides for short cross-fades and drop
// overshoot, while keeping direct 1:1 manipulation (a finger dragging a card
// is not decorative motion).
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((on) => { if (alive) setReduced(Boolean(on)); })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (on) => {
      setReduced(Boolean(on));
    });
    return () => { alive = false; sub?.remove?.(); };
  }, []);

  return reduced;
}

// The reduced-motion stand-in for a spring: a short, flat cross-fade.
export function fadeTo(value, toValue, duration = 180) {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: Easing.out(Easing.quad),
    useNativeDriver: false,
  });
}

// Mirrored easings for reversible transitions, so the outbound path matches
// the return path instead of the two feeling like different animations.
export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IN = Easing.bezier(0.64, 0, 0.78, 0);
