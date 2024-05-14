import {
  Image,
  StyleSheet,
  Platform,
  TextInput,
  View,
  Text,
  Button,
  PermissionsAndroid,
} from "react-native";

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
import { useThemeColor } from "@/hooks/useThemeColor";
import { useColorScheme } from "@/hooks/useColorScheme";

import { BleManager } from "react-native-ble-plx";

export const manager = new BleManager();

export default function HomeScreen() {
  const { value, setValue } = useContext(TestContext);
  const [color, setColor] = useState(toHsv("green"));

  function onColorChange(color: HsvColor) {
    setColor(color);
  }

  const colorScheme = useColorScheme();

  const handleSendData = () => {};

  const requestBluetoothPermission = async () => {
    if (Platform.OS === "ios") {
      return true;
    }
    if (
      Platform.OS === "android" &&
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ) {
      const apiLevel = parseInt(Platform.Version.toString(), 10);

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      if (
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      ) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          result["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.BLUETOOTH_SCAN"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.ACCESS_FINE_LOCATION"] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }

    // this.showErrorToast("Permission have not been granted");
    console.log("Permission have not been granted");

    return false;
  };

  return (
    <SafeAreaView
      style={
        colorScheme == "light" ? lightStyle.container : darkStyle.container
      }
    >
      <Text style={colorScheme == "light" ? lightStyle.text : darkStyle.text}>
        Select your own ambiance.
      </Text>
      <View style={{ height: 300, width: 300 }}>
        <TriangleColorPicker
          // oldColor="purple"
          color={color}
          onColorChange={onColorChange}
          onColorSelected={(color) => alert(`Color selected: ${color}`)}
          onOldColorSelected={(color) => alert(`Old color selected: ${color}`)}
          style={{ flex: 1 }}
        />
      </View>
      <Button
        onPress={handleSendData}
        title="Set your mood."
        color="#0080ff"
        accessibilityLabel="Learn more about this purple button"
      />
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

const lightStyle = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    flexGrow: 2,
    backgroundColor: "#f0fcfc",
    gap: 24,
  },
  text: {
    fontSize: 48,
    color: "#424242",
    textAlign: "center",
    fontWeight: "800",
    paddingTop: 16,
    paddingBottom: 16,
  },
});
const darkStyle = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    flexGrow: 2,
    backgroundColor: "#424242",
    gap: 24,
  },
  text: {
    fontSize: 48,
    color: "#f0fcfc",
    textAlign: "center",
    fontWeight: "800",
    paddingTop: 16,
    paddingBottom: 16,
  },
});
