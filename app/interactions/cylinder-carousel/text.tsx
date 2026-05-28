import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { Colors, Typography, useColors } from "./theme";

type TextVariant = keyof typeof Typography;
type TextColor = keyof (typeof Colors)["light"];

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  bold?: boolean;
  color?: TextColor | (string & {});
}

export function Text({ variant = "body", bold, color = "text", style, ...rest }: TextProps) {
  const { colors } = useColors();
  const resolvedColor = color in colors ? colors[color as TextColor] : color;

  return (
    <RNText
      {...rest}
      style={[
        Typography[variant],
        { color: resolvedColor },
        bold && { fontWeight: "bold" },
        style,
      ]}
    />
  );
}
