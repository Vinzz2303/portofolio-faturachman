import React from 'react'
import { motion } from 'framer-motion'
import type { DetailedStockData } from '../../lib/stockService'
import { getExploreI18n } from '../../utils/exploreIntelligenceI18n'
import { useLanguagePreference } from '../../utils/language'
import { formatPercent, sanitizeMarketPercent } from '../../utils/marketFormatting'
import { formatAssetCurrency } from '../../utils/portfolioSnapshot'

interface Props {
  quotes: DetailedStockData[]
  loading: boolean
  onSelectTicker: (ticker: string) => void
  selectedTicker: string
}

function formatPrice(price: number, currency: string, yahooSymbol: string) {
  const isIdx = /\.JK$/i.test(yahooSymbol)
  const isCrypto = /-USD$/i.test(yahooSymbol)
  const isCommodity = /=F$/i.test(yahooSymbol)

  return formatAssetCurrency(
    price,
    isIdx ? 'IDR' : currency,
    isCrypto ? 'crypto' : isCommodity ? 'commodity' : 'stock',
    yahooSymbol
  )
}

// Let's pass i18n directly to get the sector label
function getSectorLabel(yahooSymbol: string, i18n: ReturnType<typeof getExploreI18n>): string {
  const map: Record<string, string> = {
    'BBCA.JK': i18n.bank, 'BBRI.JK': i18n.bank, 'BMRI.JK': i18n.bank, 'BBNI.JK': i18n.bank,
    'TLKM.JK': i18n.telco, 'GOTO.JK': i18n.tech, 'EMTK.JK': i18n.tech,
    'ADRO.JK': i18n.energy, 'PTBA.JK': i18n.energy, 'MEDC.JK': i18n.energy,
    'ICBP.JK': i18n.consumer, 'INDF.JK': i18n.consumer, 'UNVR.JK': i18n.consumer,
    'ASII.JK': i18n.industry, 'ANTM.JK': i18n.mining,
    'GC=F': 'COMMODITY', 'SI=F': 'COMMODITY', 'CL=F': 'COMMODITY',
    'BTC-USD': 'CRYPTO', 'ETH-USD': 'CRYPTO', 'SOL-USD': 'CRYPTO',
    'BNB-USD': 'CRYPTO', 'XRP-USD': 'CRYPTO',
  }
  return map[yahooSymbol] ?? 'IDX'
}

export default function MarketSnapshot({ quotes, loading, onSelectTicker, selectedTicker }: Props) {
  const { language } = useLanguagePreference()
  const i18n = getExploreI18n(language)

  return (
    <div className="w-full space-y-6">
      {loading && quotes.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {quotes.map((q, i) => {
            const change = sanitizeMarketPercent(q.changePercent, 35)
            const up = (change ?? 0) >= 0
            const isSelected = q.yahooSymbol === selectedTicker

            return (
              <motion.button
                key={q.yahooSymbol}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onSelectTicker(q.yahooSymbol)}
                className={`text-left p-5 rounded-2xl border transition-all duration-300 ${
                  isSelected
                    ? 'bg-white/[0.08] border-white/20 shadow-xl shadow-black/20 ring-1 ring-white/10'
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-semibold text-sm tracking-tight">{q.symbol}</div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                      {getSectorLabel(q.yahooSymbol, i18n)}
                    </div>
                  </div>
                  
                  <div className={`market-status-badge ${
                    q.status === 'live' ? 'market-status-live' :
                    q.status === 'delayed' ? 'market-status-live' :
                    'market-status-fallback'
                  }`}>
                    {q.status === 'live' || q.status === 'delayed' ? (up ? '↑' : '↓') : '—'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-lg font-semibold numeric-value">
                    {formatPrice(q.price, q.currency, q.yahooSymbol)}
                  </div>
                  <div className={`text-xs font-medium font-mono ${up ? 'text-teal-400' : 'text-red-400'}`}>
                    {formatPercent(change, language)}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Summary footer */}
      {quotes.length > 0 && (
        <div className="flex items-center gap-6 px-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="text-teal-500 font-bold">{quotes.filter(q => (sanitizeMarketPercent(q.changePercent, 35) ?? 0) >= 0).length}</span>
            <span>{i18n.bullish}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-bold">{quotes.filter(q => (sanitizeMarketPercent(q.changePercent, 35) ?? 0) < 0).length}</span>
            <span>{i18n.bearish}</span>
          </div>
          <div className="hidden md:block h-3 w-px bg-white/5" />
          <span className="hidden md:block">{i18n.clickForTechnicalVisualization}</span>
        </div>
      )}
    </div>
  )
}
