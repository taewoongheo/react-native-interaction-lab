import {
  BlurMask,
  Canvas,
  RoundedRect,
  SweepGradient,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Touchable, { useGestureHandler } from "react-native-skia-gesture";

const { width, height } = Dimensions.get("screen");

const padding = 7;

const buttonWidth = 250;
const buttonHeight = 70;

const canvasButtonWidth = buttonWidth + padding * 2;
const canvasButtonHeight = buttonHeight + padding * 2;

const canvasWidth = 400;
const canvasHeight = 500;

const cycle = Math.PI * 3;

export default function SkiaMagicalButton() {
  const isTouched = useSharedValue(false);

  const scale = useDerivedValue(() => {
    return withTiming(isTouched.value ? 1.2 : 1, { duration: 500 });
  });

  const rotate = useDerivedValue(() => {
    return withTiming(isTouched.value ? cycle : 0, {
      duration: 1000,
    });
  });

  const transform = useDerivedValue(() => [
    { rotate: rotate.value },
    { scale: scale.value },
  ]);

  const blur = useDerivedValue(() => {
    return interpolate(rotate.value, [0, cycle / 6, cycle], [0, 20, 20]);
  });

  const origin = { x: canvasWidth / 2, y: canvasHeight / 2 };

  const rButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const tapGesture = useGestureHandler({
    onStart: () => {
      "worklet";
      isTouched.value = true;
    },
    onEnd: () => {
      "worklet";
      isTouched.value = false;
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <View>
        <View
          style={{
            position: "absolute",
            top: height / 2 - canvasHeight / 2,
            left: width / 2 - canvasWidth / 2,
          }}
        >
          <Touchable.Canvas
            style={{
              width: canvasWidth,
              height: canvasHeight,
            }}
          >
            <Touchable.RoundedRect
              x={canvasWidth / 2 - canvasButtonWidth / 2}
              y={canvasHeight / 2 - canvasButtonHeight / 2}
              width={canvasButtonWidth}
              height={canvasButtonHeight}
              r={canvasButtonHeight / 2}
              transform={transform}
              origin={origin}
              {...tapGesture}
            >
              <SweepGradient
                c={{
                  x: canvasWidth / 2,
                  y: canvasHeight / 2,
                }}
                colors={["cyan", "magenta", "yellow", "cyan"]}
              />
              <BlurMask blur={blur} style="solid" />
            </Touchable.RoundedRect>
          </Touchable.Canvas>
        </View>
        <Animated.View
          pointerEvents={"none"}
          style={[
            {
              position: "absolute",
              top: height / 2 - buttonHeight / 2,
              left: width / 2 - buttonWidth / 2,

              width: buttonWidth,
              height: buttonHeight,
              borderRadius: buttonWidth / 2,
              backgroundColor: "black",

              justifyContent: "center",
              alignItems: "center",
            },
            rButtonStyle,
          ]}
        >
          <Text style={{ color: "white", fontSize: 18 }}>Press me</Text>
        </Animated.View>
      </View>
    </View>
  );
}
