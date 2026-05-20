import Slider from "@react-native-community/slider";
import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  Skia,
  useImage,
} from "@shopify/react-native-skia";
import { Pressable, Text, View } from "react-native";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { glsl } from "../../lib/glsl-helper";
import { useState } from "react";

const FIRST_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";
const SECOND_IMAGE =
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80";

const canvasWidth = 300;
const canvasHeight = canvasWidth * 0.75;

export const transition = (openGLTransition: string) => {
  return glsl`
    uniform shader image1;
    uniform shader image2;
    uniform float progress;
    uniform float2 resolution;
 
    half4 getFromColor(float2 uv) {
      return image1.eval(uv * resolution);
    }
 
    half4 getToColor(float2 uv) {
      return image2.eval(uv * resolution);
    }
 
    ${openGLTransition}
 
    half4 main(vec2 xy) {
      vec2 uv = xy / resolution;
      return transition(uv);
    }
  `;
};

const directionalShader = glsl`
  // Author: pschroen - License: MIT
  vec2 direction = vec2(-1.0, 1.0);
  const float smoothness = 0.5;
  const vec2 center = vec2(0.5, 0.5);
 
  vec4 transition(vec2 uv) {
    vec2 v = normalize(direction);
    v /= abs(v.x) + abs(v.y);
    float d = v.x * center.x + v.y * center.y;
    float m = 1.0 - smoothstep(-smoothness, 0.0,
      v.x * uv.x + v.y * uv.y - (d - 0.5 + progress * (1.0 + smoothness)));
    return mix(getFromColor((uv - 0.5) * (1.0 - m) + 0.5),
               getToColor((uv - 0.5) * m + 0.5), m);
  }
`;

const shaderSource = transition(directionalShader);

const runtimeEffect = Skia.RuntimeEffect.Make(shaderSource);

export default function ImageShaderTransitions() {
  const image1 = useImage(FIRST_IMAGE);
  const image2 = useImage(SECOND_IMAGE);

  const progress = useSharedValue(0);

  const [sliderValueState, setSliderValueState] = useState(0);

  const uniforms = useDerivedValue(() => ({
    progress: progress.value,
    resolution: [canvasWidth, canvasHeight],
  }));

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        backgroundColor: "black",
      }}
    >
      <Canvas
        style={{
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: "red",
          borderRadius: 25,
          overflow: "hidden",
        }}
      >
        <Fill>
          {runtimeEffect && (
            <Shader source={runtimeEffect} uniforms={uniforms}>
              <ImageShader
                image={image1}
                width={canvasWidth}
                height={canvasHeight}
                fit="cover"
              />
              <ImageShader
                image={image2}
                width={canvasWidth}
                height={canvasHeight}
                fit="cover"
              />
            </Shader>
          )}
        </Fill>
      </Canvas>
      <Slider
        style={{ width: 300, height: 40 }}
        minimumTrackTintColor="#fff"
        minimumValue={0}
        maximumValue={1}
        value={sliderValueState}
        onValueChange={(value) => {
          progress.value = value;
        }}
      />
      <Pressable
        onPress={() => {
          const nextValue = progress.value === 1 ? 0 : 1;
          progress.value = withTiming(nextValue, {
            duration: 1000,
          });
          setSliderValueState(nextValue);
        }}
        style={{
          width: 100,
          height: 50,
          backgroundColor: "blue",
          borderRadius: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>Tap</Text>
      </Pressable>
    </View>
  );
}
