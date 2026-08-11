import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated } from 'react-native';
import { fmtNumber } from '../utils/helpers';

// Counts up from 0 to `value` on mount (and animates on later changes),
// formatting with the shared k/M formatter. Purely visual.
export default function AnimatedNumber({ value = 0, duration = 900, style, format = fmtNumber }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(format(value));

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(format(Math.round(v))));
    Animated.timing(anim, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [value, duration]);

  return <Text style={style}>{display}</Text>;
}
