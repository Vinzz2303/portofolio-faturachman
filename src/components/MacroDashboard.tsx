import { useState, useEffect } from 'react'

interface MacroData {
  fedFundsRate: number | null
  us10YearYield: number | null
  dxy: number | null
  inflationRate: number | null
  lastUpdated: string
}

export default function MacroDashboard({ i18n }: { i18n: any }) {
  const [data, setData] = useState<MacroData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // We will call our Node.js backend which proxies OpenBB
    fetch('/api/market/macro')
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch macro data', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] p-7 flex items-center justify-center min-h-[120px]" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-xs text-slate-500 font-mono animate-pulse">MEMUAT DATA OPENBB...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="rounded-2xl border border-white/[0.06] p-7 space-y-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="label-uppercase text-[10px] text-amber-500">POWERED BY OPENBB</p>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50 animate-pulse" />
        </div>
        <h3 className="text-lg font-medium text-slate-200">Global Macro & Geopolitics</h3>
        <p className="text-xs text-slate-500 mt-1">Data tingkat institusi untuk membaca arus likuiditas dan sentimen global.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Fed Funds Rate */}
        <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
          <p className="text-[10px] font-mono text-slate-500 mb-1">SUKU BUNGA THE FED</p>
          <p className="text-2xl font-semibold text-slate-200">{data.fedFundsRate ? `${data.fedFundsRate}%` : '-'}</p>
        </div>

        {/* US 10Y Yield */}
        <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
          <p className="text-[10px] font-mono text-slate-500 mb-1">YIELD OBLIGASI AS 10Y</p>
          <p className="text-2xl font-semibold text-slate-200">{data.us10YearYield ? `${data.us10YearYield}%` : '-'}</p>
        </div>

        {/* DXY */}
        <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
          <p className="text-[10px] font-mono text-slate-500 mb-1">INDEKS DOLAR (DXY)</p>
          <p className="text-2xl font-semibold text-slate-200">{data.dxy ? data.dxy : '-'}</p>
        </div>

        {/* Inflation */}
        <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
          <p className="text-[10px] font-mono text-slate-500 mb-1">INFLASI AS (CPI)</p>
          <p className="text-2xl font-semibold text-slate-200">{data.inflationRate ? `${data.inflationRate}%` : '-'}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/[0.04]">
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          <span className="text-teal-400">INTELIGENSI MAKRO:</span> Suku bunga {data.fedFundsRate}% dan inflasi {data.inflationRate}% mengindikasikan likuiditas global yang ketat. 
          Yield {data.us10YearYield}% membuat aset berisiko (saham/crypto) kurang menarik dibanding instrumen pendapatan tetap. 
          Kondisi ini memerlukan alokasi portofolio yang defensif.
        </p>
      </div>
    </div>
  )
}
