import GridShape from "@/components/common/GridShape";
import Link from "next/link";
import React from "react";

interface ErrorPageProps {
  code?: number;
  title?: string;
  message?: string;
}

const errorInfo: Record<
  number,
  { title: string; message: string }
> = {
  400: {
    title: "Bad Request",
    message: "The server could not understand the request due to invalid syntax.",
  },
  401: {
    title: "Unauthorized",
    message: "You need to be authenticated to access this page.",
  },
  403: {
    title: "Forbidden",
    message: "You don’t have permission to access this page.",
  },
  404: {
    title: "Page Not Found",
    message: "We can’t seem to find the page you are looking for!",
  },
  408: {
    title: "Request Timeout",
    message: "The request took too long. Please try again.",
  },
  429: {
    title: "Too Many Requests",
    message: "You’ve made too many requests in a short time. Please wait and try again.",
  },
  500: {
    title: "Server Error",
    message: "Server error. Please try again later.",
  },
  502: {
    title: "Bad Gateway",
    message: "The server received an invalid response from the upstream server.",
  },
  503: {
    title: "Service Unavailable",
    message: "Service temporarily unavailable. Please try again later.",
  },
  504: {
    title: "Gateway Timeout",
    message: "The server did not receive a timely response.",
  },
};

export default function ErrorPage({ code = 500, title, message }: ErrorPageProps) {
  const error = errorInfo[code] || errorInfo[500];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
      <GridShape />
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 className="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
          {title || error.title}
        </h1>

        <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          {message || error.message}
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Back to Home Page
        </Link>
      </div>

      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        &copy; {new Date().getFullYear()} - LogMiner
      </p>
    </div>
  );
}
