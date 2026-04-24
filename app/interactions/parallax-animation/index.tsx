import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import Animated from "react-native-reanimated";

export const Images = [
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
  return (
    <View style={styles.container}>
      <Animated.ScrollView
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
            image={image}
            key={index}
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
};

function ListItem({ image, itemWidth, style }: ListItemProps) {
  return (
    <View style={[style]}>
      <Image
        source={{ uri: image }}
        style={{ width: itemWidth, aspectRatio: 0.6, borderRadius: 20 }}
      />
    </View>
  );
}
