import React, { useState, useEffect } from 'react';

const BluetoothComponent: React.FC = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | undefined>(undefined);
  const [receivedData, setReceivedData] = useState<string>('');

  const handleConnectButtonClick = async (selectedDevice: BluetoothDevice) => {
    try {
      setSelectedDevice(selectedDevice);

      const server = await selectedDevice.gatt?.connect();

      const serviceUUID = 'your_ble_service_uuid';
      const characteristicUUID = 'your_ble_characteristic_uuid';

      const service = await server?.getPrimaryService(serviceUUID);
      const char = await service?.getCharacteristic(characteristicUUID);

      setCharacteristic(char);

      // Start receiving notifications
      await char?.startNotifications();
      char?.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    } catch (error) {
      console.error('Error connecting to BLE device:', error);
    }
  };

  const handleCharacteristicValueChanged = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    const receivedText = new TextDecoder().decode(value);
    setReceivedData(receivedText);
    console.log('Received data:', receivedText);
  };

  const handleDiscoverButtonClick = async () => {
    try {
      const availableDevices = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['your_optional_service_uuid'],
      });

      setDevices([availableDevices]);
    } catch (error) {
      console.error('Error discovering BLE devices:', error);
    }
  };

  return (
    <div>
      <h1>Bluetooth Data Receiver</h1>
      <button onClick={handleDiscoverButtonClick}>Discover Bluetooth Devices</button>
      <ul>
        {devices.map(device => (
          <li key={device.id}>
            {device.name}
            <button onClick={() => handleConnectButtonClick(device)}>Connect</button>
          </li>
        ))}
      </ul>
      {selectedDevice && <p>Connected to: {selectedDevice.name}</p>}
      {characteristic && <p>Characteristics: {characteristic.uuid}</p>}
      {receivedData && <p>Received Data: {receivedData}</p>}
    </div>
  );
};

export default BluetoothComponent;
