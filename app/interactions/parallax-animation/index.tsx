import {
  Dimensions,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";

export const Images = [
  "https://images.unsplash.com/photo-1712174863129-dcbd52938915?q=100&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1621897100070-055b183ead92?q=100&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1623093386041-a0915e5a1ca4?q=100&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1513883524931-aaab83bcb19b?q=100&w=2992&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1712174863129-dcbd52938915?q=100&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1621897100070-055b183ead92?q=100&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1623093386041-a0915e5a1ca4?q=100&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1513883524931-aaab83bcb19b?q=100&w=2992&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1712174863129-dcbd52938915?q=100&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1621897100070-055b183ead92?q=100&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1623093386041-a0915e5a1ca4?q=100&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1513883524931-aaab83bcb19b?q=100&w=2992&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const { width: WindowWidth } = Dimensions.get("window");

const ItemWidth = WindowWidth * 0.8;

const ItemInternalPadding = 10;
const ItemContainerWidth = ItemWidth + ItemInternalPadding * 2;

const ListPadding = (WindowWidth - ItemContainerWidth) / 2;

export default function ParallaxAnimation() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const scrollOffset = useScrollOffset(scrollRef);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        style={{ flex: 1 }}
        contentContainerStyle={{
          alignItems: "center",
          paddingLeft: ListPadding,
          paddingRight: ListPadding,
        }}
        snapToInterval={ItemContainerWidth}
        pagingEnabled
        decelerationRate="fast"
      >
        {Images.map((image, index) => (
          <ListItem
            scrollOffset={scrollOffset}
            image={image}
            key={index}
            index={index}
            itemWidth={ItemWidth}
            style={{ marginHorizontal: ItemInternalPadding }}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

type ListItemProps = {
  image: string;
  itemWidth: number;
  style?: StyleProp<ViewStyle>;
  scrollOffset: SharedValue<number>;
  index: number;
};

function ListItem({
  image,
  itemWidth,
  style,
  scrollOffset,
  index,
}: ListItemProps) {
  const inputRange = [
    ItemContainerWidth * (index - 1),
    ItemContainerWidth * index,
    ItemContainerWidth * (index + 1),
  ];

  const rImageStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollOffset.value,
      inputRange,
      [-200, 0, 200],
    );

    return {
      transform: [{ translateX: translateX }, { scale: 1.7 }],
    };
  }, []);

  const rContainerStyle = useAnimatedStyle(() => {
    const outputRange = [1, 1.05, 1];
    const scale = interpolate(scrollOffset.value, inputRange, outputRange);

    return {
      transform: [{ scale: scale }],
    };
  }, []);

  return (
    <Animated.View
      style={[{ overflow: "hidden", borderRadius: 20 }, style, rContainerStyle]}
    >
      <Animated.Image
        source={{ uri: image }}
        resizeMode="cover"
        style={[
          { width: itemWidth, aspectRatio: 0.6, borderRadius: 20 },
          rImageStyle,
        ]}
      />
    </Animated.View>
  );
}
