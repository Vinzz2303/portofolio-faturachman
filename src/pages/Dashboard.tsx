import React, { useEffect, useMemo, useState } from 'react'
import AiChat from '../components/AiChat'
import { API_URL } from '../utils/api'
import { fetchWithSession, readResponseError } from '../utils/authFetch'
import { hasProAccess } from '../utils/entitlements'
import { useLanguagePreference } from '../utils/language'
import { useAuthSession } from '../utils/useAuthSession'
import type {
  CandlestickPoint,
  GoldCardData,
  InvestmentMeta,
  InvestmentSummaryResponse,
  PortfolioSummaryResponse,
  TingRefineResponse,
  TingRefinedInsight
} from '../types'
import FreeDashboard from '../components/dashboard/FreeDashboard'
import ProDashboard from '../components/dashboard/ProDashboard'
import TingDashboardInsight from '../components/dashboard/TingDashboardInsight'
import { deriveDecisionContext, normalizeInsightSummary } from '../components/dashboard/decisionContext'
import { getDashboardCopy } from '../components/dashboard/dashboardI18n'
import { buildDashboardTingAIOutput, buildRawDashboardInsight } from '../tingai/dashboardAdapter'

type DashboardState = {
  summary: string
  meta: InvestmentMeta | null
  portfolio: PortfolioSummaryResponse | null
  loading: boolean
  error: string
}

const initialState: DashboardState = {
  summary: '',
  meta: null,
  portfolio: null,
  loading: true,
  error: ''
}

const localizeSummarySentence = (sentence: string, language: 'id' | 'en') => {
  if (language === 'en') return sentence.trim()

  let cleaned = sentence.trim().replace(/\s+/g, ' ')

  const directPrefixes: Array<[RegExp, string]> = [
    [/^Market brief:\s*/i, 'Ringkasan pasar: '],
    [/^What Changed:\s*/i, 'Apa yang berubah: '],
    [/^Why It Matters:\s*/i, 'Kenapa ini penting: '],
    [/^What To Watch:\s*/i, 'Yang perlu diperhatikan: ']
  ]

  for (const [pattern, replacement] of directPrefixes) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, replacement)
      break
    }
  }

  const movedMatch = cleaned.match(
    /^(.*?:\s*)?([A-Z0-9]+)\s+moved\s+(higher|lower)\s+most clearly(?:\s+at the latest checkpoint)?(?:,\s+with a move of\s+([+-]?\d+(?:\.\d+)?)%)(?:\s+on\s+([0-9-]+))?\.?$/i
  )
  if (movedMatch) {
    const [, prefix = '', symbol, direction, pct, date] = movedMatch
    const directionText = direction.toLowerCase() === 'higher' ? 'naik' : 'turun'
    const pctText = pct ? ` sebesar ${Number(pct).toFixed(2)}%` : ''
    const dateText = date ? ` pada ${date}` : ''
    return `${prefix}${symbol} bergerak paling jelas ke arah ${directionText}${pctText}${dateText}.`
  }

  if (/^The tape is leaning defensive/i.test(cleaned)) {
    return 'Pasar sedang condong defensif, tetapi belum sepenuhnya bergerak satu arah.'
  }

  if (/^The tape is constructive/i.test(cleaned)) {
    return 'Pasar sedang terlihat konstruktif, tetapi konfirmasi tetap perlu dijaga.'
  }

  if (/^The tape is mixed/i.test(cleaned) || /^Cross-asset signals are mixed/i.test(cleaned)) {
    return 'Sinyal pasar masih campuran, jadi sebaiknya jangan terlalu cepat mengambil satu kesimpulan.'
  }

  if (/stay selective/i.test(cleaned) || /selective/i.test(cleaned)) {
    return 'Kondisi pasar masih meminta sikap selektif dan disiplin.'
  }

  if (/avoid overcommitting to one narrative/i.test(cleaned)) {
    return 'Jangan terlalu cepat berkomitmen pada satu narasi pasar saja.'
  }

  const localized = cleaned
    .replace(/\bRisk-on leaning\b/gi, 'Minat risiko mulai condong membaik')
    .replace(/\bRisk-on\b/gi, 'Minat risiko membaik')
    .replace(/\bMixed tone\b/gi, 'Nada pasar campuran')
    .replace(/\bFragile risk-on recovery\b/gi, 'Pemulihan minat risiko masih rapuh')
    .replace(/\bTightening-aware risk-on\b/gi, 'Minat risiko membaik tetapi tetap sensitif ke tekanan makro')
    .replace(/\bHigh-dispersion cross-asset tape\b/gi, 'Sinyal lintas aset masih terpencar')
    .replace(/\bcross-asset consolidation\b/gi, 'konsolidasi lintas aset')
    .replace(/\bmedium conviction\b/gi, 'keyakinan sedang')
    .replace(/\blow conviction\b/gi, 'keyakinan rendah')
    .replace(/\bhigh conviction\b/gi, 'keyakinan tinggi')
    .replace(/\bat the latest checkpoint\b/gi, 'pada pembaruan terakhir')
    .replace(/\blatest checkpoint\b/gi, 'pembaruan terakhir')
    .replace(/\bwith a move of\b/gi, 'dengan pergerakan')
    .replace(/\bmoved higher\b/gi, 'bergerak naik')
    .replace(/\bmoved lower\b/gi, 'bergerak turun')
    .replace(/\bmost clearly\b/gi, 'paling jelas')
    .replace(/\bBecause signals are still mixed\b/gi, 'Karena sinyal masih campuran')
    .replace(/\bthe market does not yet offer one clean narrative\b/gi, 'pasar belum memberi satu narasi yang bersih')
    .replace(/\bThat raises the value of cross-asset confirmation\b/gi, 'konfirmasi lintas aset menjadi lebih penting')
    .replace(/\bWatch whether\b/gi, 'Perhatikan apakah')
    .replace(/\bIf that persists\b/gi, 'Jika kondisi itu bertahan')

  const movedFallback = localized.match(
    /^(.*?:\s*)?([A-Z0-9]+)\s+bergerak\s+(naik|turun)\s+paling jelas(?:\s+pada pembaruan terakhir)?(?:,\s+dengan pergerakan\s+([+-]?\d+(?:\.\d+)?)%)(?:\s+(?:on|pada)\s+([0-9-]+))?\.?$/i
  )
  if (movedFallback) {
    const [, prefix = '', symbol, direction, pct, date] = movedFallback
    const pctText = pct ? ` sebesar ${Number(pct).toFixed(2)}%` : ''
    const dateText = date ? ` pada ${date}` : ''
    return `${prefix}${symbol} bergerak paling jelas ke arah ${direction}${pctText}${dateText}.`
  }

  return localized
    .replace(/\bPortfolio fit\b/gi, 'Kecocokan portofolio')
    .replace(/\bportfolio\b/gi, 'portofolio')
    .replace(/\bmarket\b/gi, 'pasar')
    .replace(/\brisk\b/gi, 'risiko')
    .replace(/\bimplication\b/gi, 'implikasi')
    .replace(/\bwatch item\b/gi, 'item yang perlu dipantau')
    .replace(/\bstatus\b/gi, 'status')
    .replace(/\bon\b/gi, 'pada')
}

const deriveTechnicalTrend = (pct?: number, delta?: number) => {
  if (typeof pct === 'number') {
    if (pct >= 0.4) return 'up' as const
    if (pct <= -0.4) return 'down' as const
    return 'flat' as const
  }

  if (typeof delta === 'number') {
    if (delta > 0) return 'up' as const
    if (delta < 0) return 'down' as const
  }

  return 'flat' as const
}

const deriveTechnicalVolatility = (pct?: number, delta?: number) => {
  if (typeof pct === 'number') return Math.abs(pct)
  if (typeof delta === 'number') return Math.abs(delta)
  return 0
}

const deriveTechnicalRsiProxy = (pct?: number) => {
  if (typeof pct !== 'number') return undefined
  if (pct >= 2) return 72
  if (pct <= -2) return 28
  if (pct >= 1) return 62
  if (pct <= -1) return 38
  return 50
}

export default function Dashboard() {
  const { user } = useAuthSession()
  const { language } = useLanguagePreference()
  const [state, setState] = useState<DashboardState>(initialState)
  const [refinedInsight, setRefinedInsight] = useState<TingRefinedInsight | null>(null)

  const isProUser = hasProAccess(user)
  const copy = useMemo(() => getDashboardCopy(language), [language])
  const dashboardErrors = useMemo(
    () =>
      language === 'en'
        ? {
            requestFailed: 'Request failed',
            timeout: 'Request timeout. Check the VPS backend, database, or market API key.',
            fallback: 'Failed to fetch data'
          }
        : {
            requestFailed: 'Request gagal',
            timeout: 'Request timeout. Cek backend VPS, database, atau API key market.',
            fallback: 'Gagal mengambil data'
          },
    [language]
  )

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 15000)
    setState((prev) => ({ ...prev, loading: true, error: '' }))

    const portfolioPromise = fetchWithSession(`${API_URL}/api/portfolio/summary`, {
      signal: controller.signal
    })
      .then(async (res) => {
        if (!res.ok) return null
        return (await res.json()) as PortfolioSummaryResponse
      })
      .catch(() => null)

    void fetchWithSession(`${API_URL}/api/investment-summary`, {
      signal: controller.signal
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await readResponseError(res, dashboardErrors.requestFailed))
        }
        const data = (await res.json()) as InvestmentSummaryResponse
        const portfolio = await portfolioPromise
        return { data, portfolio }
      })
      .then(({ data, portfolio }) => {
        if (!active) return
        setState({
          summary: data.summary || '',
          meta: data.meta || null,
          portfolio,
          loading: false,
          error: ''
        })
      })
      .catch((err: unknown) => {
        if (!active) return
        setState({
          summary: '',
          meta: null,
          portfolio: null,
          loading: false,
          error:
            err instanceof Error && err.name === 'AbortError'
              ? dashboardErrors.timeout
              : err instanceof Error
                ? err.message
                : dashboardErrors.fallback
        })
      })

    return () => {
      active = false
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [dashboardErrors])

  const summaryItems = useMemo(() => normalizeInsightSummary(state.summary), [state.summary])
  const localizedSummaryItems = useMemo(
    () => summaryItems.map((item) => localizeSummarySentence(item, language)),
    [language, summaryItems]
  )

  const goldData = useMemo<GoldCardData | undefined>(() => {
    const gold = state.meta?.instruments?.ANTAM

    if (!gold || gold.error) return undefined

    return {
      price: gold.latestPrice ?? null,
      change: gold.delta ?? 0,
      updatedAt: gold.latestDate ?? '-'
    }
  }, [state.meta])

  const sp500Series = useMemo<CandlestickPoint[]>(() => [], [])
  const ihsgSeries = useMemo<CandlestickPoint[]>(() => [], [])

  const decisionContext = useMemo(
    () =>
      deriveDecisionContext({
        summary: localizedSummaryItems.length > 0 ? localizedSummaryItems.join('. ') : state.summary,
        market: [
          state.meta?.instruments?.ANTAM,
          state.meta?.instruments?.SP500,
          state.meta?.instruments?.IHSG,
          state.meta?.instruments?.BTC
        ]
          .filter(Boolean)
          .map((item) => ({
            symbol: item!.instrument,
            delta: item!.delta,
            error: item!.error
          })),
        technicals: [
          state.meta?.instruments?.ANTAM,
          state.meta?.instruments?.SP500,
          state.meta?.instruments?.IHSG,
          state.meta?.instruments?.BTC
        ]
          .filter(Boolean)
          .map((item) => ({
            symbol: item!.instrument,
            trend: deriveTechnicalTrend(item!.pct, item!.delta),
            volatility: deriveTechnicalVolatility(item!.pct, item!.delta),
            rsi: deriveTechnicalRsiProxy(item!.pct)
          })),
        marketContext: state.meta?.context
          ? {
              // Trust Pipeline: frontend only receives semantic market context,
              // never raw provider datasets.
              riskTone: state.meta.context.riskTone,
              stressState: state.meta.context.stressState,
              macroContext: state.meta.context.macroContext,
              headlinePressure: state.meta.context.headlinePressure,
              watchLevel: state.meta.context.watchLevel,
              semanticSignals: state.meta.context.semanticSignals
            }
          : undefined,
        language,
        planTier: isProUser ? 'pro' : 'free'
      }),
    [isProUser, language, localizedSummaryItems, state.meta, state.summary]
  )
  const tingInsight = useMemo(
    () => buildDashboardTingAIOutput(state.portfolio, state.meta),
    [state.meta, state.portfolio]
  )
  const hasPortfolioHoldings = Boolean(state.portfolio?.holdings?.length)

  useEffect(() => {
    if (!tingInsight || language !== 'id') {
      setRefinedInsight(null)
      return
    }

    let active = true
    const controller = new AbortController()
    const rawInsight = buildRawDashboardInsight(tingInsight)

    void fetchWithSession(`${API_URL}/api/ting-ai/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawInsight }),
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) return null
        return (await response.json()) as TingRefineResponse
      })
      .then((payload) => {
        if (!active) return
        setRefinedInsight(payload?.insight || null)
      })
      .catch(() => {
        if (active) setRefinedInsight(null)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [language, tingInsight])

  const insightBadge = language === 'en'
    ? {
        label: copy.insightBadgeLabel,
        ready: copy.portfolioAware,
        pending: 'Portfolio pending'
      }
    : {
        label: copy.insightBadgeLabel,
        ready: copy.portfolioAware,
        pending: copy.portfolioPending
      }

  return (
    <section className="container dashboard-shell">
      <div className="dashboard-stage">
        <div className="dashboard-stage-main">
          <div className="dashboard-header dashboard-header-primary">
            <div className="eyebrow">Ting AI</div>
            <div className="dashboard-header-row">
              <div>
                <h2>{copy.heroTitle}</h2>
                <p className="lead">{copy.heroLead}</p>
              </div>
              <div className="dashboard-stage-badge">
                <span className="dashboard-stage-badge-label">{insightBadge.label}</span>
                <strong>{hasPortfolioHoldings ? insightBadge.ready : insightBadge.pending}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-primary-insight">
            <TingDashboardInsight
              analysis={tingInsight}
              loading={state.loading}
              hasPortfolio={hasPortfolioHoldings}
              language={language}
              refinedInsight={refinedInsight}
            />
          </div>

          <AiChat
            sectionId="dashboard-ask-ting-ai"
            variant="panel"
            language={language}
            summary={localizedSummaryItems[0] || state.summary || ''}
            meta={state.meta}
            portfolio={state.portfolio}
            userPlan={isProUser ? 'pro' : 'free'}
            analysisStatus={{
              label: copy.askTingAi,
              detail: hasPortfolioHoldings
                ? copy.askTingAiLead
                : language === 'en'
                  ? 'Ask Ting AI is still available even while portfolio context is still loading or empty.'
                  : 'Tanya Ting AI tetap tersedia meskipun konteks portofolio masih kosong atau belum siap.'
            }}
          />
        </div>
      </div>

      <div className="dashboard-supporting dashboard-supporting-content">
        {isProUser ? (
          <ProDashboard
            copy={copy}
            decisionContext={decisionContext}
            loading={state.loading}
            error={state.error}
            insights={decisionContext.overnightChange}
            gold={goldData}
            sp500={sp500Series}
            ihsg={ihsgSeries}
            summary={localizedSummaryItems[0] || state.summary || copy.contextLayerLead}
            instruments={state.meta?.instruments}
            headlines={state.meta?.context?.headlines}
          />
        ) : (
          <FreeDashboard
            copy={copy}
            decisionContext={decisionContext}
            loading={state.loading}
            error={state.error}
            insights={decisionContext.overnightChange}
            summary={localizedSummaryItems[0] || state.summary || copy.contextLayerLead}
            instruments={state.meta?.instruments}
            headlines={state.meta?.context?.headlines}
          />
        )}
      </div>
    </section>
  )
}
