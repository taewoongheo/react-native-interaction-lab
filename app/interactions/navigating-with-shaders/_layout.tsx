import { Stack } from "expo-router";

import { TransitionsProvider } from "./transitions-provider";

export default function NavigatingWithShadersLayout() {
  return (
    <TransitionsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </TransitionsProvider>
  );
}
