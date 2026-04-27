import type {
  AnalysisContext,
  ConcentrationLevel,
  ConfidenceLevel,
  ExposureLevel,
  RiskLevel,
  TingAIInput,
  TingAIOutput
} from './types'

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function getDominantAllocation(input: TingAIInput) {
  const exactMatch = input.user.allocation.find(
    (item) => normalizeText(item.asset) === normalizeText(input.user.dominant_asset)
  )

  if (exactMatch) return exactMatch.percentage

  return input.user.allocation.reduce((largest, item) => Math.max(largest, item.percentage), 0)
}

function formatRiskLabel(level: RiskLevel | ConcentrationLevel | ExposureLevel) {
  switch (level) {
    case 'High':
      return 'tinggi'
    case 'Medium':
      return 'sedang'
    case 'Low':
      return 'rendah'
  }
}

function capitalizeSentence(text: string) {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function isExtremeEmotion(input: TingAIInput) {
  return input.market.fear_greed === 'Extreme Fear' || input.market.fear_greed === 'Extreme Greed'
}

function evaluateConcentration(dominantAllocation: number): ConcentrationLevel {
  if (dominantAllocation >= 50) return 'High'
  if (dominantAllocation >= 30) return 'Medium'
  return 'Low'
}

function evaluateExposure(input: TingAIInput): ExposureLevel {
  const { market } = input
  let stressScore = 0

  if (market.market_sentiment === 'Negatif') stressScore += 1
  if (market.trend === 'Menurun') stressScore += 1

  if (market.volatility === 'Tinggi') {
    stressScore += 2
  } else if (market.volatility === 'Sedang') {
    stressScore += 1
  }

  if (market.fear_greed === 'Extreme Fear') stressScore += 1

  if (
    market.fear_greed === 'Extreme Greed' &&
    (market.market_sentiment === 'Positif' || market.trend === 'Naik')
  ) {
    stressScore += 1
  }

  if (stressScore >= 4) return 'High'
  if (stressScore >= 2) return 'Medium'
  return 'Low'
}

function evaluateCurrentRisk(
  input: TingAIInput,
  concentration: ConcentrationLevel,
  exposure: ExposureLevel
): RiskLevel {
  const { market } = input
  const extremeEmotion = isExtremeEmotion(input)

  if (concentration === 'High' && exposure === 'High') return 'High'

  if (extremeEmotion && concentration !== 'Low' && exposure !== 'Low') {
    return 'High'
  }

  if (market.market_sentiment === 'Negatif' && market.volatility === 'Tinggi') {
    return concentration === 'Low' ? 'Medium' : 'High'
  }

  if (
    concentration === 'High' ||
    exposure === 'High' ||
    (concentration === 'Medium' && exposure === 'Medium')
  ) {
    return 'Medium'
  }

  if (
    market.market_sentiment === 'Netral' &&
    market.trend === 'Sideways' &&
    market.volatility !== 'Tinggi'
  ) {
    return 'Low'
  }

  return concentration === 'Medium' || exposure === 'Medium' ? 'Medium' : 'Low'
}

function evaluateConfidence(input: TingAIInput): { level: ConfidenceLevel; reason: string } {
  const { market, user } = input

  if (!market || !user || !user.allocation?.length) {
    return {
      level: 'Low',
      reason:
        'Data portofolio atau market belum cukup lengkap, jadi pembacaan ini lebih cocok dianggap gambaran awal.'
    }
  }

  let ambiguityCount = 0

  if (market.market_sentiment === 'Netral') ambiguityCount += 1
  if (market.trend === 'Sideways') ambiguityCount += 1
  if (market.news_sentiment === 'Netral') ambiguityCount += 1

  const sentimentConflict =
    market.market_sentiment !== 'Netral' &&
    market.news_sentiment !== 'Netral' &&
    market.market_sentiment !== market.news_sentiment

  const unstableContext = market.volatility === 'Tinggi' || isExtremeEmotion(input)

  if (ambiguityCount >= 2 || sentimentConflict) {
    return {
      level: 'Low',
      reason: 'Beberapa sinyal utama belum benar-benar sejalan, jadi confidence sengaja dijaga rendah.'
    }
  }

  if (ambiguityCount === 1 || unstableContext) {
    return {
      level: 'Medium',
      reason:
        'Ada konteks yang cukup terbaca, tetapi kondisi masih bisa berubah cepat atau terlalu emosional untuk dibaca dengan yakin tinggi.'
    }
  }

  return {
    level: 'High',
    reason:
      'Arah utama market terlihat cukup konsisten, meski tetap perlu disiplin karena konteks bisa berubah sewaktu-waktu.'
  }
}

function generateMarketSummary(input: TingAIInput) {
  const { market } = input

  let summary = `Market saat ini cenderung ${market.market_sentiment.toLowerCase()}`

  if (market.trend === 'Naik') {
    summary += ' dengan tren naik.'
  } else if (market.trend === 'Menurun') {
    summary += ' dengan tren menurun.'
  } else {
    summary += ' dengan pergerakan sideways, jadi arahnya belum terlalu bersih.'
  }

  if (market.volatility === 'Tinggi') {
    summary += ' Volatilitas tinggi membuat pergerakan jangka pendek lebih cepat dan mudah berubah.'
  } else if (market.volatility === 'Sedang') {
    summary += ' Volatilitas sedang berarti ruang gerak masih ada, tetapi belum benar-benar tenang.'
  } else {
    summary += ' Volatilitas relatif rendah, jadi pergerakan terlihat lebih tenang.'
  }

  if (market.fear_greed === 'Extreme Fear') {
    summary += ' Fear/greed berada di Extreme Fear, sehingga tekanan emosi pasar masih tinggi.'
  } else if (market.fear_greed === 'Extreme Greed') {
    summary += ' Fear/greed berada di Extreme Greed, sehingga euforia pasar juga perlu diwaspadai.'
  } else if (market.fear_greed === 'Greed') {
    summary += ' Sentimen greed menunjukkan minat risiko membaik, tetapi tidak selalu lurus tanpa pullback.'
  }

  return summary
}

function generateImpactPoints(
  context: AnalysisContext,
  concentration: ConcentrationLevel,
  exposure: ExposureLevel
) {
  const { portfolio, market, dominantAllocation } = context
  const points: string[] = []

  if (concentration === 'High') {
    points.push(
      `${portfolio.dominant_asset} memegang sekitar ${dominantAllocation}% portfolio kamu, jadi gerak aset ini paling cepat terasa.`
    )
  } else if (concentration === 'Medium') {
    points.push(
      `${portfolio.dominant_asset} masih dominan di sekitar ${dominantAllocation}%, jadi pergerakannya tetap cukup terasa ke portfolio kamu.`
    )
  } else {
    points.push('Portfolio kamu cukup tersebar, jadi risiko tidak langsung bertumpu pada satu aset.')
  }

  if (exposure === 'High') {
    points.push('Dalam kondisi market seperti ini, tekanan eksternal lebih cepat terasa ke portfolio.')
  } else if (market.market_sentiment === 'Positif' && market.trend === 'Naik') {
    points.push(
      'Konteks pasar masih cukup mendukung aset growth, tetapi penambahan risiko baru tetap perlu dijaga agar tidak terlalu cepat.'
    )
  } else {
    points.push(
      'Kondisi market belum sepenuhnya memberi dorongan kuat, jadi kualitas posisi lebih penting daripada bergerak cepat.'
    )
  }

  if (market.volatility === 'Tinggi') {
    points.push(
      'Volatilitas tinggi berarti nilai portofolio dapat berubah cepat dalam jangka pendek, sehingga ukuran posisi dan timing menjadi lebih penting.'
    )
  } else if (market.trend === 'Menurun') {
    points.push('Tren yang masih menurun membuat ruang salah langkah tetap ada jika masuk terlalu cepat.')
  } else if (market.trend === 'Naik') {
    points.push('Tren naik membantu konteks, tetapi tidak menghapus risiko pullback jangka pendek.')
  }

  return points.slice(0, 3)
}

function generateScenarioPoints(
  context: AnalysisContext,
  concentration: ConcentrationLevel,
  currentRisk: RiskLevel,
  confidenceLevel: ConfidenceLevel
) {
  const { market, portfolio } = context
  const enterNowPoints: string[] = []
  const waitPoints: string[] = []

  if (currentRisk === 'High') {
    enterNowPoints.push(
      'Dalam kondisi ini, bergerak lebih cepat bisa langsung bertemu fluktuasi atau tekanan lanjutan.'
    )
  } else if (market.market_sentiment === 'Positif' && market.trend === 'Naik') {
    enterNowPoints.push(
      'Bergerak lebih cepat bisa ikut arus yang sedang terbentuk, tetapi timing tetap perlu dijaga.'
    )
  } else {
    enterNowPoints.push(
      'Bergerak lebih cepat tetap membawa timing risk, terutama jika arah pasar belum benar-benar bersih.'
    )
  }

  if (market.volatility === 'Tinggi') {
    enterNowPoints.push('Volatilitas tinggi membuat hasil langkah awal lebih mudah berubah dalam waktu singkat.')
  }

  if (concentration !== 'Low') {
    enterNowPoints.push(
      `Jika penambahan dilakukan di area yang sama, konsentrasi pada ${portfolio.dominant_asset} bisa ikut naik.`
    )
  }

  if (currentRisk === 'High') {
    enterNowPoints.push(
      'Kalau tetap ingin aktif, laju risiko yang lebih pelan biasanya lebih sehat daripada langkah agresif.'
    )
  }

  if (market.volatility === 'Tinggi') {
    waitPoints.push('Menunggu bisa memberi ruang sampai fluktuasi mereda dan pembacaan market lebih stabil.')
  }

  if (market.trend === 'Menurun') {
    waitPoints.push(
      'Memberi waktu sampai tekanan turun atau support mulai bertahan dapat membantu menurunkan timing risk.'
    )
  } else if (
    market.market_sentiment === 'Positif' &&
    market.trend === 'Naik' &&
    confidenceLevel === 'High'
  ) {
    waitPoints.push('Menunggu terlalu lama berpotensi membuat sebagian momentum awal lewat.')
  } else {
    waitPoints.push('Menunggu bisa memberi waktu tambahan untuk melihat apakah arah pasar mulai lebih jelas.')
  }

  if (concentration === 'High') {
    waitPoints.push(
      'Jeda juga bisa dipakai untuk menilai apakah portfolio perlu lebih seimbang sebelum menambah risiko baru.'
    )
  } else {
    waitPoints.push('Memberi waktu lebih untuk menilai langkah berikutnya dengan lebih tenang.')
  }

  return {
    enterNowPoints: enterNowPoints.slice(0, 3),
    waitPoints: waitPoints.slice(0, 3)
  }
}

function generateOptions(
  input: TingAIInput,
  concentration: ConcentrationLevel,
  currentRisk: RiskLevel,
  confidenceLevel: ConfidenceLevel
) {
  const options = [
    {
      title: 'Jaga tekanan timing',
      description:
        'Kalau tetap ingin aktif, membagi eksposur ke beberapa tahap membantu menahan tekanan timing dalam satu momen.'
    },
    {
      title: 'Jaga ruang fleksibel',
      description:
        'Memberi ruang sampai struktur market lebih jelas bisa membantu menjaga fleksibilitas saat konteks belum rapi.'
    },
    {
      title: concentration === 'High' ? 'Cermati titik penumpukan' : 'Atur laju risiko',
      description:
        concentration === 'High'
          ? `Eksposur kamu masih berat di ${input.user.dominant_asset}, jadi fokus utamanya adalah sadar seberapa besar risiko yang bertumpu di area yang sama.`
          : 'Kalau tetap ingin aktif, menjaga laju risiko tetap pelan membantu portfolio kamu tetap fleksibel.'
    }
  ]

  if (currentRisk === 'High') {
    options[1].description =
      'Saat risiko sedang tinggi, menjaga ruang fleksibel membantu kamu membaca market tanpa menambah tekanan terlalu cepat.'
  }

  if (confidenceLevel === 'Low') {
    options[0].description =
      'Saat konteks masih ambigu, membagi eksposur ke beberapa tahap membantu risiko tetap lebih terukur.'
  }

  if (
    input.market.market_sentiment === 'Positif' &&
    input.market.trend === 'Naik' &&
    confidenceLevel !== 'Low'
  ) {
    options[1].description =
      'Menjaga ruang fleksibel tetap valid, sambil sadar bahwa market bisa bergerak lebih dulu sebelum terasa lebih nyaman dibaca.'
  }

  return options
}

function generateEvidence(
  input: TingAIInput,
  dominantAllocation: number,
  concentration: ConcentrationLevel
) {
  const { market, user } = input
  const evidenceItems: TingAIOutput['evidence'] = [
    {
      label: 'Sentimen Pasar',
      value: market.market_sentiment,
      tone:
        market.market_sentiment === 'Positif'
          ? ('positive' as const)
          : market.market_sentiment === 'Negatif'
            ? ('negative' as const)
            : ('neutral' as const)
    }
  ]

  if (concentration !== 'Low') {
    evidenceItems.push({
      label: 'Konsentrasi Portofolio',
      value: `${dominantAllocation}% pada ${user.dominant_asset}`,
      tone: concentration === 'High' ? ('negative' as const) : ('neutral' as const)
    })
  }

  if (market.volatility !== 'Rendah') {
    evidenceItems.push({
      label: 'Volatilitas',
      value: market.volatility,
      tone: market.volatility === 'Tinggi' ? ('negative' as const) : ('neutral' as const)
    })
  }

  if (evidenceItems.length < 3) {
    evidenceItems.push({
      label: 'Trend Pasar',
      value: market.trend,
      tone:
        market.trend === 'Naik'
          ? ('positive' as const)
          : market.trend === 'Menurun'
            ? ('negative' as const)
            : ('neutral' as const)
    })
  }

  if (evidenceItems.length < 3 && market.fear_greed !== 'Neutral') {
    evidenceItems.push({
      label: 'Fear/Greed',
      value: market.fear_greed,
      tone:
        market.fear_greed === 'Extreme Fear' || market.fear_greed === 'Fear'
          ? ('negative' as const)
          : market.fear_greed === 'Extreme Greed' || market.fear_greed === 'Greed'
            ? ('positive' as const)
            : ('neutral' as const)
    })
  }

  return evidenceItems.slice(0, 3)
}

function generateImpactSummary(
  input: TingAIInput,
  concentration: ConcentrationLevel,
  exposure: ExposureLevel,
  currentRisk: RiskLevel
) {
  const portfolioCondition =
    concentration === 'High'
      ? `${input.user.dominant_asset} masih jadi pusat portfolio kamu`
      : concentration === 'Medium'
        ? `${input.user.dominant_asset} masih cukup dominan di portfolio kamu`
        : 'Portfolio kamu cukup tersebar'

  const riskText =
    currentRisk === 'High'
      ? exposure === 'High'
        ? `risiko paling besar sekarang datang dari konsentrasi ${input.user.dominant_asset} dan tekanan market yang masih ${formatRiskLabel(
            exposure
          )}`
        : `risiko paling besar sekarang datang dari bobot ${input.user.dominant_asset} yang masih dominan`
      : currentRisk === 'Medium'
        ? exposure === 'Low'
          ? `risiko utamanya tetap ada di bobot ${input.user.dominant_asset} yang masih dominan`
          : `risiko utamanya tetap ada di bobot ${input.user.dominant_asset} dan eksposur market ${formatRiskLabel(
              exposure
            )}`
        : `risiko saat ini lebih terjaga, meski ${input.user.dominant_asset} masih perlu dipantau`

  return `${portfolioCondition}. ${capitalizeSentence(riskText)}.`
}

function evaluateScenarioRiskLevels(
  input: TingAIInput,
  currentRisk: RiskLevel,
  confidenceLevel: ConfidenceLevel
) {
  const { market } = input

  const enterNowRisk: RiskLevel =
    currentRisk === 'High'
      ? 'High'
      : market.volatility === 'Tinggi' || market.trend === 'Sideways' || confidenceLevel === 'Low'
        ? 'Medium'
        : 'Medium'

  const waitRisk: RiskLevel =
    currentRisk === 'High'
      ? 'Medium'
      : market.market_sentiment === 'Positif' &&
          market.trend === 'Naik' &&
          confidenceLevel === 'High'
        ? 'Medium'
        : 'Low'

  return { enterNowRisk, waitRisk }
}

export function analyzeTingAI(input: TingAIInput): TingAIOutput {
  const dominantAllocation = getDominantAllocation(input)

  const context: AnalysisContext = {
    portfolio: input.user,
    market: input.market,
    dominantAllocation,
    hasDataGaps: !input.user?.allocation?.length
  }

  const concentration = evaluateConcentration(dominantAllocation)
  const exposure = evaluateExposure(input)
  const currentRisk = evaluateCurrentRisk(input, concentration, exposure)
  const confidence = evaluateConfidence(input)

  const marketSummary = generateMarketSummary(input)
  const impactPoints = generateImpactPoints(context, concentration, exposure)
  const { enterNowPoints, waitPoints } = generateScenarioPoints(
    context,
    concentration,
    currentRisk,
    confidence.level
  )
  const options = generateOptions(input, concentration, currentRisk, confidence.level)
  const evidence = generateEvidence(input, dominantAllocation, concentration)
  const { enterNowRisk, waitRisk } = evaluateScenarioRiskLevels(
    input,
    currentRisk,
    confidence.level
  )

  return {
    market_summary: marketSummary,
    portfolio_overview: {
      portfolio_value: input.user.portfolio_value,
      dominant_asset: input.user.dominant_asset,
      concentration_level: concentration,
      market_exposure: exposure
    },
    impact_on_portfolio: {
      summary: generateImpactSummary(input, concentration, exposure, currentRisk),
      risk_level: currentRisk,
      impact_points: impactPoints
    },
    scenario_analysis: {
      enter_now: {
        label: 'Jika bergerak lebih cepat',
        risk_level: enterNowRisk,
        points: enterNowPoints
      },
      wait: {
        label: 'Jika memberi waktu lebih',
        risk_level: waitRisk,
        points: waitPoints
      }
    },
    options_to_consider: options,
    evidence,
    confidence,
    disclaimer: 'Keputusan akhir tetap ada pada pengguna.'
  }
}
