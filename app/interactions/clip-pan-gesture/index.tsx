import {
  BlurMask,
  Canvas,
  Group,
  rect,
  Rect,
  RoundedRect,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Touchable, { useGestureHandler } from "react-native-skia-gesture";

const { width, height } = Dimensions.get("screen");

function useSharedPoint(initialPoint: { x: number; y: number }): {
  point: SharedValue<{
    x: number;
    y: number;
  }>;
  x: SharedValue<number>;
  y: SharedValue<number>;
} {
  const point = useSharedValue(initialPoint);
  const x = useDerivedValue(() => point.value.x);
  const y = useDerivedValue(() => point.value.y);

  return { point, x, y };
}

const SQARE_SIZE = 80;

export default function ClipPanGesture() {
  const { x, y } = useSharedPoint({
    x: width / 2 - SQARE_SIZE / 2,
    y: height / 2 - SQARE_SIZE / 2,
  });
  const isDragging = useSharedValue(false);
  const scale = useDerivedValue(() => {
    return withSpring(isDragging.value ? 1.2 : 1);
  });
  const rotate = useDerivedValue(() => {
    return withSpring(isDragging.value ? Math.PI / 4 : 0);
  });
  const transform = useDerivedValue(() => {
    return [{ rotate: rotate.value }, { scale: scale.value }];
  });
  const origin = useDerivedValue(() => ({
    x: x.value + SQARE_SIZE / 2,
    y: y.value + SQARE_SIZE / 2,
  }));
  const blur = useDerivedValue(() => {
    return withSpring(isDragging.value ? 20 : 0);
  });

  const context = useSharedValue({ x: 0, y: 0 });

  const panGesture = useGestureHandler({
    onStart: () => {
      "worklet";
      isDragging.value = true;
      context.value = { x: x.value, y: y.value };
    },
    onActive: ({ translationX, translationY }) => {
      "worklet";
      x.value = translationX + context.value.x;
      y.value = translationY + context.value.y;
    },
    onEnd: () => {
      "worklet";
      isDragging.value = false;
    },
  });

  const whiteRect = rect(0, 0, width, height / 2);

  return (
    <Touchable.Canvas style={{ flex: 1 }}>
      <Rect x={0} y={0} width={width} height={height / 2} color="white" />
      <Rect
        x={0}
        y={height / 2}
        width={width}
        height={height / 2}
        color="black"
      />
      <Group>
        <Group clip={whiteRect}>
          <Group transform={transform} origin={origin}>
            <Touchable.RoundedRect
              x={x}
              y={y}
              width={SQARE_SIZE}
              height={SQARE_SIZE}
              color="black"
              r={20}
              {...panGesture}
            />
          </Group>
        </Group>
        <Group clip={whiteRect} invertClip>
          <Group transform={transform} origin={origin}>
            <RoundedRect
              x={x}
              y={y}
              width={SQARE_SIZE}
              height={SQARE_SIZE}
              color="white"
              r={20}
            />
          </Group>
        </Group>
        <BlurMask blur={blur} style={"solid"} />
      </Group>
    </Touchable.Canvas>
  );
}
