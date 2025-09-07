'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Log } from '@/types/Log';
import { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Props {
  logs: Log[];
}

export default function LogsHeatmap({ logs }: Props) {
  const heatmapData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data: Record<string, number[]> = Object.fromEntries(
      days.map((day) => [day, Array(24).fill(0)])
    );

    logs.forEach((log) => {
      const date = new Date(log.timestamp);
      const day = days[date.getDay()];
      const hour = date.getHours();
      data[day][hour]++;
    });

    return days.map((day) => ({
      name: day,
      data: data[day].map((count, hour) => ({
        x: `${hour}h`,
        y: count,
      })),
    }));
  }, [logs]);

  const options: ApexOptions = {
    chart: {
      type: 'heatmap',
      toolbar: { show: false },
      fontFamily: 'Outfit, sans-serif',
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#00A100', '#128C7E', '#FFD700', '#FF4500', '#B22222'],
    xaxis: {
      type: 'category',
      title: {
        text: 'Hour',
        style: { color: '#666' },
      },
    },
    yaxis: {
      title: {
        text: 'Day',
        style: { color: '#666' },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Logs Heatmap (Day × Hour)
      </h3>
      <ReactApexChart
        options={options}
        series={heatmapData}
        type="heatmap"
        height={350}
      />
    </div>
  );
}
