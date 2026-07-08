import React from "react";
import { Sun, Moon, Zap, RefreshCw } from "lucide-react";
import { Theme } from "../types";

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function Header({
  theme,
  toggleTheme,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  const todayStr = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/85 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title and date */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <Zap className="h-6 w-6 fill-amber-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              LuzPVPC <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full uppercase tracking-wider">España</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
              {todayStr}
            </p>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all duration-200"
            title="Actualizar datos"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center"
            aria-label="Cambiar tema"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-slate-600" />
            ) : (
              <Sun className="h-5 w-5 text-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
