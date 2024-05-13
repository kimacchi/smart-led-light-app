import { Image, StyleSheet, Platform, TextInput, View } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TestContext } from "../_layout";
import { useContext, useState } from "react";

import { TriangleColorPicker, toHsv } from "react-native-color-picker";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { HsvColor } from "react-native-color-picker/dist/typeHelpers";

export default function HomeScreen() {
  const { value, setValue } = useContext(TestContext);
  const [color, setColor] = useState(toHsv("green"));

  function onColorChange(color: HsvColor) {
    setColor(color);
  }
  return (
    <SafeAreaView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">
          Welcome! The Current Value Is: {value}!
        </ThemedText>
        {/* <HelloWave /> Bu component animasyon örneği içeriyor.  */}
      </ThemedView>
      <TextInput
        style={{
          padding: 8,
          margin: 8,
          borderWidth: 1,
          borderColor: "gray",
          color: "white",
        }}
        value={value}
        onChangeText={setValue}
      />
      <View style={{ height: 300, width: 300, backgroundColor: "black" }}>
        <TriangleColorPicker
          // oldColor="purple"
          color={color}
          onColorChange={onColorChange}
          onColorSelected={(color) => alert(`Color selected: ${color}`)}
          onOldColorSelected={(color) => alert(`Old color selected: ${color}`)}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
