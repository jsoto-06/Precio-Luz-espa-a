import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Info, CloudOff } from "lucide-react";

import { PriceMetric, PriceResponse, Theme } from "./types";
import { processPrices } from "./utils";

import Header from "./components/Header";
import CurrentPriceCard from "./components/CurrentPriceCard";
import SavingsCalculator from "./components/SavingsCalculator";
import SummaryCards from "./components/SummaryCards";
import PriceChart from "./components/PriceChart";
import HourlyList from "./components/HourlyList";
import LoaderState from "./components/LoaderState";
import ErrorState from "./components/ErrorState";

export default function App() {
  const [prices, setPrices] = useState<PriceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Persistence of Theme (Light vs Dark)
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("luz-pvpc-theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Apply Theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("luz-pvpc-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Generates fresh mock data for the current date as a fail-safe
  const generateFallbackPrices = (): PriceResponse => {
    const fallback: PriceResponse = {};
    const today = new Date();
    const dayStr = today
      .toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
      .replace(/\//g, "-");

    // Typical Spanish PVPC daily prices: higher in mornings & nights, solar dip in the afternoon
    const basePrices = [
      124.5, 118.2, 111.4, 107.1, 104.3, 105.5, 120.9, 138.2, 144.1, 140.5, 115.4, 98.2, 74.1, 69.4,
      65.2, 62.5, 64.8, 79.4, 115.5, 141.9, 158.4, 151.2, 135.1, 129.8,
    ];

    for (let h = 0; h < 24; h++) {
      const start = String(h).padStart(2, "0");
      const end = String(h + 1).padStart(2, "0");
      const hourKey = `${start}-${end}`;
      const price = basePrices[h];

      fallback[hourKey] = {
        date: dayStr,
        hour: hourKey,
        "is-cheap": price < 90,
        "is-under-avg": price < 113.8,
        market: "PVPC",
        price,
        units: "€/MWh",
      };
    }
    return fallback;
  };

  const fetchPrices = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setIsDemoMode(false);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch("/api/prices", {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error en el servidor: Código ${response.status}`);
      }

      const data: PriceResponse = await response.json();
      
      // Basic schema validation
      if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
        throw new Error("La API devolvió un formato de datos vacío o inesperado.");
      }

      const processed = processPrices(data);
      setPrices(processed);
    } catch (err: any) {
      console.warn("Fallo al conectar con la API real, activando modo demostración:", err);
      
      // Activate fall-back demo mode automatically so the app is always functional
      const fallbackData = generateFallbackPrices();
      const processed = processPrices(fallbackData);
      setPrices(processed);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const currentPrice = prices.find((p) => p.isCurrent);
  
  // Extract minimum and maximum to scale graphs and metrics
  const minPrice = prices.length > 0 ? Math.min(...prices.map((p) => p.priceMWh)) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices.map((p) => p.priceMWh)) : 300;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 font-sans pb-16">
      {/* Header component */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onRefresh={() => fetchPrices(true)}
        isRefreshing={refreshing}
      />

      <main className="max-w-4xl mx-auto px-4 mt-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoaderState />
            </motion.div>
          ) : prices.length === 0 ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <ErrorState
                message={error || "No se han podido cargar los datos de la luz."}
                onRetry={() => fetchPrices()}
              />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Demo Mode Notice Banner */}
              {isDemoMode && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-sm text-amber-700 dark:text-amber-400">
                  <CloudOff className="h-5 w-5 shrink-0 mt-0.5 animate-bounce" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Modo de Demostración Activo</p>
                    <p className="text-xs opacity-90 leading-relaxed">
                      No se pudo conectar con el servidor público de PVPC. Estamos mostrando precios estimados del mercado de hoy en base a perfiles históricos de consumo para garantizar el funcionamiento interactivo de la app.
                    </p>
                  </div>
                </div>
              )}

              {/* Primary Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Main 1-hour Price Focus Card */}
                <div className="md:col-span-3 space-y-6">
                  <CurrentPriceCard
                    currentPrice={currentPrice}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                  />
                  <SavingsCalculator
                    currentPrice={currentPrice}
                    prices={prices}
                  />
                </div>

                {/* Sub-Highlights Card */}
                <div className="md:col-span-2 flex flex-col justify-between">
                  <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col justify-center h-full space-y-4">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg shrink-0">
                        <Info className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          ¿Qué es la Tarifa PVPC?
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          El Precio Voluntario para el Pequeño Consumidor es la tarifa regulada de electricidad en España. Los precios varían cada hora según la oferta y la demanda del mercado mayorista.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Day metrics summary cards */}
              <SummaryCards prices={prices} />

              {/* Interactive graph */}
              <PriceChart prices={prices} />

              {/* Table details with scrolling and filter */}
              <HourlyList prices={prices} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
