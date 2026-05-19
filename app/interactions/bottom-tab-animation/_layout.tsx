import { Tabs } from "expo-router";
import TabBar from "./tab-bar";

export default function BottomTabAnimationLayout() {
  return (
    <Tabs
      initialRouteName="apple"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={() => <TabBar />}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="apple" />
      <Tabs.Screen name="book-mark" />
      <Tabs.Screen name="add" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
