import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { PriceMetric } from "../types";
import { getCategoryInfo } from "../utils";

interface HourlyListProps {
  prices: PriceMetric[];
}

export default function HourlyList({ prices }: HourlyListProps) {
  const [onlyFuture, setOnlyFuture] = useState(false);

  // Filter the list based on selection
  const filteredPrices = onlyFuture ? prices.filter((p) => p.isFuture) : prices;

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6 transition-colors duration-200">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-slate-500" />
            Precios por horas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detalle horario de la tarifa regulada hoy
          </p>
        </div>

        {/* Toggle between Show All / Only Future */}
        <button
          onClick={() => setOnlyFuture(!onlyFuture)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all duration-200 self-start sm:self-auto shadow-sm"
        >
          {onlyFuture ? (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Mostrar todas las horas</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>Ocultar horas pasadas</span>
            </>
          )}
        </button>
      </div>

      {/* Hourly table list */}
      <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-xl max-h-96 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <th className="py-3 px-4">Hora</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            <AnimatePresence initial={false}>
              {filteredPrices.map((p) => {
                const catInfo = getCategoryInfo(p.category);
                
                return (
                  <motion.tr
                    key={p.hour}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`group transition-all duration-150 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${
                      p.isCurrent
                        ? "bg-amber-500/5 dark:bg-amber-500/10 font-medium"
                        : ""
                    }`}
                  >
                    {/* Hour cell */}
                    <td className="py-3.5 px-4 flex items-center gap-2">
                      <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                        {p.hour}
                      </span>
                      {p.isCurrent && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-500 text-white rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5 shrink-0 animate-pulse">
                          <span>Ahora</span>
                        </span>
                      )}
                      {p.isMin && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-0.5 shrink-0 border border-emerald-500/20">
                          <TrendingDown className="h-3 w-3" />
                          <span>Mínimo</span>
                        </span>
                      )}
                      {p.isMax && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg flex items-center gap-0.5 shrink-0 border border-rose-500/20">
                          <TrendingUp className="h-3 w-3" />
                          <span>Máximo</span>
                        </span>
                      )}
                    </td>

                    {/* Status Dot & Label */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${catInfo.solidBg} shadow-sm group-hover:scale-110 transition-transform duration-200`}></span>
                        <span className={`text-xs font-semibold ${catInfo.textClass}`}>
                          {catInfo.label}
                        </span>
                      </div>
                    </td>

                    {/* Price cell */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {(p.priceMWh / 1000).toLocaleString("es-ES", {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })}
                      </span>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 ml-1.5 font-sans">
                        €/kWh
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
