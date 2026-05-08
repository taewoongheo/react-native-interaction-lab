import {
  Group,
  LinearGradient,
  Path,
  Rect,
  Skia,
  Text,
  useFont,
  vec,
} from "@shopify/react-native-skia";
import { Dimensions, StyleSheet, View } from "react-native";
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import Touchable, { useGestureHandler } from "react-native-skia-gesture";

const { width, height } = Dimensions.get("window");

const BASE_RADIUS = 110;
const POINT_COUNT = 9;
const RADIUS_RATIOS = [1.0, 0.7, 1.15, 0.82, 1.08, 0.74, 1.18, 0.88, 0.95];

const ROTATION_SPEED = (Math.PI * 2) / 26000;

const SLOPE_LEFT_Y = 0;
const SLOPE_RIGHT_Y = 1;

const TOP_PATH = (() => {
  const p = Skia.Path.Make();
  p.moveTo(0, 0);
  p.lineTo(width, 0);
  p.lineTo(width, height * SLOPE_RIGHT_Y);
  p.lineTo(0, height * SLOPE_LEFT_Y);
  p.close();
  return p;
})();

const FONT_SIZE = 25;
const TEXT_X = 10;
const LINE1_Y = height * 0.24;
const LINE2_Y = LINE1_Y + FONT_SIZE * 1.5;
const LINE1 = "<Group clip={slope}>";
const LINE2 = "<Group clip={slope} invertClip>";

const nunitoBold = require("../../../assets/fonts/Nunito-Bold.ttf");

function buildBlobPath(
  cx: number,
  cy: number,
  baseR: number,
  rotation: number,
) {
  "worklet";
  const path = Skia.Path.Make();

  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < POINT_COUNT; i++) {
    const angle = (i / POINT_COUNT) * Math.PI * 2 + rotation;
    const r = baseR * RADIUS_RATIOS[i];
    xs.push(cx + Math.cos(angle) * r);
    ys.push(cy + Math.sin(angle) * r);
  }

  const startMidX = (xs[POINT_COUNT - 1] + xs[0]) / 2;
  const startMidY = (ys[POINT_COUNT - 1] + ys[0]) / 2;
  path.moveTo(startMidX, startMidY);

  for (let i = 0; i < POINT_COUNT; i++) {
    const next = (i + 1) % POINT_COUNT;
    const midX = (xs[i] + xs[next]) / 2;
    const midY = (ys[i] + ys[next]) / 2;
    path.quadTo(xs[i], ys[i], midX, midY);
  }
  path.close();
  return path;
}

export default function InvertClipBlob() {
  const font = useFont(nunitoBold, FONT_SIZE);
  const center = useSharedValue({ x: width / 2, y: height / 2 });
  const dragCtx = useSharedValue({ x: 0, y: 0 });
  const rotation = useSharedValue(0);

  useFrameCallback((info) => {
    if (info.timeSincePreviousFrame == null) return;
    rotation.value += ROTATION_SPEED * info.timeSincePreviousFrame;
  });

  const blobPath = useDerivedValue(() =>
    buildBlobPath(center.value.x, center.value.y, BASE_RADIUS, rotation.value),
  );

  const dragGesture = useGestureHandler({
    onStart: () => {
      "worklet";
      dragCtx.value = { x: center.value.x, y: center.value.y };
    },
    onActive: ({ translationX, translationY }) => {
      "worklet";
      center.value = {
        x: dragCtx.value.x + translationX,
        y: dragCtx.value.y + translationY,
      };
    },
  });

  if (!font) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <Touchable.Canvas style={StyleSheet.absoluteFill}>
        <Group clip={TOP_PATH}>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, height)}
              colors={["#0d1224", "#1a1a2e"]}
            />
          </Rect>
        </Group>
        <Group clip={TOP_PATH} invertClip>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, height)}
              colors={["#FF6B9D", "#FFA07A", "#FFE66D"]}
            />
          </Rect>
        </Group>

        <Group clip={TOP_PATH}>
          <Path path={blobPath} color="#FFE66D" />
        </Group>
        <Group clip={TOP_PATH} invertClip>
          <Path path={blobPath} color="#1a1a2e" />
        </Group>

        <Group clip={TOP_PATH}>
          <Text
            x={TEXT_X}
            y={LINE1_Y}
            text={LINE1}
            font={font}
            color="#FFFFFF"
          />
          <Text
            x={TEXT_X}
            y={LINE2_Y}
            text={LINE2}
            font={font}
            color="#FFFFFF"
          />
        </Group>
        <Group clip={TOP_PATH} invertClip>
          <Text
            x={TEXT_X}
            y={LINE1_Y}
            text={LINE1}
            font={font}
            color="#0a0a0a"
          />
          <Text
            x={TEXT_X}
            y={LINE2_Y}
            text={LINE2}
            font={font}
            color="#0a0a0a"
          />
        </Group>

        <Touchable.Rect
          x={0}
          y={0}
          width={width}
          height={height}
          color="transparent"
          {...dragGesture}
        />
      </Touchable.Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
});
