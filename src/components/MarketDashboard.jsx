import React, { useEffect, useMemo, useRef, useState } from "react";
import { createChart, ColorType } from "lightweight-charts";
import { API_URL } from "../utils/api";

const defaultAntam = {
  price: null,
  change: 0,
  updatedAt: "-",
};

const defaultSp500 = [];

const currencyIdr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const currencyUsd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function MarketDashboard({
  sectionId = "market",
  antam = defaultAntam,
  sp500 = defaultSp500,
}) {
  const [sp500Timeframe, setSp500Timeframe] = useState("1D");
  const [xauTimeframe, setXauTimeframe] = useState("1D");
  const [sp500Series, setSp500Series] = useState(sp500);
  const [xauSeries, setXauSeries] = useState([]);
  const [sp500Note, setSp500Note] = useState("");
  const [xauNote, setXauNote] = useState("");
  const sp500ChartRef = useRef(null);
  const xauChartRef = useRef(null);
  const sp500ContainerRef = useRef(null);
  const xauContainerRef = useRef(null);
  const sp500SeriesRef = useRef(null);
  const xauSeriesRef = useRef(null);

  const hasAntam = antam?.price != null;
  const trend = !hasAntam
    ? "none"
    : antam.change > 0
      ? "up"
      : antam.change < 0
        ? "down"
        : "flat";
  const changeLabel = hasAntam
    ? `${antam.change > 0 ? "+" : antam.change < 0 ? "-" : ""}${Math.abs(antam.change)}`
    : "-";
  const changeClass = !hasAntam
    ? "text-slate-300 border-slate-400/30 bg-slate-500/10"
    : trend === "up"
      ? "text-emerald-300 border-emerald-400/30 bg-emerald-500/10"
      : trend === "down"
        ? "text-rose-300 border-rose-400/30 bg-rose-500/10"
        : "text-slate-200 border-slate-400/30 bg-slate-500/10";

  const firstValue = sp500Series?.[0]?.close;
  const lastValue = sp500Series?.[sp500Series.length - 1]?.close;
  const isGain =
    typeof firstValue === "number" &&
    typeof lastValue === "number" &&
    lastValue >= firstValue;
  const trendStroke = isGain ? "#4ade80" : "#f87171";

  const xauFirst = xauSeries?.[0]?.close;
  const xauLast = xauSeries?.[xauSeries.length - 1]?.close;
  const xauGain =
    typeof xauFirst === "number" &&
    typeof xauLast === "number" &&
    xauLast >= xauFirst;
  const xauStroke = xauGain ? "#4ade80" : "#f87171";

  const sp500Label = useMemo(() => {
    if (sp500Timeframe === "1D") return "7 hari terakhir";
    if (sp500Timeframe === "1W") return "7 hari terakhir";
    if (sp500Timeframe === "1M") return "30 hari terakhir";
    if (sp500Timeframe === "3M") return "90 hari terakhir";
    return "Trend";
  }, [sp500Timeframe]);

  const xauLabel = useMemo(() => {
    if (xauTimeframe === "1D") return "7 hari terakhir";
    if (xauTimeframe === "1W") return "7 hari terakhir";
    if (xauTimeframe === "1M") return "30 hari terakhir";
    if (xauTimeframe === "3M") return "90 hari terakhir";
    return "Trend";
  }, [xauTimeframe]);

  const normalizeSeries = series => {
    if (!Array.isArray(series)) return [];
    return series
      .map(point => {
        if (
          point &&
          (typeof point.time === "string" || typeof point.time === "number") &&
          typeof point.open === "number" &&
          typeof point.high === "number" &&
          typeof point.low === "number" &&
          typeof point.close === "number"
        ) {
          return point;
        }

        if (point && typeof point.date === "string" && typeof point.value === "number") {
          const close = Number(point.value);
          return {
            time: point.date,
            open: close,
            high: close,
            low: close,
            close,
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  useEffect(() => {
    if (!sp500ContainerRef.current || sp500ChartRef.current) return;
    const chart = createChart(sp500ContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "rgba(0,0,0,0)" },
        textColor: "rgba(167,176,191,0.85)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.06)" },
        horzLines: { color: "rgba(255,255,255,0.06)" },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
    });
    const series = chart.addCandlestickSeries({
      upColor: "#4ade80",
      downColor: "#f87171",
      wickUpColor: "#4ade80",
      wickDownColor: "#f87171",
      borderVisible: false,
    });
    sp500ChartRef.current = chart;
    sp500SeriesRef.current = series;

    const resize = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (!rect || !sp500ChartRef.current) return;
      sp500ChartRef.current.applyOptions({
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
      });
    });
    resize.observe(sp500ContainerRef.current);
    return () => {
      resize.disconnect();
      chart.remove();
      sp500ChartRef.current = null;
      sp500SeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!xauContainerRef.current || xauChartRef.current) return;
    const chart = createChart(xauContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "rgba(0,0,0,0)" },
        textColor: "rgba(167,176,191,0.85)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.06)" },
        horzLines: { color: "rgba(255,255,255,0.06)" },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
    });
    const series = chart.addCandlestickSeries({
      upColor: "#4ade80",
      downColor: "#f87171",
      wickUpColor: "#4ade80",
      wickDownColor: "#f87171",
      borderVisible: false,
    });
    xauChartRef.current = chart;
    xauSeriesRef.current = series;

    const resize = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (!rect || !xauChartRef.current) return;
      xauChartRef.current.applyOptions({
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
      });
    });
    resize.observe(xauContainerRef.current);
    return () => {
      resize.disconnect();
      chart.remove();
      xauChartRef.current = null;
      xauSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const token = window.localStorage.getItem("lifeOS_token");
    const url =
      sp500Timeframe === "1D"
        ? `${API_URL}/api/market/sp500?days=7`
        : `${API_URL}/api/market/sp500?days=${sp500Timeframe === "1W" ? 7 : sp500Timeframe === "1M" ? 30 : 90}`;

    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Request failed");
        }
        return res.json();
      })
      .then(data => {
        if (!active) return;
        const series = Array.isArray(data?.data) ? data.data : [];
        const normalized = normalizeSeries(series);
        setSp500Series(normalized.length ? normalized : normalizeSeries(sp500));
        setSp500Note(data?.note || "");
      })
      .catch(() => {
        if (!active) return;
        setSp500Series(normalizeSeries(sp500));
        setSp500Note("");
      });

    return () => {
      active = false;
    };
  }, [sp500Timeframe, sp500]);

  useEffect(() => {
    let active = true;
    const token = window.localStorage.getItem("lifeOS_token");
    const url =
      xauTimeframe === "1D"
        ? `${API_URL}/api/market/xau?days=7`
        : `${API_URL}/api/market/xau?days=${xauTimeframe === "1W" ? 7 : xauTimeframe === "1M" ? 30 : 90}`;

    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Request failed");
        }
        return res.json();
      })
      .then(data => {
        if (!active) return;
        const series = Array.isArray(data?.data) ? data.data : [];
        setXauSeries(normalizeSeries(series));
        setXauNote(data?.note || "");
      })
      .catch(() => {
        if (!active) return;
        setXauSeries([]);
        setXauNote("");
      });

    return () => {
      active = false;
    };
  }, [xauTimeframe]);

  useEffect(() => {
    if (sp500SeriesRef.current) {
      const normalized = normalizeSeries(sp500Series);
      sp500SeriesRef.current.setData(normalized);
      sp500ChartRef.current?.timeScale().fitContent();
    }
  }, [sp500Series]);

  useEffect(() => {
    if (xauSeriesRef.current) {
      const normalized = normalizeSeries(xauSeries);
      xauSeriesRef.current.setData(normalized);
      xauChartRef.current?.timeScale().fitContent();
    }
  }, [xauSeries]);

  return (
    <section id={sectionId} className="py-16 sm:py-20">
      <div className="container">
        <div className="mb-8">
          <div className="eyebrow">Market Snapshot</div>
          <h2>Market Dashboard</h2>
          <p className="lead">
            Ringkasan harga emas spot (XAU/USD) dan indeks S&amp;P 500 untuk
            memantau portofolio harian.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
          <div className="market-card rounded-2xl border border-[color:var(--line)] bg-[var(--surface)] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--accent)]">
                  Gold Spot (XAU/USD)
                </p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--text)]">
                  {hasAntam ? `${currencyIdr.format(antam.price)} / gr` : "-"}
                </p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Update terakhir: {hasAntam ? antam.updatedAt : "-"}
                </p>
              </div>
              <div
                className={`rounded-full border px-3 py-2 text-sm font-semibold ${changeClass}`}
              >
                {changeLabel}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[color:var(--line)] bg-[var(--surface-2)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Status Hari Ini
              </p>
              <p className="mt-2 text-lg font-medium text-[color:var(--text)]">
                {!hasAntam
                  ? "Data belum tersedia."
                  : trend === "up"
                    ? "Harga menguat, momentum positif."
                    : trend === "down"
                      ? "Harga melemah, tetap waspada."
                      : "Harga stabil, belum ada momentum baru."}
              </p>
            </div>

            <div className="mt-6">
              <div className="timeframe-toggle">
                {["1D", "1W", "1M", "3M"].map(frame => (
                  <button
                    key={frame}
                    type="button"
                    className={xauTimeframe === frame ? "active" : ""}
                    onClick={() => setXauTimeframe(frame)}
                  >
                    {frame}
                  </button>
                ))}
              </div>
              <div className="mt-4 w-full">
                <div className="tv-chart-shell">
                  <div className="tv-chart" ref={xauContainerRef} />
                  {!xauSeries.length && (
                    <div className="chart-empty">
                      {xauNote || "Data candle XAU belum tersedia."}
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                {xauLabel}
              </p>
            </div>
          </div>

          <div className="market-card rounded-2xl border border-[color:var(--line)] bg-[var(--surface)] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--accent-2)]">
                  S&amp;P 500
                </p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text)]">
                  {currencyUsd.format(lastValue || 0)}
                </p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  7 hari terakhir
                </p>
              </div>
              <div className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs text-[color:var(--muted)]">
                Trend
              </div>
            </div>

            <div className="mt-6">
              <div className="timeframe-toggle">
                {["1D", "1W", "1M", "3M"].map(frame => (
                  <button
                    key={frame}
                    type="button"
                    className={sp500Timeframe === frame ? "active" : ""}
                    onClick={() => setSp500Timeframe(frame)}
                  >
                    {frame}
                  </button>
                ))}
              </div>
              <div className="mt-4 w-full">
                <div className="tv-chart-shell">
                  <div className="tv-chart tv-chart-lg" ref={sp500ContainerRef} />
                  {!sp500Series.length && (
                    <div className="chart-empty">
                      {sp500Note || "Data candle S&P 500 belum tersedia."}
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                {sp500Label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
