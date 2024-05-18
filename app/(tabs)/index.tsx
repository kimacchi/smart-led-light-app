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
  Pressable,
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

import { BleManager, Characteristic, Device } from "react-native-ble-plx";
import React from "react";

export default function HomeScreen() {
  const { value, setValue } = useContext(TestContext);
  const [color, setColor] = useState(toHsv("green"));
  const [devices, setDevices] = useState<Device[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [connectedDevice, setConnectedDevice] = useState<Device>();
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
      <Pressable
        onPress={() => {
          connectDevice(item);
        }}
      >
        <Text
          style={
            colorScheme == "light" ? lightStyle.modalText : darkStyle.modalText
          }
        >
          {item.name ? item.name : item.id}
        </Text>
        <Button
          title="Connect"
          onPress={() => {
            connectDevice(item);
          }}
        ></Button>
      </Pressable>
    </View>
  );

  const handleDisconnected = async (error: Error | null, device: Device) => {
    if (error) {
      console.error("Bağlantı kesildi:", error);
      // Yeniden bağlanma işlemi
      try {
        await device.connect(); // veya connectToDevice fonksiyonunu tekrar çağırın
        console.log("Yeniden bağlandı!");
      } catch (error) {
        console.error("Yeniden bağlanma hatası:", error);
      }
    }
  };

  const connectDevice = (device: Device) => {
    setModalVisible(false);
    manager.stopDeviceScan();
    manager
      .connectToDevice(device.id)
      .then(async (device) => {
        const temp = await device.discoverAllServicesAndCharacteristics();
        manager.stopDeviceScan();
        if (await temp.isConnected()) {
          setDisplayText(`Device connected\n with ${device.name}`);
        }
        setConnectedDevice(device);
        setDevices([]);
        while (!temp.isConnected()) {
          console.log(await temp.isConnected());
          device.onDisconnected((error) => handleDisconnected(error, device));
        }
        console.log("cihaz adi:", device.name);
      })
      .catch((e) => {
        console.log("error", e);
      });
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
        onPress={requestBluetoothPermission}
        title="Set your mood."
        color="#0080ff"
        accessibilityLabel="Learn more about this purple button"
      />
      <View>
        <Button title="Scan Devices" onPress={scanForDevices} />
      </View>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View
          style={
            colorScheme == "light"
              ? lightStyle.modalContainer
              : darkStyle.modalContainer
          }
        >
          <View
            style={
              colorScheme == "light"
                ? lightStyle.modalContent
                : darkStyle.modalContent
            }
          >
            <FlatList
              data={devices}
              renderItem={renderItem}
              keyExtractor={(item) => item.id || ""}
            />
          </View>
        </View>
      </Modal>
      <Text>{displayText}</Text>
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
  modalContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    height: "75%",
    width: "90%",
    backgroundColor: "black",
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    position: "absolute",
    bottom: "7%",
    left: "5%",
  },
  modalText: {
    color: "white",
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
  modalContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    height: "25%",
    width: "100%",
    backgroundColor: "#25292e",
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: "absolute",
    bottom: 0,
  },
  modalText: {
    color: "white",
  },
});
