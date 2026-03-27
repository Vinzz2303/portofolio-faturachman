import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const defaultAntam = {
  price: null,
  change: 0,
  updatedAt: "-",
};

const defaultSp500 = [
  { date: "Mar 20", value: 5128 },
  { date: "Mar 21", value: 5142 },
  { date: "Mar 22", value: 5136 },
  { date: "Mar 23", value: 5174 },
  { date: "Mar 24", value: 5192 },
  { date: "Mar 25", value: 5201 },
  { date: "Mar 26", value: 5214 },
];

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
  const hasAntam = antam?.price != null;
  const isUp = hasAntam ? antam.change >= 0 : true;
  const changeLabel = hasAntam
    ? `${isUp ? "+" : "-"}${Math.abs(antam.change)}`
    : "—";
  const changeClass = !hasAntam
    ? "text-slate-300 border-slate-400/30 bg-slate-500/10"
    : isUp
      ? "text-emerald-300 border-emerald-400/30 bg-emerald-500/10"
      : "text-rose-300 border-rose-400/30 bg-rose-500/10";

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
          <div className="rounded-2xl border border-[color:var(--line)] bg-[var(--surface)] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.35)]">
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
                  : isUp
                    ? "Harga menguat, momentum positif."
                    : "Harga melemah, tetap waspada."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--line)] bg-[var(--surface)] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--accent-2)]">
                  S&amp;P 500
                </p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text)]">
                  {currencyUsd.format(sp500[sp500.length - 1]?.value || 0)}
                </p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  7 hari terakhir
                </p>
              </div>
              <div className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs text-[color:var(--muted)]">
                Trend
              </div>
            </div>

            <div className="mt-6 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sp500}>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "rgba(167,176,191,0.85)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(167,176,191,0.85)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(16,22,33,0.92)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      color: "#eef2f7",
                    }}
                    labelStyle={{ color: "#a7b0bf" }}
                    formatter={(value) => currencyUsd.format(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--accent-2)"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
