import { BlurMask, Canvas, RoundedRect } from "@shopify/react-native-skia";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Touchable, { useGestureHandler } from "react-native-skia-gesture";

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 220;
const SHAPE_WIDTH = 200;
const SHAPE_HEIGHT = 70;

const origin = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
const shapeX = CANVAS_WIDTH / 2 - SHAPE_WIDTH / 2;
const shapeY = CANVAS_HEIGHT / 2 - SHAPE_HEIGHT / 2;

const canvasFrameStyle = {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: "rgba(255,255,255,0.04)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
};

const canvasLabelOverlayStyle = {
  position: "absolute" as const,
  top: 6,
  left: 10,
};

const canvasLabelTextStyle = {
  color: "rgba(255,255,255,0.45)",
  fontSize: 16,
  fontWeight: "600" as const,
  letterSpacing: 0.6,
};

export default function SkiaGestureComparison() {
  const topActive = useSharedValue(false);
  const topScale = useDerivedValue(() =>
    withTiming(topActive.value ? 1.1 : 1, { duration: 200 }),
  );
  const topTransform = useDerivedValue(() => [{ scale: topScale.value }]);
  const topBlur = useDerivedValue(() =>
    withTiming(topActive.value ? 18 : 0, { duration: 200 }),
  );
  const topStatusStyle = useAnimatedStyle(() => ({
    opacity: withTiming(topActive.value ? 1 : 0, { duration: 150 }),
  }));

  const topGesture = Gesture.Tap()
    .onTouchesDown(() => {
      topActive.value = true;
    })
    .onTouchesUp(() => {
      topActive.value = false;
    });

  const bottomActive = useSharedValue(false);

  const bottomScale = useDerivedValue(() =>
    withTiming(bottomActive.value ? 1.1 : 1, { duration: 200 }),
  );

  const bottomTransform = useDerivedValue(() => [{ scale: bottomScale.value }]);

  const bottomBlur = useDerivedValue(() =>
    withTiming(bottomActive.value ? 18 : 0, { duration: 200 }),
  );

  const bottomStatusStyle = useAnimatedStyle(() => ({
    opacity: withTiming(bottomActive.value ? 1 : 0, { duration: 150 }),
  }));

  const bottomGesture = useGestureHandler({
    onStart: () => {
      "worklet";
      bottomActive.value = true;
    },
    onEnd: () => {
      "worklet";
      bottomActive.value = false;
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Animated.Text
            style={[
              {
                color: "#7df3ff",
                fontSize: 16,
                fontWeight: "600",
                letterSpacing: 0.5,
              },
              topStatusStyle,
            ]}
          >
            Gesture detected!
          </Animated.Text>
          <View>
            <GestureDetector gesture={topGesture}>
              <Canvas style={canvasFrameStyle}>
                <RoundedRect
                  x={shapeX}
                  y={shapeY}
                  width={SHAPE_WIDTH}
                  height={SHAPE_HEIGHT}
                  r={SHAPE_HEIGHT / 2}
                  color="#7df3ff"
                  transform={topTransform}
                  origin={origin}
                >
                  <BlurMask blur={topBlur} style="solid" />
                </RoundedRect>
              </Canvas>
            </GestureDetector>
            <View pointerEvents="none" style={canvasLabelOverlayStyle}>
              <Text style={canvasLabelTextStyle}>Canvas</Text>
            </View>
          </View>
          <Text style={{ color: "white", opacity: 1, fontSize: 16 }}>
            GestureDetector — fires anywhere on the canvas
          </Text>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.18)",
            marginHorizontal: 24,
          }}
        />

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Animated.Text
            style={[
              {
                color: "#7df3ff",
                fontSize: 16,
                fontWeight: "600",
                letterSpacing: 0.5,
              },
              bottomStatusStyle,
            ]}
          >
            Gesture detected!
          </Animated.Text>
          <View>
            <Touchable.Canvas style={canvasFrameStyle}>
              <Touchable.RoundedRect
                x={shapeX}
                y={shapeY}
                width={SHAPE_WIDTH}
                height={SHAPE_HEIGHT}
                r={SHAPE_HEIGHT / 2}
                color="#7df3ff"
                transform={bottomTransform}
                origin={origin}
                {...bottomGesture}
              >
                <BlurMask blur={bottomBlur} style="solid" />
              </Touchable.RoundedRect>
            </Touchable.Canvas>
            <View pointerEvents="none" style={canvasLabelOverlayStyle}>
              <Text style={canvasLabelTextStyle}>Canvas</Text>
            </View>
          </View>
          <Text style={{ color: "white", opacity: 1, fontSize: 16 }}>
            Skia Touchable — fires only on the shape
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
