import React from "react";
import { motion } from "motion/react";
import { ArrowDownCircle, ArrowUpCircle, BarChart3 } from "lucide-react";
import { PriceMetric } from "../types";

interface SummaryCardsProps {
  prices: PriceMetric[];
}

export default function SummaryCards({ prices }: SummaryCardsProps) {
  // Find Min, Max, and Average
  const minMetric = prices.find((p) => p.isMin);
  const maxMetric = prices.find((p) => p.isMax);
  
  const avgMWh = prices.reduce((acc, p) => acc + p.priceMWh, 0) / prices.length;
  const avgEuroKWh = avgMWh / 1000;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      {/* Lowest Price Card */}
      {minMetric && (
        <motion.div
          variants={cardVariants}
          className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-start gap-3 shadow-sm relative overflow-hidden"
        >
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <ArrowDownCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
              Más bajo del día
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-sans">
                {(minMetric.priceMWh / 1000).toLocaleString("es-ES", {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                €/kWh
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hora: <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{minMetric.hour}</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Highest Price Card */}
      {maxMetric && (
        <motion.div
          variants={cardVariants}
          className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 flex items-start gap-3 shadow-sm relative overflow-hidden"
        >
          <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
            <ArrowUpCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600/80 dark:text-rose-400/80">
              Más alto del día
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-sans">
                {(maxMetric.priceMWh / 1000).toLocaleString("es-ES", {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                €/kWh
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hora: <span className="font-mono font-medium text-rose-600 dark:text-rose-400">{maxMetric.hour}</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Average Price Card */}
      <motion.div
        variants={cardVariants}
        className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-start gap-3 shadow-sm relative overflow-hidden"
      >
        <div className="p-2 bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-xl shrink-0">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600/85 dark:text-slate-400/85">
            Precio medio diario
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-sans">
              {avgEuroKWh.toLocaleString("es-ES", {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              €/kWh
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            24 horas (PVPC)
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
