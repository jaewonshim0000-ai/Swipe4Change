import React, { useRef, useState, useEffect, useMemo } from 'react';
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
  onReset,
}) {
  const position = useRef(new Animated.ValueXY()).current;
  const [dragX, setDragX] = useState(0);

  useEffect(() => {
    const id = position.x.addListener(({ value }) => setDragX(value));
    return () => position.x.removeListener(id);
  }, [position.x]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
        onPanResponderMove: Animated.event(
          [null, { dx: position.x, dy: position.y }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: (_, g) => {
          if (g.dx > SWIPE_THRESHOLD) {
            forceSwipe('right');
          } else if (g.dx < -SWIPE_THRESHOLD) {
            forceSwipe('left');
          } else {
            resetPosition();
          }
        },
      }),
    [position, index, data]
  );

  const forceSwipe = (direction) => {
    const x = direction === 'right' ? SCREEN_W * 1.5 : -SCREEN_W * 1.5;
    Haptics.impactAsync(
      direction === 'right'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    ).catch(() => {});
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction) => {
    const item = data[index];
    if (!item) return;
    position.setValue({ x: 0, y: 0 });
    if (direction === 'right') onSwipeRight(item);
    else onSwipeLeft(item);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      useNativeDriver: false,
    }).start();
  };

  // Expose programmatic swipe for action buttons
  SwipeDeck.triggerSwipe = forceSwipe;

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_W * 1.5, 0, SCREEN_W * 1.5],
      outputRange: ['-30deg', '0deg', '30deg'],
    });
    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  if (index >= data.length) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconEmoji}>✨</Text>
        </View>
        <Text style={styles.emptyTitle}>You're all caught up</Text>
        <Text style={styles.emptySub}>
          You've seen every petition in your feed. New ones arrive daily based on your interests.
        </Text>
        <TouchableOpacity style={styles.resetBtn} onPress={onReset} activeOpacity={0.8}>
          <Text style={styles.resetBtnText}>Restart deck</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderCards = () => {
    return data
      .map((item, i) => {
        if (i < index) return null;
        if (i > index + 2) return null;

        // Top card - draggable
        if (i === index) {
          return (
            <Animated.View
              key={item.id}
              style={[styles.cardContainer, getCardStyle()]}
              {...panResponder.panHandlers}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => onTap(item)}
                style={{ flex: 1 }}
                // Only fire tap if not currently dragging
                delayPressIn={120}
              >
                <PetitionCard petition={item} dragX={dragX} />
              </TouchableOpacity>
            </Animated.View>
          );
        }

        // Background stack cards
        const depth = i - index;
        return (
          <View
            key={item.id}
            style={[
              styles.cardContainer,
              {
                transform: [
                  { translateY: -depth * 8 },
                  { scale: 1 - depth * 0.04 },
                ],
                opacity: 0.5 - depth * 0.15,
                zIndex: -depth,
              },
            ]}
            pointerEvents="none"
          >
            <PetitionCard petition={item} dragX={0} />
          </View>
        );
      })
      .filter(Boolean)
      .reverse();
  };

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
  emptyIconEmoji: { fontSize: 32 },
  emptyTitle: { color: 'white', fontSize: 24, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  emptySub: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  resetBtn: {
    paddingHorizontal: 28, paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  resetBtnText: { color: 'white', fontSize: 14, fontWeight: '700' },
});
