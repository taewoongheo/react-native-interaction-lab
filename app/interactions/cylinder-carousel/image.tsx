import { Image as ExpoImage, type ImageProps as ExpoImageProps, type ImageStyle } from "expo-image";
import { StyleSheet } from "react-native";
import { Layout } from "./theme";

interface ImageProps extends Omit<ExpoImageProps, "style"> {
  radius?: "none" | "sm" | "md" | "lg" | "full";
  style?: ImageStyle;
}

const radiusMap = {
  none: 0,
  sm: Layout.radiusSm,
  md: Layout.radiusMd,
  lg: Layout.radiusLg,
  full: 9999,
} as const;

export function Image({ radius = "none", style, ...rest }: ImageProps) {
  return (
    <ExpoImage
      style={[styles.base, { borderRadius: radiusMap[radius] }, style]}
      transition={200}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    width: "100%",
    height: 200,
  },
});
