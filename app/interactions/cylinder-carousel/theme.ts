import { Platform, StyleSheet } from "react-native";

export const Colors = {
  light: {
    background: "#FFFFFF",
    backgroundGrouped: "#F2F2F7",
    text: "#000000",
    textSecondary: "#8E8E93",
    accent: "#007AFF",
  },
} as const;

export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const Layout = {
  margin: 16,
  touchTarget: 44,
  radiusLg: 12,
  radiusMd: 10,
  radiusSm: 8,
  separator: StyleSheet.hairlineWidth,
} as const;

const fontFamily = Platform.select({
  ios: "System",
  default: "sans-serif",
});

export const Typography = {
  title: {
    fontFamily,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700" as const,
  },
  subtitle: {
    fontFamily,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const,
  },
  body: {
    fontFamily,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "400" as const,
  },
  label: {
    fontFamily,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500" as const,
  },
  caption: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400" as const,
  },
} as const;

export function useColors() {
  return { colors: Colors.light };
}
