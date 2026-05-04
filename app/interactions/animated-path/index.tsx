import SegmentedControl from "@react-native-segmented-control/segmented-control";
import {
  Canvas,
  CornerPathEffect,
  DashPathEffect,
  Line,
  Path,
  Skia,
  usePathInterpolation,
  vec,
} from "@shopify/react-native-skia";
import { useMemo, useState } from "react";
import { Dimensions, View } from "react-native";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const paths = [
  [
    100, 53, 82, 59, 43, 63, 51, 66, 54, 62, 72, 81, 89, 92, 100, 100, 96, 98,
    100, 100, 100, 100, 100, 93, 97, 100, 100,
  ],
  [
    54, 42, 67, 48, 35, 54, 43, 57, 47, 53, 61, 68, 77, 85, 87, 93, 82, 84, 88,
    87, 95, 91, 90, 77, 82, 87, 92,
  ],
  [
    20, 35, 55, 39, 29, 46, 37, 50, 40, 45, 51, 57, 65, 73, 60, 80, 71, 71, 75,
    73, 79, 75, 74, 63, 69, 74, 79,
  ],
];

const CANVAS_HEIGHT = 300;
const PADDING_Y = 20;
const PADDING_X = 16;

function getPath(pathIndex: number, canvasWidth: number) {
  const path = Skia.Path.Make();
  path.moveTo(0, getNormalizedY(paths[pathIndex][0], CANVAS_HEIGHT));
  for (let i = 1; i < paths[pathIndex].length; i++) {
    path.lineTo(
      i * (canvasWidth / paths[pathIndex].length),
      getNormalizedY(paths[pathIndex][i], CANVAS_HEIGHT),
    );
  }
  return path;
}

export default function AnimatedPath() {
  const option = useSharedValue(0);
  const canvasWidth = Dimensions.get("window").width - PADDING_X * 2;

  const progress = useDerivedValue(() => {
    return withTiming(option.value, {
      duration: 400,
      easing: Easing.inOut(Easing.cubic),
    });
  });

  const lightPath = useMemo(() => getPath(0, canvasWidth), [canvasWidth]);
  const standardPath = useMemo(() => getPath(1, canvasWidth), [canvasWidth]);
  const proPath = useMemo(() => getPath(2, canvasWidth), [canvasWidth]);

  const animatedPath = usePathInterpolation(
    progress,
    [0, 1, 2],
    [lightPath, standardPath, proPath],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: PADDING_X,
          justifyContent: "center",
          gap: 16,
        }}
      >
        <SegmentedControl
          values={["light", "standard", "pro"]}
          selectedIndex={option.value}
          onChange={(event) => {
            option.value = event.nativeEvent.selectedSegmentIndex;
          }}
        />
        <Canvas
          style={{
            width: "100%",
            height: CANVAS_HEIGHT + PADDING_Y * 2,
          }}
        >
          <Path
            path={animatedPath}
            color={"#c100cf"}
            style={"stroke"}
            strokeWidth={4}
            strokeCap={"round"}
          >
            <CornerPathEffect r={64} />
          </Path>
          <Line
            p1={vec(0, CANVAS_HEIGHT * 0.3)}
            p2={vec(canvasWidth, CANVAS_HEIGHT * 0.3)}
            strokeWidth={2}
            color={"#cac8c2"}
          >
            <DashPathEffect intervals={[10, 10]} />
          </Line>
        </Canvas>
      </View>
    </SafeAreaView>
  );
}

function getNormalizedY(value: number, height: number) {
  return height - (value / 100) * height + PADDING_Y;
}
