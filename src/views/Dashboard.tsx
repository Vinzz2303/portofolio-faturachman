import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../utils/api'
import { fetchWithSession } from '../utils/authFetch'
import { useLanguagePreference } from '../utils/language'
import { derivePercentChange, formatMarketNumber, formatPercent, isFiniteNumber, sanitizeMarketPercent } from '../utils/marketFormatting'
import { getCurrentPortfolioSnapshot } from '../utils/portfolioStorage'
import { getUsdToIdrRate } from '../utils/exchangeRateService'
import { normalizeDisplaySymbol } from '../utils/assetNormalization'
import { getDelayedMarketQuotes, getMultipleMarketQuotes, type DelayedMarketQuote, type MarketQuote } from '../services/marketData'
import type { InvestmentSummaryResponse, PortfolioSummaryResponse, InvestmentMeta } from '../types'
import MulaiDariSiniCard from '../components/MulaiDariSiniCard'

type DashboardState = {
  meta: InvestmentMeta | null
  portfolio: PortfolioSummaryResponse | null
  loading: boolean
  updatedAt: Date | null
}

// Minimal SVG Sparkline Component
const Sparkline = ({ data, color, width = 100, height = 30 }: { data: number[], color: string, width?: number, height?: number }) => {
  if (!data || data.length === 0) return <div style={{ width, height }} className="bg-white/5 rounded-md" />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-80"
      />
    </svg>
  );
};

export default function Dashboard() {
  const { language } = useLanguagePreference()
  const [state, setState] = useState<DashboardState>({
    meta: null,
    portfolio: null,
    loading: true,
    updatedAt: null
  })
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR')
  const [rate, setRate] = useState(17150)
  const [marketQuotes, setMarketQuotes] = useState<Record<string, MarketQuote>>({})
  const [watchlistQuotes, setWatchlistQuotes] = useState<DelayedMarketQuote[]>([])
  const [watchlistLoading, setWatchlistLoading] = useState(true)

  // Simulated sparkline data
  const generateSparkline = (trend: 'up' | 'down') => {
    const base = Array.from({ length: 20 }, (_, i) => i);
    return base.map(i => {
      const noise = Math.random() * 10;
      return trend === 'up' ? i * 2 + noise : 40 - i * 2 + noise;
    });
  };

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    // Fetch exchange rate as fallback
    getUsdToIdrRate().then(r => {
      if (active) setRate(r)
    }).catch(console.error)

    // Centralized Market Data Fetch
    const fetchMarketQuotes = async () => {
      try {
        const symbols = ['BTC-USD', 'GC=F', '^JKSE', '^GSPC', 'USDIDR=X'];
        const results = await getMultipleMarketQuotes(symbols);
        const quotesMap = results.reduce((acc, q) => {
          acc[q.symbol] = q;
          return acc;
        }, {} as Record<string, MarketQuote>);
        
        if (active) {
          setMarketQuotes(quotesMap);
        }
      } catch (err) {
        console.error('Failed to fetch centralized market quotes:', err);
      }
    };

    fetchMarketQuotes();
    const marketInterval = setInterval(fetchMarketQuotes, 5 * 60 * 1000); // Refresh every 5 mins

    const portfolioPromise = getCurrentPortfolioSnapshot().catch(() => null)

    void fetchWithSession(`${API_URL}/api/investment-summary`, {
      signal: controller.signal
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        const data = (await res.json()) as InvestmentSummaryResponse
        const portfolio = await portfolioPromise
        return { data, portfolio }
      })
      .then(({ data, portfolio }) => {
        if (!active) return
        setState({
          meta: data.meta || null,
          portfolio,
          loading: false,
          updatedAt: new Date()
        })
      })
      .catch(() => {
        if (!active) return
        portfolioPromise
          .then((portfolio) => {
            if (!active) return
            setState(prev => ({ ...prev, portfolio, loading: false, updatedAt: new Date() }))
          })
          .catch(() => {
            if (!active) return
            setState(prev => ({ ...prev, loading: false, updatedAt: new Date() }))
          })
      })

    return () => {
      active = false
      controller.abort()
      clearInterval(marketInterval)
    }
  }, [])

  const copy = {
    dashboard: language === 'id' ? 'Dasbor' : 'Dashboard',
    dashboardDesc: language === 'id' ? 'Ringkasan pasar dan portofolio' : 'Market overview and portfolio snapshot',
    marketSnapshot: language === 'id' ? 'Ringkasan Pasar' : 'Market Snapshot',
    marketMovement: language === 'id' ? 'Pergerakan Pasar' : 'Market Movement',
    updating: language === 'id' ? 'Memperbarui...' : 'Updating...',
    delayedData: language === 'id' ? 'Data tertunda ±5–15 menit' : 'Data delayed ±5–15 mins',
    exchangeRate: language === 'id' ? 'Kurs' : 'Rate',
    portfolio: language === 'id' ? 'Portofolio' : 'Portfolio',
    totalValue: language === 'id' ? 'Nilai Total' : 'Total Value',
    riskLevel: language === 'id' ? 'Level Risiko' : 'Risk Level',
    mediumRisk: language === 'id' ? 'Sedang' : 'Medium',
    viewDetail: language === 'id' ? 'Lihat detail' : 'View detail',
    watchlist: language === 'id' ? 'Pantauan' : 'Watchlist',
    manage: language === 'id' ? 'Kelola' : 'Manage',
    asset: language === 'id' ? 'Aset' : 'Asset',
    price: language === 'id' ? 'Harga' : 'Price',
    change: language === 'id' ? 'Perubahan' : 'Change',
    trend: language === 'id' ? 'Tren' : 'Trend',
    ctaTitle: language === 'id' ? 'Pahami portofolio lebih dalam' : 'Understand your portfolio deeper',
    ctaBody: language === 'id'
      ? 'Ting AI membantu membaca risiko, bukan hanya angka, berdasarkan alokasi portofolio Anda.'
      : 'Ting AI helps you read risk, not just numbers, based on your exact allocations.',
    openTingAi: language === 'id' ? 'Buka Ting AI' : 'Open Ting AI',
    assets: language === 'id' ? 'Aset' : 'Assets',
    gold: language === 'id' ? 'Emas' : 'Gold',
    stocks: language === 'id' ? 'Saham' : 'Stocks',
    portfolioUnavailable: language === 'id' ? 'Portofolio belum tersedia' : 'Portfolio unavailable',
    addPortfolio: language === 'id' ? 'Tambahkan aset di Portfolio Workspace' : 'Add assets in Portfolio Workspace',
    allocationMode: language === 'id' ? 'Mode alokasi' : 'Allocation mode',
    noPnlYet: language === 'id' ? 'Belum menghitung untung/rugi pribadi' : 'Personal profit/loss not calculated yet',
    comingSoon: language === 'id' ? 'Segera hadir!' : 'Coming soon!',
    dataUnavailable: language === 'id' ? 'Data tidak tersedia' : 'Data unavailable',
    recommended: 'Recommended',
    primaryRange: language === 'id' ? 'Aktif' : 'Active',
    later: language === 'id' ? 'Nanti' : 'Later',
    delayedMarketData: language === 'id' ? 'Data market tertunda' : 'Delayed market data',
    cachedMarketData: language === 'id' ? 'Cache market' : 'Market cache',
    marketUnavailable: language === 'id' ? 'Data market belum tersedia' : 'Market data unavailable',
    delayedBadge: language === 'id' ? 'Data tertunda' : 'Delayed',
    cacheBadge: language === 'id' ? 'Cache' : 'Cache',
    unavailableBadge: language === 'id' ? 'Data belum tersedia' : 'Data unavailable',
    updatedAt: language === 'id' ? 'Update' : 'Updated',
  }

  const formatCurrency = (val: number, cur: string) => formatMarketNumber(val, language, { currency: cur })
  const formatPlainNumber = (val: number, maxDigits = 2, minDigits = maxDigits) =>
    formatMarketNumber(val, language, { minDigits, maxDigits })

  // Custom robust formatter for large numbers (Billion, jt, etc.) based on language
  const formatLargeCurrency = (val: number, cur: string) => {
    if (val >= 1_000_000_000) {
      return `${cur === 'IDR' ? 'Rp ' : '$'}${(val / 1_000_000_000).toFixed(1)}${cur === 'IDR' ? 'M' : 'B'}`;
    }
    if (val >= 1_000_000) {
      return `${cur === 'IDR' ? 'Rp ' : '$'}${(val / 1_000_000).toFixed(2)}${cur === 'IDR' ? 'jt' : 'M'}`;
    }
    return formatCurrency(val, cur);
  }

  const getSafeQuotePercent = (quote?: MarketQuote, fallback?: number) => {
    if (quote && isFiniteNumber(quote.changePercent)) {
      return sanitizeMarketPercent(quote.changePercent, 35) ?? fallback ?? null;
    }
    return fallback !== undefined ? sanitizeMarketPercent(fallback, 35) : null;
  }

  const handleComingSoon = () => alert(copy.comingSoon)

  const formatWatchlistPrice = (quote: DelayedMarketQuote) => {
    if (quote.dataStatus === 'unavailable' || quote.price === null || quote.price === undefined) {
      return quote.currency === 'IDR' ? 'Rp —' : 'US$ —'
    }

    const displayValue = currency === quote.currency
      ? quote.price
      : quote.currency === 'IDR' && currency === 'USD'
        ? quote.price / rate
        : quote.price * rate

    return formatCurrency(displayValue, currency)
  }

  const formatWatchlistUpdateTime = (quote: DelayedMarketQuote) => {
    if (!quote.lastUpdated) return copy.unavailableBadge
    const parsed = new Date(quote.lastUpdated)
    if (Number.isNaN(parsed.getTime())) return copy.unavailableBadge
    return `${copy.updatedAt} ${parsed.toLocaleTimeString('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
    })} WIB`
  }

  const watchlistStatus = useMemo(() => {
    if (watchlistLoading) return copy.updating
    if (!watchlistQuotes.length || watchlistQuotes.every((quote) => quote.dataStatus === 'unavailable')) {
      return copy.marketUnavailable
    }
    if (watchlistQuotes.some((quote) => quote.dataStatus === 'cached')) return copy.cachedMarketData
    return copy.delayedMarketData
  }, [copy.cachedMarketData, copy.delayedMarketData, copy.marketUnavailable, copy.updating, watchlistLoading, watchlistQuotes])

  // ====================================
  // ASSET PROCESSING LOGIC
  // ====================================
  type AssetType = 'CRYPTO' | 'METAL' | 'INDEX';

  const processAsset = (
    name: string, 
    type: AssetType, 
    baseValue: number, 
    pctChange: number | null,
    currentRate: number
  ) => {
    let displayPrice = '';
    
    if (type === 'CRYPTO') {
      // Base USD
      const val = currency === 'USD' ? baseValue : baseValue * currentRate;
      displayPrice = formatLargeCurrency(val, currency);
    } else if (type === 'METAL') {
      // Base USD per ounce
      if (currency === 'USD') {
        displayPrice = `${formatCurrency(baseValue, 'USD')} / oz`;
      } else {
        // IDR per gram: USD per ounce -> USD per gram -> IDR
        const valPerGram = (baseValue / 31.1035) * currentRate;
        displayPrice = `${formatLargeCurrency(valPerGram, 'IDR')} / gram`;
      }
    } else if (type === 'INDEX') {
      // Not convertable, just raw number
      displayPrice = formatPlainNumber(baseValue, 2);
    }

    return {
      name,
      price: displayPrice,
      change: pctChange,
      sparkline: generateSparkline((pctChange ?? 0) >= 0 ? 'up' : 'down')
    };
  }

  const marketAssets = useMemo(() => {
    // 2. ONE EXCHANGE RATE ACROSS ALL COMPONENTS
    const finalRate = (isFiniteNumber(marketQuotes['USDIDR=X']?.price) && marketQuotes['USDIDR=X']!.price > 0)
      ? marketQuotes['USDIDR=X']!.price
      : rate;
    
    // BTC: Base USD
    const btcBaseUsd = (isFiniteNumber(marketQuotes['BTC-USD']?.price) && marketQuotes['BTC-USD']!.price > 0)
      ? marketQuotes['BTC-USD']!.price 
      : 70000;
    
    // GOLD: Base USD per oz
    const goldBaseUsd = (isFiniteNumber(marketQuotes['GC=F']?.price) && marketQuotes['GC=F']!.price > 0)
      ? marketQuotes['GC=F']!.price 
      : 4050.50; // Real fallback > 4000
    
    // IHSG: Base IDR (index)
    const ihsgBaseIdr = (isFiniteNumber(marketQuotes['^JKSE']?.price) && marketQuotes['^JKSE']!.price > 0)
      ? marketQuotes['^JKSE']!.price 
      : 7072;
    
    // SP500: Base USD (index)
    const sp500BaseUsd = (isFiniteNumber(marketQuotes['^GSPC']?.price) && marketQuotes['^GSPC']!.price > 0)
      ? marketQuotes['^GSPC']!.price 
      : 7135;

    // DXY: Base USD (index)
    const dxyBaseUsd = 98.97;

    return {
      finalRate,
      assets: [
        processAsset('BTC', 'CRYPTO', btcBaseUsd, getSafeQuotePercent(marketQuotes['BTC-USD'], 1.24), finalRate),
        processAsset(copy.gold, 'METAL', goldBaseUsd, getSafeQuotePercent(marketQuotes['GC=F'], -0.32), finalRate),
        processAsset('IHSG', 'INDEX', ihsgBaseIdr, getSafeQuotePercent(marketQuotes['^JKSE'], -0.52), finalRate),
        processAsset('S&P 500', 'INDEX', sp500BaseUsd, getSafeQuotePercent(marketQuotes['^GSPC'], 0.83), finalRate),
        processAsset('DXY', 'INDEX', dxyBaseUsd, -0.21, finalRate),
      ]
    };
  }, [marketQuotes, language, currency, rate]);

  // PORTFOLIO LOGIC
  // Snapshot values are normalized to IDR by portfolioSnapshot.ts.
  const portfolioHoldings = state.portfolio?.holdings ?? []
  const hasPortfolio = portfolioHoldings.length > 0
  const portfolioBaseIdr = state.portfolio?.summary?.totalCurrentValue ?? 0
  const portfolioDisplayValue = hasPortfolio
    ? currency === 'IDR'
      ? formatCurrency(portfolioBaseIdr, 'IDR')
      : formatCurrency(portfolioBaseIdr / marketAssets.finalRate, 'USD')
    : copy.portfolioUnavailable
  const portfolioChange = sanitizeMarketPercent(state.portfolio?.summary?.totalPnlPct, 100)
  const portfolioAllocation = portfolioHoldings
    .map((holding) => {
      const value = Number(holding.currentValue || 0)
      const weight = portfolioBaseIdr > 0 ? (value / portfolioBaseIdr) * 100 : 0
      return { symbol: normalizeDisplaySymbol(holding.symbol), weight }
    })
    .filter((item) => item.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4)
  const topWeight = portfolioAllocation[0]?.weight ?? 0
  const riskLevel = topWeight >= 50
    ? (language === 'id' ? 'Tinggi' : 'High')
    : topWeight >= 30
    ? copy.mediumRisk
    : (language === 'id' ? 'Rendah' : 'Low')
  const allocationColors = ['#F59E0B', '#3B82F6', '#14B8A6', '#A78BFA']

  useEffect(() => {
    let active = true
    const loadWatchlistQuotes = async () => {
      setWatchlistLoading(true)
      const quotes = await getDelayedMarketQuotes(['BBCA.JK', 'BMRI.JK', 'TLKM.JK', 'UNVR.JK'])
      if (active) {
        setWatchlistQuotes(quotes)
        setWatchlistLoading(false)
      }
    }

    void loadWatchlistQuotes()
    const id = setInterval(loadWatchlistQuotes, 5 * 60 * 1000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#07090E] text-white font-sans selection:bg-teal-500/30 pb-24 pt-20 px-6">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* 1. TOP HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">{copy.dashboard}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {copy.dashboardDesc}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 rounded-lg px-1 py-1 flex text-xs font-medium">
              <button 
                onClick={() => setCurrency('IDR')}
                className={`px-3 py-1.5 rounded-md transition-colors ${currency === 'IDR' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                IDR
              </button>
              <button 
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-md transition-colors ${currency === 'USD' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                USD
              </button>
            </div>
          </div>
        </header>

        <MulaiDariSiniCard />

        {/* 2. MARKET SNAPSHOT */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">{copy.marketSnapshot}</h2>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline-block text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">
                {copy.exchangeRate}: Rp {formatPlainNumber(marketAssets.finalRate, 0)} / USD
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                {state.loading ? copy.updating : copy.delayedData}
                <div className={`w-1.5 h-1.5 rounded-full ${state.loading ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {marketAssets.assets.map(asset => (
              <div key={asset.name} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 hover:bg-white/[0.04] transition-colors group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                    {asset.name[0]}
                  </div>
                  <span className="text-xs font-medium text-slate-300">{asset.name}</span>
                </div>
                <div className="text-lg font-semibold tracking-tight mb-1">{asset.price}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${asset.change === null ? 'text-slate-500' : asset.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {asset.change !== null ? formatPercent(asset.change, language) : '-'}
                  </span>
                  <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                    <Sparkline data={asset.sparkline} color={asset.change === null || asset.change >= 0 ? '#34d399' : '#f87171'} width={40} height={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. MARKET MOVEMENT & PORTFOLIO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* MARKET MOVEMENT */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300">{copy.marketMovement}</h2>
              <div className="flex gap-1 text-[10px] font-mono" aria-label={language === 'id' ? 'Rentang waktu' : 'Time range'}>
                {['1D', '1W', '1M', '1Y', 'YTD'].map(tf => (
                  <button
                    key={tf}
                    type="button"
                    onClick={tf === '1D' ? undefined : handleComingSoon}
                    className={`px-2 py-1 rounded ${
                      tf === '1D'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'text-slate-600 bg-white/[0.015] cursor-default'
                    }`}
                    title={tf === '1D' ? copy.primaryRange : copy.comingSoon}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {marketAssets.assets.slice(0, 4).map(asset => (
                <div key={`chart-${asset.name}`} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">{asset.name}</div>
                      <div className="text-lg font-semibold">{asset.price}</div>
                    </div>
                    <span className={`text-xs font-medium ${asset.change === null ? 'text-slate-500' : asset.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {asset.change !== null ? formatPercent(asset.change, language) : '-'}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/[0.02]">
                    <Sparkline data={asset.sparkline} color={asset.change === null || asset.change >= 0 ? '#34d399' : '#f87171'} width={280} height={60} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PORTFOLIO OVERVIEW */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-slate-300">{copy.portfolio}</h2>
              <span className="soft-recommended-badge">{copy.recommended}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 h-[calc(100%-2rem)] flex flex-col">
              <div className="mb-6">
                <div className="text-xs text-slate-400 mb-1">{copy.totalValue}</div>
                <div className="flex items-end gap-3">
                  <div className="text-2xl font-bold tracking-tight">{portfolioDisplayValue}</div>
                  {portfolioChange !== null ? (
                    <span className={`text-xs font-medium mb-1 ${portfolioChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatPercent(portfolioChange, language)}</span>
                  ) : hasPortfolio ? (
                    <span className="text-[10px] font-mono text-slate-500 mb-1 uppercase tracking-widest">{copy.allocationMode}</span>
                  ) : null}
                </div>
                {hasPortfolio && portfolioChange === null && (
                  <p className="text-[11px] text-slate-500 mt-2">{copy.noPnlYet}</p>
                )}
              </div>
              
              <div className="flex-1 flex items-center gap-6">
                {hasPortfolio ? (
                  <>
                    <div className="relative w-24 h-24 shrink-0 rounded-full border border-white/10 bg-white/[0.03] flex flex-col items-center justify-center">
                      <span className="text-xl font-bold">{portfolioHoldings.length}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest">{copy.assets}</span>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      {portfolioAllocation.map((item, index) => (
                        <div key={item.symbol} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: allocationColors[index % allocationColors.length] }} />
                              <span className="text-slate-300">{item.symbol}</span>
                            </div>
                            <span className="font-medium">{item.weight.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(item.weight, 100)}%`, backgroundColor: allocationColors[index % allocationColors.length] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 rounded-xl border border-dashed border-white/10 bg-white/[0.015] p-4">
                    <p className="text-sm font-medium text-slate-300">{copy.portfolioUnavailable}</p>
                    <Link to="/portfolio" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-2 inline-block">
                      {copy.addPortfolio}
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">{copy.riskLevel}</span>
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 font-medium">{riskLevel}</span>
                </div>
                <Link to="/portfolio" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">{copy.viewDetail}</Link>
              </div>
            </div>
          </section>
        </div>

        {/* 4. WATCHLIST */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-slate-300">{copy.watchlist}</h2>
              <span className={`text-[10px] font-mono px-2 py-1 rounded-md border uppercase tracking-widest ${
                watchlistStatus === copy.marketUnavailable
                  ? 'border-red-500/15 bg-red-500/5 text-red-300/80'
                  : watchlistStatus === copy.cachedMarketData
                  ? 'border-amber-500/15 bg-amber-500/5 text-amber-300/80'
                  : 'border-teal-500/15 bg-teal-500/5 text-teal-300/80'
              }`}>
                {watchlistStatus}
              </span>
            </div>
            <button
              onClick={handleComingSoon}
              className="text-xs text-slate-600 hover:text-slate-500"
              title={copy.comingSoon}
            >
              {copy.manage} · {copy.later}
            </button>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-xs text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">{copy.asset}</th>
                  <th className="px-6 py-3 font-medium text-right">{copy.price}</th>
                  <th className="px-6 py-3 font-medium text-right">{copy.change}</th>
                  <th className="px-6 py-3 font-medium text-right hidden md:table-cell">{copy.trend}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {(watchlistQuotes.length ? watchlistQuotes : ['BBCA.JK', 'BMRI.JK', 'TLKM.JK', 'UNVR.JK'].map((symbol) => ({
                  symbol,
                  displaySymbol: normalizeDisplaySymbol(symbol),
                  name: normalizeDisplaySymbol(symbol),
                  price: null,
                  currency: 'IDR',
                  changePercent: null,
                  source: 'none' as const,
                  dataStatus: 'unavailable' as const,
                  lastUpdated: null,
                }))).map(w => {
                  const unavailable = w.dataStatus === 'unavailable'
                  const up = (w.changePercent ?? 0) >= 0
                  const badge = w.dataStatus === 'cached'
                    ? copy.cacheBadge
                    : w.dataStatus === 'delayed'
                    ? copy.delayedBadge
                    : copy.unavailableBadge

                  return (
                  <tr key={w.symbol} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold">{w.displaySymbol[0]}</div>
                        <div>
                          <div className="font-semibold text-slate-200">{w.displaySymbol}</div>
                          <div className="text-[10px] text-slate-500">{w.name}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                              w.dataStatus === 'cached'
                                ? 'border-amber-500/15 bg-amber-500/5 text-amber-300/70'
                                : w.dataStatus === 'delayed'
                                ? 'border-teal-500/15 bg-teal-500/5 text-teal-300/70'
                                : 'border-red-500/15 bg-red-500/5 text-red-300/70'
                            }`}>
                              {badge}
                            </span>
                            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
                              {formatWatchlistUpdateTime(w)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right font-medium numeric-value">{formatWatchlistPrice(w)}</td>
                    <td className={`px-6 py-3 text-right font-medium ${unavailable ? 'text-slate-600' : up ? 'text-emerald-400' : 'text-red-400'}`}>
                      {unavailable || w.changePercent === null ? '-' : formatPercent(w.changePercent, language)}
                    </td>
                    <td className="px-6 py-3 text-right hidden md:table-cell">
                      {unavailable ? (
                        <span className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">-</span>
                      ) : (
                        <span className={`text-[10px] font-mono uppercase tracking-widest ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                          {up ? 'Naik' : 'Turun'}
                        </span>
                      )}
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. CTA SECTION */}
        <section className="mt-12 mb-8">
          <div className="relative rounded-2xl overflow-hidden border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 to-[#0B0D12] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-white mb-2">{copy.ctaTitle}</h2>
              <p className="text-slate-400 text-sm max-w-md leading-relaxed">{copy.ctaBody}</p>
            </div>
            <div className="relative z-10 shrink-0">
              <Link 
                to="/ting-ai" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
              >
                {copy.openTingAi}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
