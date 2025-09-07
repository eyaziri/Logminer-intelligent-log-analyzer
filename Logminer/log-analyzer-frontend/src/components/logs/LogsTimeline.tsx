"use client";

import React from "react";
import { Log } from "@/types/Log";

interface Props {
  logs: Log[];
}

const levelColor = {
  INFO: "bg-blue-400",
  WARN: "bg-yellow-400",
  WARNING: "bg-yellow-400",
  ERROR: "bg-red-500",
  DEFAULT: "bg-gray-300",
};

export default function LogsTimeline({ logs }: Props) {
  const sortedLogs = [...logs].sort(
    (b, a) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getLevelColor = (level: string) => {
    const upperLevel = level.toUpperCase();
    return levelColor[upperLevel as keyof typeof levelColor] || levelColor.DEFAULT;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Recent logs Timeline 
      </h3>
      <div className="relative border-l-2 border-gray-200 dark:border-gray-600 ml-3 pl-6">
        {sortedLogs.slice(0, 10).map((log, index) => (
          <div key={index} className="mb-6 relative">
            <span
              className={`absolute left-0 top-[6px] -translate-x-1/2 h-4 w-4 rounded-full ${getLevelColor(log.level)}`}
            />
            <div className="pl-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(log.timestamp).toLocaleString()}
              </p>
              {log.project?.name && (
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  Projet : {log.project.name}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-300">{log.message}</p>
              <p className="text-xs text-gray-400 italic">{log.level}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
