import { Link } from "expo-router";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTransitions } from "./transitions-provider";
import { useCallback, useMemo, useState } from "react";
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";
import { FlatList } from "react-native-gesture-handler";
import { Notes, Palette } from "./constants";
import { AntDesign } from "@expo/vector-icons";
import { NoteType } from "./atoms";
import PressableScale from "./pressable-scale";
import { LinearGradient } from "expo-linear-gradient";

export default function NavigatingWithShaders() {
  const [currentScreen, setCurrentScreen] = useState<"home" | "detail">("home");
  const [notes, setNotes] = useState<NoteType[]>(Notes);

  const handleAddNote = useCallback((newNote: string) => {
    setNotes((prev) => [
      {
        id: (prev.length + 1).toString(),
        title: newNote,
      },
      ...prev,
    ]);
    setCurrentScreen("home");
  }, []);

  if (currentScreen === "detail") {
    return (
      <DetailScreen
        onSave={handleAddNote}
        onClose={() => setCurrentScreen("home")}
      />
    );
  }

  return (
    <HomeScreen
      notes={notes}
      onNavigateToDetail={() => setCurrentScreen("detail")}
    />
  );
}

function HomeScreen({
  onNavigateToDetail,
  notes,
}: {
  onNavigateToDetail: () => void;
  notes: NoteType[];
}) {
  const { top: safeTop, bottom: safeBottom } = useSafeAreaInsets();
  const { prepareTransition } = useTransitions();

  const ListHeaderComponent = useMemo(() => {
    return (
      <View style={styles.listHeaderContainer}>
        <View style={styles.fillStart}>
          <Text
            style={[
              {
                color: Palette.primary,
              },
              styles.headerTitle,
            ]}
          >
            Add Note
          </Text>
        </View>
        <PressableScale
          onPress={async () => {
            await prepareTransition();
            onNavigateToDetail();
          }}
          style={[
            styles.button,
            {
              backgroundColor: Palette.primary,
            },
          ]}
        >
          <AntDesign name="plus" size={24} color="white" />
        </PressableScale>
      </View>
    );
  }, [prepareTransition, onNavigateToDetail]);

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background }}>
      <FlatList
        data={notes}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={{
          paddingTop: safeTop + 8,
          paddingBottom: safeBottom,
          backgroundColor: Palette.background,
        }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          return (
            <Animated.View
              entering={FadeInDown.delay(index * 100)}
              exiting={FadeOutDown}
              layout={LinearTransition.springify().damping(20).stiffness(90)}
              style={[
                styles.card,
                {
                  backgroundColor: Palette.surface,
                  marginHorizontal: 16,
                  marginBottom: 12,
                },
              ]}
            >
              <Text
                style={{
                  color: Palette.text,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {item.title}
              </Text>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

function DetailScreen({
  onSave,
  onClose,
}: {
  onSave: (note: string) => void;
  onClose: () => void;
}) {
  const [noteText, setNoteText] = useState("");
  const { top: safeTop } = useSafeAreaInsets();
  const { runTransition } = useTransitions();

  const handleSave = useCallback(async () => {
    if (!noteText) {
      Alert.alert("Empty Note", "Please write something before saving");
      return;
    }
    await runTransition(() => {
      onSave(noteText);
    });
  }, [noteText, onSave, runTransition]);

  const handleClose = useCallback(async () => {
    await runTransition();
    setTimeout(() => {
      onClose();
    }, 1000);
  }, [onClose, runTransition]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Palette.background,
        paddingHorizontal: 8,
      }}
    >
      <LinearGradient
        colors={["rgba(255, 0, 0, 0.05)", "transparent", "transparent"]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={{
          flexDirection: "row",
          paddingTop: safeTop + 16,
        }}
      >
        <PressableScale onPress={handleClose} style={styles.button}>
          <AntDesign name="close" size={32} color={Palette.text} />
        </PressableScale>
        <View style={styles.fillCenter}>
          <Text
            style={{
              fontSize: 18,
              color: Palette.text,
            }}
          >
            Create a new Note
          </Text>
        </View>
        <PressableScale onPress={handleSave} style={styles.button}>
          <AntDesign name="check" size={32} color={Palette.primary} />
        </PressableScale>
      </View>
      <TextInput
        style={styles.textInput}
        placeholder="Write your note here..."
        placeholderTextColor="#999"
        multiline
        autoFocus
        value={noteText}
        onChangeText={setNoteText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  fillStart: {
    flex: 1,
    alignItems: "flex-start",
  },
  fillCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderCurve: "continuous",
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: Palette.text,
    padding: 24,
    textAlignVertical: "top",
  },
});
