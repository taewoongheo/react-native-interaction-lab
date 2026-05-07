import {
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  Line,
  Path,
  SkContourMeasure,
  Skia,
  SkPath,
  vec,
} from "@shopify/react-native-skia";
import { Dimensions, View } from "react-native";
import {
  cancelAnimation,
  interpolate,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Touchable, { useGestureHandler } from "react-native-skia-gesture";
import { runOnJS } from "react-native-worklets";

const RADIUS = 120;
const BASELINE_Y = 450;
const CENTER_X = Dimensions.get("window").width / 2;
const HANDLE_LIFT = (4 / 3) * RADIUS;

const CIRCLE_RADIUS = 13;
const CIRCLE_STROKE_WIDTH = 2;

const START_POINT = {
  x: CENTER_X - RADIUS * 1.3,
  y: BASELINE_Y,
};

const C1_POINT = {
  x: CENTER_X - RADIUS,
  y: BASELINE_Y - HANDLE_LIFT,
};

const C2_POINT = {
  x: CENTER_X + RADIUS,
  y: BASELINE_Y - HANDLE_LIFT,
};

const END_POINT = {
  x: CENTER_X + RADIUS * 1.3,
  y: BASELINE_Y,
};

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

const useSharedControlPoint = (initialPoint: Point) => {
  const controlPoint = useSharedValue(initialPoint);
  const cx = useDerivedValue(() => controlPoint.value.x);
  const cy = useDerivedValue(() => controlPoint.value.y);

  return { controlPoint, cx, cy };
};

export default function AnimatedBezierCurve() {
  const {
    controlPoint: start,
    cx: startX,
    cy: startY,
  } = useSharedControlPoint(START_POINT);
  const {
    controlPoint: end,
    cx: endX,
    cy: endY,
  } = useSharedControlPoint(END_POINT);
  const {
    controlPoint: c1,
    cx: c1X,
    cy: c1Y,
  } = useSharedControlPoint(C1_POINT);
  const {
    controlPoint: c2,
    cx: c2X,
    cy: c2Y,
  } = useSharedControlPoint(C2_POINT);

  const points = useSharedValue<Point[]>([]);
  const progress = useSharedValue(0);

  const cx = useDerivedValue(() => {
    if (points.value.length <= 1) return 0;
    const inputRange = points.value.map(
      (_, index) => index / (points.value.length - 1),
    );
    const pointsX = points.value.map((point) => point.x);
    return interpolate(progress.value, inputRange, pointsX);
  });

  const cy = useDerivedValue(() => {
    if (points.value.length <= 1) return 0;
    const inputRange = points.value.map(
      (_, index) => index / (points.value.length - 1),
    );
    const pointsY = points.value.map((point) => point.y);
    return interpolate(progress.value, inputRange, pointsY);
  });

  const onComplete = (computedPath: SkPath) => {
    points.value = getPathPoints(computedPath);
    cancelAnimation(progress);
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1000 });
  };

  const skPath = useDerivedValue<SkPath>(() => {
    const path = Skia.Path.Make();
    path.moveTo(startX.value, startY.value);
    path.cubicTo(
      c1X.value,
      c1Y.value,
      c2X.value,
      c2Y.value,
      endX.value,
      endY.value,
    );
    return path;
  });

  const startCircleGesture = useGestureHandler({
    onActive: ({ x, y }) => {
      "worklet";
      start.value = { x, y };
    },
    onEnd: () => {
      "worklet";
      runOnJS(onComplete)(skPath.value);
    },
  });

  const c1CircleGesture = useGestureHandler({
    onActive: ({ x, y }) => {
      "worklet";
      c1.value = { x, y };
    },
    onEnd: () => {
      "worklet";
      runOnJS(onComplete)(skPath.value);
    },
  });

  const c2CircleGesture = useGestureHandler({
    onActive: ({ x, y }) => {
      "worklet";
      c2.value = { x, y };
    },
    onEnd: () => {
      "worklet";
      runOnJS(onComplete)(skPath.value);
    },
  });

  return (
    <Touchable.Canvas style={{ flex: 1, backgroundColor: "black" }}>
      <Path path={skPath} color={"white"} style="stroke" strokeWidth={2} />
      <Line p1={start} p2={c1} color={"white"} strokeWidth={2.5} opacity={0.5}>
        <DashPathEffect intervals={[5, 5]} />
      </Line>
      <Line p1={c2} p2={end} color={"white"} strokeWidth={2.5} opacity={0.5}>
        <DashPathEffect intervals={[5, 5]} />
      </Line>
      <GestureCircle x={startX} y={startY} gesture={startCircleGesture} />
      <GestureCircle x={c1X} y={c1Y} gesture={c1CircleGesture} opacity={0.5} />
      <GestureCircle x={c2X} y={c2Y} gesture={c2CircleGesture} opacity={0.5} />
      <GestureCircle x={endX} y={endY} gesture={[]} />
      <Circle
        cx={cx}
        cy={cy}
        r={CIRCLE_RADIUS + CIRCLE_STROKE_WIDTH}
        color={"red"}
      />
    </Touchable.Canvas>
  );
}

function GestureCircle({
  x,
  y,
  gesture,
  opacity = 1,
}: {
  x: SharedValue<number>;
  y: SharedValue<number>;
  gesture: any;
  opacity?: number;
}) {
  return (
    <Group opacity={opacity}>
      <Touchable.Circle
        cx={x}
        cy={y}
        r={CIRCLE_RADIUS}
        color={"white"}
        style={"stroke"}
        strokeWidth={CIRCLE_STROKE_WIDTH}
        {...gesture}
      />
      <Circle
        cx={x}
        cy={y}
        color={"black"}
        r={CIRCLE_RADIUS * 0.9}
        style={"fill"}
      />
    </Group>
  );
}
