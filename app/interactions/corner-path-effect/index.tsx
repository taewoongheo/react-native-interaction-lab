import {
  Canvas,
  CornerPathEffect,
  Line,
  Path,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const HORIZONTAL_PADDING = 24;
const CHART_HEIGHT = 280;
const CHART_TOP_PADDING = 26;
const CHART_BOTTOM_PADDING = 30;
const MAX_RADIUS = 20;
const SLIDER_HEIGHT = 44;
const THUMB_SIZE = 26;

const CHART_VALUES = [
  58, 30, 56, 54, 76, 60, 62, 92, 58, 72, 70, 78,
];

function createChartPath(chartWidth: number) {
  const path = Skia.Path.Make();
  const usableHeight = CHART_HEIGHT - CHART_TOP_PADDING - CHART_BOTTOM_PADDING;
  const step = chartWidth / (CHART_VALUES.length - 1);

  CHART_VALUES.forEach((value, index) => {
    const x = index * step;
    const y =
      CHART_TOP_PADDING + usableHeight - (value / 100) * usableHeight;

    if (index === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }
  });

  return path;
}

export default function CornerPathEffectDemo() {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const chartWidth = Math.min(width - HORIZONTAL_PADDING * 2, 390);
  const sliderWidth = chartWidth;

  const [radiusLabel, setRadiusLabel] = useState(0);
  const cornerRadius = useSharedValue(0);
  const drawProgress = useSharedValue(0);

  const chartPath = useMemo(() => createChartPath(chartWidth), [chartWidth]);

  const replay = () => {
    drawProgress.value = 0;
    drawProgress.value = withTiming(1, {
      duration: reduceMotion ? 0 : 1100,
      easing: Easing.out(Easing.cubic),
    });
  };

  const sliderGesture = Gesture.Pan()
    .onBegin((event) => {
      const nextRadius = clamp(
        (event.x / sliderWidth) * MAX_RADIUS,
        0,
        MAX_RADIUS,
      );
      cornerRadius.value = nextRadius;
      runOnJS(setRadiusLabel)(Math.round(nextRadius));
    })
    .onUpdate((event) => {
      const nextRadius = clamp(
        (event.x / sliderWidth) * MAX_RADIUS,
        0,
        MAX_RADIUS,
      );
      cornerRadius.value = nextRadius;
      runOnJS(setRadiusLabel)(Math.round(nextRadius));
    });

  const rSliderFillStyle = useAnimatedStyle(() => {
    return {
      width: (cornerRadius.value / MAX_RADIUS) * sliderWidth,
    };
  });

  const rThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX:
            (cornerRadius.value / MAX_RADIUS) * sliderWidth - THUMB_SIZE / 2,
        },
      ],
    };
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>CornerPathEffect</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>
              {"<CornerPathEffect "}
              <Text style={styles.codeProp}>{`r={${radiusLabel}}`}</Text>
              {" />"}
            </Text>
          </View>
        </View>

        <Canvas style={[styles.canvas, { width: chartWidth }]}>
          {[0.25, 0.5, 0.75].map((ratio) => {
            const y = CHART_HEIGHT * ratio;

            return (
              <Line
                key={ratio}
                p1={vec(0, y)}
                p2={vec(chartWidth, y)}
                color="#E9EDF2"
                strokeWidth={1}
              />
            );
          })}
          <Path
            path={chartPath}
            color="#111827"
            end={drawProgress}
            start={0}
            style="stroke"
            strokeCap="round"
            strokeWidth={6}
          >
            <CornerPathEffect r={cornerRadius} />
          </Path>
        </Canvas>

        <View style={[styles.controls, { width: chartWidth }]}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>corner radius</Text>
            <Text style={styles.radiusValue}>{`r = ${radiusLabel}`}</Text>
          </View>

          <GestureDetector gesture={sliderGesture}>
            <Animated.View
              accessible
              accessibilityActions={[
                { name: "increment", label: "Increase radius" },
                { name: "decrement", label: "Decrease radius" },
              ]}
              accessibilityHint="Drag horizontally to change the corner radius"
              accessibilityLabel="Corner radius"
              accessibilityRole="adjustable"
              accessibilityValue={{ min: 0, max: MAX_RADIUS }}
              onAccessibilityAction={(event) => {
                const delta =
                  event.nativeEvent.actionName === "increment" ? 8 : -8;
                const nextRadius = Math.max(
                  0,
                  Math.min(MAX_RADIUS, radiusLabel + delta),
                );

                cornerRadius.value = nextRadius;
                setRadiusLabel(nextRadius);
              }}
              style={[styles.slider, { width: sliderWidth }]}
            >
              <View style={styles.sliderTrack} />
              <Animated.View style={[styles.sliderFill, rSliderFillStyle]} />
              <Animated.View style={[styles.thumb, rThumbStyle]} />
            </Animated.View>
          </GestureDetector>

          <Pressable
            accessibilityHint="Draws the chart line from the beginning"
            accessibilityLabel="Start chart animation"
            accessibilityRole="button"
            hitSlop={8}
            onPress={replay}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Start</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  header: {
    width: "100%",
    maxWidth: 390,
    marginBottom: 32,
  },
  title: {
    color: "#111827",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0,
  },
  codeBlock: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  code: {
    color: "#6B7280",
    fontSize: 21,
    fontWeight: "700",
  },
  codeProp: {
    color: "#111827",
    fontWeight: "900",
  },
  canvas: {
    height: CHART_HEIGHT,
    backgroundColor: "#FFFFFF",
  },
  controls: {
    marginTop: 34,
  },
  sliderHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sliderLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  radiusValue: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  slider: {
    height: SLIDER_HEIGHT,
    justifyContent: "center",
  },
  sliderTrack: {
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    height: 5,
    position: "absolute",
    width: "100%",
  },
  sliderFill: {
    backgroundColor: "#111827",
    borderRadius: 999,
    height: 5,
    position: "absolute",
  },
  thumb: {
    backgroundColor: "#111827",
    borderColor: "#FFFFFF",
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 4,
    height: THUMB_SIZE,
    position: "absolute",
    width: THUMB_SIZE,
  },
  button: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#111827",
    borderRadius: 999,
    height: 52,
    justifyContent: "center",
    marginTop: 24,
    minWidth: 132,
    paddingHorizontal: 28,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
