import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./text";
import { Spacing, useColors } from "./theme";

export default function DemoScreen({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useColors();
  const { top } = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: top + Spacing.md }]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color={colors.accent} />
          </Pressable>
          <Text variant="title">{title}</Text>
        </View>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing["2xl"],
  },
  header: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
});
