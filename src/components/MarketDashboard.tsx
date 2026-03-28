import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type Time
} from 'lightweight-charts'
import { API_URL } from '../utils/api'
import type { CandlestickPoint, GoldCardData, MarketSeriesResponse } from '../types'

type Timeframe = '1D' | '1W' | '1M' | '3M'
type ChartKind = 'gold' | 'btc' | 'sp500'

type RawPoint = Partial<CandlestickPoint> & {
  date?: string
  value?: number
}

type MarketDashboardProps = {
  sectionId?: string
  gold?: GoldCardData
  sp500?: CandlestickPoint[]
}

const defaultGold: GoldCardData = {
  price: null,
  change: 0,
  updatedAt: '-'
}

const defaultSp500: CandlestickPoint[] = []
const timeframeOptions: Timeframe[] = ['1D', '1W', '1M', '3M']

const currencyIdr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
})

const currencyUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
})

const normalizeSeries = (series: RawPoint[] | CandlestickPoint[] | undefined): CandlestickPoint[] => {
  if (!Array.isArray(series)) return []

  return series
    .map((point) => {
      const rawPoint = point as RawPoint
      if (
        point &&
        (typeof point.time === 'string' || typeof point.time === 'number') &&
        typeof point.open === 'number' &&
        typeof point.high === 'number' &&
        typeof point.low === 'number' &&
        typeof point.close === 'number'
      ) {
        return {
          time: point.time,
          open: point.open,
          high: point.high,
          low: point.low,
          close: point.close
        }
      }

      if (rawPoint && typeof rawPoint.date === 'string' && typeof rawPoint.value === 'number') {
        return {
          time: rawPoint.date,
          open: rawPoint.value,
          high: rawPoint.value,
          low: rawPoint.value,
          close: rawPoint.value
        }
      }

      return null
    })
    .filter((point): point is CandlestickPoint => point !== null)
}

const toChartData = (series: CandlestickPoint[]): CandlestickData<Time>[] =>
  series.map((point) => ({
    time: point.time as Time,
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close
  }))

const getDaysFromTimeframe = (timeframe: Timeframe) => {
  switch (timeframe) {
    case '1D':
    case '1W':
      return 7
    case '1M':
      return 30
    case '3M':
      return 90
  }
}

const getTimeframeLabel = (timeframe: Timeframe) => {
  if (timeframe === '1M') return '30 hari terakhir'
  if (timeframe === '3M') return '90 hari terakhir'
  return '7 hari terakhir'
}

const createCandlestickChart = (
  container: HTMLDivElement,
  chartRef: React.MutableRefObject<IChartApi | null>,
  seriesRef: React.MutableRefObject<ISeriesApi<'Candlestick'> | null>
) => {
  const chart = createChart(container, {
    layout: {
      background: { type: ColorType.Solid, color: 'rgba(0,0,0,0)' },
      textColor: 'rgba(167,176,191,0.85)'
    },
    grid: {
      vertLines: { color: 'rgba(255,255,255,0.06)' },
      horzLines: { color: 'rgba(255,255,255,0.06)' }
    },
    rightPriceScale: {
      borderVisible: false
    },
    timeScale: {
      borderVisible: false,
      timeVisible: true,
      secondsVisible: false
    }
  })

  const series = chart.addCandlestickSeries({
    upColor: '#4ade80',
    downColor: '#f87171',
    wickUpColor: '#4ade80',
    wickDownColor: '#f87171',
    borderVisible: false
  })

  chartRef.current = chart
  seriesRef.current = series

  const resize = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect
    if (!rect || !chartRef.current) return
    chartRef.current.applyOptions({
      width: Math.floor(rect.width),
      height: Math.floor(rect.height)
    })
  })

  resize.observe(container)

  return () => {
    resize.disconnect()
    chart.remove()
    chartRef.current = null
    seriesRef.current = null
  }
}

export default function MarketDashboard({
  sectionId = 'market',
  gold = defaultGold,
  sp500 = defaultSp500
}: MarketDashboardProps) {
  const [goldTimeframe, setGoldTimeframe] = useState<Timeframe>('1D')
  const [sp500Timeframe, setSp500Timeframe] = useState<Timeframe>('1D')
  const [btcTimeframe, setBtcTimeframe] = useState<Timeframe>('1D')
  const [goldSeries, setGoldSeries] = useState<CandlestickPoint[]>([])
  const [sp500Series, setSp500Series] = useState<CandlestickPoint[]>(sp500)
  const [btcSeries, setBtcSeries] = useState<CandlestickPoint[]>([])
  const [goldNote, setGoldNote] = useState('')
  const [sp500Note, setSp500Note] = useState('')
  const [btcNote, setBtcNote] = useState('')

  const goldChartRef = useRef<IChartApi | null>(null)
  const btcChartRef = useRef<IChartApi | null>(null)
  const sp500ChartRef = useRef<IChartApi | null>(null)
  const goldContainerRef = useRef<HTMLDivElement | null>(null)
  const btcContainerRef = useRef<HTMLDivElement | null>(null)
  const sp500ContainerRef = useRef<HTMLDivElement | null>(null)
  const goldSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const btcSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const sp500SeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  const goldLastValue = goldSeries[goldSeries.length - 1]?.close
  const btcLastValue = btcSeries[btcSeries.length - 1]?.close
  const sp500LastValue = sp500Series[sp500Series.length - 1]?.close

  const hasGold = gold.price != null
  const trend = !hasGold
    ? 'none'
    : gold.change > 0
      ? 'up'
      : gold.change < 0
        ? 'down'
        : 'flat'

  const changeLabel = hasGold
    ? `${gold.change > 0 ? '+' : gold.change < 0 ? '-' : ''}${Math.abs(gold.change)}`
    : '-'

  const changeClass = !hasGold
    ? 'text-slate-300 border-slate-400/30 bg-slate-500/10'
    : trend === 'up'
      ? 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10'
      : trend === 'down'
        ? 'text-rose-300 border-rose-400/30 bg-rose-500/10'
        : 'text-slate-200 border-slate-400/30 bg-slate-500/10'

  const token = window.localStorage.getItem('lifeOS_token')

  useEffect(() => {
    if (!goldContainerRef.current || goldChartRef.current) return
    return createCandlestickChart(goldContainerRef.current, goldChartRef, goldSeriesRef)
  }, [])

  useEffect(() => {
    if (!btcContainerRef.current || btcChartRef.current) return
    return createCandlestickChart(btcContainerRef.current, btcChartRef, btcSeriesRef)
  }, [])

  useEffect(() => {
    if (!sp500ContainerRef.current || sp500ChartRef.current) return
    return createCandlestickChart(sp500ContainerRef.current, sp500ChartRef, sp500SeriesRef)
  }, [])

  useEffect(() => {
    let active = true
    const url = `${API_URL}/api/market/gold?days=${getDaysFromTimeframe(goldTimeframe)}`

    void fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Request failed')
        }
        return (await res.json()) as MarketSeriesResponse
      })
      .then((data) => {
        if (!active) return
        setGoldSeries(normalizeSeries(data.data))
        setGoldNote(data.note || '')
      })
      .catch((error: unknown) => {
        if (!active) return
        setGoldSeries([])
        setGoldNote(error instanceof Error ? error.message : 'Data candle GOLD belum tersedia.')
      })

    return () => {
      active = false
    }
  }, [goldTimeframe, token])

  useEffect(() => {
    let active = true
    const url = `${API_URL}/api/market/sp500?days=${getDaysFromTimeframe(sp500Timeframe)}`

    void fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Request failed')
        }
        return (await res.json()) as MarketSeriesResponse
      })
      .then((data) => {
        if (!active) return
        const normalized = normalizeSeries(data.data)
        setSp500Series(normalized.length ? normalized : normalizeSeries(sp500))
        setSp500Note(data.note || '')
      })
      .catch((error: unknown) => {
        if (!active) return
        setSp500Series(normalizeSeries(sp500))
        setSp500Note(error instanceof Error ? error.message : '')
      })

    return () => {
      active = false
    }
  }, [sp500Timeframe, sp500, token])

  useEffect(() => {
    let active = true
    const url = `${API_URL}/api/market/btc?days=${getDaysFromTimeframe(btcTimeframe)}`

    void fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Request failed')
        }
        return (await res.json()) as MarketSeriesResponse
      })
      .then((data) => {
        if (!active) return
        setBtcSeries(normalizeSeries(data.data))
        setBtcNote(data.note || '')
      })
      .catch((error: unknown) => {
        if (!active) return
        setBtcSeries([])
        setBtcNote(error instanceof Error ? error.message : '')
      })

    return () => {
      active = false
    }
  }, [btcTimeframe, token])

  useEffect(() => {
    if (!goldSeriesRef.current) return
    goldSeriesRef.current.setData(toChartData(goldSeries))
    goldChartRef.current?.timeScale().fitContent()
  }, [goldSeries])

  useEffect(() => {
    if (!btcSeriesRef.current) return
    btcSeriesRef.current.setData(toChartData(btcSeries))
    btcChartRef.current?.timeScale().fitContent()
  }, [btcSeries])

  useEffect(() => {
    if (!sp500SeriesRef.current) return
    sp500SeriesRef.current.setData(toChartData(sp500Series))
    sp500ChartRef.current?.timeScale().fitContent()
  }, [sp500Series])

  const renderChartCard = ({
    key,
    title,
    subtitle,
    value,
    note,
    label,
    timeframe,
    onTimeframeChange,
    containerRef,
    series
  }: {
    key: ChartKind
    title: string
    subtitle: string
    value: string
    note: string
    label: string
    timeframe: Timeframe
    onTimeframeChange: (frame: Timeframe) => void
    containerRef: React.RefObject<HTMLDivElement>
    series: CandlestickPoint[]
  }) => (
    <div key={key} className="market-card rounded-2xl border border-[color:var(--line)] bg-[var(--surface)] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--accent)]">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-[color:var(--text)]">{value}</p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{subtitle}</p>
        </div>
        <div className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs text-[color:var(--muted)]">
          Trend
        </div>
      </div>

      <div className="mt-6">
        <div className="timeframe-toggle">
          {timeframeOptions.map((frame) => (
            <button
              key={frame}
              type="button"
              className={timeframe === frame ? 'active' : ''}
              onClick={() => onTimeframeChange(frame)}
            >
              {frame}
            </button>
          ))}
        </div>
        <div className="mt-4 w-full">
          <div className="tv-chart-shell">
            <div className="tv-chart tv-chart-lg" ref={containerRef} />
            {!series.length && <div className="chart-empty">{note || `Data candle ${title} belum tersedia.`}</div>}
          </div>
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">{label}</p>
      </div>
    </div>
  )

  return (
    <section id={sectionId} className="py-16 sm:py-20">
      <div className="container">
        <div className="mb-8">
          <div className="eyebrow">Market Snapshot</div>
          <h2>Market Dashboard</h2>
          <p className="lead">
            Ringkasan GOLD (XAU/USD), Bitcoin (BTC/USDT), dan indeks S&amp;P 500 untuk memantau
            portofolio harian.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {renderChartCard({
            key: 'gold',
            title: 'GOLD (XAU/USD)',
            subtitle: `Update terakhir: ${hasGold ? gold.updatedAt : '-'}`,
            value: hasGold && gold.price !== null ? currencyIdr.format(gold.price) : '-',
            note: goldNote,
            label: getTimeframeLabel(goldTimeframe),
            timeframe: goldTimeframe,
            onTimeframeChange: setGoldTimeframe,
            containerRef: goldContainerRef,
            series: goldSeries
          })}

          {renderChartCard({
            key: 'btc',
            title: 'Bitcoin (BTC/USDT)',
            subtitle: 'Aset kripto global',
            value: btcLastValue ? currencyUsd.format(btcLastValue) : '-',
            note: btcNote,
            label: getTimeframeLabel(btcTimeframe),
            timeframe: btcTimeframe,
            onTimeframeChange: setBtcTimeframe,
            containerRef: btcContainerRef,
            series: btcSeries
          })}

          <div className="market-card rounded-2xl border border-[color:var(--line)] bg-[var(--surface)] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--accent-2)]">
                  S&amp;P 500
                </p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--text)]">
                  {sp500LastValue ? currencyUsd.format(sp500LastValue) : '-'}
                </p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Indeks saham AS</p>
              </div>
              <div className={`rounded-full border px-3 py-2 text-sm font-semibold ${changeClass}`}>
                {changeLabel}
              </div>
            </div>

            <div className="mt-6">
              <div className="timeframe-toggle">
                {timeframeOptions.map((frame) => (
                  <button
                    key={frame}
                    type="button"
                    className={sp500Timeframe === frame ? 'active' : ''}
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
                      {sp500Note || 'Data candle S&P 500 belum tersedia.'}
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                {getTimeframeLabel(sp500Timeframe)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
