import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  WashingMachine, 
  Flame, 
  Thermometer, 
  Sparkles, 
  TrendingDown, 
  Info, 
  Clock, 
  ChevronRight, 
  HelpCircle,
  PiggyBank,
  Wind,
  Snowflake,
  Shirt,
  Zap,
  Car
} from "lucide-react";
import { PriceMetric } from "../types";

interface SavingsCalculatorProps {
  currentPrice: PriceMetric | undefined;
  prices: PriceMetric[];
}

interface ApplianceConfig {
  id: string;
  name: string;
  label: string;
  powerkW: number;
  durationHours: number;
  icon: React.ComponentType<{ className?: string }>;
}

const appliances: ApplianceConfig[] = [
  {
    id: "washing-machine",
    name: "Lavadora (1 hora)",
    label: "Lavadora",
    powerkW: 1.2,
    durationHours: 1,
    icon: WashingMachine,
  },
  {
    id: "dishwasher",
    name: "Lavavajillas (2 horas)",
    label: "Lavavajillas",
    powerkW: 1.0,
    durationHours: 2,
    icon: Sparkles,
  },
  {
    id: "oven",
    name: "Horno (1 hora)",
    label: "Horno",
    powerkW: 2.0,
    durationHours: 1,
    icon: Flame,
  },
  {
    id: "water-heater",
    name: "Termo Eléctrico (3 horas)",
    label: "Termo Eléctrico",
    powerkW: 1.5,
    durationHours: 3,
    icon: Thermometer,
  },
  {
    id: "fan",
    name: "Ventilador de pie/techo (2 horas)",
    label: "Ventilador de pie/techo",
    powerkW: 0.06,
    durationHours: 2,
    icon: Wind,
  },
  {
    id: "air-conditioner",
    name: "Aire Acondicionado (2 horas)",
    label: "Aire Acondicionado",
    powerkW: 1.5,
    durationHours: 2,
    icon: Snowflake,
  },
  {
    id: "electric-heater",
    name: "Estufa eléctrica (1 hora)",
    label: "Estufa eléctrica",
    powerkW: 1.8,
    durationHours: 1,
    icon: Flame,
  },
  {
    id: "clothes-dryer",
    name: "Secadora de ropa (2 horas)",
    label: "Secadora de ropa",
    powerkW: 2.2,
    durationHours: 2,
    icon: Shirt,
  },
  {
    id: "iron",
    name: "Plancha de ropa (1 hora)",
    label: "Plancha de ropa",
    powerkW: 1.6,
    durationHours: 1,
    icon: Zap,
  },
  {
    id: "ev-charger",
    name: "Carga de vehículo eléctrico (4 horas)",
    label: "Carga de vehículo eléctrico",
    powerkW: 3.7,
    durationHours: 4,
    icon: Car,
  },
];

export default function SavingsCalculator({ currentPrice, prices }: SavingsCalculatorProps) {
  const [selectedId, setSelectedId] = useState<string>(appliances[0].id);
  const [showExplanation, setShowExplanation] = useState(false);

  // Find selected appliance configuration
  const selectedAppliance = useMemo(() => {
    return appliances.find((app) => app.id === selectedId) || appliances[0];
  }, [selectedId]);

  // Find the index of the current hour in the prices array
  const currentHourIdx = useMemo(() => {
    if (!currentPrice || prices.length === 0) return -1;
    return prices.findIndex((p) => p.hour === currentPrice.hour);
  }, [currentPrice, prices]);

  // Calculate costs using consecutive hours for accurate multi-hour calculation
  const calculations = useMemo(() => {
    if (prices.length === 0 || currentHourIdx === -1) {
      return {
        currentCost: 0,
        currentHours: [] as string[],
        bestCost: 0,
        bestStartHour: "",
        bestHours: [] as string[],
        savings: 0,
        savingsPercent: 0,
        totalConsumption: 0,
      };
    }

    const { powerkW, durationHours } = selectedAppliance;
    const totalConsumption = powerkW * durationHours;

    // 1. Calculate current cost (starting now for durationHours)
    let currentCost = 0;
    const currentHours: string[] = [];
    for (let i = 0; i < durationHours; i++) {
      const idx = (currentHourIdx + i) % prices.length;
      const metric = prices[idx];
      const priceKWh = metric.priceMWh / 1000;
      currentCost += powerkW * 1 * priceKWh; // power * 1 hour * price/kWh
      currentHours.push(metric.hour);
    }

    // 2. Find the best starting hour (consecutive block with minimum cost)
    let bestCost = Infinity;
    let bestStartIdx = 0;
    const bestHoursList: string[] = [];

    // Check all possible starting hours of the day
    for (let startIdx = 0; startIdx < prices.length; startIdx++) {
      let tempCost = 0;
      for (let i = 0; i < durationHours; i++) {
        const idx = (startIdx + i) % prices.length;
        const metric = prices[idx];
        const priceKWh = metric.priceMWh / 1000;
        tempCost += powerkW * 1 * priceKWh;
      }

      if (tempCost < bestCost) {
        bestCost = tempCost;
        bestStartIdx = startIdx;
      }
    }

    // Build the hour labels for the best block
    for (let i = 0; i < durationHours; i++) {
      const idx = (bestStartIdx + i) % prices.length;
      bestHoursList.push(prices[idx].hour);
    }

    const savings = Math.max(0, currentCost - bestCost);
    const savingsPercent = currentCost > 0 ? (savings / currentCost) * 100 : 0;

    return {
      currentCost,
      currentHours,
      bestCost,
      bestStartHour: prices[bestStartIdx]?.hour || "",
      bestHours: bestHoursList,
      savings,
      savingsPercent,
      totalConsumption,
    };
  }, [selectedAppliance, prices, currentHourIdx]);

  if (!currentPrice || prices.length === 0) return null;

  const ApplianceIcon = selectedAppliance.icon;

  return (
    <motion.div
      id="domestic-savings-calculator-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 transition-colors duration-200"
    >
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <PiggyBank className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
              Calculadora de Ahorro Doméstico
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compara el coste actual con la franja más barata del día
            </p>
          </div>
        </div>
        <button
          id="btn-savings-calculator-explanation"
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          title="Ver detalles del cálculo"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>

      {/* Info Explanation Banner (Accordion style) */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>¿Cómo funciona este cálculo?</span>
              </div>
              <p>
                Multiplicamos la potencia estimada de cada electrodoméstico por el precio de la luz de las horas de uso.
              </p>
              <p>
                Si un aparato dura más de 1 hora, sumamos los precios de las **horas consecutivas**. Para el ahorro máximo, encontramos el mejor bloque continuo del día para iniciar el ciclo.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-2.5 pt-2.5 border-t border-slate-250/50 dark:border-slate-800 font-mono text-[10px]">
                {appliances.map((app) => (
                  <div key={app.id} className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span className="truncate pr-1">• {app.label}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                      {app.powerkW} kW × {app.durationHours}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form / Selector Section */}
      <div className="space-y-2">
        <label htmlFor="appliance-selector" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Selecciona un electrodoméstico:
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <ApplianceIcon className="h-5 w-5" />
          </div>
          <select
            id="appliance-selector"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all duration-200 cursor-pointer appearance-none"
          >
            {appliances.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <ChevronRight className="h-4 w-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Main calculation display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current Cost Block */}
        <div className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/60 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Si lo enciendes ahora ({currentPrice.hour})</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-850 dark:text-slate-100 font-sans">
              {calculations.currentCost.toLocaleString("es-ES", {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}
            </span>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
              €
            </span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {selectedAppliance.powerkW} kW × {selectedAppliance.durationHours}h ≈ {calculations.totalConsumption.toFixed(1)} kWh
          </p>
        </div>

        {/* Best Cost Block */}
        <div className="bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/10 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Franja más barata del día</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans">
              {calculations.bestCost.toLocaleString("es-ES", {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}
            </span>
            <span className="text-sm font-bold text-emerald-500 dark:text-emerald-500/80">
              €
            </span>
          </div>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono font-medium">
            Inicio recomendado: <span className="font-bold">{calculations.bestStartHour.split("-")[0]}:00 h</span>
          </p>
        </div>
      </div>

      {/* Savings highlight message banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors duration-200 ${
        calculations.savings > 0.0001
          ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
          : "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
      }`}>
        <div className="text-center sm:text-left space-y-0.5">
          <p className="text-xs font-semibold">
            {calculations.savings > 0.0001
              ? `¿Puedes esperar a las ${calculations.bestStartHour.split("-")[0]}:00 h?`
              : "¡Genial! Estás en el momento más óptimo del día"}
          </p>
          <p className="text-[10px] opacity-80">
            {calculations.savings > 0.0001
              ? `Programando el inicio ahorrarás un ${calculations.savingsPercent.toFixed(0)}% por ciclo`
              : "Usar este electrodoméstico ahora mismo es sumamente eficiente"}
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-current/10 rounded-lg text-center shrink-0 min-w-[120px] shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">Ahorro estimado</span>
          <span className="text-lg font-black font-sans block leading-tight">
            {calculations.savings.toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })} €
          </span>
        </div>
      </div>
    </motion.div>
  );
}
