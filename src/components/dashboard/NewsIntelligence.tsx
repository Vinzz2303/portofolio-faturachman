import React from 'react'
import type { MarketHeadline } from '../../types'
import type { DashboardCopy } from './types'

type Props = {
  copy: DashboardCopy
  headlines?: MarketHeadline[]
}

function getRelevanceBucket(item: MarketHeadline): 'fresh' | 'likely_priced_in' | 'noise' | 'high' {
  if (item.relevance === 'high') return 'high'
  if (item.relevance === 'low') return 'noise'

  const publishedAt = Date.parse(item.publishedAt)
  if (Number.isFinite(publishedAt)) {
    const hours = Math.abs(Date.now() - publishedAt) / (1000 * 60 * 60)
    if (hours <= 18) return 'fresh'
  }

  return 'likely_priced_in'
}

function getRelevanceLabel(bucket: ReturnType<typeof getRelevanceBucket>, copy: DashboardCopy) {
  switch (bucket) {
    case 'fresh':
      return copy.relevanceFresh
    case 'likely_priced_in':
      return copy.relevanceLikelyPricedIn
    case 'noise':
      return copy.relevanceNoise
    case 'high':
      return copy.relevanceHigh
  }
}

function getExplanation(bucket: ReturnType<typeof getRelevanceBucket>, copy: DashboardCopy) {
  if (copy.language === 'en') {
    switch (bucket) {
      case 'fresh':
        return 'This headline is still fresh enough to matter, but price reaction should confirm whether it is really changing the read.'
      case 'likely_priced_in':
        return 'Price reaction has not added much new confirmation, so this headline may already be reflected in the market.'
      case 'noise':
        return 'This headline adds context, but it does not look relevant enough to carry the main market read on its own.'
      case 'high':
        return 'This headline still looks highly relevant because it can change how market pressure or risk appetite is being interpreted.'
    }
  }

  switch (bucket) {
    case 'fresh':
      return 'Headline ini masih cukup baru untuk diperhatikan, tetapi reaksi harga tetap perlu mengonfirmasi apakah pembacaannya benar-benar berubah.'
    case 'likely_priced_in':
      return 'Reaksi harga belum mengonfirmasi headline, sehingga berita ini kemungkinan sudah tercermin sebelumnya.'
    case 'noise':
      return 'Headline ini menambah konteks, tetapi belum cukup relevan untuk membawa pembacaan pasar utama sendirian.'
    case 'high':
      return 'Headline ini masih terlihat sangat relevan karena dapat mengubah cara tekanan pasar atau selera risiko dibaca.'
  }
}

export default function NewsIntelligence({ copy, headlines }: Props) {
  const cards = (headlines || []).slice(0, 3)

  if (!cards.length) return null

  return (
    <section className="card dashboard-card" id="news-intelligence">
      <div className="dashboard-summary-head context-layer-head">
        <div>
          <p className="dashboard-summary-kicker">{copy.newsIntelligence}</p>
          <h3 style={{ fontSize: '1.06rem' }}>{copy.newsIntelligence}</h3>
          <p className="summary-text context-layer-summary">{copy.newsIntelligenceLead}</p>
        </div>
      </div>

      <div className="brief-section-list">
        {cards.map((item) => {
          const bucket = getRelevanceBucket(item)
          return (
            <div key={`${item.title}-${item.publishedAt}`} className="brief-section-card">
              <span className="brief-section-label">
                {copy.relevanceLabel}: {getRelevanceLabel(bucket, copy)}
              </span>
              <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: '0.5rem' }}>{item.title}</p>
              <p>{getExplanation(bucket, copy)}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
