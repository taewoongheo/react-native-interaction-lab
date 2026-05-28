import { useCallback, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Image } from './image';
import { Layout } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CylinderCarouselProps {
  /** Array of image URIs */
  data: string[];
  /** Width of each card */
  cardWidth?: number;
  /** Height of each card */
  cardHeight?: number;
  /** Card border radius */
  cardRadius?: number;
  /** Gap between cards in pixels */
  gap?: number;
  /** Controlled active (centered) index */
  activeIndex?: number;
  /** Called when the centered item changes */
  onIndexChange?: (index: number) => void;
}

// Arc geometry — tune these two to control the 3D feel
const ANGLE_PER_ITEM = 20; // degrees between adjacent cards on the arc
const PERSPECTIVE = 400; // camera distance — affects 3D tilt and scale falloff

const ANGLE_PER_ITEM_RAD = (ANGLE_PER_ITEM * Math.PI) / 180;
const MAX_ANGLE_RAD = Math.PI / 2; // clamp at 90° to prevent sin wrap-around
const SNAP_SPRING = { damping: 20, stiffness: 150 };

/**
 * Horizontal carousel with cards on a 3D arc surface.
 *
 * All transforms derived from arc geometry — no hardcoded interpolation:
 * - arcRadius = itemSpacing / anglePerItemRad
 * - translateX = arcRadius × sin(angle)
 * - scale = perspective / (perspective + arcZ)
 * - rotateY = tangent to the arc = -angle
 */
export function CylinderCarousel({
  data,
  cardWidth = SCREEN_WIDTH * 0.4,
  cardHeight = cardWidth * 1.4,
  cardRadius = Layout.radiusLg,
  gap = 0,
  activeIndex,
  onIndexChange,
}: CylinderCarouselProps) {
  const itemCount = data.length;
  const itemSpacing = cardWidth + gap;
  const maxScroll = Math.max(0, (itemCount - 1) * itemSpacing);
  // Derive arc radius so adjacent cards are ~itemSpacing apart near center
  const arcRadius = itemSpacing / ANGLE_PER_ITEM_RAD;

  const scrollX = useSharedValue((activeIndex ?? 0) * itemSpacing);
  const savedScrollX = useSharedValue(0);
  const currentIdx = useRef(activeIndex ?? 0);

  const reportIndex = useCallback(
    (idx: number) => {
      currentIdx.current = idx;
      onIndexChange?.(idx);
    },
    [onIndexChange],
  );

  // Controlled activeIndex
  useEffect(() => {
    if (activeIndex === undefined || activeIndex === currentIdx.current) return;
    currentIdx.current = activeIndex;
    scrollX.value = withSpring(activeIndex * itemSpacing, SNAP_SPRING);
  }, [activeIndex, itemSpacing, scrollX]);

  const snapTo = (targetScroll: number) => {
    'worklet';
    const idx = Math.round(targetScroll / itemSpacing);
    const clamped = Math.max(0, Math.min(idx, itemCount - 1));
    scrollX.value = withSpring(clamped * itemSpacing, SNAP_SPRING);
    scheduleOnRN(reportIndex, clamped);
  };

  const tapGesture = Gesture.Tap().onEnd((e) => {
    'worklet';
    const tappedIdx = Math.round((e.x - SCREEN_WIDTH / 2 + scrollX.value) / itemSpacing);
    const clamped = Math.max(0, Math.min(tappedIdx, itemCount - 1));
    scrollX.value = withSpring(clamped * itemSpacing, SNAP_SPRING);
    scheduleOnRN(reportIndex, clamped);
  });

  const panGesture = Gesture.Pan()
    .minDistance(5)
    .onStart(() => {
      'worklet';
      cancelAnimation(scrollX);
      savedScrollX.value = scrollX.value;
    })
    .onUpdate((e) => {
      'worklet';
      const next = savedScrollX.value - e.translationX;
      if (next < 0) {
        scrollX.value = next * 0.3;
      } else if (next > maxScroll) {
        scrollX.value = maxScroll + (next - maxScroll) * 0.3;
      } else {
        scrollX.value = next;
      }
    })
    .onEnd((e) => {
      'worklet';
      snapTo(scrollX.value - e.velocityX * 0.1);
    });

  const gesture = Gesture.Race(tapGesture, panGesture);

  const renderItem = useCallback(
    (uri: string, index: number) => (
      <CarouselCard
        key={uri}
        uri={uri}
        index={index}
        scrollX={scrollX}
        itemSpacing={itemSpacing}
        arcRadius={arcRadius}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        cardRadius={cardRadius}
      />
    ),
    [itemSpacing, arcRadius, cardWidth, cardHeight, cardRadius, scrollX],
  );

  if (itemCount === 0) return null;

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.container, { height: cardHeight }]}>{data.map(renderItem)}</View>
    </GestureDetector>
  );
}

interface CarouselCardProps {
  uri: string;
  index: number;
  scrollX: SharedValue<number>;
  itemSpacing: number;
  arcRadius: number;
  cardWidth: number;
  cardHeight: number;
  cardRadius: number;
}

function CarouselCard({
  uri,
  index,
  scrollX,
  itemSpacing,
  arcRadius,
  cardWidth,
  cardHeight,
  cardRadius,
}: CarouselCardProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const normalizedOffset = (index * itemSpacing - scrollX.value) / itemSpacing;

    // Clamp angle to ±90° to prevent sin wrap-around at extremes
    const angleRad = Math.max(
      -MAX_ANGLE_RAD,
      Math.min(normalizedOffset * ANGLE_PER_ITEM_RAD, MAX_ANGLE_RAD),
    );

    // Accumulated projected-width loss: each card's cos-shrinkage compounds
    const absN = Math.abs(normalizedOffset);
    const extra = Math.sign(angleRad) * absN * cardWidth * (1 - Math.cos(angleRad)) * 0.35;
    const translateX = arcRadius * Math.sin(angleRad) - extra;
    // Depth: how far behind the arc center
    const arcZ = arcRadius * (1 - Math.cos(angleRad));
    // Perspective-based scale (simulates Z depth)
    const scale = PERSPECTIVE / (PERSPECTIVE + arcZ);
    // Dampen rotation for far items to preserve visible card width
    const rotationDamping = 1 + 0.1 * normalizedOffset * normalizedOffset;
    const rotateY = ((angleRad / rotationDamping) * 180) / Math.PI;

    const opacity = interpolate(
      Math.abs(normalizedOffset),
      [0, 2, 3],
      [1, 1, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      zIndex: Math.round(100 - Math.abs(normalizedOffset) * 10),
      transform: [
        { perspective: PERSPECTIVE },
        { translateX },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
    } as ViewStyle;
  });

  return (
    <Animated.View style={[styles.card, { width: cardWidth, height: cardHeight }, animatedStyle]}>
      <Image
        source={{ uri }}
        radius="none"
        style={{ width: cardWidth, height: cardHeight, borderRadius: cardRadius }}
        contentFit="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
  },
});
