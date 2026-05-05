import {
  Canvas,
  Circle,
  Path,
  SkContourMeasure,
  SkPath,
} from "@shopify/react-native-skia";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Skia } from "@shopify/react-native-skia";
import {
  cancelAnimation,
  interpolate,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

export class PathGeometry {
  private contour: SkContourMeasure;

  constructor(path: SkPath) {
    const it = Skia.ContourMeasureIter(path, false, 1);
    this.contour = it.next()!;
  }

  getTotalLength() {
    return this.contour.length();
  }

  getPointAtLength(length: number) {
    const [pos] = this.contour.getPosTan(length);
    return pos;
  }
}

type Point = {
  x: number;
  y: number;
};

const SAMPLE_COUNT = 100;

function getPathPoints(path: SkPath): Point[] {
  const points: Point[] = [];
  const countPoints = path.countPoints();

  if (countPoints <= 1) return [];

  const geometry = new PathGeometry(path);
  const totalLength = geometry.getTotalLength();

  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const point = geometry.getPointAtLength(totalLength * (i / SAMPLE_COUNT));
    points.push({ x: point.x, y: point.y });
  }
  return points;
}

export default function AnimateThroughAPath() {
  const points = useSharedValue<Point[]>([]);

  const progress = useSharedValue(0);

  const skPath = useSharedValue(Skia.Path.Make());
  const isDrawing = useSharedValue(false);

  const onComplete = (computedPath: SkPath) => {
    points.value = getPathPoints(computedPath);
    cancelAnimation(progress);
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1000 });
  };

  const pan = Gesture.Pan()
    .onBegin(({ x, y }) => {
      skPath.value = Skia.Path.Make();
      skPath.value.moveTo(x, y);
      isDrawing.value = true;
    })
    .onUpdate(({ x, y }) => {
      skPath.value.lineTo(x, y);
      skPath.value = skPath.value.copy();
    })
    .onFinalize(() => {
      isDrawing.value = false;
      runOnJS(onComplete)(skPath.value);
    });

  const pathOpacity = useDerivedValue(() => {
    return withTiming(isDrawing.value ? 1 : 0);
  });

  const cx = useDerivedValue(() => {
    if (points.value.length <= 1) return 0;
    const inputRange = points.value.map(
      (_, index) => index / points.value.length,
    );
    const pointsX = points.value.map((point) => point.x);
    return interpolate(progress.value, inputRange, pointsX);
  });

  const cy = useDerivedValue(() => {
    if (points.value.length <= 1) return 0;
    const inputRange = points.value.map(
      (_, index) => index / points.value.length,
    );
    const pointsY = points.value.map((point) => point.y);
    return interpolate(progress.value, inputRange, pointsY);
  });

  return (
    <GestureDetector gesture={pan}>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <Canvas style={{ flex: 1 }}>
          <Path
            path={skPath}
            color={"white"}
            style="stroke"
            strokeWidth={2}
            opacity={pathOpacity}
          />
          <Circle cx={cx} cy={cy} r={10} color="white" />
        </Canvas>
      </View>
    </GestureDetector>
  );
}
