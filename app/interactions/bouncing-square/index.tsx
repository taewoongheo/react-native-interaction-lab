import { Button, Dimensions, Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function BouncingSquare() {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Animated.View
        onTouchStart={() => {
          scale.value = withSpring(1.2);
        }}
        onTouchEnd={() => {
          scale.value = withSpring(1);
          rotate.value = withSpring(rotate.value + 90);
        }}
        style={[
          style,
          {
            width: 100,
            height: 100,
            backgroundColor: "skyblue",
            borderRadius: 20,
          },
        ]}
      />
      <Pressable
        onPress={() => {
          const MaxTranslationAmount = 100;

          translateX.value = withSpring(
            Math.random() * MaxTranslationAmount * 2 - MaxTranslationAmount,
          );
          translateY.value = withSpring(
            Math.random() * MaxTranslationAmount * 2 - MaxTranslationAmount,
          );
        }}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text
          style={{ color: "white", padding: 10, fontWeight: 600, fontSize: 18 }}
        >
          move
        </Text>
      </Pressable>
    </View>
  );
}
