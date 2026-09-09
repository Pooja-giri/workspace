"use client";

import dynamic from "next/dynamic";
import { EChartsOption } from "echarts";

const ReactECharts = dynamic(
  () => import("echarts-for-react"),
  {
    ssr: false,
  }
);

interface AnalyticsChartProps {
  title: string;
  option: EChartsOption;
  height?: number;
}

export default function AnalyticsChart({
  title,
  option,
  height = 320,
}: AnalyticsChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          {title}
        </h3>
      </div>

      <ReactECharts
        option={option}
        style={{
          height,
          width: "100%",
        }}
      />
    </div>
  );
}