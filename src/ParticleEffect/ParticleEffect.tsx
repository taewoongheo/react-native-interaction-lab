import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {Canvas} from '@shopify/react-native-skia';
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  TapGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';
import {PanGestureHandlerEventPayload} from 'react-native-screens';
import Particle from './Particle';
import Vector from './Vector';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

// poisson disk sampling
const poissonDiskSampling = () => {
  const r = 19; // min distance between particles
  const k = 30; // max number of attempts to find a valid sample
  const w = r / Math.sqrt(2); // grid cell size
  const grid = [];
  const active = [];

  const centerVector = new Vector(width / 2, height / 2);
  const maxThreshold = 150;
  const minThreshold = 20;

  // initialize grid cell
  const colCnt = Math.floor(width / w);
  const rowCnt = Math.floor(height / w);
  for (let i = 0; i < colCnt * rowCnt; i++) {
    grid[i] = undefined;
  }

  // start with random point
  const x = width / 2 + minThreshold;
  const y = height / 2 + minThreshold;
  const colIdx = Math.floor(x / w);
  const rowIdx = Math.floor(y / w);
  const pos = new Vector(x, y);
  grid[colIdx + rowIdx * colCnt] = pos;
  active.push(pos);

  while (active.length > 0) {
    // select random point from active list
    const randIdx = Math.floor(Math.random() * active.length);
    const basePos = active[randIdx];
    let found = false;

    // attempt n times to find a valid sample
    for (let n = 0; n < k; n++) {
      // generate random vector
      const sample = Vector.random2D();
      const randMagnitude = r + Math.random() * r; // r~2r range
      sample.setMagnitude(randMagnitude);
      sample.addVector(basePos);

      const col = Math.floor(sample.x / w);
      const row = Math.floor(sample.y / w);

      const distFromCenter = Vector.dist(sample, centerVector);

      if (
        col < 0 ||
        col >= colCnt ||
        row < 0 ||
        row >= rowCnt ||
        grid[col + row * colCnt] ||
        distFromCenter > maxThreshold ||
        distFromCenter < minThreshold
      ) {
        continue;
      }

      const remainDistance = maxThreshold - distFromCenter;
      let currentR = Math.max(1, remainDistance * 0.2);

      let neighborDistOk = true;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const neighborColIdx = col + i;
          const neighborRowIdx = row + j;

          if (
            neighborColIdx < 0 ||
            neighborColIdx >= colCnt ||
            neighborRowIdx < 0 ||
            neighborRowIdx >= rowCnt
          ) {
            continue;
          }

          const neighborGridIdx = neighborColIdx + neighborRowIdx * colCnt;
          const neighborPos = grid[neighborGridIdx];
          if (neighborPos === undefined) {
            continue;
          }

          const distFromNeighbor = Vector.dist(sample, neighborPos);
          if (distFromNeighbor < currentR) {
            neighborDistOk = false;
            break;
          }
        }
        if (!neighborDistOk) {
          break;
        }
      }
      if (neighborDistOk) {
        found = true;
        grid[col + row * colCnt] = sample;
        active.push(sample);
        break;
      }
    }
    // tried n times, but failed to find a valid sample
    if (!found) {
      active.splice(randIdx, 1);
    }
  }

  // add edge particles
  for (let i = 0; i < 360; i += 3) {
    const vector = new Vector(Math.cos(i), Math.sin(i));
    vector.setMagnitude(maxThreshold);
    vector.addVector(centerVector);

    const randomOffsetX = Math.random() * 6;
    const randomOffsetY = Math.random() * 6;
    vector.x += randomOffsetX;
    vector.y += randomOffsetY;

    grid.push(vector);
  }

  return grid;
};

function ParticleEffect(): React.JSX.Element {
  const particles = poissonDiskSampling();
  const touchX = useSharedValue(0);
  const touchY = useSharedValue(0);
  const isTouching = useSharedValue(false);

  const handleTouch = (
    e:
      | GestureUpdateEvent<PanGestureHandlerEventPayload>
      | GestureUpdateEvent<TapGestureHandlerEventPayload>,
  ) => {
    'worklet';
    touchX.value = e.x;
    touchY.value = e.y;
    isTouching.value = true;
  };

  const tap = Gesture.Tap()
    .onStart(e => handleTouch(e))
    .onEnd(() => {
      'worklet';
      isTouching.value = false;
    });

  const pan = Gesture.Pan()
    .onBegin(e => {
      handleTouch(e);
    })
    .onUpdate(e => {
      handleTouch(e);
    })
    .onEnd(() => {
      'worklet';
      isTouching.value = false;
    });

  const combinedGesture = Gesture.Race(tap, pan);

  return (
      <GestureDetector gesture={combinedGesture}>
        <Canvas style={styles.container}>
          {particles.map(particle => {
            if (!particle) {
              return null;
            }
            const particleColor = Math.random() * 170;
            return (
              <Particle
                key={`${particle.x}-${particle.y}`}
                centerX={particle.x}
                centerY={particle.y}
                radius={Math.random() * 0.5 + 0.8}
                color={`rgb(${particleColor}, ${particleColor}, ${particleColor})`}
                touchX={touchX}
                touchY={touchY}
                isTouching={isTouching}
              />
            );
          })}
        </Canvas>
      </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
});

export default ParticleEffect;
