import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const numbers = Array.from({length: 21}, (_, index) => index * 5);

const CELL_WIDTH = 4;
const CELL_HEIGHT = 100;
const CELL_GAP = 2;

const ITEM_WIDTH = CELL_WIDTH * 5 + CELL_GAP * 4;
const GAP = CELL_GAP;

export default function TunerSlider() {
  const [value, setValue] = useState(0);
  const [halfW, setHalfW] = useState(0);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / (ITEM_WIDTH + GAP));
    setValue(numbers[idx]);
  };

  return (
      <View style={styles.mainContainer}>
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
        </View>

        <View style={styles.flatListContainer}>
          <FlatList
            data={numbers}
            horizontal
            showsHorizontalScrollIndicator={false}
            onLayout={e => setHalfW(e.nativeEvent.layout.width / 2)}
            bounces={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            scrollEventThrottle={16}
            snapToAlignment="start"
            snapToOffsets={numbers.map(
              (_, index) => index * (ITEM_WIDTH + GAP),
            )}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH + GAP,
              offset: index * (ITEM_WIDTH + GAP),
              index,
            })}
            contentContainerStyle={{
              ...styles.flatListContentContainer,
              paddingHorizontal: halfW - ITEM_WIDTH / 2,
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyExtractor={item => String(item)}
            renderItem={({item}) => (
              <View style={styles.itemWrapper}>
                <Text style={styles.itemText}>{item}</Text>
                <View style={styles.itemBox}>
                  {Array.from({length: 5}, (_, index) => (
                    <View
                      key={new Date().getTime() + index}
                      style={[
                        styles.cell,
                        {
                          backgroundColor: index === 2 ? 'red' : 'white',
                          opacity:
                            index === 2
                              ? 1
                              : item === 0 && index < 2
                              ? 0
                              : item === 100 && index > 2
                              ? 0
                              : 0.6,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
          />

          <View
            style={[
              styles.centerLine,
              {left: Math.round(halfW - CELL_WIDTH / 2)},
            ]}
            pointerEvents="none"
          />

          <View style={styles.overlayContainer}>
            <View style={styles.leftHandle}>
              <View style={styles.leftHandleInner} />
            </View>
            <View style={styles.rightHandle}>
              <View style={styles.rightHandleInner} />
            </View>
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '20%',
  },
  valueText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  flatListContainer: {
    width: '100%',
    height: '40%',
  },
  centerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: CELL_WIDTH,
    height: '50%',
    backgroundColor: 'yellow',
    zIndex: 10,
  },
  flatListContentContainer: {
    alignItems: 'center',
    backgroundColor: 'rgb(37, 37, 37)',
    height: '50%',
  },
  separator: {
    width: GAP,
  },
  itemWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  itemBox: {
    width: ITEM_WIDTH,
    height: CELL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  itemText: {
    fontSize: 16,
    color: 'white',
  },
  cell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    borderRadius: 2,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    height: '50%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftHandle: {
    width: 40,
    height: '100%',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'flex-end',
  },
  leftHandleInner: {
    width: 15,
    height: '100%',
    backgroundColor: 'rgb(37, 37, 37)',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  rightHandle: {
    width: 40,
    height: '100%',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'flex-start',
  },
  rightHandleInner: {
    width: 15,
    height: '100%',
    backgroundColor: 'rgb(37, 37, 37)',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
});
