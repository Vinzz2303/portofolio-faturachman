import type { FC } from 'react'
import { useMemo } from 'react'
import type { TingRefinedInsight } from '../../types'
import type { TingAIOutput } from '../../tingai/types'
import type { InsightChangeAwareness } from './changeAwareness'
import styles from './PortfolioImpactCard.module.css'
import { getDashboardCopy } from './dashboardI18n'
import type { DashboardCopy } from './types'

type PortfolioImpactCardProps = {
  data: TingAIOutput
  language: 'id' | 'en'
  changeAwareness?: InsightChangeAwareness | null
  refinedInsight?: TingRefinedInsight | null
}

function getRiskColor(level: 'Low' | 'Medium' | 'High') {
  switch (level) {
    case 'Low':
      return 'var(--ting-risk-low)'
    case 'Medium':
      return 'var(--ting-risk-medium)'
    case 'High':
      return 'var(--ting-risk-high)'
  }
}

function getRiskLabel(level: 'Low' | 'Medium' | 'High', language: 'id' | 'en') {
  if (language === 'en') {
    return level
  }

  switch (level) {
    case 'Low':
      return 'Rendah'
    case 'Medium':
      return 'Sedang'
    case 'High':
      return 'Tinggi'
  }
}

function getExposureLabel(level: 'Low' | 'Medium' | 'High', language: 'id' | 'en') {
  const localizedLevel = getRiskLabel(level, language).toLowerCase()
  return language === 'en' ? `Exposure ${localizedLevel}` : `Eksposur ${localizedLevel}`
}

function getScenarioLabel(kind: 'enter' | 'wait', language: 'id' | 'en') {
  if (language === 'en') {
    return kind === 'enter' ? 'If moving earlier' : 'If giving it more time'
  }

  return kind === 'enter' ? 'Jika bergerak lebih cepat' : 'Jika memberi waktu lebih'
}

function getTradeOffLead(kind: 'enter' | 'wait', language: 'id' | 'en') {
  if (language === 'en') {
    return kind === 'enter' ? 'Still actionable.' : 'Waiting looks lighter.'
  }

  return kind === 'enter' ? 'Masih bisa aktif.' : 'Menunggu lebih ringan.'
}

function getToneIcon(tone: 'positive' | 'neutral' | 'negative') {
  switch (tone) {
    case 'positive':
      return '+'
    case 'neutral':
      return '='
    case 'negative':
      return '-'
  }
}

function normalizeStatement(text: string) {
  return text.trim().replace(/\s+/g, ' ')
}

function cleanDanglingEnding(text: string) {
  return text.trim().replace(/[\s,;:.-]+$/, '')
}

function ensureSentenceEnd(text: string) {
  const cleaned = cleanDanglingEnding(text)
  if (!cleaned) return cleaned
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`
}

function getFirstCompleteSentence(text: string) {
  const normalized = normalizeStatement(text)
  const match = normalized.match(/^.+?[.!?](?=\s|$)/)
  return match?.[0] || ''
}

function shortenStatement(text: string, maxLength = 92) {
  const normalized = normalizeStatement(text)

  if (normalized.length <= maxLength) return normalized

  const firstSentence = getFirstCompleteSentence(normalized)
  if (firstSentence) {
    if (firstSentence.length <= maxLength) return firstSentence
    if (firstSentence.length <= maxLength + 28) return firstSentence
  }

  const truncated = normalized.slice(0, maxLength).trim()
  const lastSpace = truncated.lastIndexOf(' ')
  const safeText = lastSpace > 48 ? truncated.slice(0, lastSpace) : truncated
  return `${cleanDanglingEnding(safeText)}...`
}

function shortenHard(text: string, maxLength = 92) {
  return shortenStatement(text, maxLength)
}

function localizeDisplayText(text: string, language: 'id' | 'en') {
  if (language === 'en') return text

  return text
    .replace(/\bExtreme Greed\b/gi, 'sangat optimistis')
    .replace(/\bExtreme Fear\b/gi, 'sangat takut')
    .replace(/\bGreed\b/gi, 'optimistis')
    .replace(/\bFear\b/gi, 'takut')
    .replace(/\bNeutral\b/gi, 'netral')
    .replace(/\btiming risk\b/gi, 'risiko timing')
    .replace(/\bmarket\b/gi, 'pasar')
    .replace(/\bportfolio\b/gi, 'portofolio')
}

function localizeAnalyzerValue(text: string, language: 'id' | 'en') {
  if (language === 'id') return text

  return text
    .replace(/(\d+(?:\.\d+)?)%\s+pada\s+([A-Z0-9.-]+)/gi, '$1% in $2')
    .replace(/\bTinggi\b/gi, 'High')
    .replace(/\bSedang\b/gi, 'Medium')
    .replace(/\bRendah\b/gi, 'Low')
    .replace(/\bPositif\b/gi, 'Positive')
    .replace(/\bNegatif\b/gi, 'Negative')
    .replace(/\bNetral\b/gi, 'Neutral')
    .replace(/\bNaik\b/gi, 'Up')
    .replace(/\bMenurun\b/gi, 'Down')
}

function localizeMarketSummary(text: string, language: 'id' | 'en') {
  if (language === 'id') return text

  return text
    .replace(
      /Market saat ini cenderung ([a-z]+) dengan tren naik\./gi,
      'The market currently looks $1 with an upward trend.'
    )
    .replace(
      /Market saat ini cenderung ([a-z]+) dengan tren menurun\./gi,
      'The market currently looks $1 with a declining trend.'
    )
    .replace(
      /Market saat ini cenderung ([a-z]+) dengan pergerakan sideways, jadi arahnya belum terlalu bersih\./gi,
      'The market currently looks $1 with sideways movement, so direction is still not very clean.'
    )
    .replace(
      /Volatilitas tinggi membuat pergerakan jangka pendek lebih cepat dan mudah berubah\./gi,
      'High volatility makes short-term moves faster and easier to reverse.'
    )
    .replace(
      /Volatilitas sedang berarti ruang gerak masih ada, tetapi belum benar-benar tenang\./gi,
      'Medium volatility means there is still room to move, but conditions are not fully calm yet.'
    )
    .replace(
      /Volatilitas relatif rendah, jadi pergerakan terlihat lebih tenang\./gi,
      'Volatility is relatively low, so price action looks calmer.'
    )
    .replace(
      /Fear\/greed berada di Extreme Fear, sehingga tekanan emosi pasar masih tinggi\./gi,
      'Fear/greed sits in Extreme Fear, so emotional market pressure is still elevated.'
    )
    .replace(
      /Fear\/greed berada di Extreme Greed, sehingga euforia pasar juga perlu diwaspadai\./gi,
      'Fear/greed sits in Extreme Greed, so market euphoria also needs caution.'
    )
    .replace(
      /Sentimen greed menunjukkan minat risiko membaik, tetapi tidak selalu lurus tanpa pullback\./gi,
      'Greed sentiment suggests risk appetite is improving, but that does not remove pullback risk.'
    )
    .replace(/\bpositif\b/gi, 'positive')
    .replace(/\bnegatif\b/gi, 'negative')
    .replace(/\bnetral\b/gi, 'neutral')
}

function localizeImpactPoint(text: string, language: 'id' | 'en') {
  if (language === 'id') return text

  const normalized = text.trim().replace(/\s+/g, ' ')

  return normalized
    .replace(
      /^([A-Z0-9.-]+) memegang sekitar (\d+(?:\.\d+)?)% portfolio kamu, jadi gerak aset ini paling cepat terasa\.?$/i,
      '$1 makes up about $2% of your portfolio, so moves in this asset will be felt the fastest.'
    )
    .replace(
      /^([A-Z0-9.-]+) masih dominan di sekitar (\d+(?:\.\d+)?)%, jadi pergerakannya tetap cukup terasa ke portfolio kamu\.?$/i,
      '$1 is still dominant at around $2%, so its moves are still felt meaningfully in your portfolio.'
    )
    .replace(
      /^Portfolio kamu cukup tersebar, jadi risiko tidak langsung bertumpu pada satu aset\.?$/i,
      'Your portfolio is fairly spread out, so risk is not concentrated in a single asset.'
    )
    .replace(
      /^Dalam kondisi market seperti ini, tekanan eksternal lebih cepat terasa ke portfolio\.?$/i,
      'In this market condition, external pressure reaches the portfolio more quickly.'
    )
    .replace(
      /^Konteks pasar masih cukup mendukung aset growth, tetapi penambahan risiko baru tetap perlu dijaga agar tidak terlalu cepat\.?$/i,
      'The market backdrop still supports growth assets, but adding new risk still needs to stay measured.'
    )
    .replace(
      /^Kondisi market belum sepenuhnya memberi dorongan kuat, jadi kualitas posisi lebih penting daripada bergerak cepat\.?$/i,
      'Market conditions are not giving a strong push yet, so position quality matters more than moving quickly.'
    )
    .replace(
      /^Volatilitas tinggi berarti nilai portofolio dapat berubah cepat dalam jangka pendek, sehingga ukuran posisi dan timing menjadi lebih penting\.?$/i,
      'High volatility means portfolio value can change quickly in the short term, so position sizing and timing matter more.'
    )
    .replace(
      /^Tren yang masih menurun membuat ruang salah langkah tetap ada jika masuk terlalu cepat\.?$/i,
      'The still-declining trend leaves room for missteps if entry comes too early.'
    )
    .replace(
      /^Tren naik membantu konteks, tetapi tidak menghapus risiko pullback jangka pendek\.?$/i,
      'An upward trend helps the backdrop, but it does not remove short-term pullback risk.'
    )
}

function localizeConfidenceReason(text: string, language: 'id' | 'en') {
  if (language === 'id') return text

  return text
    .replace(
      /Beberapa sinyal utama belum benar-benar sejalan, jadi confidence sengaja dijaga rendah\./gi,
      'Several key signals are not fully aligned yet, so confidence is intentionally kept low.'
    )
    .replace(
      /Ada konteks yang cukup terbaca, tetapi kondisi masih bisa berubah cepat atau terlalu emosional untuk dibaca dengan yakin tinggi\./gi,
      'There is enough context to read, but conditions can still shift quickly or become too emotional for high confidence.'
    )
    .replace(
      /Arah utama market terlihat cukup konsisten, meski tetap perlu disiplin karena konteks bisa berubah sewaktu-waktu\./gi,
      'The main market direction looks fairly consistent, though discipline still matters because conditions can change at any time.'
    )
}

function localizeDisclaimer(text: string, language: 'id' | 'en') {
  if (language === 'id') return text

  return text.replace(/Keputusan akhir tetap ada pada pengguna\./gi, 'The final decision remains with the user.')
}

function sentencePreview(text: string, maxLength = 92, language: 'id' | 'en' = 'en') {
  return localizeDisplayText(ensureSentenceEnd(shortenStatement(text, maxLength)), language)
}

function localizeScenarioPoint(text: string, language: 'id' | 'en') {
  if (language === 'id') return text

  const normalized = text.trim().replace(/\s+/g, ' ')

  return normalized
    .replace(
      /^Dalam kondisi ini, bergerak lebih cepat bisa langsung bertemu fluktuasi atau tekanan lanjutan\.?$/i,
      'In this condition, moving earlier can run straight into volatility or renewed pressure.'
    )
    .replace(
      /^Bergerak lebih cepat bisa ikut arus yang sedang terbentuk, tetapi timing tetap perlu dijaga\.?$/i,
      'Moving earlier can follow the emerging move, but timing still needs discipline.'
    )
    .replace(
      /^Bergerak lebih cepat tetap membawa timing risk, terutama jika arah pasar belum benar-benar bersih\.?$/i,
      'Moving earlier still carries timing risk, especially when market direction is not clean yet.'
    )
    .replace(
      /^Volatilitas tinggi membuat hasil langkah awal lebih mudah berubah dalam waktu singkat\.?$/i,
      'High volatility makes the initial outcome easier to reverse in a short period.'
    )
    .replace(
      /^Jika penambahan dilakukan di area yang sama, konsentrasi pada (.+) bisa ikut naik\.?$/i,
      'Adding in the same area can increase concentration in $1.'
    )
    .replace(
      /^Kalau tetap ingin aktif, laju risiko yang lebih pelan biasanya lebih sehat daripada langkah agresif\.?$/i,
      'If staying active, a slower risk pace is usually healthier than an aggressive step.'
    )
    .replace(
      /^Menunggu bisa memberi ruang sampai fluktuasi mereda dan pembacaan market lebih stabil\.?$/i,
      'Waiting can create room for volatility to ease and for the market read to become more stable.'
    )
    .replace(
      /^Memberi waktu sampai tekanan turun atau support mulai bertahan dapat membantu menurunkan timing risk\.?$/i,
      'Giving it more time until pressure fades or support starts to hold can reduce timing risk.'
    )
    .replace(
      /^Menunggu terlalu lama berpotensi membuat sebagian momentum awal lewat\.?$/i,
      'Waiting too long can allow part of the early momentum to pass.'
    )
    .replace(
      /^Menunggu bisa memberi waktu tambahan untuk melihat apakah arah pasar mulai lebih jelas\.?$/i,
      'Waiting can give extra time to see whether market direction becomes clearer.'
    )
    .replace(
      /^Jeda juga bisa dipakai untuk menilai apakah portfolio perlu lebih seimbang sebelum menambah risiko baru\.?$/i,
      'The pause can also be used to assess whether the portfolio should be more balanced before adding new risk.'
    )
    .replace(
      /^Memberi waktu lebih untuk menilai langkah berikutnya dengan lebih tenang\.?$/i,
      'More time can help evaluate the next move with a calmer read.'
    )
}

function topTwo<T>(items: T[]) {
  return items.slice(0, 2)
}

function getLevelScore(level: 'Low' | 'Medium' | 'High') {
  switch (level) {
    case 'Low':
      return 1
    case 'Medium':
      return 2
    case 'High':
      return 3
  }
}

function getChangeCopy(changeAwareness: InsightChangeAwareness, language: 'id' | 'en', copy: DashboardCopy) {
  if (language === 'en') {
    if (changeAwareness.direction === 'worsened') {
      return {
        eyebrow: 'Change Awareness',
        title: 'Risk pressure increased',
        detail:
          changeAwareness.driver === 'risk'
            ? 'The latest reading shows portfolio risk is a bit heavier than the previous session.'
            : changeAwareness.driver === 'exposure'
              ? 'Market exposure is carrying a bit more pressure than the previous session.'
              : changeAwareness.driver === 'concentration'
                ? 'Portfolio concentration is slightly heavier than the previous session.'
                : 'Several signals are leaning a bit heavier than the previous session.'
      }
    }

    if (changeAwareness.direction === 'improved') {
      return {
        eyebrow: 'Change Awareness',
        title: 'Pressure eased',
        detail:
          changeAwareness.driver === 'risk'
            ? 'The latest reading shows portfolio risk is lighter than the previous session.'
            : changeAwareness.driver === 'exposure'
              ? 'Market exposure looks a bit calmer than the previous session.'
              : changeAwareness.driver === 'concentration'
                ? 'Portfolio concentration looks a bit lighter than the previous session.'
                : 'The latest signals look a bit calmer than the previous session.'
      }
    }

    return {
      eyebrow: copy.changeAwareness,
      title: copy.conditionMostlyUnchanged,
      detail:
        changeAwareness.driver === 'stable'
          ? 'The overall portfolio risk read is still similar to the previous session.'
          : 'There are small shifts, but the overall portfolio risk read is still similar.'
    }
  }

  if (changeAwareness.direction === 'worsened') {
    return {
      eyebrow: copy.changeAwareness,
      title: 'Tekanan risiko naik',
      detail:
        changeAwareness.driver === 'risk'
          ? 'Bacaan terbaru menunjukkan risiko portofolio sedikit lebih berat dibanding sesi sebelumnya.'
          : changeAwareness.driver === 'exposure'
            ? 'Paparan pasar terasa sedikit lebih menekan dibanding sesi sebelumnya.'
            : changeAwareness.driver === 'concentration'
              ? 'Konsentrasi portofolio terasa sedikit lebih berat dibanding sesi sebelumnya.'
              : 'Beberapa sinyal utama terasa sedikit lebih berat dibanding sesi sebelumnya.'
    }
  }

  if (changeAwareness.direction === 'improved') {
    return {
      eyebrow: copy.changeAwareness,
      title: 'Tekanan mulai mereda',
      detail:
        changeAwareness.driver === 'risk'
          ? 'Bacaan terbaru menunjukkan risiko portofolio sedikit lebih ringan dibanding sesi sebelumnya.'
          : changeAwareness.driver === 'exposure'
            ? 'Paparan pasar terlihat sedikit lebih tenang dibanding sesi sebelumnya.'
            : changeAwareness.driver === 'concentration'
              ? 'Konsentrasi portofolio terlihat sedikit lebih ringan dibanding sesi sebelumnya.'
              : 'Sinyal terbaru terlihat sedikit lebih tenang dibanding sesi sebelumnya.'
    }
  }

  return {
    eyebrow: copy.changeAwareness,
    title: copy.conditionMostlyUnchanged,
    detail:
      changeAwareness.driver === 'stable'
        ? 'Pembacaan risiko portofolio masih mirip dengan sesi sebelumnya.'
        : 'Ada perubahan kecil, tetapi pembacaan risiko portofolio secara umum masih mirip dengan sesi sebelumnya.'
  }
}

function getReturnCue(data: TingAIOutput, language: 'id' | 'en') {
  const risk = data.impact_on_portfolio.risk_level
  const exposure = data.portfolio_overview.market_exposure
  const concentration = data.portfolio_overview.concentration_level
  const confidence = data.confidence.level
  const dominantAsset = data.portfolio_overview.dominant_asset

  if (language === 'en') {
    if (risk === 'High' || exposure === 'High') {
      return `Worth checking again later because market pressure can still shift quickly.`
    }

    if (concentration === 'High') {
      return `Worth checking again later because ${dominantAsset} still carries most of the portfolio sensitivity.`
    }

    if (confidence === 'Low') {
      return `Worth checking again later because the current read is still waiting for cleaner confirmation.`
    }

    if (risk === 'Medium' || exposure === 'Medium') {
      return `Worth checking again later because the portfolio read can still change with the next market move.`
    }

    return `Worth checking again later to confirm whether this calmer reading is holding up.`
  }

  if (risk === 'High' || exposure === 'High') {
    return 'Perlu dicek kembali karena tekanan pasar masih dapat berubah cepat.'
  }

  if (concentration === 'High') {
    return `Perlu dicek kembali karena ${dominantAsset} masih memegang sensitivitas terbesar di portofolio.`
  }

  if (confidence === 'Low') {
    return 'Perlu dicek kembali karena pembacaan saat ini masih menunggu konfirmasi yang lebih jelas.'
  }

  if (risk === 'Medium' || exposure === 'Medium') {
    return 'Perlu dicek kembali karena pembacaan portofolio masih bisa bergeser dengan pergerakan pasar berikutnya.'
  }

  return 'Perlu dicek kembali untuk memastikan kondisi yang lebih tenang ini tetap bertahan.'
}

function getTrustIntro(copy: DashboardCopy) {
  return copy.basedOn
}

function formatEvidenceCue(
  item: TingAIOutput['evidence'][number],
  language: 'id' | 'en'
) {
  if (language === 'en') {
    return `${formatEvidenceLabel(item.label, language)}: ${shortenHard(localizeAnalyzerValue(item.value, language), 32)}`
  }

  const labelMap: Record<string, string> = {
    'Sentimen Pasar': 'sentimen',
    'Konsentrasi Portofolio': 'konsentrasi',
    Volatilitas: 'volatilitas',
    'Trend Pasar': 'tren',
    'Fear/Greed': 'emosi pasar'
  }

  const label = labelMap[item.label] || item.label.toLowerCase()
  return `${label}: ${localizeDisplayText(shortenHard(item.value, 32), language)}`
}

function formatEvidenceLabel(label: string, language: 'id' | 'en') {
  if (language === 'en') {
    const labelMap: Record<string, string> = {
      'Sentimen Pasar': 'Market sentiment',
      'Konsentrasi Portofolio': 'Portfolio concentration',
      Volatilitas: 'Volatility',
      'Trend Pasar': 'Market trend',
      'Fear/Greed': 'Fear/Greed'
    }

    return labelMap[label] || label
  }

  const labelMap: Record<string, string> = {
    'Sentimen Pasar': 'Sentimen pasar',
    'Konsentrasi Portofolio': 'Konsentrasi portofolio',
    Volatilitas: 'Volatilitas',
    'Trend Pasar': 'Tren pasar',
    'Fear/Greed': 'Emosi pasar'
  }

  return labelMap[label] || label
}

function getDetailLabels(copy: DashboardCopy) {
  return {
    fullExplanation: copy.viewFullExplanation,
    optional: copy.optional,
    marketSummary: copy.marketSummary,
    impactPoints: copy.language === 'en' ? 'Impact points' : 'Dampak ke portofolio',
    scenarios: copy.language === 'en' ? 'Scenarios' : 'Skenario',
    evidence: copy.language === 'en' ? 'Evidence' : 'Bukti pendukung',
    confidence: copy.language === 'en' ? 'Confidence' : 'Keyakinan',
    confidenceLevel: copy.language === 'en' ? 'Confidence' : 'Keyakinan',
    mainPoint: copy.mainPoint,
    tradeOff: copy.tradeOff
  }
}

const PortfolioImpactCard: FC<PortfolioImpactCardProps> = ({
  data,
  language,
  changeAwareness,
  refinedInsight
}) => {
  const copy = useMemo(() => getDashboardCopy(language), [language])
  const labels = getDetailLabels(copy)
  const concentrationLabel = getRiskLabel(data.portfolio_overview.concentration_level, language).toLowerCase()
  const exposureLabel = getRiskLabel(data.portfolio_overview.market_exposure, language).toLowerCase()
  const impactRiskLabel = getRiskLabel(data.impact_on_portfolio.risk_level, language).toLowerCase()
  const changeCopy = changeAwareness ? getChangeCopy(changeAwareness, language, copy) : null
  const returnCue = getReturnCue(data, language)
  const trustIntro = getTrustIntro(copy)
  const trustCues = data.evidence
    .filter((item) => item.label !== 'Sentimen Pasar')
    .slice(0, 3)
    .map((item) => formatEvidenceCue(item, language))
  const concentrationScore = getLevelScore(data.portfolio_overview.concentration_level)
  const pressureScore = Math.max(
    getLevelScore(data.impact_on_portfolio.risk_level),
    getLevelScore(data.portfolio_overview.market_exposure)
  )

  const mainRisk =
    data.impact_on_portfolio.impact_points[0] ||
    (language === 'en'
      ? `${data.portfolio_overview.dominant_asset} is still the most sensitive point in your portfolio right now.`
      : `${data.portfolio_overview.dominant_asset} masih jadi titik paling sensitif di portfolio kamu saat ini.`)

  const prioritySummary =
    language === 'en'
      ? `${data.portfolio_overview.dominant_asset} is still the main focus. Your profile currently reads ${impactRiskLabel}.`
      : `${data.portfolio_overview.dominant_asset} masih jadi titik utama. Profil kamu sekarang ${impactRiskLabel}.`

  const positionSummary =
    language === 'en'
      ? `${data.portfolio_overview.dominant_asset} remains dominant. Concentration is ${concentrationLabel}.`
      : `${data.portfolio_overview.dominant_asset} dominan. Konsentrasi ${concentrationLabel}.`

  const enterTradeOffRaw =
    data.scenario_analysis.enter_now.points[0] ||
    (language === 'en'
      ? `${getScenarioLabel('enter', language)} carries ${getRiskLabel(
          data.scenario_analysis.enter_now.risk_level,
          language
        ).toLowerCase()} risk.`
      : `${getScenarioLabel('enter', language)} membawa risiko ${getRiskLabel(
          data.scenario_analysis.enter_now.risk_level,
          language
        ).toLowerCase()}.`)
  const waitTradeOffRaw =
    data.scenario_analysis.wait.points[0] ||
    (language === 'en'
      ? `${getScenarioLabel('wait', language)} carries ${getRiskLabel(
          data.scenario_analysis.wait.risk_level,
          language
        ).toLowerCase()} risk.`
      : `${getScenarioLabel('wait', language)} membawa risiko ${getRiskLabel(
          data.scenario_analysis.wait.risk_level,
          language
        ).toLowerCase()}.`)
  const enterTradeOff = localizeScenarioPoint(enterTradeOffRaw, language)
  const waitTradeOff = localizeScenarioPoint(waitTradeOffRaw, language)

  const topAnswer = sentencePreview(prioritySummary, 118, language)
  const cardOneValue = `${data.portfolio_overview.dominant_asset} / ${concentrationLabel}`
  const cardTwoValue =
    data.scenario_analysis.wait.risk_level <= data.scenario_analysis.enter_now.risk_level
      ? `${getTradeOffLead('wait', language)} ${sentencePreview(waitTradeOff, 74, language)}`
      : `${getTradeOffLead('enter', language)} ${sentencePreview(enterTradeOff, 74, language)}`
  const hasRefinedInsight = language === 'id' && refinedInsight

  return (
    <div className={styles.container}>
      <section className={styles.prioritySection}>
        <div className={styles.priorityHero}>
          <div>
            <div className={styles.priorityEyebrow}>
              {hasRefinedInsight && language === 'id' ? copy.insightBadgeLabel : language === 'id' ? 'JAWABAN UTAMA' : 'Main insight'}
            </div>
            <h2 className={styles.priorityTitle}>
              {hasRefinedInsight ? refinedInsight.insightUtama : topAnswer}
            </h2>
            {changeCopy ? (
              <div className={styles.changeAwareness}>
                <span className={styles.changeEyebrow}>{changeCopy.eyebrow}</span>
                <strong className={styles.changeTitle}>{changeCopy.title}</strong>
                <span className={styles.changeDetail}>{changeCopy.detail}</span>
              </div>
            ) : null}
          </div>
          <div
            className={styles.priorityRiskBadge}
            style={{ backgroundColor: getRiskColor(data.impact_on_portfolio.risk_level) }}
          >
            {language === 'en'
              ? `${getRiskLabel(data.impact_on_portfolio.risk_level, language)} Risk`
              : `Risiko ${getRiskLabel(data.impact_on_portfolio.risk_level, language)}`}
          </div>
        </div>

        <div className={styles.priorityGrid}>
          <div className={styles.priorityCard}>
            <span className={styles.priorityLabel}>{labels.mainPoint}</span>
            <strong className={styles.priorityValue}>{cardOneValue}</strong>
            <span className={styles.priorityMeta}>{sentencePreview(positionSummary, 70, language)}</span>
            <div className={styles.miniMeter} aria-hidden="true">
              <span
                className={styles.miniMeterFill}
                style={{ width: `${(concentrationScore / 3) * 100}%` }}
              />
            </div>
            <span className={styles.visualHint}>
              {copy.allocationWeight}
            </span>
          </div>
          <div className={styles.priorityCard}>
            <span className={styles.priorityLabel}>{labels.tradeOff}</span>
            <strong className={styles.priorityValue}>{cardTwoValue}</strong>
            <span className={styles.priorityMeta}>
              {getExposureLabel(data.portfolio_overview.market_exposure, language)}
            </span>
            <div className={styles.pressureIndicator} aria-hidden="true">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className={`${styles.pressureDot} ${index < pressureScore ? styles.pressureDotActive : ''}`}
                />
              ))}
            </div>
            <span className={styles.visualHint}>
              {copy.pressureLevel}
            </span>
          </div>
        </div>

        <div className={styles.nextActionBlock}>
          <span className={styles.nextActionLabel}>{copy.nextSensibleAction}</span>
          <p className={styles.nextActionText}>{copy.nextSensibleActionText}</p>
        </div>

        {hasRefinedInsight ? (
          <div className={styles.refinedGrid}>
            {refinedInsight.alasan.length > 0 ? (
              <div className={styles.refinedBlock}>
                <span className={styles.detailLabel}>Kenapa Ini Terjadi</span>
                <div className={styles.bulletList}>
                  {refinedInsight.alasan.slice(0, 2).map((point, index) => (
                    <div className={styles.bullet} key={`reason-${index}`}>
                      <span className={styles.bulletMark}>-</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {refinedInsight.risiko.length > 0 ? (
              <div className={styles.refinedBlock}>
                <span className={styles.detailLabel}>Risiko yang Harus Disadari</span>
                <div className={styles.bulletList}>
                  {refinedInsight.risiko.slice(0, 2).map((point, index) => (
                    <div className={styles.bullet} key={`risk-${index}`}>
                      <span className={styles.bulletMark}>-</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {refinedInsight.arahan ? (
              <div className={`${styles.refinedBlock} ${styles.refinedGuidance}`}>
                <span className={styles.detailLabel}>Apa yang Sebaiknya Dipikirkan</span>
                <p className={styles.summary}>{refinedInsight.arahan}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className={styles.returnCue}>
            <span className={styles.returnCueLabel}>
              {copy.whyCheckAgain}
            </span>
            <span className={styles.returnCueText}>{returnCue}</span>
          </div>
        )}

        <div className={styles.trustLayer}>
          <span className={styles.trustLayerLabel}>{trustIntro}</span>
          <div className={styles.trustCueList}>
            {trustCues.map((cue, index) => (
              <span key={`${cue}-${index}`} className={styles.trustCue}>
                {cue}
              </span>
            ))}
          </div>
        </div>
      </section>

      <details className={`${styles.section} ${styles.secondarySection}`} open={false}>
        <summary className={styles.sectionSummary}>
          <span className={styles.sectionTitle}>{labels.fullExplanation}</span>
          <span className={styles.summaryHint}>{labels.optional}</span>
        </summary>

        <div className={styles.detailBlock}>
          <span className={styles.detailLabel}>{labels.marketSummary}</span>
          <p className={styles.summary}>{sentencePreview(localizeMarketSummary(data.market_summary, language), 132, language)}</p>
        </div>

        <div className={styles.detailBlock}>
          <span className={styles.detailLabel}>{labels.impactPoints}</span>
          <div className={styles.bulletList}>
            {topTwo(data.impact_on_portfolio.impact_points).map((point, idx) => (
              <div key={idx} className={styles.bullet}>
                <span className={styles.bulletMark}>-</span>
                <span>{sentencePreview(localizeImpactPoint(point, language), 110, language)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.detailBlock}>
          <span className={styles.detailLabel}>{labels.scenarios}</span>
          <div className={styles.scenarioRow}>
            <div className={styles.scenarioCard}>
              <h3 className={styles.scenarioTitle}>{getScenarioLabel('enter', language)}</h3>
              <div
                className={styles.scenarioRiskBadge}
                style={{ backgroundColor: getRiskColor(data.scenario_analysis.enter_now.risk_level) }}
              >
                {getRiskLabel(data.scenario_analysis.enter_now.risk_level, language)}
              </div>
              <div className={styles.bulletList}>
                {topTwo(data.scenario_analysis.enter_now.points).map((point, idx) => (
                  <div key={idx} className={styles.bullet}>
                    <span className={styles.bulletMark}>-</span>
                    <span>{sentencePreview(localizeScenarioPoint(point, language), 96, language)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.scenarioCard}>
              <h3 className={styles.scenarioTitle}>{getScenarioLabel('wait', language)}</h3>
              <div
                className={styles.scenarioRiskBadge}
                style={{ backgroundColor: getRiskColor(data.scenario_analysis.wait.risk_level) }}
              >
                {getRiskLabel(data.scenario_analysis.wait.risk_level, language)}
              </div>
              <div className={styles.bulletList}>
                {topTwo(data.scenario_analysis.wait.points).map((point, idx) => (
                  <div key={idx} className={styles.bullet}>
                    <span className={styles.bulletMark}>-</span>
                    <span>{sentencePreview(localizeScenarioPoint(point, language), 96, language)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailBlock}>
          <span className={styles.detailLabel}>{labels.evidence}</span>
          <div className={styles.evidenceList}>
            {data.evidence.map((item, idx) => (
              <div key={idx} className={styles.evidenceItem}>
                  <span className={styles.evidenceTone}>{getToneIcon(item.tone)}</span>
                <div className={styles.evidenceContent}>
                  <span className={styles.evidenceLabel}>{formatEvidenceLabel(item.label, language)}</span>
                  <span className={styles.evidenceValue}>{sentencePreview(localizeAnalyzerValue(item.value, language), 88, language)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.detailBlock}>
          <span className={styles.detailLabel}>{labels.confidence}</span>
          <div className={styles.detailMetaRow}>
            <div
              className={styles.confidenceBadge}
              style={{ backgroundColor: getRiskColor(data.confidence.level) }}
            >
              <span className={styles.confidenceLevel}>
                {labels.confidenceLevel} {getRiskLabel(data.confidence.level, language)}
              </span>
            </div>
          </div>
          <p className={styles.confidenceReason}>{sentencePreview(localizeConfidenceReason(data.confidence.reason, language), 110, language)}</p>
          <div className={styles.disclaimer}>
            <strong>{language === 'en' ? 'Note:' : 'Catatan:'}</strong>{' '}
            {sentencePreview(localizeDisclaimer(data.disclaimer, language), 96, language)}
          </div>
        </div>
      </details>
    </div>
  )
}

export default PortfolioImpactCard
