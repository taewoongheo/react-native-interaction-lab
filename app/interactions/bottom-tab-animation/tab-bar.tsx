import { Entypo } from "@expo/vector-icons";
import {
  Canvas,
  LinearGradient,
  Path,
  RoundedRect,
  Skia,
} from "@shopify/react-native-skia";
import { usePathname, useRouter } from "expo-router";
import { Dimensions, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

const routes = [
  { icon: "app-store", route: "apple" },
  { icon: "book", route: "book-mark" },
  { icon: "aircraft", route: "add" },
  { icon: "air", route: "profile" },
  { icon: "500px", route: "settings" },
] as const;

const { width: windowWidth } = Dimensions.get("screen");
const tabBarWidth = windowWidth * 0.85;
const internalHorizontalPadding = windowWidth * 0.05;
const tabBarItemWidth =
  (tabBarWidth - internalHorizontalPadding * 2) / routes.length;

const tabBarHeight = 60;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AnimatedTabItem({
  isVisible,
  name,
  onPress,
}: {
  isVisible: boolean;
  name: string;
  onPress: () => void;
}) {
  const rOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isVisible ? 1 : 0.6),
    };
  });

  return (
    <AnimatedPressable
      style={[
        {
          width: tabBarItemWidth,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        rOpacity,
      ]}
      onPress={onPress}
    >
      <Entypo name={name as any} size={24} color="white" />
    </AnimatedPressable>
  );
}

export default function TabBar() {
  const pathname = usePathname();
  const activeIndex = Math.max(
    0,
    routes.findIndex((route) => pathname.endsWith(`/${route.route}`)),
  );
  const router = useRouter();

  const rHighlightedViewStyle = useAnimatedStyle(() => {
    const offset = internalHorizontalPadding + activeIndex * tabBarItemWidth;

    return {
      transform: [{ translateX: withTiming(offset, { duration: 200 }) }],
    };
  }, [activeIndex]);

  const skPath = useDerivedValue(() => {
    const path = Skia.Path.Make();

    const padding = 7;

    path.moveTo(padding, 0);
    path.lineTo(tabBarItemWidth - padding, 0);
    path.lineTo(tabBarItemWidth, tabBarHeight);
    path.lineTo(0, tabBarHeight);
    path.close();

    return path;
  });

  const widthPadding = 3;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 40,
        width: tabBarWidth,
        height: tabBarHeight,
        alignSelf: "center",
        backgroundColor: "#151515ff",
        borderRadius: 30,
        paddingHorizontal: internalHorizontalPadding,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            width: tabBarItemWidth,
            height: "100%",
            borderRadius: 10,
          },
          rHighlightedViewStyle,
        ]}
      >
        <Canvas style={{ flex: 1 }}>
          <Path path={skPath}>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: tabBarHeight }}
              colors={["white", "transparent"]}
            />
          </Path>
          <RoundedRect
            x={widthPadding}
            y={0}
            width={tabBarItemWidth - widthPadding * 2}
            height={6}
            r={10}
            color={"white"}
          />
        </Canvas>
      </Animated.View>
      {routes.map((route, index) => {
        return (
          <AnimatedTabItem
            key={route.route}
            isVisible={activeIndex === index}
            name={route.icon}
            onPress={() => {
              router.navigate(
                `/interactions/bottom-tab-animation/${route.route}?param=${route.icon}`,
              );
            }}
          />
        );
      })}
    </View>
  );
}
