import { useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const sqareWidth = 100;

export default function PanGestureHandler() {
  const { width, height } = useWindowDimensions();

  const translateX = useSharedValue(width / 2 - sqareWidth / 2);
  const translateY = useSharedValue(height / 2 - sqareWidth / 2);
  const context = useSharedValue({
    x: 0,
    y: 0,
  });

  const isDragging = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
      context.value = { x: translateX.value, y: translateY.value };
    })
    .onUpdate((event) => {
      translateX.value = context.value.x + event.translationX;
      translateY.value = context.value.y + event.translationY;
    })
    .onFinalize(() => {
      isDragging.value = false;
    });

  const rotate = useDerivedValue(() => {
    return withSpring(isDragging.value ? "45deg" : "0deg");
  });

  const scale = useDerivedValue(() => {
    return withSpring(isDragging.value ? 0.9 : 1);
  });

  const color = useDerivedValue(() => {
    if (isDragging.value) return "#0099ff";

    const isInTheWhiteSpace = translateY.value + sqareWidth / 2 < height / 2;
    const isInTheBlackSpace = translateY.value + sqareWidth / 2 > height / 2;
    if (isInTheWhiteSpace) {
      return "black";
    }
    if (isInTheBlackSpace) {
      return "white";
    }
    return "#0099ff";
  });

  const animatedColor = useDerivedValue(() => {
    return withTiming(color.value);
  });

  const rStyle = useAnimatedStyle(() => ({
    backgroundColor: animatedColor.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: rotate.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          position: "absolute",
          width: "100%",
          height: height / 2,
          backgroundColor: "white",
        }}
      />
      <View
        style={{
          flex: 1,
          position: "absolute",
          width: "100%",
          height: height / 2,
          top: height / 2,
          backgroundColor: "black",
        }}
      />
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              width: sqareWidth,
              height: sqareWidth,
              borderRadius: 20,
            },
            rStyle,
          ]}
        />
      </GestureDetector>
    </View>
  );
}
