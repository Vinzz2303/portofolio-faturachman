import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const defaultAntam = {
  price: 1145000,
  change: 12000,
  updatedAt: '2026-03-26'
};

const defaultSp500 = [
  { date: 'Mar 20', value: 5128 },
  { date: 'Mar 21', value: 5142 },
  { date: 'Mar 22', value: 5136 },
  { date: 'Mar 23', value: 5174 },
  { date: 'Mar 24', value: 5192 },
  { date: 'Mar 25', value: 5201 },
  { date: 'Mar 26', value: 5214 }
];

const currencyIdr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
});

const currencyUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const MarketDashboard = ({ antam = defaultAntam, sp500 = defaultSp500 }) => {
  const isUp = antam.change >= 0;
  const changeLabel = `${isUp ? '+' : '-'}${Math.abs(antam.change)}`;
  const changeClass = isUp
    ? 'text-emerald-200 border-emerald-400/30 bg-emerald-500/10'
    : 'text-rose-200 border-rose-400/30 bg-rose-500/10';

  const sp500Latest = sp500?.[sp500.length - 1]?.value || 0;

  return (
    <section className="py-6 sm:py-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Market Snapshot</p>
        <h3 className="mt-3 text-2xl font-semibold text-white">Market Dashboard</h3>
        <p className="mt-3 text-sm text-gray-400">
          Ringkasan harga emas Antam dan indeks S&amp;P 500 untuk memantau portofolio harian.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
        <div className="rounded-2xl border border-gray-800 bg-dark-bg bg-opacity-80 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold">Emas Antam</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {currencyIdr.format(antam.price)}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Update terakhir: {antam.updatedAt}
              </p>
            </div>
            <div className={`rounded-full border px-3 py-2 text-sm font-semibold ${changeClass}`}>
              {changeLabel}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-gray-800 bg-black bg-opacity-40 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-gray-500">Status Hari Ini</p>
            <p className="mt-2 text-sm text-gray-200">
              {isUp ? 'Harga menguat, momentum positif.' : 'Harga melemah, tetap waspada.'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-dark-bg bg-opacity-80 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">S&amp;P 500</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {currencyUsd.format(sp500Latest)}
              </p>
              <p className="mt-2 text-xs text-gray-400">Pergerakan terbaru</p>
            </div>
            <div className="rounded-full border border-gray-800 px-3 py-1 text-xs text-gray-400">
              Trend
            </div>
          </div>

          <div className="mt-6 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sp500}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(203,213,225,0.8)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(203,213,225,0.8)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(12,12,12,0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: '#eef2f7'
                  }}
                  labelStyle={{ color: '#a7b0bf' }}
                  formatter={value => currencyUsd.format(value)}
                />
                <Line type="monotone" dataKey="value" stroke="#8fbfba" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketDashboard;
