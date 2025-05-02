/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ReactECharts from "echarts-for-react";

interface EchartProps {
  type: "bar" | "pie" | "table";
  option: any;
}

export default function Echart({ type, option }: EchartProps) {
  const getDefaultOption = () => {
    if (type === "pie") {
      return {
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
          textStyle: {
            color: "#fff",
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
              color: "#fff",
              fontFamily: "Prompt, sans-serif",
            },
            labelLine: {
              lineStyle: {
                color: "#fff",
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
            color: "#fff",
            fontSize: 16,
            fontFamily: "Prompt, sans-serif",
          },
        },
      };
    } else if (type === "bar") {
      return {
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
          data: option.seriesData?.map((item: any) => item.name) ?? [],
          axisLine: { lineStyle: { color: "#fff" } },
          axisLabel: { color: "#fff", fontFamily: "Prompt, sans-serif" },
        },
        yAxis: {
          type: "value",
          axisLine: { lineStyle: { color: "#fff" } },
          axisLabel: { color: "#fff", fontFamily: "Prompt, sans-serif" },
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
            color: "#fff",
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
    backgroundColor: "#52525c",
  };

  console.log(mergedOption);
  return (
    <div className="w-full max-w-2xl border-2 shadow">
      <ReactECharts
        option={mergedOption}
        style={{ height: 300, minWidth: "600px" }}
      />
    </div>
  );
}
