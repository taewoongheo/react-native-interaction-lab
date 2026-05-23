import React, { useCallback } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

type PressableScaleProps = {
  onPress?: () => void;
  minScale?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function PressableScale({
  children,
  onPress,
  style,
  minScale = 0.95,
  ...props
}: PressableScaleProps) {
  const onPressWrapper = useCallback(() => {
    return (onPress as any)?.();
  }, [onPress]);

  const scale = useSharedValue(1);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const tapGesture = Gesture.Tap()
    .maxDuration(5000)
    .onTouchesDown(() => {
      scale.value = withSpring(minScale, { overshootClamping: true });
    })
    .onTouchesUp(() => {
      scale.value = withSpring(1, { overshootClamping: true }, (isFinished) => {
        if (isFinished) runOnJS(onPressWrapper)();
      });
    })
    .onTouchesCancelled(() => {
      scale.value = withSpring(1, { overshootClamping: true });
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View {...props} style={[style, rStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
