import { StyleSheet, Text, View } from "react-native";
import Animated, {
  clamp,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ReText } from "react-native-redash";
import { useCallback, useRef } from "react";

export const sections = [
  {
    title: "Introduction",
    description:
      "Chess openings are the first few moves of a chess game. There are many different chess openings, and each one has its own set of ideas and strategies. Here are some of the most popular chess openings:",
  },
  {
    title: "The Ruy Lopez",
    description:
      "his opening is named after the 16th-century Spanish bishop Ruy López de Segura. It starts with the moves 1.e4 e5 2.Nf3 Nc6 3.Bb5, and it is known for its focus on controlling the center of the board and attacking the black king.",
  },
  {
    title: "The Sicilian Defense",
    description:
      "The Sicilian Defense: This opening is the most popular choice for Black, and it starts with the move 1.e4 c5. It is known for its aggressive nature and the many tactical possibilities it offers.",
  },
  {
    title: "The French Defense",
    description:
      "This opening is named after the French chess master André Danican Philidor, who popularized it in the 18th century. It starts with the moves 1.e4 e6, and it is known for its solid and defensive nature.",
  },
  {
    title: "The Italian Game",
    description:
      "This opening starts with the moves 1.e4 e5 2.Nf3 Nc6 3.Bc4, and it is known for its focus on rapid development and control of the center.",
  },
  {
    title: "The Caro-Kann Defense",
    description:
      "This opening is named after the Austrian chess master Rudolf Spielmann, who popularized it in the 19th century. It starts with the moves 1.e4 c6, and it is known for its focus on controlling the center of the board.",
  },
  {
    title: "The Queen’s Gambit",
    description:
      "This opening is named after the 16th-century English queen Elizabeth I, who was known for her love of chess. It starts with the moves 1.d4 d5 2.c4, and it is known for its focus on controlling the center of the board.",
  },
  {
    title: "The Nimzo-Indian Defense",
    description:
      "This opening is named after the Indian chess master Aron Nimzowitsch, who popularized it in the 20th century. It starts with the moves 1.d4 Nf6 2.c4 e6, and it is known for its focus on controlling the center of the board.",
  },
  {
    title: "The King’s Gambit",
    description:
      "This opening is named after the 16th-century English king Henry VIII, who was known for his love of chess. It starts with the moves 1.e4 e5 2.f4, and it is known for its focus on controlling the center of the board.",
  },
  {
    title: "The King’s Indian Attack",
    description:
      "This opening is named after the 16th-century Indian king Shivaji, who was known for his love of chess. It starts with the moves 1.d4 Nf6 2.c4 g6, and it is known for its focus on controlling the center of the board.",
  },
  {
    title: "The Queen’s Indian Defense",
    description:
      "This opening is named after the 16th-century Indian queen Rani Lakshmibai, who was known for her love of chess. It starts with the moves 1.d4 Nf6 2.c4 e6, and it is known for its focus on controlling the center of the board.",
  },
  {
    title: "The Grünfeld Defense",
    description:
      "This opening is named after the 16th-century German chess master Samuel Loyd, who was known for his love of chess. It starts with the moves 1.d4 Nf6 2.c4 g6, and it is known for its focus on controlling the center of the board.",
  },
  {
    title: "The Benoni Defense",
    description:
      "This opening is named after the 16th-century South African chess master Benoni, who was known for his love of chess. It starts with the moves 1.d4 Nf6 2.c4 c5, and it is known for its focus on controlling the center of the board.",
  },
  {
    title: "The English Opening",
    description:
      "This opening is named after the 16th-century English chess master, who was known for his love of chess. It starts with the moves 1.c4 e5, and it is known for its focus on controlling the center of the board.",
  },
  {
    title: "The Four Knights Game",
    description:
      "This opening is named after the 16th-century English chess master, who was known for his love of chess. It starts with the moves 1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6, and it is known for its focus on controlling the center of the board.",
  },
];

export default function ScrollablePercentage() {
  const progress = useSharedValue(0);
  const scrollHeight = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      progress.value = clamp(
        event.contentOffset.y /
          (event.contentSize.height - event.layoutMeasurement.height),
        0,
        1,
      );
    },
  });

  const scrollRef = useRef<Animated.ScrollView>(null);

  const onReset = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0 });
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#101010",
    },
    scrollable: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 160,
    },
    listItem: {
      marginBottom: 20,
    },
    title: {
      fontSize: 25,
      color: "white",
      fontWeight: "bold",
    },
    description: {
      marginTop: 8,
      fontSize: 18,
      color: "rgba(255, 255, 255, 0.5)",
    },
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onLayout={(e) => (scrollHeight.value = e.nativeEvent.layout.height)}
        style={styles.scrollable}
      >
        {sections.map(({ title, description }, key) => {
          return (
            <View key={key} style={styles.listItem}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          );
        })}
      </Animated.ScrollView>
      <ProgressIndicator
        onReset={onReset}
        progress={progress}
        readingTime={getReadingTime(
          sections
            .map(({ title, description }) => `${title} ${description}`)
            .join(" "),
        )}
      />
    </View>
  );
}

import { AntDesign } from "@expo/vector-icons";

type ProgressIndicatorProps = {
  readingTime: number;
  progress: SharedValue<number>;
  onReset: () => void;
};

const MIN_PROGRESS_INDICATOR_SIZE = 80;

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  readingTime,
  progress,
  onReset,
}) => {
  const { rIdleViewStyle, rEndViewStyle, rExpandedViewStyle, state } =
    useSharedProgressState(progress);

  const rStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(
        state.value === "expanded" ? 200 : MIN_PROGRESS_INDICATOR_SIZE,
      ),
    };
  }, []);

  const rExpandedProgressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  }, []);

  const progressPercentage = useDerivedValue(() => {
    return `${Math.floor(progress.value * 100)}%`;
  });

  const styles = StyleSheet.create({
    container: {
      height: MIN_PROGRESS_INDICATOR_SIZE,
      aspectRatio: 1,
      position: "absolute",
      bottom: 40,
      left: 0,
      right: 0,
      alignSelf: "center",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      height: "100%",
      borderRadius: MIN_PROGRESS_INDICATOR_SIZE / 2,
      borderWidth: 5,
      borderColor: "#202020",
      backgroundColor: "#2D2D2D",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    idleLabel: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.5)",
      position: "absolute",
    },
    expandedContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      paddingHorizontal: 20,
    },
    progressText: {
      color: "#9D9D9D",
      fontSize: 17,
      marginRight: 12,
    },
    progressBarContainer: {
      width: 100,
      height: 5,
      borderRadius: 5,
      backgroundColor: "#191919",
      overflow: "hidden",
    },
    progressPercentage: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "#9D9D9D",
    },
  });

  return (
    <View style={styles.container}>
      {/* Idle View Container */}
      <Animated.View style={[styles.content, rStyle]}>
        <Animated.Text style={[styles.idleLabel, rIdleViewStyle]}>
          {readingTime} min
        </Animated.Text>
        {/* End View Container */}
        <Animated.View
          onTouchEnd={() => {
            onReset();
          }}
          style={[
            {
              position: "absolute",
              zIndex: 1,
            },
            rEndViewStyle,
          ]}
        >
          <AntDesign
            name="arrow-up"
            size={32}
            color="rgba(255, 255, 255, 0.5)"
          />
        </Animated.View>
        {/* Expanded View Container */}
        <Animated.View style={[styles.expandedContainer, rExpandedViewStyle]}>
          <ReText text={progressPercentage} style={styles.progressText} />
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[styles.progressPercentage, rExpandedProgressBarStyle]}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

type ProgressState = "idle" | "expanded" | "end";

export const useSharedProgressState = (progress: SharedValue<number>) => {
  const state: SharedValue<ProgressState> = useDerivedValue(() => {
    if (progress.value === 0) return "idle";
    if (progress.value === 1) return "end";
    return "expanded";
  });

  const rIdleViewStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(state.value === "idle" ? 1 : 0),
    };
  }, []);

  const rEndViewStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(state.value === "end" ? 1 : 0),
      pointerEvents: state.value === "end" ? "auto" : "none",
    };
  }, []);

  const rExpandedViewStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(state.value === "expanded" ? 1 : 0),
    };
  }, []);

  return {
    rIdleViewStyle,
    rEndViewStyle,
    rExpandedViewStyle,
    state,
  };
};

function getReadingTime(text: string) {
  const wordsPerMinute = 200;
  const numberOfWords = text.split(/\s/g).length;
  return Math.ceil(numberOfWords / wordsPerMinute);
}
