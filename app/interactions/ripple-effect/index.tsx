import React from 'react';
import {StyleSheet} from 'react-native';
import {
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {Canvas, Circle} from '@shopify/react-native-skia';

const DIAMETER = 100;
const EXPANSION_DURATION = 400;

const RippleEffect = () => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const r = useSharedValue(0);
  const opacity = useSharedValue(1);

  // flag
  const isAnimationRunning = useSharedValue(false);

  const tap = Gesture.Tap().onStart(e => {
    if (isAnimationRunning.value) {
      return;
    }
    isAnimationRunning.value = true;

    x.value = e.x;
    y.value = e.y;

    r.value = withSequence(
      withTiming(DIAMETER * 4, {duration: EXPANSION_DURATION}),
      withTiming(0, {duration: 0}),
    );
    opacity.value = withSequence(
      withTiming(0, {duration: EXPANSION_DURATION}),
      withTiming(1, {duration: 0}, () => {
        isAnimationRunning.value = false;
      }),
    );
  });

  return (
    <GestureDetector gesture={tap}>
      <Canvas style={styles.canvas}>
        <Circle cx={x} cy={y} r={r} opacity={opacity} />
      </Canvas>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
});

export default RippleEffect;
