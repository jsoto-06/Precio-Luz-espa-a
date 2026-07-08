import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // API route to proxy the PVPC electricity prices request
  app.get("/api/prices", async (req, res) => {
    try {
      console.log("[Proxy Server] Fetching latest prices from official ESIOS REE API...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

      const apiResponse = await fetch("https://api.esios.ree.es/archives/70/download_json?locale=es", {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!apiResponse.ok) {
        throw new Error(`Public ESIOS API returned status code ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      
      if (!data || !Array.isArray(data.PVPC) || data.PVPC.length === 0) {
        throw new Error("Formato de respuesta de ESIOS inesperado o vacío");
      }

      // Filter entries for Spain's today's date
      const spainDateStr = new Date().toLocaleDateString("es-ES", {
        timeZone: "Europe/Madrid",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

      let targetEntries = data.PVPC.filter((entry: any) => entry.Dia === spainDateStr);

      // Fallback: if no entries match Spain's today date, use the first date available in the response
      if (targetEntries.length === 0) {
        const fallbackDate = data.PVPC[0].Dia;
        console.log(`[Proxy Server] No entries found for today (${spainDateStr}). Using fallback date: ${fallbackDate}`);
        targetEntries = data.PVPC.filter((entry: any) => entry.Dia === fallbackDate);
      }

      if (targetEntries.length === 0) {
        throw new Error("No se encontraron registros de PVPC en la respuesta");
      }

      // Map ESIOS format to our frontend format
      const parsedItems = targetEntries.map((entry: any) => {
        const priceStr = entry.PCB || entry.CYM || "0";
        const price = parseFloat(priceStr.replace(",", "."));
        return {
          date: entry.Dia.replace(/\//g, "-"),
          hour: entry.Hora,
          price,
          market: "PVPC",
          units: "€/MWh"
        };
      });

      // Calculate stats to determine cheap and under-average flags dynamically
      const avg = parsedItems.reduce((acc, item) => acc + item.price, 0) / parsedItems.length;
      const sortedPrices = [...parsedItems].map(item => item.price).sort((a, b) => a - b);
      // The 33% percentile threshold is an excellent representation for cheap/valley hours
      const cheapThresholdIndex = Math.floor(sortedPrices.length * 0.33);
      const cheapThreshold = sortedPrices[cheapThresholdIndex] || avg * 0.9;

      const mappedResponse: Record<string, any> = {};
      parsedItems.forEach((item) => {
        mappedResponse[item.hour] = {
          date: item.date,
          hour: item.hour,
          "is-cheap": item.price <= cheapThreshold,
          "is-under-avg": item.price < avg,
          market: item.market,
          price: item.price,
          units: item.units
        };
      });

      console.log(`[Proxy Server] Successfully processed ${Object.keys(mappedResponse).length} prices.`);

      // Set caching headers for 15 minutes to reduce burden on public server and keep it extremely fast
      res.setHeader("Cache-Control", "public, max-age=900");
      res.json(mappedResponse);
    } catch (error: any) {
      console.error("[Proxy Server] Error fetching prices from PVPC:", error);
      res.status(500).json({
        error: "No se pudieron obtener los precios de la luz desde la fuente oficial",
        details: error.message,
      });
    }
  });

  // Vite middleware for development or serving compiled static build in production
  if (process.env.NODE_ENV !== "production") {
    console.log("[Proxy Server] Running in DEVELOPMENT mode. Mounting Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Proxy Server] Running in PRODUCTION mode. Serving static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Proxy Server] Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
