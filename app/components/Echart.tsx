import React from 'react';
import * as echarts from 'echarts/core';
import {
  GridComponent,
  GridComponentOption,
  TitleComponent,
  TitleComponentOption,
  ToolboxComponent,
  ToolboxComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  LegendComponent,
  LegendComponentOption,
} from 'echarts/components';
import {
  BarChart,
  BarSeriesOption,
  LineChart,
  LineSeriesOption,
  PieChart,
  PieSeriesOption,
} from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useRef } from 'react';

type ECOption = echarts.ComposeOption<
  | GridComponentOption
  | TitleComponentOption
  | ToolboxComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
>;

echarts.use([
  GridComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  LegendComponent,
  BarChart,
  LineChart,
  PieChart,
  CanvasRenderer,
]);

interface EchartProps {
  option: ECOption;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export default function Echart({ option, width = '100%', height = '400px', className }: EchartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    if (chartInstance.current) {
      chartInstance.current.setOption(option as ECOption);
      chartInstance.current.resize();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, [option]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  }, [width, height]);

  return (
    <div
      ref={chartRef}
      style={{ width, height }}
      className={className}
    />
  );
}