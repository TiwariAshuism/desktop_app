import Paper from "@mui/material/Paper";
import * as React from "react";
import { EAutoRange, FastLineRenderableSeries, libraryVersion, NumericAxis, SciChartSurface, XyDataSeries } from "scichart";
import { appTheme, RandomWalkGenerator } from "scichart-example-dependencies";
SciChartSurface.configure({
    dataUrl: `https://cdn.jsdelivr.net/npm/scichart@${libraryVersion}/_wasm/scichart2d.data`,
    wasmUrl: `https://cdn.jsdelivr.net/npm/scichart@${libraryVersion}/_wasm/scichart2d.wasm`,
    
 });
const divElementId = "chart";
const drawExample = async () => {
    const { wasmContext, sciChartSurface } = await SciChartSurface.create(divElementId, {
        theme: appTheme.SciChartJsTheme
    });

    const xAxis = new NumericAxis(wasmContext, { autoRange: EAutoRange.Always });
    sciChartSurface.xAxes.add(xAxis);
    const yAxis = new NumericAxis(wasmContext, { autoRange: EAutoRange.Always });
    sciChartSurface.yAxes.add(yAxis);
    
    const dataSeries = new XyDataSeries(wasmContext, { containsNaN: false, isSorted: true });

    sciChartSurface.renderableSeries.add(
        new FastLineRenderableSeries(wasmContext, {
            dataSeries: dataSeries,
            strokeThickness: 2,
            stroke: appTheme.VividSkyBlue
        })
    );

    const randomWalkGenerator = new RandomWalkGenerator(0);

    const updateFunc = () => {
        if (dataSeries.count() >= 200) {
            dataSeries.removeRange(0, 1);
        }

        const { xValues, yValues } = randomWalkGenerator.getRandomWalkSeries(1);
        dataSeries.appendRange(xValues, yValues);

        setTimeout(updateFunc, 10);
    };

    xAxis.autoRange = EAutoRange.Always;

    setTimeout(updateFunc, 10);

    return { wasmContext, sciChartSurface };
};

export default function RealtimePerformanceDemo() {
    const [stats, setStats] = React.useState({ numberPoints: 0, fps: 0 });

    React.useEffect(() => {
        const initializeChart = async () => {
            const res = await drawExample();
            let lastRendered = Date.now();
            res.sciChartSurface.rendered.subscribe(() => {
                const currentTime = Date.now();
                const timeDiffSeconds = new Date(currentTime - lastRendered).getTime() / 1000;
                lastRendered = currentTime;
                const fps = 1 / timeDiffSeconds;
                setStats({
                    numberPoints: res.sciChartSurface.renderableSeries.size() *
                        res.sciChartSurface.renderableSeries.get(0).dataSeries.count(),
                    fps
                });
            });
            
        };

        initializeChart();

        return () => {
            // Cleanup if needed
            
        };
        
    }, []);

    return (
        <>
        
            <Paper style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "row", background: appTheme.DarkIndigo }}>
                <div id={divElementId} style={{ flex: 1 }}></div>
                
            </Paper>
        </>
    );
}
