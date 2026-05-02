import { StyleSheet, Text, View } from "react-native";
import Animated, {
  clamp,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { ReText } from "react-native-redash";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FILLER_PARAGRAPHS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
}));

export default function ScrollClampDemo() {
  const insets = useSafeAreaInsets();

  const rawProgress = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const scrollable =
        event.contentSize.height - event.layoutMeasurement.height;
      rawProgress.value =
        scrollable > 0 ? event.contentOffset.y / scrollable : 0;
    },
  });

  const rawText = useDerivedValue(() => rawProgress.value.toFixed(3));
  const clampedText = useDerivedValue(() =>
    clamp(rawProgress.value, 0, 1).toFixed(3),
  );

  const rRawStyle = useAnimatedStyle(() => {
    const isOutOfRange = rawProgress.value < 0 || rawProgress.value > 1;
    return {
      color: isOutOfRange ? "#FF3B30" : "#FFFFFF",
    };
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 180, paddingBottom: insets.bottom + 80 },
        ]}
      >
        {FILLER_PARAGRAPHS.map((p) => (
          <Text key={p.id} style={styles.paragraph}>
            {p.text}
          </Text>
        ))}
      </Animated.ScrollView>

      <View
        style={[styles.overlay, { top: insets.top + 16 }]}
        pointerEvents="none"
      >
        <View style={styles.column}>
          <Text style={styles.label}>raw</Text>
          <ReText text={rawText} style={[styles.value, rRawStyle]} />
        </View>
        <View style={styles.divider} />
        <View style={styles.column}>
          <Text style={styles.label}>clamped</Text>
          <ReText
            text={clampedText}
            style={[styles.value, styles.valueWhite]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255, 255, 255, 0.35)",
    marginBottom: 20,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  column: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginHorizontal: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: 8,
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 48,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  valueWhite: {
    color: "#FFFFFF",
  },
});
