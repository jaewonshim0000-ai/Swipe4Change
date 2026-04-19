import React, { useRef, useMemo } from 'react';
import { View, Animated, PanResponder, Dimensions, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../theme';
import PetitionCard from './PetitionCard';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_W * 0.25;
const SWIPE_OUT_DURATION = 280;

export default function SwipeDeck({
  data,
  index,
  onSwipeRight,
  onSwipeLeft,
  onTap,
  onReport,
}) {
  const position = useRef(new Animated.ValueXY()).current;
  const active = data[index];

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 5,
    }).start();
  };

  const completeSwipe = (direction) => {
    const toX = direction === 'right' ? SCREEN_W * 1.4 : -SCREEN_W * 1.4;
    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      if (!active) return;
      if (direction === 'right') onSwipeRight?.(active);
      else onSwipeLeft?.(active);
    });
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        completeSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        completeSwipe('left');
      } else {
        resetPosition();
      }
    },
  }), [active, onSwipeLeft, onSwipeRight]);

  SwipeDeck.triggerSwipe = completeSwipe;

  if (!active) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconEmoji}>✓</Text>
        </View>
        <Text style={styles.emptyTitle}>You're all caught up</Text>
        <Text style={styles.emptySub}>Check Discover for more petitions or update your interests.</Text>
      </View>
    );
  }

  const renderCards = () => data
    .slice(index, index + 3)
    .map((item, i) => {
      if (i === 0) {
        return (
          <Animated.View
            key={item.id}
            style={[
              styles.cardContainer,
              {
                zIndex: 10,
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { rotate },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => onTap?.(item)}>
              <PetitionCard petition={item} dragX={position.x.__getValue?.() || 0} onReport={onReport} />
            </TouchableOpacity>
          </Animated.View>
        );
      }

      const depth = i;
      return (
        <View
          key={item.id}
          style={[
            styles.cardContainer,
            {
              transform: [
                { translateY: depth * 8 },
                { scale: 1 - depth * 0.04 },
              ],
              opacity: 0.5 - depth * 0.12,
              zIndex: -depth,
            },
          ]}
          pointerEvents="none"
        >
          <PetitionCard petition={item} dragX={0} />
        </View>
      );
    })
    .reverse();

  return <View style={styles.deck}>{renderCards()}</View>;
}

const styles = StyleSheet.create({
  deck: { flex: 1, position: 'relative' },
  cardContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(78,222,163,0.15)',
    borderWidth: 1, borderColor: 'rgba(78,222,163,0.3)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIconEmoji: { fontSize: 32, color: COLORS.tertiary },
  emptyTitle: { color: 'white', fontSize: 24, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  emptySub: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
});
