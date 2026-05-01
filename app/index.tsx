import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const listData: Array<{
  title: string;
  description: string;
  route: Href;
}> = [
  {
    title: "ScrollablePercentage",
    description: "Scrollable percentage",
    route: "/interactions/scrollable-percentage",
  },
  {
    title: "AnimatedText",
    description: "Animated text",
    route: "/interactions/animated-text",
  },
  {
    title: "ParallaxAnimation",
    description: "Parallax Animation",
    route: "/interactions/parallax-animation",
  },
  {
    title: "SpatialTapGesture",
    description: "Spatial Tap Gesture",
    route: "/interactions/spatial-tap-gesture",
  },
  {
    title: "PanGestureHandler",
    description: "Pan Gesture Handler",
    route: "/interactions/pan-gesture-handler",
  },
  {
    title: "BouncingSquare",
    description: "Bouncing square",
    route: "/interactions/bouncing-square",
  },
  {
    title: "Ripple Effect",
    description: "Circular ripple animation triggered by background touch",
    route: "/interactions/ripple-effect",
  },
  {
    title: "InlineTextSwap",
    description: "Swaps inline text on touch",
    route: "/interactions/inline-text-swap",
  },
  {
    title: "Particle Effect",
    description: "Particle effect triggered by background touch",
    route: "/interactions/particle-effect",
  },
  {
    title: "TunerSlider",
    description: "Scrollable slider mimicking radio tuner",
    route: "/interactions/tuner-slider",
  },
];

const ListItem = ({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.listItem}>
      <View style={styles.bullet}>
        <Text style={styles.dot}>•</Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function Main() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Text style={styles.title}>Interaction Lab</Text>

      <View style={styles.listContainer}>
        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.route)}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              description={item.description}
              onPress={() => router.push(item.route)}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    alignItems: "flex-start",
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  listContainer: {
    width: "100%",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    width: "100%",
  },
  bullet: {
    marginRight: 8,
    paddingTop: 2,
  },
  dot: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemDescription: {
    fontSize: 14,
    color: "#666666",
  },
});
