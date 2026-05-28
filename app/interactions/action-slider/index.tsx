import { Dimensions, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { runOnJS } from "react-native-worklets";

const height = 60;
const width = Dimensions.get("window").width * 0.8;
const padding = height * 0.1;
const thumbWidth = height - padding * 2;
const maxX = width - padding * 2 - thumbWidth;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function ActionSlider() {
  const [text, setText] = useState("Slide to Purchase");
  const [textWidth, setTextWidth] = useState(0);
  const x = useSharedValue(0);
  const bg = useSharedValue("#0a0044");
  const opacity = useSharedValue(1);

  const gradientX = useSharedValue(0);

  const handleCompletePurchase = () => {
    setText("Purchase Complete!");
  };

  useEffect(() => {
    if (textWidth === 0) return;

    gradientX.value = -textWidth;
    gradientX.value = withRepeat(
      withTiming(textWidth, { duration: 2500 }),
      -1,
      false,
    );
  }, [textWidth, gradientX]);

  const gesture = Gesture.Pan()
    .onUpdate(({ translationX }) => {
      x.value = Math.min(Math.max(translationX, 0), maxX);
    })
    .onEnd(() => {
      if (x.value === maxX) {
        bg.value = withTiming("#06ba00");
        opacity.value = withTiming(0);
        runOnJS(handleCompletePurchase)();
      }
      x.value = withTiming(0);
    });

  const rButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: x.value }],
      backgroundColor: bg.value,
    };
  });

  const rBarStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        x.value,
        [0, maxX],
        ["#ededed", "#0a0044"],
      ),
    };
  });

  const rGradientStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: gradientX.value }],
      opacity: opacity.value,
    };
  });

  const rTextStyle = useAnimatedStyle(() => {
    return {
      color: bg.value,
    };
  });

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            {
              width: width,
              height: height,
              borderWidth: 1,
              borderColor: "#d3d3d3",
              borderRadius: 10,

              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              paddingHorizontal: padding,

              position: "relative",
            },
            rBarStyle,
          ]}
        >
          <View
            style={{
              position: "absolute",
              inset: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AnimatedText
                style={[
                  { color: "#0a0044", fontWeight: "bold", fontSize: 18 },
                  rTextStyle,
                ]}
                onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
              >
                Slide to Purchase
              </AnimatedText>
              <MaskedView
                style={{
                  position: "absolute",
                  inset: 0,
                }}
                maskElement={
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={[
                        {
                          color: "black",
                          fontWeight: "bold",
                          fontSize: 18,
                        },
                      ]}
                    >
                      {text}
                    </Text>
                  </View>
                }
              >
                <AnimatedLinearGradient
                  colors={[
                    "transparent",
                    "rgba(255,255,255,0.2)",
                    "rgba(255,255,255,0.3)",
                    "rgba(255,255,255,0.4)",
                    "rgba(255,255,255,0.3)",
                    "rgba(255,255,255,0.2)",
                    "transparent",
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[
                    {
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      width: textWidth,
                    },
                    rGradientStyle,
                  ]}
                />
              </MaskedView>
            </View>
          </View>
          <Animated.View
            style={[
              {
                height: height - padding * 2,
                aspectRatio: 1,
                backgroundColor: "#0a0044",
                borderRadius: 10,

                justifyContent: "center",
                alignItems: "center",
              },
              rButtonStyle,
            ]}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              S
            </Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
