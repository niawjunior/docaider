/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
interface EchartProps {
  type: "bar" | "pie" | "table";
  option: any;
}

export default function Echart({ type, option }: EchartProps) {
  const textColor = option?.textColor ?? "#fff";
  const [boxWidth, setBoxWidth] = useState(0);

  useEffect(() => {
    // Convert 90vw to px
    const vwWidth = Math.floor(window.innerWidth * 0.9) - 280;
    setBoxWidth(vwWidth);
  }, []);

  const getDefaultOption = () => {
    if (type === "pie") {
      return {
        toolbox: {
          show: true,
          feature: {
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        backgroundColor: "#52525c",
        tooltip: {
          trigger: "item",

          textStyle: {
            fontFamily: "Prompt, sans-serif",
          },
        },
        legend: {
          orient: "vertical",
          left: "left",
          bottom: 0,
          padding: [20, 10, 10, 10],
          width: "50%",
          textStyle: {
            color: textColor,
            fontSize: 10,
            width: 200,
            overflow: "break",
            fontFamily: "Prompt, sans-serif",
          },
        },
        series: [
          {
            name: "",
            type: "pie",
            radius: "60%",
            center: ["50%", "50%"],
            label: {
              formatter: "{b}: {d}%",
              color: textColor,
              fontFamily: "Prompt, sans-serif",
              overflow: "break", // ← allow wrapping instead of truncating
              width: 160, // ← adjust width to allow wrapping
              lineHeight: 16,
              fontSize: 10,
            },
            labelLine: {
              lineStyle: {
                color: textColor,
              },
            },
            data: [],
          },
        ],
        title: {
          text: "",
          left: "center",
          top: 10,
          textStyle: {
            color: textColor,
            fontSize: 16,
            fontFamily: "Prompt, sans-serif",
          },
        },
      };
    } else if (type === "bar") {
      return {
        grid: {
          bottom: "100px",
        },
        toolbox: {
          show: true,
          feature: {
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        backgroundColor: "#52525c",
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          textStyle: {
            fontFamily: "Prompt, sans-serif",
          },
        },
        xAxis: {
          type: "category",
          data: option?.seriesData?.map((item: any) => item.name) ?? [],
          axisLine: { lineStyle: { color: textColor } },
          axisLabel: {
            color: textColor,
            fontFamily: "Prompt, sans-serif",
            interval: 0,
            rotate: 30,
            overflow: "break", // ← allow wrapping instead of truncating
            width: 100, // ← adjust width to allow wrapping
            lineHeight: 12,
            margin: 16,
            fontSize: 10,
          },
        },
        yAxis: {
          type: "value",
          axisLine: { lineStyle: { color: textColor } },
          axisLabel: { color: textColor, fontFamily: "Prompt, sans-serif" },
        },
        series: [
          {
            data: [],
            type: "bar",
            itemStyle: {
              color: "#5cb85c",
            },
          },
        ],
        title: {
          text: "",
          left: "center",
          top: 10,
          textStyle: {
            color: textColor,
            fontSize: 16,
            fontFamily: "Prompt, sans-serif",
          },
        },
      };
    }
    return {};
  };

  const defaultOption = getDefaultOption() as any;

  const mergedOption = {
    ...defaultOption,
    ...option,
    title: {
      ...defaultOption.title,
      ...(option?.title && typeof option?.title === "object"
        ? option?.title
        : { text: option?.title }),
    },
    series: (option?.series || defaultOption.series)?.map(
      (s: any, i: number) => {
        const seriesData = option?.seriesData ?? s.data ?? [];

        // 🔁 Add color to each item if provided
        const enrichedData = seriesData.map((item: any) => ({
          ...item,
          itemStyle: item.color ? { color: item.color } : undefined,
        }));

        return {
          ...defaultOption.series?.[i],
          ...s,
          data: enrichedData,
        };
      }
    ),
    backgroundColor: option?.backgroundColor ?? defaultOption.backgroundColor,
  };

  console.log(mergedOption);
  return (
    <div>
      {option && boxWidth > 0 && (
        <div className="w-[calc(100vw-460px)] shadow ">
          <ResizableBox
            width={boxWidth}
            height={400}
            minConstraints={[300, 300]}
            maxConstraints={[1000, 800]}
          >
            <ReactECharts
              showLoading={!option}
              option={mergedOption}
              notMerge
              lazyUpdate
              style={{ width: "100%", height: "100%" }}
            />
          </ResizableBox>
        </div>
      )}
    </div>
  );
}
