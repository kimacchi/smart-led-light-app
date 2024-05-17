import {
  Image,
  StyleSheet,
  Platform,
  TextInput,
  View,
  Text,
  Button,
  PermissionsAndroid,
  Modal,
  FlatList,
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

import { BleManager, Device } from "react-native-ble-plx";
import React from "react";

export default function HomeScreen() {
  const { value, setValue } = useContext(TestContext);
  const [color, setColor] = useState(toHsv("green"));
  const [devices, setDevices] = useState<Device[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const manager = new BleManager();

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

  const scanForDevices = async () => {
    try {
      setModalVisible(true);
      manager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.error("Error scanning devices:", error);
          return;
        }
        setDevices((devices) => {
          const existingDeviceIndex = devices.findIndex(
            (device) => device.id === scannedDevice!.id
          );
          if (existingDeviceIndex !== -1) {
            devices[existingDeviceIndex] = scannedDevice!;
            return [...devices];
          } else {
            return [...devices, scannedDevice!];
          }
        });
      });
    } catch (error) {
      console.error("Error starting device scan:", error);
    }
  };

  const renderItem = ({ item }: { item: Device }) => (
    <View>
      <Text>{item.name ? item.name : item.id}</Text>
    </View>
  );

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
        onPress={requestBluetoothPermission}
        title="Set your mood."
        color="#0080ff"
        accessibilityLabel="Learn more about this purple button"
      />
      <View>
        <Button title="Scan Devices" onPress={scanForDevices} />
        <FlatList
          data={devices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || ""}
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
