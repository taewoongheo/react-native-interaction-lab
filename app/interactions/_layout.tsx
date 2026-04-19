import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function InteractionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: styles.screen,
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
});
