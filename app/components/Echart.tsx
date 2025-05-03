/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ReactECharts from "echarts-for-react";

interface EchartProps {
  type: "bar" | "pie" | "table";
  option: any;
}

export default function Echart({ type, option }: EchartProps) {
  const textColor = option?.textColor ?? "#fff";
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
            fontFamily: "Prompt, sans-serif",
          },
        },
        series: [
          {
            name: "",
            type: "pie",
            radius: "60%",
            center: ["60%", "50%"],
            label: {
              formatter: "{b}: {d}%",
              color: textColor,
              fontFamily: "Prompt, sans-serif",
              overflow: "break", // ← allow wrapping instead of truncating
              width: 200, // ← adjust width to allow wrapping
              lineHeight: 16,
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
      {option && (
        <div className="w-[calc(100vw-460px)] shadow ">
          <ReactECharts
            showLoading={!option}
            option={mergedOption}
            style={{ minHeight: "400px", width: "100%" }}
          />
        </div>
      )}
    </div>
  );
}
