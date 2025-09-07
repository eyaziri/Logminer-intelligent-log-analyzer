"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { Log } from "@/types/Log";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <p>Loading chart...</p>,
});

interface Props {
  logs: Log[];
  loadingLogs: boolean;
}

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEFAULT";

const LEVELS: LogLevel[] = ["INFO", "WARN", "ERROR", "DEFAULT"];

const COLORS: Record<LogLevel, string> = {
  INFO: "#60A5FA",
  WARN: "#FACC15",
  ERROR: "#EF4444",
  DEFAULT: "#D1D5DB",
};

function normalizeLevel(level: string | null | undefined): LogLevel {
  const normalized = level?.trim().toUpperCase();
  if (normalized === "INFO") return "INFO";
  if (normalized === "WARN" || normalized === "WARNING") return "WARN";
  if (normalized === "ERROR") return "ERROR";
  return "DEFAULT";
}

export default function LogsLineChart({ logs, loadingLogs }: Props) {
  const { categories, series } = useMemo(() => {
    const levelDateCounts: Record<LogLevel, Record<string, number>> = {
      INFO: {},
      WARN: {},
      ERROR: {},
      DEFAULT: {},
    };

    logs.forEach((log) => {
      const date = new Date(log.timestamp).toISOString().split("T")[0];
      const level = normalizeLevel(log.level);
      levelDateCounts[level][date] = (levelDateCounts[level][date] || 0) + 1;
    });

    const allDates = Array.from(
      new Set(logs.map((log) => new Date(log.timestamp).toISOString().split("T")[0]))
    ).sort();

    const series = LEVELS.map((level) => ({
      name: level,
      data: allDates.map((date) => levelDateCounts[level][date] || 0),
    }));

    return { categories: allDates, series };
  }, [logs]);

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 310,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      type: "category",
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
      },
    },
    tooltip: {
      x: { format: "yyyy-MM-dd" },
    },
    dataLabels: { enabled: false },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    colors: LEVELS.map((level) => COLORS[level]),
  };

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Logs Activity (Line Chart)
        </h3>
        <p className="text-gray-500 text-sm dark:text-gray-400">
          Number of logs per day by level
        </p>
      </div>

      <div className="relative min-h-[320px]">
        {series.length === 0 ? (
          <p className="text-center text-gray-500">No data to display.</p>
        ) : (
          <>
            {loadingLogs && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/30 flex items-center justify-center z-10">
                <p className="text-gray-700 dark:text-gray-300">Updating chart...</p>
              </div>
            )}
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={310}
            />
          </>
        )}
      </div>
    </div>
  );
}
