import React from "react";

export default function LoaderState() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Current Hour Card Shimmer */}
      <div className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 rounded-2xl p-6 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-32"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-16"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-16"></div>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-40"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-16"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-16"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-24"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-16"></div>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-full"></div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/20 rounded-xl p-4 h-16"></div>
      </div>

      {/* Summary Cards Grid Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 rounded-2xl p-4 flex gap-3 animate-pulse"
          >
            <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
            <div className="space-y-2 w-full">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-20"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-24"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-16"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Shimmer */}
      <div className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 rounded-2xl p-6 space-y-4 animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-48"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-64"></div>
        <div className="h-48 bg-slate-100 dark:bg-slate-800/20 rounded-xl w-full flex items-end justify-between p-4 gap-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-200 dark:bg-slate-800 rounded-t w-full"
              style={{ height: `${20 + Math.random() * 60}%` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
