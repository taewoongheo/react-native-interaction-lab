import { FontAwesome } from "@expo/vector-icons";
import {
  Canvas,
  SweepGradient,
  Text,
  useFont,
  vec,
} from "@shopify/react-native-skia";
import { Dimensions, Pressable, View } from "react-native";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const nunitoBold = require("../../../assets/fonts/Nunito-Bold.ttf");

const { width, height } = Dimensions.get("window");

export default function AnimatedText() {
  const fontSize = 50;
  const count = useSharedValue(0);
  const font = useFont(nunitoBold, fontSize);

  const countString = useDerivedValue(() => {
    return Math.floor(count.value).toString();
  }, [count]);

  const x = useDerivedValue(() => {
    const textWidth = font?.measureText(countString.value).width ?? 0;
    return width / 2 - textWidth / 2;
  }, [countString]);

  const y = useDerivedValue(() => {
    return height / 2;
  }, [countString]);

  const c = useDerivedValue(() => {
    return vec(width / 2, y.value - fontSize / 2);
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
      }}
    >
      <Canvas style={{ width, height }}>
        <Text x={x} y={y} text={countString} font={font}>
          <SweepGradient
            c={c}
            colors={["#FF0080", "#FF8C00", "#00FFCC", "#FF0080"]}
          />
        </Text>
      </Canvas>
      <Pressable
        onPress={() => {
          count.value = withTiming(Math.random() * 100, {
            duration: 1000,
          });
        }}
        style={{
          position: "absolute",
          bottom: 50,
          right: 30,
          padding: 20,
          backgroundColor: "lightgray",
          borderRadius: 20,
        }}
      >
        <FontAwesome name="refresh" size={24} color="black" />
      </Pressable>
    </View>
  );
}
