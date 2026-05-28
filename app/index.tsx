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
    title: "Expandable Bottom Sheet",
    description: "Compact-to-expanded sheet with drag and button controls",
    route: "/interactions/expandable-bottom-sheet",
  },
  {
    title: "Cylinder Carousel",
    description: "3D arc carousel driven by pan and tap gestures",
    route: "/interactions/cylinder-carousel",
  },
  {
    title: "Action Slider",
    description: "Action Slider",
    route: "/interactions/action-slider",
  },
  {
    title: "Navigate with Shaders",
    description: "Navigate with Shaders",
    route: "/interactions/navigating-with-shaders",
  },
  {
    title: "CornerPathEffect",
    description: "Dynamic corner radius for a single Skia path",
    route: "/interactions/corner-path-effect",
  },
  {
    title: "Image Shader Transitions",
    description: "Image Shader Transitions",
    route: "/interactions/image-shader-transitions",
  },
  {
    title: "Bottom Tab Animation",
    description: "Bottom Tab Animation",
    route: "/interactions/bottom-tab-animation/apple",
  },
  {
    title: "Invert Clip Blob",
    description: "Invert Clip Blob",
    route: "/interactions/invert-clip-blob",
  },
  {
    title: "ClipPanGesture",
    description: "Clip Pan Gesture",
    route: "/interactions/clip-pan-gesture",
  },
  {
    title: "AnimatedBezierCurve",
    description: "Animated Bezier Curve",
    route: "/interactions/animated-bezier-curve",
  },
  {
    title: "Animate Through A Path",
    description: "Animate Through A Path",
    route: "/interactions/animate-through-a-path",
  },
  {
    title: "AnimatedPath",
    description: "AnimatedPath",
    route: "/interactions/animated-path",
  },
  {
    title: "Skia Magical Button",
    description: "Skia Magical Button",
    route: "/interactions/skia-magical-button",
  },
  {
    title: "Skia Gesture Comparison",
    description: "GestureDetector vs react-native-skia-gesture (SNS demo)",
    route: "/interactions/skia-gesture-comparison",
  },
  {
    title: "Scroll Clamp Demo",
    description: "iOS scroll progress with clamp on/off (SNS demo)",
    route: "/interactions/scroll-clamp-demo",
  },
  {
    title: "Family Number Input",
    description: "Family Number Input",
    route: "/interactions/family-number-input",
  },
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
      <View style={styles.listContainer}>
        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.route)}
          ListHeaderComponent={
            <Text style={styles.title}>Interaction Lab</Text>
          }
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
