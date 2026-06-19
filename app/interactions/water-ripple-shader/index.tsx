import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  useImage,
} from "@shopify/react-native-skia";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { frag } from "../../lib/glsl-helper";

const WATER_IMAGE = require("../../../assets/images/water-ripple-source.jpg");

const RIPPLE_DURATION_MS = 1800;

const rippleEffect = frag`
  uniform shader image;

  uniform float2 resolution;
  uniform float2 center;
  uniform float progress;
  uniform float amplitude;
  uniform float frequency;
  uniform float speed;
  uniform float ringWidth;

  half4 main(vec2 xy) {
    vec2 delta = xy - center;
    float dist = length(delta);
    vec2 dir = delta / max(dist, 0.001);

    float maxRadius = length(resolution) * 0.1;
    float waveFront = progress * maxRadius;
    float ringDistance = dist - waveFront;

    float envelope = 1.0 - smoothstep(0.0, ringWidth, abs(ringDistance));
    float fade = 1.0 - smoothstep(0.1, 0.8, progress);
    float wave = sin(ringDistance * frequency - progress * speed) * envelope * fade;

    vec2 sampleXY = xy + dir * wave * amplitude;
    sampleXY = clamp(sampleXY, vec2(0.0), resolution);

    half4 color = image.eval(sampleXY);
    half highlight = half(envelope * fade * 0.035);
    return half4(color.rgb + half3(highlight), color.a);
  }
`;

export default function WaterRippleShader() {
  const image = useImage(WATER_IMAGE);
  const { width, height } = useWindowDimensions();

  const canvasWidth = Math.max(1, width);
  const canvasHeight = Math.max(1, height);

  const centerX = useSharedValue(-1);
  const centerY = useSharedValue(-1);
  const progress = useSharedValue(1);

  const tapGesture = Gesture.Tap().onStart((event) => {
    centerX.value = event.x;
    centerY.value = event.y;
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: RIPPLE_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  });

  const center = useDerivedValue(() => [
    centerX.value < 0 ? canvasWidth / 2 : centerX.value,
    centerY.value < 0 ? canvasHeight / 2 : centerY.value,
  ]);

  const uniforms = useDerivedValue(() => ({
    resolution: [canvasWidth, canvasHeight],
    center: center.value,
    progress: progress.value,
    amplitude: 20,
    frequency: 0.07,
    speed: 10,
    ringWidth: 200,
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Canvas style={styles.canvas}>
        <Fill color="#0B5C73" />
        {image ? (
          <Fill>
            <Shader source={rippleEffect} uniforms={uniforms}>
              <ImageShader
                fit="cover"
                height={canvasHeight}
                image={image}
                width={canvasWidth}
              />
            </Shader>
          </Fill>
        ) : null}
      </Canvas>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: "#0B5C73",
  },
});
