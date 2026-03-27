import React, { useEffect, useMemo, useState } from 'react';
import AiChat from '../components/AiChat';
import MarketDashboard from '../components/MarketDashboard';

const defaultState = {
  summary: '',
  meta: null,
  loading: true,
  error: ''
};

const formatShortDate = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
};

const Dashboard = () => {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    let active = true;
    setState(prev => ({ ...prev, loading: true, error: '' }));

    fetch('http://localhost:3001/api/investment-summary')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Request failed');
        }
        return res.json();
      })
      .then(data => {
        if (!active) return;
        setState({
          summary: data?.summary || '',
          meta: data?.meta || null,
          loading: false,
          error: ''
        });
      })
      .catch(err => {
        if (!active) return;
        setState({
          summary: '',
          meta: null,
          loading: false,
          error: err?.message || 'Gagal mengambil data'
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const marketProps = useMemo(() => {
    const antam = state.meta?.instruments?.ANTAM;
    const sp500 = state.meta?.instruments?.SP500;

    const antamData =
      antam && !antam.error
        ? { price: antam.latestPrice, change: antam.delta, updatedAt: antam.latestDate }
        : undefined;

    const sp500Data =
      sp500 && !sp500.error
        ? [
            { date: formatShortDate(sp500.previousDate), value: sp500.previousPrice },
            { date: formatShortDate(sp500.latestDate), value: sp500.latestPrice }
          ]
        : undefined;

    return { antam: antamData, sp500: sp500Data };
  }, [state.meta]);

  return (
    <main className="container mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Investor Desk</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Investment Dashboard</h2>
        <p className="mt-3 max-w-2xl text-sm text-gray-400">
          Ringkasan data investasi terbaru dan AI assistant yang membantu interpretasi data.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-gray-800 bg-dark-bg bg-opacity-80 p-6 shadow-[0_22px_50px_rgba(0,0,0,0.5)]">
          <h3 className="text-xl font-semibold text-white">Ringkasan Investasi</h3>
          {state.loading && <p className="mt-4 text-sm text-gray-400">Memuat ringkasan...</p>}
          {state.error && (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {state.error}
            </p>
          )}
          {!state.loading && !state.error && (
            <p className="mt-4 text-sm leading-relaxed text-gray-300">{state.summary}</p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-800 bg-dark-bg bg-opacity-80 p-6 shadow-[0_22px_50px_rgba(0,0,0,0.5)]">
          <AiChat summary={state.summary} meta={state.meta} disabled={state.loading || !!state.error} />
        </div>
      </div>

      <div className="mt-12">
        <MarketDashboard antam={marketProps.antam} sp500={marketProps.sp500} />
      </div>
    </main>
  );
};

export default Dashboard;
