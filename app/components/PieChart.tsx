/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ResizableBox } from "react-resizable";

interface PieChartProps {
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

const PieChart = ({ option }: PieChartProps) => {
  const [boxWidth, setBoxWidth] = useState(0);

  useEffect(() => {
    const vwWidth = Math.floor(window.innerWidth * 0.9) - 280;
    setBoxWidth(vwWidth);
  }, []);

  const defaultOption = {
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
        color: option?.textColor,
        fontSize: 10,
        width: 200,
        overflow: "break",
        fontFamily: "Prompt, sans-serif",
      },
    },
    series: [
      {
        name: option?.title ?? "",
        type: "pie",
        radius: "60%",
        center: ["50%", "50%"],
        label: {
          formatter: "{b}: {d}%",
          color: option?.textColor,
          fontFamily: "Prompt, sans-serif",
          overflow: "break",
          width: 160,
          lineHeight: 16,
          fontSize: 10,
        },
        labelLine: {
          lineStyle: {
            color: option?.textColor,
          },
        },
        data:
          option?.seriesData?.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: item.color ? { color: item.color } : undefined,
          })) ?? [],
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

  return (
    <div className="w-[calc(100vw-460px)] shadow ">
      {option && boxWidth > 0 && (
        <ResizableBox
          width={boxWidth}
          height={400}
          minConstraints={[300, 300]}
          maxConstraints={[1000, 800]}
        >
          <ReactECharts
            showLoading={!option}
            option={defaultOption}
            notMerge
            lazyUpdate
            style={{ width: "100%", height: "100%" }}
          />
        </ResizableBox>
      )}
    </div>
  );
};

export default PieChart;
