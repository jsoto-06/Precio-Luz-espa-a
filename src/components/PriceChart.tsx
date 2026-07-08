import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { PriceMetric } from "../types";
import { getCategoryInfo } from "../utils";

interface PriceChartProps {
  prices: PriceMetric[];
}

export default function PriceChart({ prices }: PriceChartProps) {
  // Map data to the format recharts expects
  const chartData = prices.map((p) => ({
    name: p.hour,
    hourShort: p.hour.split("-")[0], // Just the start hour, e.g. "00" instead of "00-01"
    price: p.priceMWh / 1000,
    priceLabel: (p.priceMWh / 1000).toLocaleString("es-ES", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }),
    category: p.category,
    isCurrent: p.isCurrent,
    metric: p,
  }));

  // Custom Tooltip component in Spanish
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const metric: PriceMetric = data.metric;
      const catInfo = getCategoryInfo(metric.category);
      const valEuroKwh = metric.priceMWh / 1000;

      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-lg space-y-1.5 transition-colors duration-200">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">
            Intervalo: <span className="text-slate-800 dark:text-slate-200 font-sans">{metric.hour} h</span>
          </p>
          <div className="space-y-0.5">
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">
              {valEuroKwh.toLocaleString("es-ES", {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}{" "}
              <span className="text-xs font-normal text-slate-500">€/kWh</span>
            </p>
          </div>
          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
            metric.category === "cheap"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : metric.category === "medium"
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
          }`}>
            {catInfo.label}
          </span>
          {metric.isCurrent && (
            <span className="block text-[10px] font-extrabold text-amber-500 animate-pulse mt-1">
              • Hora Actual
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Evolución del precio de la luz hoy
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gráfico interactivo de las 24 horas (Tarifa PVPC)
          </p>
        </div>
        {/* Color legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Barato</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Moderado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Caro</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(156, 163, 175, 0.15)"
            />
            <XAxis
              dataKey="hourShort"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(156, 163, 175, 0.8)", fontSize: 11, fontFamily: "monospace" }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val.toLocaleString("es-ES", {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}
              tick={{ fill: "rgba(156, 163, 175, 0.8)", fontSize: 10, fontFamily: "monospace" }}
              dx={-5}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(148, 163, 184, 0.08)", radius: 6 }}
            />
            <Bar
              dataKey="price"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            >
              {chartData.map((entry, index) => {
                const catInfo = getCategoryInfo(entry.category);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={catInfo.fillColor}
                    // Highlight the current hour bar with higher opacity and a clean stroke
                    opacity={entry.isCurrent ? 1 : 0.8}
                    stroke={entry.isCurrent ? "#f59e0b" : undefined}
                    strokeWidth={entry.isCurrent ? 2 : 0}
                    className={entry.isCurrent ? "drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" : ""}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
