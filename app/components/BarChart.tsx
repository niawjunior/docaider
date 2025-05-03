/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ResizableBox } from "react-resizable";

interface BarChartProps {
  option: {
    title: string;
    seriesData: {
      name: string;
      value: number;
      color: string;
    }[];
    backgroundColor: string;
    textColor: string;
  };
}

const BarChart = ({ option }: BarChartProps) => {
  const [boxWidth, setBoxWidth] = useState(0);
  console.log(option);
  useEffect(() => {
    const actualWidth = window.innerWidth;
    const vwWidth =
      Math.floor(actualWidth * 0.9) - (actualWidth > 768 ? 270 : 0);
    setBoxWidth(vwWidth);
  }, []);

  const defaultOption = {
    grid: {
      bottom: "100px",
      right: "40px",
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
      axisLine: { lineStyle: { color: option?.textColor } },
      axisLabel: {
        color: option?.textColor,
        fontFamily: "Prompt, sans-serif",
        interval: 0,
        rotate: 30,
        overflow: "break",
        width: 100,
        lineHeight: 12,
        margin: 16,
        fontSize: 10,
      },
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: option?.textColor } },
      axisLabel: {
        color: option?.textColor,
        fontFamily: "Prompt, sans-serif",
        padding: [0, -5],
      },
    },
    series: [
      {
        data: [],
        type: "bar",
        itemStyle: {
          color: "#5cb85c",
        },
        barMaxWidth: 50,
      },
    ],
    title: {
      text: option?.title ?? "",
      left: "center",
      top: 10,
      textStyle: {
        color: option?.textColor,
        fontSize: 16,
        fontFamily: "Prompt, sans-serif",
      },
    },
  };

  const mergedOption = {
    ...defaultOption,
    ...option,
    title: {
      ...defaultOption.title,
      ...(typeof option?.title === "object"
        ? option.title
        : { text: option?.title }),
    },
    text: option?.title,
    series: [
      {
        type: "bar",
        data:
          option?.seriesData?.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: item.color ? { color: item.color } : undefined,
          })) ?? [],
        barMaxWidth: 50,
      },
    ],
    backgroundColor: option?.backgroundColor ?? defaultOption.backgroundColor,
  };

  return (
    <div>
      {option && boxWidth > 0 && (
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
      )}
    </div>
  );
};

export default BarChart;
