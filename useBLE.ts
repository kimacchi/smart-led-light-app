import { useEffect, useMemo, useRef, useState } from "react";
import { BleManager, Device } from "react-native-ble-plx";
import { PermissionsAndroid, Platform } from "react-native";
//import * as ExpoDevice from "expo-device";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  allDevices: Device[];
  connectToDevice: (deviceId: Device) => Promise<void>;
  connectedDevice: Device | null;
}

function useBLE(): BluetoothLowEnergyApi {
  // const bleManager = useMemo(() => new BleManager(), []);
  const bleManager = useRef(null as unknown as BleManager);

  useEffect(() => {
    if (!bleManager.current) {
      bleManager.current = new BleManager();
    }
    //same code of before
    return () => {
      // _isMounted.current = false;
      // delete bleManager.current; //adding or commenting this does not change the issue situation
    };
  }, []);

  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      const apiLevel = parseInt(Platform.Version.toString(), 10);
      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.current.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const connectToDevice = async (device: Device) => {
    try {
      const isPermissionsEnabled = await requestPermissions();
      if (isPermissionsEnabled) {
        const deviceConnection = await bleManager.current.connectToDevice(
          device.id
        );
        setConnectedDevice(deviceConnection);
        console.log("cihaaz: ", await deviceConnection.isConnected());
        await deviceConnection.discoverAllServicesAndCharacteristics();
      }

      bleManager.current.stopDeviceScan();
      // scanForPeripherals();
      // const isPermissionsEnabled2 = await requestPermissions();
      // if (isPermissionsEnabled2) {
      //   const disconnectDevice = () => {
      //     device.cancelConnection();
      //     setConnectedDevice(null);
      //   };
      //   const connectAgain = await bleManager.current.connectToDevice(
      //     device.id
      //   );
      //   setConnectedDevice(connectAgain);
      //   console.log("cihaaz: ", await connectAgain.isConnected());
      //   //await deviceConnection.discoverAllServicesAndCharacteristics();
      // }
      // console.log(temp.isConnected);
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };

  return {
    scanForPeripherals,
    requestPermissions,
    allDevices,
    connectToDevice,
    connectedDevice,
  };
}

export default useBLE;
