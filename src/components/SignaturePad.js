import React, { useEffect, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function SignaturePad({ onSave, initialPath, height = 160 }) {
  const [paths, setPaths] = useState(initialPath ? [initialPath] : []);
  const [currentPath, setCurrentPath] = useState('');
  const pathsRef = useRef(initialPath ? [initialPath] : []);
  const currentPathRef = useRef('');

  useEffect(() => {
    const next = initialPath ? [initialPath] : [];
    pathsRef.current = next;
    currentPathRef.current = '';
    setPaths(next);
    setCurrentPath('');
  }, [initialPath]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const path = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        currentPathRef.current = path;
        setCurrentPath(path);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const next = `${currentPathRef.current} L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        currentPathRef.current = next;
        setCurrentPath(next);
      },
      onPanResponderRelease: () => {
        if (currentPathRef.current) {
          const all = [...pathsRef.current, currentPathRef.current];
          pathsRef.current = all;
          currentPathRef.current = '';
          setPaths(all);
          setCurrentPath('');
          onSave?.(all.join(' '));
        }
      },
    })
  ).current;

  const clear = () => {
    pathsRef.current = [];
    currentPathRef.current = '';
    setPaths([]);
    setCurrentPath('');
    onSave?.(null);
  };

  const hasSig = paths.length > 0 || currentPath.length > 0;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.pad} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%">
          {paths.map((p, i) => (
            <Path key={`${p}-${i}`} d={p} stroke="white" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {currentPath ? (
            <Path d={currentPath} stroke="white" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </Svg>
        {!hasSig ? (
          <View style={styles.placeholder} pointerEvents="none">
            <MaterialIcons name="draw" size={20} color="rgba(255,255,255,0.25)" />
            <Text style={styles.placeholderText}>Draw your signature here</Text>
          </View>
        ) : null}
      </View>
      {hasSig ? (
        <TouchableOpacity style={styles.clearBtn} onPress={clear}>
          <MaterialIcons name="refresh" size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pad: { flex: 1, position: 'relative' },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  placeholderText: { color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: '600' },
  clearBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700' },
});
