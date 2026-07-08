import React from "react";
import { motion } from "motion/react";
import { Zap, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { PriceMetric } from "../types";
import { formatPrice, getCategoryInfo } from "../utils";

interface CurrentPriceCardProps {
  currentPrice: PriceMetric | undefined;
  minPrice: number;
  maxPrice: number;
}

export default function CurrentPriceCard({
  currentPrice,
  minPrice,
  maxPrice,
}: CurrentPriceCardProps) {
  if (!currentPrice) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
        <Info className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          No hay datos de precio para la hora actual.
        </p>
      </div>
    );
  }

  const priceVal = currentPrice.priceMWh / 1000;
  const minVal = minPrice / 1000;
  const maxVal = maxPrice / 1000;
  const rangeSpan = maxVal - minVal;
  
  // Calculate percentage of current price between min and max for the range slider
  const rangePercent = rangeSpan > 0 ? Math.min(100, Math.max(0, ((priceVal - minVal) / rangeSpan) * 100)) : 0;

  const catInfo = getCategoryInfo(currentPrice.category);

  // Recommendations in Spanish based on the category
  const getRecommendation = (category: "cheap" | "medium" | "expensive") => {
    switch (category) {
      case "cheap":
        return {
          icon: <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
          title: "¡Hora económica!",
          desc: "Excelente momento para programar lavadoras, lavavajillas, recarga de vehículo eléctrico u otros consumos elevados.",
        };
      case "medium":
        return {
          icon: <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
          title: "Precio moderado",
          desc: "Uso normal recomendado. Intenta evitar picos de consumo si puedes desplazarlos a las horas verdes del día.",
        };
      case "expensive":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
          title: "Hora pico (cara)",
          desc: "Se recomienda reducir el consumo. Evita encender electrodomésticos de gran potencia para ahorrar en tu factura.",
        };
    }
  };

  const advice = getRecommendation(currentPrice.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`border rounded-2xl p-6 transition-all duration-300 ${catInfo.bgClass} ${catInfo.borderClass} relative overflow-hidden shadow-sm`}
    >
      {/* Visual background gradient accents */}
      <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full blur-3xl opacity-30 ${catInfo.solidBg}`}></div>

      <div className="flex flex-col gap-6">
        {/* Header containing current status badge and hour */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Precio de la luz ahora
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium px-2.5 py-1 bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-lg text-slate-700 dark:text-slate-300 shadow-sm">
              {currentPrice.hour}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 shadow-sm ${
              currentPrice.category === "cheap"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : currentPrice.category === "medium"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
            }`}>
              {catInfo.label}
            </span>
          </div>
        </div>

        {/* Large price display */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
            {priceVal.toLocaleString("es-ES", {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            })}
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-500 dark:text-slate-400">
            €/kWh
          </span>
        </div>

        {/* Visual progress track (where does it stand between min and max) */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Mín: {formatPrice(minPrice)}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Posición diaria
            </span>
            <span>Máx: {formatPrice(maxPrice)}</span>
          </div>
          <div className="h-2 bg-slate-200/60 dark:bg-slate-800/60 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${catInfo.solidBg}`}
              style={{ width: `${rangePercent}%` }}
            ></div>
          </div>
        </div>

        {/* Actionable recommendation card */}
        <div className="bg-white/85 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 flex gap-3 shadow-sm">
          <div className="shrink-0 mt-0.5">{advice.icon}</div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {advice.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {advice.desc}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
