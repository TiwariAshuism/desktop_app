import React, { useState } from "react";
import { Button } from "@mui/material";

interface bluetoothInterface {
  id: number;
  device_name: string;
  address: string;
}

interface GetBluetoothConnectionProps {}

const GetBluetoothConnection: React.FC<GetBluetoothConnectionProps> = (
  props
) => {
  let [bluetoothData, newbluetoothData] = useState<bluetoothInterface[]>([]);
  const handleButtonClick = async (): Promise<void> => {
    try {
      const response = await fetch("http://localhost:5000/start_scan");
      const reader = response.body!.getReader();
      const decoder = new TextDecoder("utf-8");
      newbluetoothData([]);
      const processChunk: (
        result: ReadableStreamReadResult<Uint8Array>
      ) => Promise<void> = async ({ done, value }) => {
        if (done) {
          return;
        }

        const jsonString = decoder.decode(value);
        const jsonData = JSON.parse(jsonString);
        newbluetoothData((prevData) => [...prevData, jsonData]);
        // Handle the scan results in your ReactJS application
        console.log(bluetoothData);

        // Continue processing the next chunk
        return reader.read().then(processChunk);
      };

      // Start processing the chunks
      await reader.read().then(processChunk);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleConnectButtonClick = async (
    device_name: string
  ): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:5000/connect/${device_name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_name: device_name,
        }),
      });

      // Handle the response from the server as needed
      console.log("Connection response:", await response.json());
    } catch (error) {
      console.error("Error connecting:", error);
    }
  };
  return (
    <>
      <Button onClick={handleButtonClick}>
        Click here to Detect Serial Ports
      </Button>
      {bluetoothData.map((element) => (
        <div key={element.id}>
          <li key={element.id}>
            <button onClick={()=>handleConnectButtonClick(element.device_name)}>{element.device_name}</button>
           
          </li>
          <br />
        </div>
      ))}
    </>
  );
};

export default GetBluetoothConnection;
