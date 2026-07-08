import { HourlyPrice, PriceResponse, PriceMetric } from "./types";

/**
 * Converts price from €/MWh to céntimos/kWh
 * 1 €/MWh = 0.1 céntimos/kWh
 */
export function mwhToKwh(priceMWh: number): number {
  return priceMWh * 0.1;
}

/**
 * Format a price value (in €/MWh) to €/kWh with 4 decimals and comma separator
 */
export function formatPrice(priceMWh: number): string {
  const euroKwh = priceMWh / 1000;
  return euroKwh.toLocaleString("es-ES", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }) + " €/kWh";
}

/**
 * Parses the API response and returns an ordered array of 24 metrics
 */
export function processPrices(response: PriceResponse): PriceMetric[] {
  const items = Object.values(response);
  
  // Sort by hour to ensure chronological order (e.g. "00-01", "01-02", etc.)
  items.sort((a, b) => a.hour.localeCompare(b.hour));
  
  // Find min and max values to flag them
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  
  items.forEach((item) => {
    if (item.price < minPrice) minPrice = item.price;
    if (item.price > maxPrice) maxPrice = item.price;
  });

  const currentHour = new Date().getHours();

  return items.map((item) => {
    const priceMWh = item.price;
    const priceKWh = mwhToKwh(priceMWh);
    
    // Determine category based on API flags
    let category: "cheap" | "medium" | "expensive" = "medium";
    if (item["is-cheap"]) {
      category = "cheap";
    } else if (!item["is-under-avg"]) {
      category = "expensive";
    }

    // Determine if it is the current hour
    // Hour string is in format "HH-HH", e.g. "14-15"
    const [startHourStr] = item.hour.split("-");
    const startHour = parseInt(startHourStr, 10);
    const isCurrent = startHour === currentHour;

    // Determine if it's a future hour
    const isFuture = startHour >= currentHour;

    return {
      hour: item.hour,
      priceMWh,
      priceKWh,
      category,
      isCurrent,
      isFuture,
      isMin: priceMWh === minPrice,
      isMax: priceMWh === maxPrice,
      raw: item,
    };
  });
}

/**
 * Returns localized text and color classes for a category
 */
export function getCategoryInfo(category: "cheap" | "medium" | "expensive") {
  switch (category) {
    case "cheap":
      return {
        label: "Barato",
        bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20",
        borderClass: "border-emerald-500/30",
        textClass: "text-emerald-600 dark:text-emerald-400",
        solidBg: "bg-emerald-500",
        fillColor: "#10b981", // Tailwind emerald-500
      };
    case "medium":
      return {
        label: "Moderado",
        bgClass: "bg-amber-500/10 dark:bg-amber-500/20",
        borderClass: "border-amber-500/30",
        textClass: "text-amber-600 dark:text-amber-400",
        solidBg: "bg-amber-500",
        fillColor: "#f59e0b", // Tailwind amber-500
      };
    case "expensive":
      return {
        label: "Caro",
        bgClass: "bg-rose-500/10 dark:bg-rose-500/20",
        borderClass: "border-rose-500/30",
        textClass: "text-rose-600 dark:text-rose-400",
        solidBg: "bg-rose-500",
        fillColor: "#f43f5e", // Tailwind rose-500
      };
  }
}
