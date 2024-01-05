// ChartComponent.tsx
import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    lcjs: any; // Adjust the type as needed
    require: any; // Adjust the type as needed
  }
}

const { lcjs } = window;
const { ipcRenderer } = window.require("electron");

const ChartComponent: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [dataArray, setDataArray] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    // Destructure LightningChart components from lcjs
    const { lightningChart, AxisScrollStrategies, Themes } = lcjs;

    // Your existing chart initialization code
    const chart = lightningChart({
      overrideInteractionMouseButtons: {
        chartXYPanMouseButton: 12,
        chartXYRectangleZoomFitMouseButton: 2,
      },
    }).ChartXY({ container: chartRef.current!, theme: Themes.auroraBorealis });
    const line = chart
      .addLineSeries({
        dataPattern: {
          pattern: "ProgressiveX",
          regularProgressiveStep: true,
        },
      })
      .setMaxPointCount(10000)
      .setMouseInteractions(true);
    chart
      .getDefaultAxisY()
      .setTitle("mV")

      .setScrollStrategy(AxisScrollStrategies.expansion);

    chart
      .getDefaultAxisX()
      .setTitle("second")
      .setInterval(0, 1000)
      .setScrollStrategy(AxisScrollStrategies.progressive);

    chart
      .getDefaultAxisX()
      .setTitle("milliseconds")

      .setScrollStrategy(AxisScrollStrategies.progressive);

    let x = 0;
    // Generate random data with 1200 elements

    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/get_data");
        const newDataArray = await response.json();
        setDataArray(newDataArray);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    // Call the data generation function
    if (dataArray.length === 0) {
      fetchData();
    }

    let dataIndex = 0;
    const updateChartWithArray = () => {
      if (dataIndex < dataArray.length) {
        const { x, y } = dataArray[dataIndex];
        line.add({ x, y });
        dataIndex += 1;
      }
      console.log(dataArray);
    };

    const intervalId = setInterval(updateChartWithArray, 1000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
      // Clear the chart and any intervals or data-related cleanup if necessary
      chart.dispose();
    };
  }, [dataArray]);

  return <div ref={chartRef} style={{ width: "100%", height: "100vh" }} />;
};

export default ChartComponent;
