import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";

const circleSize = 100;

export default function SpatialTapGesture() {
  const left = useSharedValue(0);
  const top = useSharedValue(0);
  const scale = useSharedValue(0);

  const prevLeft = useSharedValue(0);
  const prevTop = useSharedValue(0);

  useAnimatedReaction(
    () => {
      return left.value;
    },
    (cur, prev) => {
      if (cur !== prev && cur !== 0) {
        cancelAnimation(scale);
        scale.value = 0;
        scale.value = withSpring(1, { mass: 0.5 });
      }
    },
  );

  const tapGesture = Gesture.Tap().onBegin((e) => {
    prevLeft.value = left.value;
    prevTop.value = top.value;

    left.value = e.x - circleSize / 2;
    top.value = e.y - circleSize / 2;
  });

  // main circle
  const animatedLeft = useDerivedValue(() => {
    return withTiming(left.value, {
      duration: 1000,
      easing: Easing.inOut(Easing.quad),
    });
  });

  const animatedTop = useDerivedValue(() => {
    return withTiming(top.value, {
      duration: 1000,
      easing: Easing.inOut(Easing.quad),
    });
  });

  const mainCircleStyle = useAnimatedStyle(() => ({
    left: animatedLeft.value,
    top: animatedTop.value,
  }));

  // sub circle
  const sStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const currentSubStyle = useAnimatedStyle(() => ({
    left: left.value,
    top: top.value,
  }));

  const prevSubStyle = useAnimatedStyle(() => ({
    left: prevLeft.value,
    top: prevTop.value,
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <View style={{ flex: 1 }}>
        <Animated.View
          style={[
            {
              position: "absolute",
              height: circleSize,
              width: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: "gray",
            },
            sStyle,
            currentSubStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              position: "absolute",
              height: circleSize,
              width: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: "gray",
            },
            prevSubStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              position: "absolute",
              height: circleSize,
              width: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: "skyblue",
            },
            mainCircleStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}
