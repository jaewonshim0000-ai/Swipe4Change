import React, { useState, useRef } from 'react';
import { View, PanResponder, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function SignaturePad({ onSave, initialPath, height = 160 }) {
  const [paths, setPaths] = useState(initialPath ? [initialPath] : []);
  const [currentPath, setCurrentPath] = useState('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setCurrentPath(`M${locationX.toFixed(1)},${locationY.toFixed(1)}`);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setCurrentPath((p) => `${p} L${locationX.toFixed(1)},${locationY.toFixed(1)}`);
      },
      onPanResponderRelease: () => {
        if (currentPath) {
          const all = [...paths, currentPath];
          setPaths(all);
          setCurrentPath('');
          if (onSave) onSave(all.join(' '));
        }
      },
    })
  ).current;

  const clear = () => {
    setPaths([]);
    setCurrentPath('');
    if (onSave) onSave(null);
  };

  const hasSig = paths.length > 0 || currentPath.length > 0;

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.pad} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%">
          {paths.map((p, i) => (
            <Path key={i} d={p} stroke="white" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {currentPath ? (
            <Path d={currentPath} stroke="white" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </Svg>
        {!hasSig && (
          <View style={styles.placeholder} pointerEvents="none">
            <MaterialIcons name="draw" size={20} color="rgba(255,255,255,0.25)" />
            <Text style={styles.placeholderText}>Draw your signature here</Text>
          </View>
        )}
      </View>
      {hasSig && (
        <TouchableOpacity style={styles.clearBtn} onPress={clear}>
          <MaterialIcons name="refresh" size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  pad: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, borderStyle: 'dashed',
    overflow: 'hidden',
  },
  placeholder: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  placeholderText: { color: 'rgba(255,255,255,0.25)', fontSize: 12, fontWeight: '600' },
  clearBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  clearText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600' },
});
