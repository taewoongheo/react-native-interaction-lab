// @ts-nocheck
import { memo, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector, type PanGesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { WithSpringConfig } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { HANDLE_HEIGHT, SCREEN_HEIGHT, parseSnapPoint, triggerHaptic } from './bottom-sheet';

// --- Types ---

type SnapPoint = number | `${number}%`;

interface ExpandableBottomSheetMethods {
  snapToIndex: (index: number) => void;
  snapToPosition: (position: number) => void;
  expand: () => void;
  collapse: () => void;
  close: () => void;
  getCurrentIndex: () => number;
}

interface ExpandableBottomSheetProps {
  children: React.ReactNode;
  snapPoints: readonly [...SnapPoint[]];
  readonly ref?: React.Ref<ExpandableBottomSheetMethods>;
  readonly enableBackdrop?: boolean;
  readonly backdropOpacity?: number;
  readonly dismissOnBackdropPress?: boolean;
  readonly dismissOnSwipeDown?: boolean;
  readonly onSnapPointChange?: (index: number) => void;
  readonly onClose?: () => void;
  readonly springConfig?: WithSpringConfig;
  readonly sheetStyle?: StyleProp<ViewStyle>;
  readonly backdropStyle?: StyleProp<ViewStyle>;
  readonly handleStyle?: StyleProp<ViewStyle>;
  readonly showHandle?: boolean;
  readonly enableOverDrag?: boolean;
  readonly enableHapticFeedback?: boolean;
  readonly snapVelocityThreshold?: number;
  readonly backgroundColor?: string;
  readonly borderRadius?: number;
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
  readonly expandedTopOffset?: number;
  readonly expandedSideMargin?: number;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly enableDynamicSizing?: boolean;
}

// --- Constants ---

const DEFAULT_SPRING_CONFIG: WithSpringConfig = {
  damping: 50,
  stiffness: 400,
  mass: 0.8,
  overshootClamping: false,
};

const DEFAULT_TIMING_CONFIG = {
  duration: 250,
};

const SCROLL_TOP_THRESHOLD = 1;
const EXPANDED_TOP_OFFSET = 8;
const EXPANDED_SIDE_MARGIN = 14;
const MAX_DYNAMIC_HEIGHT_RATIO = 0.9;

// --- Component ---

const ExpandableBottomSheet = memo(function ExpandableBottomSheet({
  children,
  snapPoints,
  ref,
  enableBackdrop = true,
  backdropOpacity = 0.5,
  dismissOnBackdropPress = true,
  dismissOnSwipeDown = true,
  onSnapPointChange,
  onClose,
  springConfig = DEFAULT_SPRING_CONFIG,
  sheetStyle,
  backdropStyle,
  handleStyle,
  showHandle = true,
  enableOverDrag = true,
  enableHapticFeedback = true,
  snapVelocityThreshold = 500,
  backgroundColor = '#FFFFFF',
  borderRadius = 24,
  contentContainerStyle,
  expandedTopOffset = EXPANDED_TOP_OFFSET,
  expandedSideMargin = EXPANDED_SIDE_MARGIN,
  onExpandedChange,
  enableDynamicSizing = false,
}: ExpandableBottomSheetProps) {
  const insets = useSafeAreaInsets();

  const parsedSnapPoints = useMemo<number[]>(() => snapPoints.map(parseSnapPoint), [snapPoints]);

  const [contentHeight, setContentHeight] = useState<number>(0);

  const effectiveSnapPoints = useMemo<number[]>(() => {
    if (!enableDynamicSizing || contentHeight <= 0) {
      return parsedSnapPoints;
    }
    const totalHeight = contentHeight + (showHandle ? HANDLE_HEIGHT : 0);
    const maxHeight = SCREEN_HEIGHT * MAX_DYNAMIC_HEIGHT_RATIO;
    return [Math.min(totalHeight, maxHeight)];
  }, [enableDynamicSizing, contentHeight, parsedSnapPoints, showHandle]);

  const expandedHeight = useMemo<number>(
    () => SCREEN_HEIGHT - insets.top - expandedTopOffset,
    [insets.top, expandedTopOffset],
  );

  // Internal snap points: effective (user-defined or measured) + expanded
  const internalSnapPoints = useMemo<number[]>(
    () => [...effectiveSnapPoints, expandedHeight],
    [effectiveSnapPoints, expandedHeight],
  );

  const maxSnapPoint = useMemo<number>(() => Math.max(...internalSnapPoints), [internalSnapPoints]);

  const minSnapPoint = useMemo<number>(() => Math.min(...internalSnapPoints), [internalSnapPoints]);

  const maxSnapIndex = useMemo<number>(() => internalSnapPoints.length - 1, [internalSnapPoints]);

  // User-defined max snap index (before expanded point)
  const userMaxSnapIndex = useMemo<number>(
    () => effectiveSnapPoints.length - 1,
    [effectiveSnapPoints],
  );

  const translateY = useSharedValue<number>(SCREEN_HEIGHT);
  const currentSnapIndex = useSharedValue<number>(-1);
  const context = useSharedValue<number>(0);
  const scrollY = useSharedValue<number>(0);
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

  const isDraggingSheet = useSharedValue<boolean>(false);
  const isScrollLocked = useSharedValue<boolean>(false);
  const gestureStartScrollY = useSharedValue<number>(0);
  const isExpanded = useSharedValue<boolean>(false);

  const [enableScroll, setEnableScroll] = useState<boolean>(false);

  const handleSnapPointChangeJS = useCallback(
    (index: number) => {
      if (enableHapticFeedback) {
        triggerHaptic();
      }
      onSnapPointChange?.(index);
    },
    [onSnapPointChange, enableHapticFeedback],
  );

  const handleExpandedChangeJS = useCallback(
    (expanded: boolean) => {
      if (enableHapticFeedback) {
        triggerHaptic();
      }
      onExpandedChange?.(expanded);
    },
    [onExpandedChange, enableHapticFeedback],
  );

  const handleCloseJS = useCallback(() => {
    if (enableHapticFeedback) {
      triggerHaptic();
    }
    onClose?.();
  }, [onClose, enableHapticFeedback]);

  const updateScrollEnabled = useCallback((enabled: boolean) => {
    setEnableScroll(enabled);
  }, []);

  const findClosestSnapPoint = useCallback(
    (currentY: number, velocity: number): number => {
      'worklet';

      const height = SCREEN_HEIGHT - currentY;

      if (Math.abs(velocity) > snapVelocityThreshold) {
        const direction = velocity > 0 ? -1 : 1;
        const currentIndex = currentSnapIndex.value;
        const nextIndex = currentIndex + direction;

        if (nextIndex >= 0 && nextIndex < internalSnapPoints.length) {
          return nextIndex;
        }
      }

      let closestIndex = 0;
      let minDistance = Math.abs(height - internalSnapPoints[0]);

      for (let i = 1; i < internalSnapPoints.length; i++) {
        const distance = Math.abs(height - internalSnapPoints[i]);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      return closestIndex;
    },
    [internalSnapPoints, snapVelocityThreshold, currentSnapIndex.value],
  );

  const snapToPoint = useCallback(
    (index: number, animated = true) => {
      'worklet';

      if (index < 0 || index >= internalSnapPoints.length) {
        return;
      }

      const targetY = SCREEN_HEIGHT - internalSnapPoints[index];

      if (animated) {
        translateY.value = withSpring(targetY, springConfig);
      } else {
        translateY.value = targetY;
      }

      currentSnapIndex.value = index;

      // Enable scroll only at expanded state
      const shouldEnableScroll = index > userMaxSnapIndex;
      isScrollLocked.value = !shouldEnableScroll;
      scheduleOnRN<[boolean], void>(updateScrollEnabled, shouldEnableScroll);

      // Track expanded state and fire appropriate callbacks
      const isExpandedIndex = index === internalSnapPoints.length - 1;
      const wasExpanded = isExpanded.value;
      isExpanded.value = isExpandedIndex;

      if (isExpandedIndex !== wasExpanded && onExpandedChange) {
        scheduleOnRN<[boolean], void>(handleExpandedChangeJS, isExpandedIndex);
      }

      // Only fire onSnapPointChange for user-defined snap points
      if (!isExpandedIndex && onSnapPointChange) {
        scheduleOnRN<[number], void>(handleSnapPointChangeJS, index);
      }
    },
    [
      internalSnapPoints,
      springConfig,
      translateY,
      currentSnapIndex,
      userMaxSnapIndex,
      isScrollLocked,
      isExpanded,
      onExpandedChange,
      onSnapPointChange,
      handleSnapPointChangeJS,
      handleExpandedChangeJS,
      updateScrollEnabled,
    ],
  );

  const closeSheet = useCallback(() => {
    'worklet';
    isScrollLocked.value = true;
    scheduleOnRN<[boolean], void>(updateScrollEnabled, false);

    if (isExpanded.value && onExpandedChange) {
      isExpanded.value = false;
      scheduleOnRN<[boolean], void>(handleExpandedChangeJS, false);
    }

    translateY.value = withTiming<number>(SCREEN_HEIGHT, DEFAULT_TIMING_CONFIG, (finished) => {
      if (finished) {
        currentSnapIndex.value = -1;
        scrollTo<Animated.ScrollView>(scrollViewRef, 0, 0, false);
        scrollY.value = 0;
        if (onClose) {
          scheduleOnRN<[], void>(handleCloseJS);
        }
      }
    });
  }, [
    translateY,
    handleCloseJS,
    handleExpandedChangeJS,
    scrollViewRef,
    scrollY,
    isScrollLocked,
    isExpanded,
    onExpandedChange,
    updateScrollEnabled,
    onClose,
    currentSnapIndex,
  ]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      scrollY.value = event.contentOffset.y;
    },
  });

  const handlePanGesture = useMemo<PanGesture>(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          'worklet';
          context.value = translateY.value;
          isDraggingSheet.value = true;
        })
        .onUpdate((event) => {
          'worklet';
          const newY = context.value + event.translationY;
          const minY = SCREEN_HEIGHT - maxSnapPoint;
          const maxY = SCREEN_HEIGHT;

          if (enableOverDrag) {
            if (newY < minY) {
              const overDrag = minY - newY;
              translateY.value = minY - Math.log(overDrag + 1) * 10;
            } else if (newY > maxY) {
              const overDrag = newY - maxY;
              translateY.value = maxY + Math.log(overDrag + 1) * 10;
            } else {
              translateY.value = newY;
            }
          } else {
            translateY.value = Math.max(minY, Math.min(maxY, newY));
          }
        })
        .onEnd((event) => {
          'worklet';
          isDraggingSheet.value = false;
          const currentY = translateY.value;
          const velocity = event.velocityY;

          if (dismissOnSwipeDown && currentY > SCREEN_HEIGHT - minSnapPoint && velocity > 500) {
            closeSheet();
            return;
          }

          const closestIndex = findClosestSnapPoint(currentY, velocity);
          snapToPoint(closestIndex, true);
        }),
    [
      translateY,
      context,
      isDraggingSheet,
      enableOverDrag,
      maxSnapPoint,
      minSnapPoint,
      dismissOnSwipeDown,
      closeSheet,
      findClosestSnapPoint,
      snapToPoint,
    ],
  );

  const contentPanGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-10, 10])
        .onStart(() => {
          'worklet';
          context.value = translateY.value;
          gestureStartScrollY.value = scrollY.value;
          isDraggingSheet.value = false;
        })
        .onUpdate((event) => {
          'worklet';
          const isFullyExpanded = currentSnapIndex.value === maxSnapIndex;

          if (!isFullyExpanded) {
            isDraggingSheet.value = true;
            const newY = context.value + event.translationY;
            const minY = SCREEN_HEIGHT - maxSnapPoint;
            const maxY = SCREEN_HEIGHT;

            if (newY < minY) {
              translateY.value = enableOverDrag ? minY - Math.log(minY - newY + 1) * 10 : minY;
            } else if (newY > maxY) {
              translateY.value = enableOverDrag ? maxY + Math.log(newY - maxY + 1) * 10 : maxY;
            } else {
              translateY.value = newY;
            }
            return;
          }

          const isAtTop = scrollY.value <= SCROLL_TOP_THRESHOLD;
          const isDraggingDown = event.translationY > 0;
          const wasAtTopAtStart = gestureStartScrollY.value <= SCROLL_TOP_THRESHOLD;

          const shouldDragSheet =
            isDraggingSheet.value || (isAtTop && isDraggingDown && wasAtTopAtStart);

          if (!shouldDragSheet) {
            return;
          }

          isDraggingSheet.value = true;

          const effectiveTranslation = event.translationY;
          const newY = context.value + effectiveTranslation;
          const minY = SCREEN_HEIGHT - maxSnapPoint;
          const maxY = SCREEN_HEIGHT;

          if (newY < minY) {
            translateY.value = enableOverDrag ? minY - Math.log(minY - newY + 1) * 10 : minY;
          } else if (newY > maxY) {
            translateY.value = enableOverDrag ? maxY + Math.log(newY - maxY + 1) * 10 : maxY;
          } else {
            translateY.value = newY;
          }
        })
        .onEnd((event) => {
          'worklet';

          if (isDraggingSheet.value) {
            const currentY = translateY.value;
            const velocity = event.velocityY;

            if (dismissOnSwipeDown && currentY > SCREEN_HEIGHT - minSnapPoint && velocity > 500) {
              closeSheet();
            } else {
              const closestIndex = findClosestSnapPoint(currentY, velocity);
              snapToPoint(closestIndex, true);
            }
          }

          isDraggingSheet.value = false;
        })
        .onFinalize(() => {
          'worklet';
          isDraggingSheet.value = false;
        }),
    [
      translateY,
      context,
      scrollY,
      gestureStartScrollY,
      isDraggingSheet,
      currentSnapIndex,
      maxSnapIndex,
      enableOverDrag,
      maxSnapPoint,
      minSnapPoint,
      dismissOnSwipeDown,
      closeSheet,
      findClosestSnapPoint,
      snapToPoint,
    ],
  );

  const scrollViewGesture = useMemo(() => Gesture.Native(), []);

  const simultaneousGesture = useMemo(
    () => Gesture.Simultaneous(scrollViewGesture, contentPanGesture),
    [scrollViewGesture, contentPanGesture],
  );

  useImperativeHandle(
    ref,
    () => ({
      snapToIndex: (index: number) => {
        snapToPoint(index, true);
      },
      snapToPosition: (position: number) => {
        'worklet';
        const targetY = SCREEN_HEIGHT - position;
        translateY.value = withSpring(targetY, springConfig);
      },
      expand: () => {
        snapToPoint(maxSnapIndex, true);
      },
      collapse: () => {
        snapToPoint(0, true);
      },
      close: () => {
        closeSheet();
      },
      getCurrentIndex: () => {
        return currentSnapIndex.value;
      },
    }),
    [snapToPoint, closeSheet, maxSnapIndex, springConfig, translateY, currentSnapIndex],
  );

  // Detach interpolation boundaries
  const expandedY = useMemo(() => SCREEN_HEIGHT - expandedHeight, [expandedHeight]);
  const userMaxY = useMemo(
    () => SCREEN_HEIGHT - Math.max(...effectiveSnapPoints),
    [effectiveSnapPoints],
  );

  // Detach visual effect:
  // detachProgress = 0 at expanded (full width), 1 at/below user max snap (detached card)
  const sheetAnimatedStyle = useAnimatedStyle(() => {
    const visibleHeight = SCREEN_HEIGHT - translateY.value;

    if (visibleHeight <= 0) {
      return {
        transform: [{ translateY: translateY.value }],
        height: 0,
        opacity: 0,
      };
    }

    const detachProgress = interpolate(
      translateY.value,
      [expandedY, userMaxY],
      [0, 1],
      Extrapolation.CLAMP,
    );

    const sheetHeight = Math.max(0, visibleHeight - detachProgress * expandedSideMargin);
    const borderProgress = interpolate(detachProgress, [0, 1], [1.35, 1], Extrapolation.CLAMP);

    return {
      transform: [{ translateY: translateY.value }],
      left: detachProgress * expandedSideMargin,
      right: detachProgress * expandedSideMargin,
      height: sheetHeight,
      borderBottomLeftRadius: borderProgress * borderRadius,
      borderBottomRightRadius: borderProgress * borderRadius,
      opacity: 1,
    };
  });

  const contentAnimatedStyle = useAnimatedStyle<Pick<ViewStyle, 'height'>>(() => {
    const visibleHeight = SCREEN_HEIGHT - translateY.value;

    const detachProgress = interpolate(
      translateY.value,
      [expandedY, userMaxY],
      [0, 1],
      Extrapolation.CLAMP,
    );

    const sheetHeight = Math.max(0, visibleHeight - detachProgress * expandedSideMargin);
    const contentHeight = Math.max(0, sheetHeight - (showHandle ? HANDLE_HEIGHT : 0));

    return {
      height: contentHeight,
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle<Pick<ViewStyle, 'opacity' | 'pointerEvents'>>(
    () => {
      const opacity = interpolate(
        translateY.value,
        [SCREEN_HEIGHT - minSnapPoint, SCREEN_HEIGHT],
        [backdropOpacity, 0],
        Extrapolation.CLAMP,
      );

      return {
        opacity,
        pointerEvents: opacity > 0 ? ('auto' as const) : ('none' as const),
      };
    },
  );

  const handleBackdropPress = useCallback(() => {
    if (dismissOnBackdropPress) {
      closeSheet();
    }
  }, [dismissOnBackdropPress, closeSheet]);

  const sheetBaseStyle = useMemo<
    Pick<ViewStyle, 'backgroundColor' | 'borderTopLeftRadius' | 'borderTopRightRadius'>
  >(
    () => ({
      backgroundColor,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    }),
    [backgroundColor, borderRadius],
  );

  const handleContentLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (enableDynamicSizing) {
        const { height } = event.nativeEvent.layout;
        setContentHeight(height);
      }
    },
    [enableDynamicSizing],
  );

  const renderContent = useCallback(() => {
    return (
      <GestureDetector gesture={simultaneousGesture}>
        <Animated.ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={contentContainerStyle}
          scrollEnabled={enableScroll}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={true}
          bounces={false}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          overScrollMode="never"
        >
          <View onLayout={handleContentLayout}>{children}</View>
        </Animated.ScrollView>
      </GestureDetector>
    );
  }, [
    children,
    simultaneousGesture,
    scrollViewRef,
    contentContainerStyle,
    enableScroll,
    onScroll,
    handleContentLayout,
  ]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {enableBackdrop && (
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={handleBackdropPress} />
        </Animated.View>
      )}

      <Animated.View style={[styles.sheet, sheetBaseStyle, sheetAnimatedStyle, sheetStyle]}>
        {showHandle && (
          <GestureDetector gesture={handlePanGesture}>
            <View style={styles.handleContainer}>
              <View style={[styles.handle, handleStyle]} />
            </View>
          </GestureDetector>
        )}

        <Animated.View style={[styles.contentWrapper, contentAnimatedStyle]}>
          {renderContent()}
        </Animated.View>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    // No static height — animated style provides dynamic height
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  contentWrapper: {
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
});

export { ExpandableBottomSheet };
export type { ExpandableBottomSheetMethods, ExpandableBottomSheetProps };
