export interface HourlyPrice {
  date: string;
  hour: string;
  "is-cheap": boolean;
  "is-under-avg": boolean;
  market: string;
  price: number; // Price in €/MWh (e.g. 145.23)
  units: string; // "€/MWh"
}

export type PriceResponse = Record<string, HourlyPrice>;

export interface PriceMetric {
  hour: string;
  priceMWh: number;
  priceKWh: number;
  category: "cheap" | "medium" | "expensive";
  isCurrent: boolean;
  isFuture: boolean;
  isMin: boolean;
  isMax: boolean;
  raw: HourlyPrice;
}

export type PriceUnit = "MWh" | "kWh";

export type Theme = "light" | "dark";
