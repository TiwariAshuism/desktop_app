import * as React from "react";

export interface SmartLight {
  connect: () => void;
  isConnected: boolean;
  toggle: () => void;
}

export const UseSmartLight = (): SmartLight => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [toggleCharacteristic, setToggleCharacteristic] =
    React.useState<BluetoothRemoteGATTCharacteristic | null>(null);

  const connect = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
      });
      console.log(device);
      const server = await device.gatt?.connect();
      if (!server) {
        console.error("Failed to connect to the Bluetooth server.");
        return;
      }

      // Retrieve all services
      const services = await server.getPrimaryServices();

      // Use the first service found (you may want to loop through services based on your requirements)
      const service = services[0];

      // Retrieve all characteristics of the service
      const characteristics = await service.getCharacteristics();

      // Use the first characteristic found
      const toggleChar = characteristics[0];

      setToggleCharacteristic(toggleChar);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting to the Bluetooth device:", error);
    }
  };

  const toggle = async () => {
    const currentValue = await toggleCharacteristic?.readValue();
    const lightIsCurrentlyOn = currentValue?.getUint8(0) ? true : false;

    await toggleCharacteristic?.writeValue(
      new Uint8Array([lightIsCurrentlyOn ? 0x0 : 0x1])
    );
  };

  return { connect, toggle, isConnected };
};
