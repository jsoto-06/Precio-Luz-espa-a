import React from "react";
import { AlertCircle, RotateCcw, HelpCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
      {/* Icon */}
      <div className="mx-auto w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner border border-rose-100/50 dark:border-rose-900/30">
        <AlertCircle className="h-8 w-8" />
      </div>

      {/* Message */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          No se pudieron cargar los precios
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {message || "Ha ocurrido un error al conectar con el servidor de la API de precios de la luz (PVPC)."}
        </p>
      </div>

      {/* Actions */}
      <div className="pt-2">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md shadow-slate-900/10 dark:shadow-none hover:translate-y-[-1px]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Intentar de nuevo</span>
        </button>
      </div>

      {/* Useful tips */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 text-left space-y-2 max-w-sm mx-auto transition-colors duration-200">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
          ¿Qué puede estar ocurriendo?
        </h4>
        <ul className="text-[11px] text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1 pl-1">
          <li>Falta de conexión a internet o señal inestable.</li>
          <li>El servidor público de PVPC está temporalmente saturado.</li>
          <li>Límite de solicitudes del navegador (rate limit).</li>
        </ul>
      </div>
    </div>
  );
}
