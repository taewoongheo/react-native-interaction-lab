import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useScrollOffset,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ReText } from "react-native-redash";
import { Canvas, Rect, RoundedRect } from "@shopify/react-native-skia";

// SafeArea 가 추가되면 스크롤 전체 높이에 insets 만큼 더해야 됨
//  SafeArea 가 차지한 마진만큼 컨텐츠 높이가 늘어나야 하기 때문
//  따라서 onContentSizeChange 의 height 값을 받아올 때 insets 을 더해줘야 됨
//   궁금한 점은 애초에 왜 계산이 처음부터 insets 을 고려하지 않고 적용된건지?

// 구현 방법의 핵심은 스크롤이라는 하나의 shared value 에 대해 나머지 애니메이션 값들을 의존시켜서 만드는 것
// 방법은 크게 두 가지
//  1. useDerivedValue
//    너비, 텍스트 같은 값들을 스크롤 높이에 따라 계산하여 결정
//    문제는 스크롤이 바뀔때마다 계산을 해야되는데, 이게 너비를 계산하는거라 계산 비용이 큼
//    이때 너비, 텍스트가 변하는 시점은 시작점/끝에 도달할 때 뿐이니까 useAnimatedReaction 을 사용해서 정말 해당 지점에 도착했을 때 한번만 갱신하도록 하면 더 효율적임
//  2. useAnimatedReaction
//    이 방법은 시작/끝 지점에 도달했을 때만 값을 계산함
//    따라서 useDerievdValue 보다 훨씬 효율적임

// 구현하면서 든 생각 = useAnimatedReaction 에서 특정 값을 기준으로 나머지 값들을 전부 제어할 수 있다면
//  물론, useAnimatedReaction 의 목적이 사이드 이펙트를 관리하기 위함이라지만
//  결과적으로는 useDerivedValue 와 같은 방식으로 사용할 수 있음
//  그렇다면 useAnimatedReaction 을 사용하면 useDerivedValue 를 사용하지 않아도 되는건가?

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

const PROGRESS_BAR_HEIGHT = 10;
const PROGRESS_BAR_WIDTH = 200;
const PROGRESS_BAR_BORDER_RADIUS = 5;

const HEIGHT = 80;

const WIDTH = {
  stop: HEIGHT,
  progress: PROGRESS_BAR_WIDTH + 120,
};

const BORDER = {
  stop: WIDTH.stop / 2,
  progress: WIDTH.progress / 1.3,
};

export default function Attempt() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const insets = useSafeAreaInsets();

  const contentHeight = useSharedValue(0);

  const canvasWidth = useSharedValue(0);
  const canvasOpacity = useSharedValue(0);

  const width = useSharedValue(WIDTH.stop);
  const borderRadius = useSharedValue(BORDER.stop);
  const text = useSharedValue("4min");
  const percentage = useSharedValue(0);

  const progressBarWidth = useDerivedValue(() => {
    return PROGRESS_BAR_WIDTH * percentage.value;
  });

  const widthAnimation = useAnimatedStyle(() => {
    return {
      width: withTiming(width.value),
    };
  });

  const borderRadiusAnimation = useAnimatedStyle(() => {
    return {
      borderRadius: withTiming(borderRadius.value),
    };
  });

  const canvasAnimation = useAnimatedStyle(() => {
    return {
      width: withTiming(canvasWidth.value, { duration: 500 }),
      opacity: withTiming(canvasOpacity.value, { duration: 250 }),
    };
  });

  useAnimatedReaction(
    () => scrollOffset.value,
    (currentOffset) => {
      const end = currentOffset + WINDOW_HEIGHT;
      if (end >= contentHeight.value) {
        // 끝 도달
        width.value = WIDTH.stop;
        borderRadius.value = BORDER.stop;
        text.value = "up";
        percentage.value = 0;
        canvasWidth.value = 0;
        canvasOpacity.value = 0;
      } else if (end <= WINDOW_HEIGHT) {
        // 시작 도달
        width.value = WIDTH.stop;
        borderRadius.value = BORDER.stop;
        text.value = "4min";
        percentage.value = 0;
        canvasWidth.value = 0;
        canvasOpacity.value = 0;
      } else {
        const newPercentage = Math.round((end / contentHeight.value) * 100);
        width.value = WIDTH.progress;
        borderRadius.value = BORDER.progress;
        text.value = `${newPercentage}%`;
        percentage.value = newPercentage / 100;
        canvasWidth.value = PROGRESS_BAR_WIDTH;
        canvasOpacity.value = 1;
      }
    },
    [scrollOffset],
  );

  return (
    <View style={{ marginTop: insets.top, marginBottom: insets.bottom }}>
      <Animated.ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          flexDirection: "column",
          alignItems: "center",
        }}
        onContentSizeChange={(_, height) =>
          (contentHeight.value = height + insets.top + insets.bottom)
        }
      >
        <View
          style={{
            flex: 1,
            marginHorizontal: 30,
            gap: 20,
          }}
        >
          <View style={{ gap: 5 }}>
            <Title text="Title1" />
            <Content
              text="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      "
            />
          </View>
          <View style={{ gap: 5 }}>
            <Title text="Title2" />
            <Content
              text="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      "
            />
          </View>
          <View style={{ gap: 5 }}>
            <Title text="Title3" />
            <Content
              text="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      "
            />
          </View>
          <View style={{ gap: 5 }}>
            <Title text="Title4" />
            <Content
              text="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      "
            />
          </View>
          <View style={{ gap: 5 }}>
            <Title text="Title5" />
            <Content
              text="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      "
            />
          </View>
          <View style={{ gap: 5 }}>
            <Title text="Title6" />
            <Content
              text="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      "
            />
          </View>
          <View style={{ gap: 5 }}>
            <Title text="Title7" />
            <Content
              text="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      "
            />
          </View>
          <View style={{ gap: 5 }}>
            <Title text="Title8" />
            <Content
              text="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      "
            />
          </View>
          <View style={{ gap: 5 }}>
            <Title text="Title9" />
            <Content
              text="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      "
            />
          </View>
        </View>
      </Animated.ScrollView>
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 50,
            alignSelf: "center",
            backgroundColor: "gray",

            height: HEIGHT,

            borderWidth: 5,
            borderColor: "lightgray",

            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",

            gap: 10,
          },
          widthAnimation,
          borderRadiusAnimation,
        ]}
      >
        <ReText text={text} style={styles.count} />
        <Animated.View style={canvasAnimation}>
          <Canvas
            style={{
              width: PROGRESS_BAR_WIDTH,
              height: PROGRESS_BAR_HEIGHT,
              backgroundColor: "black",
              borderRadius: PROGRESS_BAR_BORDER_RADIUS,
            }}
          >
            <RoundedRect
              x={0}
              y={0}
              width={progressBarWidth}
              height={PROGRESS_BAR_HEIGHT}
              r={PROGRESS_BAR_BORDER_RADIUS}
              color="white"
            />
          </Canvas>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function Title({ text }: { text: string }) {
  return <Text style={{ fontSize: 24, fontWeight: "bold" }}>{text}</Text>;
}

function Content({ text }: { text: string }) {
  return <Text style={{ fontSize: 21, fontWeight: "regular" }}>{text}</Text>;
}

const styles = StyleSheet.create({
  count: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
});
