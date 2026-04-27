import { useEffect, useMemo, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import PortfolioImpactCard from './PortfolioImpactCard'
import type { TingRefinedInsight } from '../../types'
import type { TingAIOutput } from '../../tingai/types'
import {
  compareInsightSnapshots,
  createInsightSnapshot,
  readStoredInsightSnapshot,
  storeInsightSnapshot,
  type InsightChangeAwareness
} from './changeAwareness'

type TingDashboardInsightProps = {
  analysis: TingAIOutput | null
  loading: boolean
  hasPortfolio: boolean
  language: 'id' | 'en'
  refinedInsight?: TingRefinedInsight | null
}

const TingDashboardInsight: FC<TingDashboardInsightProps> = ({
  analysis,
  loading,
  hasPortfolio,
  language,
  refinedInsight
}) => {
  const [changeAwareness, setChangeAwareness] = useState<InsightChangeAwareness | null>(null)
  const currentSnapshot = useMemo(
    () => (analysis ? createInsightSnapshot(analysis) : null),
    [analysis]
  )

  useEffect(() => {
    if (!currentSnapshot) {
      setChangeAwareness(null)
      return
    }

    const previousSnapshot = readStoredInsightSnapshot()
    setChangeAwareness(
      previousSnapshot ? compareInsightSnapshots(previousSnapshot, currentSnapshot) : null
    )
    storeInsightSnapshot(currentSnapshot)
  }, [currentSnapshot])

  if (loading) {
    return (
      <div className="card dashboard-card">
        <div className="eyebrow">Ting AI</div>
        <h3>{language === 'en' ? 'Reading portfolio...' : 'Membaca portofolio...'}</h3>
        <p className="card-note">{language === 'en' ? 'Preparing your risk view.' : 'Menyiapkan tampilan risiko kamu.'}</p>
      </div>
    )
  }

  if (!hasPortfolio || !analysis) {
    return (
      <div className="card dashboard-card">
        <div className="eyebrow">Ting AI</div>
        <h3>{language === 'en' ? 'Start from your portfolio first' : 'Mulai dari portofolio kamu dulu'}</h3>
        <p className="lead" style={{ margin: '0.4rem 0 0.8rem' }}>
          {language === 'en'
            ? 'Add holdings to unlock the risk view.'
            : 'Isi posisi dulu untuk membuka tampilan risiko.'}
        </p>
        <p className="card-note">
          {language === 'en'
            ? 'Without positions, the insight stays generic.'
            : 'Tanpa posisi, insight akan tetap umum.'}
        </p>
        <div className="hero-cta" style={{ marginTop: '1rem' }}>
          <Link className="btn" to="/portfolio">
            {language === 'en' ? 'Open Portfolio' : 'Buka Portofolio'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <PortfolioImpactCard
      data={analysis}
      language={language}
      changeAwareness={changeAwareness}
      refinedInsight={refinedInsight}
    />
  )
}

export default TingDashboardInsight
