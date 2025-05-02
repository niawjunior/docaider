/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ReactECharts from "echarts-for-react";

interface EchartProps {
  type: "bar" | "pie";
  option: any;
}

export default function Echart({ type, option }: EchartProps) {
  console.log(option);
  const getDefaultOption = () => {
    if (type === "pie") {
      return {
        backgroundColor: "#ffffff",
        tooltip: {
          trigger: "item",

          textStyle: {
            fontFamily: "Prompt, sans-serif",
          },
        },
        legend: {
          orient: "vertical",
          left: "left",
          textStyle: {
            color: "#333",
            fontFamily: "Prompt, sans-serif",
          },
        },
        series: [
          {
            name: "",
            type: "pie",
            radius: "60%",
            label: {
              formatter: "{b}: {d}%",
              color: "#333",
              fontFamily: "Prompt, sans-serif",
            },
            labelLine: {
              lineStyle: {
                color: "#333",
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
            color: "#333",
            fontSize: 16,
            fontFamily: "Prompt, sans-serif",
          },
        },
      };
    } else if (type === "bar") {
      return {
        backgroundColor: "#ffffff",
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
          data: [],
          axisLine: { lineStyle: { color: "#333" } },
          axisLabel: { color: "#333", fontFamily: "Prompt, sans-serif" },
        },
        yAxis: {
          type: "value",
          axisLine: { lineStyle: { color: "#333" } },
          axisLabel: { color: "#333", fontFamily: "Prompt, sans-serif" },
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
            color: "#333",
            fontSize: 16,
            fontFamily: "Prompt, sans-serif",
          },
        },
      };
    }
    return {};
  };

  const defaultOption = getDefaultOption() as any;
  if (type === "bar" && option?.xAxisLabels) {
    defaultOption.xAxis.data = option.xAxisLabels;
  }
  const mergedOption = {
    ...defaultOption,
    ...option,
    title: {
      ...defaultOption.title,
      ...(option?.title && typeof option.title === "object"
        ? option.title
        : { text: option.title }),
    },
    series: (option.series || defaultOption.series)?.map(
      (s: any, i: number) => {
        const seriesData = option.seriesData ?? s.data ?? [];

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
    backgroundColor: "#ffffff",
  };

  console.log(mergedOption);
  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow p-4">
      <ReactECharts
        option={mergedOption}
        style={{ height: 300, width: "600px" }}
      />
    </div>
  );
}
