import { StyleSheet, View } from 'react-native';
import { BottomSheet, useBottomSheet } from './bottom-sheet';
import DemoScreen from './demo-screen';
import { ExpandableBottomSheet } from './expandable-bottom-sheet';
import { Text } from './text';
import { Spacing } from './theme';

export default function () {
  const basic = useBottomSheet();
  const multiSnap = useBottomSheet();
  const scroll = useBottomSheet();
  const expandable = useBottomSheet();
  const expandableScroll = useBottomSheet();
  const dynamic = useBottomSheet();
  const dynamicExpandable = useBottomSheet();

  const sns = useBottomSheet();

  return (
    <View style={{ flex: 1 }}>
      <DemoScreen title="Bottom Sheet">
        <View style={demoStyles.grid}>
          <DemoButton label="Bottom Sheet" onPress={sns.open} />
          {/* <DemoButton label="Basic (30%)" onPress={basic.open} />
          <DemoButton label="Multi Snap" onPress={multiSnap.open} />
          <DemoButton label="Scroll Content" onPress={scroll.open} />
          <DemoButton label="Expandable" onPress={expandable.open} />
          <DemoButton label="Expandable + Scroll" onPress={expandableScroll.open} />
          <DemoButton label="Dynamic Sizing" onPress={dynamic.open} />
          <DemoButton label="Dynamic Expandable" onPress={dynamicExpandable.open} /> */}
        </View>
      </DemoScreen>

      <ExpandableBottomSheet ref={sns.ref} snapPoints={['30%']} borderRadius={45}>
        <View style={[demoStyles.content]}>
          <Text variant="subtitle">Float-to-Full Bottom Sheet</Text>
        </View>
      </ExpandableBottomSheet>

      {/* 1. Basic — single snap */}
      <BottomSheet ref={basic.ref} snapPoints={['30%']}>
        <View style={demoStyles.content}>
          <Text variant="subtitle">Basic Sheet</Text>
          <Text color="textSecondary">Single snap point at 30%</Text>
        </View>
      </BottomSheet>

      {/* 2. Multi snap — 30% / 60% */}
      <BottomSheet ref={multiSnap.ref} snapPoints={['30%', '60%']}>
        <View style={demoStyles.content}>
          <Text variant="subtitle">Multi Snap</Text>
          <Text color="textSecondary">Drag up for 60%, down for 30%</Text>
          <Text color="textSecondary">Scroll enabled at 60%</Text>
        </View>
      </BottomSheet>

      {/* 3. Scroll content — internal ScrollView */}
      <BottomSheet ref={scroll.ref} snapPoints={['40%', '70%']}>
        <View style={demoStyles.content}>
          <Text variant="subtitle">Scroll Content</Text>
          <Text color="textSecondary">Expand to 70% to scroll</Text>
          {Array.from({ length: 20 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholder list
            <View key={i} style={demoStyles.listItem}>
              <Text>Scroll item {i + 1}</Text>
            </View>
          ))}
        </View>
      </BottomSheet>

      {/* 4. Expandable — detached card effect */}
      <ExpandableBottomSheet ref={expandable.ref} snapPoints={['30%', '60%']}>
        <View style={demoStyles.content}>
          <Text variant="subtitle">Expandable</Text>
          <Text color="textSecondary">Drag past 60% to expand</Text>
          <Text color="textSecondary">Detached card at small sizes</Text>
        </View>
      </ExpandableBottomSheet>

      {/* 5. Expandable + scroll content */}
      <ExpandableBottomSheet ref={expandableScroll.ref} snapPoints={['30%', '60%']}>
        <View style={demoStyles.content}>
          <Text variant="subtitle">Expandable + Scroll</Text>
          <Text color="textSecondary">Expand fully to scroll content</Text>
          {Array.from({ length: 30 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholder list
            <View key={i} style={demoStyles.listItem}>
              <Text>Item {i + 1}</Text>
            </View>
          ))}
        </View>
      </ExpandableBottomSheet>

      {/* 6. Dynamic sizing — content height determines sheet height */}
      <BottomSheet ref={dynamic.ref} snapPoints={['50%']} enableDynamicSizing>
        <View style={demoStyles.content}>
          <Text variant="subtitle">Dynamic Sizing</Text>
          <Text color="textSecondary">Sheet height matches content</Text>
          <Text color="textSecondary">snapPoints are ignored</Text>
        </View>
      </BottomSheet>

      {/* 7. Dynamic sizing + expandable — detached card at content height */}
      <ExpandableBottomSheet ref={dynamicExpandable.ref} snapPoints={['50%']} enableDynamicSizing>
        <View style={demoStyles.content}>
          <Text variant="subtitle">Dynamic Expandable</Text>
          <Text color="textSecondary">Opens at content height</Text>
          <Text color="textSecondary">Drag up to expand fully</Text>
        </View>
      </ExpandableBottomSheet>
    </View>
  );
}

function DemoButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <View style={demoStyles.button}>
      <Text variant="label" color="accent" bold onPress={onPress} style={{ textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}

const demoStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  button: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  listItem: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
});
