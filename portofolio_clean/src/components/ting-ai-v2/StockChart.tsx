import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts'
import { getMarketHistory } from '../../services/marketData'
import type { MarketHistoryPoint } from '../../services/marketData'
import { useLanguagePreference } from '../../utils/language'
import { getExploreI18n } from '../../utils/exploreIntelligenceI18n'
import { formatMarketNumber, formatPercent, sanitizeMarketPercent } from '../../utils/marketFormatting'

interface Props {
  ticker: string
  currentPrice?: number
  changePercent?: number
}

const RANGES = ['5d', '1mo', '3mo', '6mo'] as const
type Range = typeof RANGES[number]

function formatPrice(n: number, language: 'id' | 'en' = 'id') {
  return formatMarketNumber(n, language, { maxDigits: 2 })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0f1318] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <div className="text-[10px] font-mono text-slate-500 mb-1">{label}</div>
      <div className="text-base font-semibold numeric-value text-teal-400">
        {formatPrice(payload[0].value)}
      </div>
    </div>
  )
}

export default function StockChart({ ticker, currentPrice, changePercent }: Props) {
  const { language } = useLanguagePreference()
  const locale = language === 'en' ? 'en-US' : 'id-ID'
  const i18n = useMemo(() => getExploreI18n(language), [language])
  const [data, setData] = useState<(MarketHistoryPoint & { date: string; close: number })[]>([])
  const [range, setRange] = useState<Range>('1mo')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    getMarketHistory(ticker, range)
      .then(d => {
        if (cancelled) return
        if (!d.length) {
          setError(true)
          setLoading(false)
          return
        }
        const formattedData = d.map(p => ({
          ...p,
          date: new Date(p.time).toLocaleDateString(locale, { day: '2-digit', month: 'short' }),
          close: p.price,
        }))
        setData(formattedData)
        setLoading(false)
      })
      .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })
    return () => { cancelled = true }
  }, [ticker, range, locale])

  const safeChange = sanitizeMarketPercent(changePercent, 35)
  const up = (safeChange ?? 0) >= 0
  const isIhsg = ticker === '^JKSE'
  const shortTicker = isIhsg ? (language === 'id' ? 'IHSG' : 'IDX Composite') : ticker.replace('.JK', '')
  const gradId = `grad-${ticker.replace(/[^a-z0-9]/gi, '_')}`

  const values  = data.map(d => d.close)
  const minVal  = values.length ? Math.min(...values) : 0
  const maxVal  = values.length ? Math.max(...values) : 0

  return (
    <div className="premium-card p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-6">
        <div className="space-y-2">
          <span className="label-uppercase opacity-60">
            {i18n.technicalVisualization}
          </span>
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-medium tracking-tight">{shortTicker}</h3>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold numeric-value">
                {currentPrice !== undefined
                  ? formatPrice(currentPrice, language)
                  : (isIhsg ? i18n.ihsgUnavailable : i18n.marketDataUnavailable)}
              </span>
              {safeChange !== null && (
                <span className={`text-sm font-semibold numeric-value ${up ? 'text-teal-400' : 'text-red-400'}`}>
                  {formatPercent(safeChange, language)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Range selector */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
                range === r
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {i18n.rangeLabels[r]}
            </button>
          ))}
        </div>
      </div>

        <div style={{ height: '256px', width: '100%', position: 'relative' }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-teal-500/20 border-t-teal-500 animate-spin" />
                <span className="label-uppercase text-slate-700 text-[10px]">{i18n.chartLoading}</span>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-700 text-xs font-mono uppercase tracking-widest">
              {i18n.chartUnavailable}
            </div>
          ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            style={{ height: '100%', width: '100%' }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={up ? '#2dd4bf' : '#ef4444'} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={up ? '#2dd4bf' : '#ef4444'} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => formatPrice(v, language)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={up ? '#2dd4bf' : '#ef4444'}
                  strokeWidth={2.5}
                  fill={`url(#${gradId})`}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Footer stats */}
      {!loading && !error && values.length > 0 && (
        <div className="flex items-center gap-6 px-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          <span>{i18n.chartMin} <span className="numeric-value text-slate-400">{formatPrice(minVal, language)}</span></span>
          <span>{i18n.chartMax} <span className="numeric-value text-slate-400">{formatPrice(maxVal, language)}</span></span>
        </div>
      )}
    </div>
  )
}
