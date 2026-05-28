import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { CylinderCarousel } from './cylinder-carousel';
import { Image } from './image';
import { Text } from './text';
import { Layout, Spacing, useColors } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SAMPLE_IMAGES = [
  'https://picsum.photos/id/10/400/560',
  'https://picsum.photos/id/20/400/560',
  'https://picsum.photos/id/30/400/560',
  'https://picsum.photos/id/40/400/560',
  'https://picsum.photos/id/50/400/560',
  'https://picsum.photos/id/60/400/560',
  'https://picsum.photos/id/70/400/560',
  'https://picsum.photos/id/80/400/560',
];

const THUMB_SIZE = 100;

export function CylinderCarouselDemo() {
  const { colors } = useColors();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      {/* Main image */}
      <View style={[styles.mainImageArea, { backgroundColor: colors.backgroundGrouped }]}>
        <Image
          source={{ uri: SAMPLE_IMAGES[activeIndex] }}
          radius="lg"
          style={styles.mainImage}
          contentFit="cover"
        />
      </View>

      <Text variant="caption" color="textSecondary" style={styles.hint}>
        Swipe to browse
      </Text>

      {/* Thumbnail carousel */}
      <CylinderCarousel
        data={SAMPLE_IMAGES}
        cardWidth={THUMB_SIZE}
        cardHeight={THUMB_SIZE}
        cardRadius={Layout.radiusSm}
        gap={10}
        onIndexChange={setActiveIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  mainImageArea: {
    borderRadius: Layout.radiusLg,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  mainImage: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: Layout.radiusLg,
  },
  hint: {
    textAlign: 'center',
  },
});
