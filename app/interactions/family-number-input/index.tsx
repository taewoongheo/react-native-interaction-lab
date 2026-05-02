import { Dispatch, SetStateAction, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { LinearGradient } from "expo-linear-gradient";

const SCREEN_W = Dimensions.get("window").width;
const H_PADDING = 40;
const COL_GAP = 28;
const ROW_GAP = 18;
const BUTTON_SIZE = (SCREEN_W - H_PADDING * 2 - COL_GAP * 2) / 3;

const numbers = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "null",
  "0",
  "back",
];

type Code = {
  code: string;
  key: string;
};

export default function FamilyNumberInput() {
  const [codes, setCodes] = useState<Code[]>([]);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View
          layout={LinearTransition}
          style={{ flexDirection: "row" }}
        >
          {codes.map((code) => (
            <Animated.View
              key={code.key}
              entering={FadeInDown}
              exiting={FadeOutDown}
            >
              <Text
                style={{
                  fontSize: 48,
                  fontWeight: "bold",
                  color: "white",
                  textAlign: "center",
                }}
              >
                {code.code}
              </Text>
            </Animated.View>
          ))}
        </Animated.View>
        <LinearGradient
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "55%",
          }}
          locations={[0, 0.9]}
          colors={["rgba(0,0,0,0)", "#000"]}
          pointerEvents="none"
        />
      </View>
      <View
        style={{
          paddingHorizontal: H_PADDING,
          paddingBottom: 40,
          flexDirection: "row",
          flexWrap: "wrap",
          rowGap: ROW_GAP,
          columnGap: COL_GAP,
        }}
      >
        {numbers.map((number, index) => (
          <NumberButton key={index} setCodes={setCodes} number={number} />
        ))}
      </View>
    </View>
  );
}

function NumberButton({
  setCodes,
  number,
}: {
  setCodes: Dispatch<SetStateAction<Code[]>>;
  number: string;
}) {
  const isEmpty = number === "null";
  const isBack = number === "back";
  const isActive = useSharedValue(false);

  const handleTap = () => {
    if (isEmpty) return;
    if (isBack) {
      setCodes((prev) => prev.slice(0, -1));
      return;
    }
    setCodes((prev) => [...prev, { code: number, key: Date.now().toString() }]);
  };

  const rAnimatedButton = useAnimatedStyle(() => {
    const baseColor = isEmpty ? "transparent" : "rgba(255, 255, 255, 0.12)";
    return {
      backgroundColor: withTiming(
        isActive.value ? "rgba(255, 255, 255, 0.32)" : baseColor,
        { duration: 120 },
      ),
      transform: [
        {
          scale: withTiming(isActive.value ? 0.94 : 1, { duration: 120 }),
        },
      ],
    };
  });

  const gesture = Gesture.Tap()
    .onBegin(() => {
      isActive.value = true;
    })
    .onTouchesUp(() => {
      scheduleOnRN(handleTap);
    })
    .onFinalize(() => {
      isActive.value = false;
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          {
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            justifyContent: "center",
            alignItems: "center",
          },
          rAnimatedButton,
        ]}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: "500",
            color: "white",
          }}
        >
          {isEmpty ? "" : isBack ? "←" : number}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}
