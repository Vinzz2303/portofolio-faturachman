// ── Sector & Volatility Classification ────────────────────────────

export const SECTORS: Record<string, string> = {
  BBCA: 'Perbankan', BBRI: 'Perbankan', BMRI: 'Perbankan', BBNI: 'Perbankan',
  TLKM: 'Telekomunikasi', EXCL: 'Telekomunikasi',
  GOTO: 'Teknologi', EMTK: 'Teknologi',
  ADRO: 'Energi', PTBA: 'Energi', MEDC: 'Energi', PGAS: 'Energi', ITMG: 'Energi', HRUM: 'Energi',
  ICBP: 'Konsumer', INDF: 'Konsumer', UNVR: 'Konsumer', CPIN: 'Konsumer', JPFA: 'Konsumer',
  ASII: 'Industri', ANTM: 'Pertambangan', SMGR: 'Industri',
}

const HIGH_VOLATILITY = ['GOTO', 'EMTK', 'ADRO', 'MEDC', 'HRUM', 'ITMG', 'ANTM', 'PTBA']
const DEFENSIVE       = ['BBCA', 'BBRI', 'TLKM', 'ICBP', 'INDF', 'UNVR', 'BMRI']

// ── Portfolio Input Parser ─────────────────────────────────────────

export interface Holding { ticker: string; weight: number }

export function parsePortfolio(input: string): Holding[] {
  const regex = /([A-Za-z]+)\s+(\d+(?:\.\d+)?)\s*%?/g
  const raw = [...input.toUpperCase().matchAll(regex)]
    .map(m => ({ ticker: m[1], weight: parseFloat(m[2]) }))

  if (!raw.length) return []

  const total = raw.reduce((s, h) => s + h.weight, 0)
  if (total > 0 && Math.abs(total - 100) > 5) {
    return raw.map(h => ({ ...h, weight: (h.weight / total) * 100 }))
  }
  return raw
}

// ── Analysis Result ────────────────────────────────────────────────

export interface AnalysisResult {
  // FREE tier
  insight:            string
  risk:               string
  awareness:          string
  score:              number   // 0 = very safe … 100 = very risky

  // PRO tier — intelligence layer
  intelligenceLayer:  string   // narrative about what the portfolio structure implies
  portfolioImpact:    string   // how market conditions specifically impact this portfolio
  tradeoffContext:    string   // trade-offs of the current allocation
  scenarioContext:    string   // what could shift the risk profile
  decisionReasoning:  string   // reasoning framework, NOT a buy/sell signal
}

// ── Core Engine ────────────────────────────────────────────────────

export function analyzePortfolio(
  input: string,
  marketData?: { ticker: string; changePercent: number }[],
  preferredLanguage: 'id' | 'en' = 'id'
): AnalysisResult {
  const holdings = parsePortfolio(input)

  const empty: AnalysisResult = {
    insight:           preferredLanguage === 'en' ? 'Format not recognized. Try: BBCA 50%, TLKM 30%, GOTO 20%' : 'Format tidak dikenali. Coba: BBCA 50%, TLKM 30%, GOTO 20%',
    risk:              '',
    awareness:         '',
    score:             0,
    intelligenceLayer: '',
    portfolioImpact:   '',
    tradeoffContext:   '',
    scenarioContext:   '',
    decisionReasoning: '',
  }

  if (!holdings.length) return empty

  // ── Metrics ─────────────────────────────────────────────────────
  const maxH = holdings.reduce((m, h) => h.weight > m.weight ? h : m)
  const concentrationHigh = maxH.weight > 40

  // Sector breakdown
  const sectorMap: Record<string, number> = {}
  holdings.forEach(h => {
    const s = SECTORS[h.ticker] ?? 'Lainnya'
    sectorMap[s] = (sectorMap[s] ?? 0) + h.weight
  })
  const sortedSectors = Object.entries(sectorMap).sort((a, b) => b[1] - a[1])
  const [topSector, topSectorWeight] = sortedSectors[0] ?? ['', 0]
  const sectorConcentrated = topSectorWeight > 60

  // Volatility exposure
  const volWeight = holdings
    .filter(h => HIGH_VOLATILITY.includes(h.ticker))
    .reduce((s, h) => s + h.weight, 0)
  const highVol = volWeight > 35

  // Market sentiment
  const redCount   = marketData?.filter(m => m.changePercent < 0).length ?? 0
  const totalMkt   = marketData?.length ?? 0
  const marketWeak = totalMkt > 0 && redCount / totalMkt > 0.6
  const marketUp   = totalMkt > 0 && redCount / totalMkt < 0.35

  // Defensive weight
  const defWeight  = holdings
    .filter(h => DEFENSIVE.includes(h.ticker))
    .reduce((s, h) => s + h.weight, 0)
  const wellDefended = defWeight > 50

  // Diversification
  const uniqueSectors = Object.keys(sectorMap).length
  const wellDiversified = uniqueSectors >= 3 && !concentrationHigh

  // ── FREE: Insight ────────────────────────────────────────────────
  let insight: string
  if (concentrationHigh) {
    insight = `Portofolio Anda memiliki ketergantungan tinggi pada ${maxH.ticker} (${maxH.weight.toFixed(0)}%). Kinerja keseluruhan Anda sangat bergantung pada satu emiten — ketika ${maxH.ticker} bergerak, seluruh portofolio ikut bergerak.`
  } else if (sectorConcentrated) {
    insight = `${topSectorWeight.toFixed(0)}% portofolio Anda terkonsentrasi di sektor ${topSector}. Ini bukan masalah jika Anda memang yakin dengan fundamental sektor tersebut — namun diversifikasi antar sektor masih perlu dipertimbangkan.`
  } else if (holdings.length >= 4) {
    insight = `Dengan ${holdings.length} emiten yang terdistribusi di ${uniqueSectors} sektor, portofolio Anda menunjukkan pendekatan diversifikasi yang cukup matang. Tidak ada ketergantungan dominan tunggal yang teridentifikasi.`
  } else {
    insight = `Portofolio Anda terdiri dari ${holdings.length} emiten. Cukup terfokus — mudah dimonitor, namun sensitivitas terhadap kinerja individual menjadi lebih tinggi.`
  }

  // ── FREE: Risk ───────────────────────────────────────────────────
  let risk: string
  if (highVol) {
    risk = `${volWeight.toFixed(0)}% portofolio Anda berada di saham bervolatilitas tinggi. Dalam kondisi market uncertainty, eksposur ini dapat memperbesar fluktuasi nilai aset Anda secara signifikan.`
  } else if (marketWeak) {
    risk = `Sentimen pasar saat ini cenderung melemah — ${redCount} dari ${totalMkt} saham yang dipantau berada di zona negatif. Perhatikan kondisi ini dalam mengambil keputusan posisi baru.`
  } else if (wellDefended) {
    risk = `Dengan ${defWeight.toFixed(0)}% di saham defensif, profil risiko portofolio Anda relatif terjaga. Tetap waspadai perubahan kebijakan suku bunga dan kondisi makro.`
  } else {
    risk = `Profil risiko portofolio Anda berada di level moderat. Tidak ada alarm khusus, namun pemantauan berkala tetap disarankan — terutama pada saham dengan bobot terbesar.`
  }

  // ── FREE: Awareness ──────────────────────────────────────────────
  let awareness: string
  if (concentrationHigh && highVol) {
    awareness = `Kombinasi konsentrasi tinggi + volatilitas besar adalah sinyal untuk ekstra waspada. Ketika ${maxH.ticker} mengalami tekanan, amplifikasinya terhadap portofolio Anda akan jauh lebih besar dari yang mungkin Anda perkirakan.`
  } else if (sectorConcentrated) {
    awareness = `Ketika sentimen sektor ${topSector} berubah — karena regulasi, kebijakan, atau kondisi makro — seluruh ${topSectorWeight.toFixed(0)}% bobot Anda akan merasakan dampaknya secara bersamaan.`
  } else if (holdings.length <= 2) {
    awareness = `Portofolio terkonsentrasi memudahkan monitoring, namun meningkatkan sensitivitas terhadap kinerja individual. Pertimbangkan diversifikasi bertahap sesuai toleransi risiko Anda.`
  } else {
    awareness = `Memahami kondisi portofolio sendiri adalah langkah pertama menuju keputusan yang lebih sadar. Ting AI tidak memberikan sinyal beli/jual — tapi membantu Anda melihat situasi Anda lebih jernih.`
  }

  // ── PRO: Intelligence Layer ─────────────────────────────────────
  let intelligenceLayer: string
  const sectorList = sortedSectors.map(([s, w]) => `${s} (${w.toFixed(0)}%)`).join(', ')
  if (wellDiversified) {
    intelligenceLayer = `Struktur portofolio Anda menyebar ke ${uniqueSectors} sektor: ${sectorList}. Dari perspektif konstruksi portofolio, distribusi ini mengurangi risiko sistemik sektor tunggal — namun juga membatasi potensi alpha jika satu sektor outperform secara signifikan.`
  } else if (concentrationHigh) {
    intelligenceLayer = `Komposisi saat ini menempatkan ${maxH.weight.toFixed(0)}% bobot pada ${maxH.ticker} di sektor ${SECTORS[maxH.ticker] ?? 'Lainnya'}. Secara struktural, ini membuat portofolio Anda berperilaku hampir identik dengan ${maxH.ticker} — bukan portofolio multi-emiten yang sesungguhnya.`
  } else {
    intelligenceLayer = `Distribusi sektoral portofolio Anda: ${sectorList}. Lapisan sektor dominan adalah ${topSector} dengan bobot ${topSectorWeight.toFixed(0)}% — artinya dinamika makro sektor ini menjadi penentu utama arah portofolio Anda.`
  }

  // ── PRO: Portfolio Impact ────────────────────────────────────────
  let portfolioImpact: string
  if (marketWeak && highVol) {
    portfolioImpact = `Kondisi pasar saat ini melemah dengan ${redCount}/${totalMkt} saham di zona negatif, bersamaan dengan eksposur volatil ${volWeight.toFixed(0)}% di portofolio Anda. Kombinasi ini mengindikasikan potensi dampak negatif yang lebih besar dari rata-rata — terutama jika tekanan pasar berlanjut.`
  } else if (marketUp && wellDefended) {
    portfolioImpact = `Pasar saat ini dalam posisi bullish. Dengan ${defWeight.toFixed(0)}% di saham defensif, portofolio Anda cenderung lebih stabil namun mungkin tidak sepenuhnya mengikuti kenaikan pasar yang lebih agresif.`
  } else if (marketWeak) {
    portfolioImpact = `Dengan ${redCount} dari ${totalMkt} saham di zona merah, tekanan pasar saat ini memberikan konteks risiko tambahan pada posisi-posisi Anda — terutama yang memiliki bobot besar.`
  } else {
    portfolioImpact = `Kondisi pasar saat ini netral-positif. Dampak langsung ke portofolio Anda bergantung pada pergerakan emiten spesifik yang Anda pegang, bukan pergerakan pasar secara keseluruhan.`
  }

  // ── PRO: Tradeoff Context ────────────────────────────────────────
  let tradeoffContext: string
  if (concentrationHigh) {
    tradeoffContext = `Keunggulan: portofolio terkonsentrasi mudah dipantau dan berpotensi memberikan return tinggi jika ${maxH.ticker} outperform. Komprominya: jika ${maxH.ticker} mengalami koreksi signifikan, tidak ada buffer dari emiten lain yang cukup berarti untuk meredam penurunan.`
  } else if (wellDiversified && wellDefended) {
    tradeoffContext = `Keunggulan: profil risiko yang relatif terjaga dengan komponen defensif yang kuat. Komprominya: dalam fase bull market agresif, portofolio ini cenderung tertinggal dari indeks — return dikompromikan demi stabilitas.`
  } else if (highVol) {
    tradeoffContext = `Keunggulan: saham volatil seperti ${holdings.filter(h => HIGH_VOLATILITY.includes(h.ticker)).map(h => h.ticker).join(', ')} memiliki potensi gain yang lebih besar saat momentum positif. Komprominya: fluktuasi jangka pendek yang lebih intens dan potensi drawdown yang lebih dalam saat koreksi.`
  } else {
    tradeoffContext = `Portofolio Anda berada di zona tengah — tidak terlalu agresif, tidak terlalu defensif. Keunggulan: fleksibel beradaptasi dengan berbagai kondisi. Komprominya: tanpa conviction sektor yang jelas, alpha potensial mungkin terdilusi.`
  }

  // ── PRO: Scenario Context ────────────────────────────────────────
  let scenarioContext: string
  if (topSector === 'Perbankan') {
    scenarioContext = `Jika Bank Indonesia menaikkan suku bunga, emiten perbankan — yang mendominasi portofolio Anda — biasanya mengalami tekanan jangka pendek pada valuasi, meski NIM (net interest margin) bisa meningkat jangka panjang. Skenario global recession juga berdampak signifikan pada sektor ini.`
  } else if (topSector === 'Energi') {
    scenarioContext = `Portofolio Anda sensitif terhadap pergerakan harga komoditas global. Kenaikan harga batubara/minyak dapat mendorong kinerja positif, sementara transisi energi hijau dan kebijakan ekspor pemerintah menjadi variabel risiko jangka menengah-panjang.`
  } else if (topSector === 'Teknologi') {
    scenarioContext = `Emiten teknologi Indonesia seperti GOTO sangat sensitif terhadap sentimen risk-off global dan kondisi likuiditas. Jika the Fed kembali hawkish atau ada ketidakpastian makro global, sektor ini cenderung mengalami tekanan valuasi lebih dulu.`
  } else {
    scenarioContext = `Skenario yang perlu dipantau: perubahan kebijakan moneter BI, tekanan inflasi domestik, dan sentimen investor asing terhadap pasar berkembang. Ketiga faktor ini secara historis memengaruhi arah IHSG secara keseluruhan.`
  }

  // ── PRO: Decision Reasoning ──────────────────────────────────────
  let decisionReasoning: string
  if (concentrationHigh && highVol) {
    decisionReasoning = `Kerangka berpikir yang relevan untuk kondisi ini: pertimbangkan apakah konsentrasi tinggi pada ${maxH.ticker} mencerminkan conviction yang terukur atau akumulasi yang belum direview. Jika belum ada target alokasi maksimum per emiten dalam rencana investasi Anda, ini saat yang tepat untuk menetapkannya.`
  } else if (wellDiversified) {
    decisionReasoning = `Dengan struktur yang sudah terdiversifikasi, pertanyaan kunci bukan "apakah perlu mengubah alokasi" tapi "apakah setiap posisi masih sesuai dengan thesis investasi awal?". Review thesis per emiten secara berkala lebih relevan daripada rebalancing berbasis pasar semata.`
  } else {
    decisionReasoning = `Langkah pertama yang selalu relevan: pastikan setiap posisi dalam portofolio Anda memiliki alasan yang jelas — bukan hanya keputusan historis yang tidak pernah direvisi. Ting AI membantu Anda melihat struktur yang ada, bukan merekomendasikan tindakan spesifik.`
  }

  // ── Risk Score ───────────────────────────────────────────────────
  let score = 45
  if (concentrationHigh)  score += 25
  if (highVol)            score += 15
  if (sectorConcentrated) score += 10
  if (marketWeak)         score += 8
  if (wellDefended)       score -= 15
  if (holdings.length >= 5) score -= 8
  if (wellDiversified)    score -= 5
  score = Math.max(10, Math.min(95, score))

  if (preferredLanguage === 'en') {
    const topTicker = maxH.ticker
    const topWeight = maxH.weight.toFixed(0)
    const sectorText = sectorList || 'uncategorized holdings'
    const volatileNames = holdings.filter(h => HIGH_VOLATILITY.includes(h.ticker)).map(h => h.ticker).join(', ')

    const insightEn = concentrationHigh
      ? `Your portfolio has high dependency on ${topTicker} (${topWeight}%). Overall movement is strongly tied to one asset.`
      : sectorConcentrated
        ? `${topSectorWeight.toFixed(0)}% of your portfolio is concentrated in ${topSector}. That can be intentional, but it raises sector sensitivity.`
        : holdings.length >= 4
          ? `With ${holdings.length} holdings across ${uniqueSectors} sectors, the portfolio shows a healthier diversification profile.`
          : `Your portfolio has ${holdings.length} holdings. It is easy to monitor, but individual asset movement matters more.`

    const riskEn = highVol
      ? `${volWeight.toFixed(0)}% of the portfolio sits in higher-volatility stocks. In uncertain markets, this can amplify value swings.`
      : marketWeak
        ? `Market tone is softer: ${redCount} of ${totalMkt} monitored stocks are negative. Treat this as added risk context.`
        : wellDefended
          ? `${defWeight.toFixed(0)}% of the portfolio is in defensive stocks, so the risk profile is relatively contained.`
          : 'Portfolio risk is moderate. No specific alarm is detected, but the largest holding still deserves regular monitoring.'

    const awarenessEn = concentrationHigh && highVol
      ? `High concentration plus high volatility requires extra attention. Pressure in ${topTicker} can move the whole portfolio more than expected.`
      : sectorConcentrated
        ? `If sentiment toward ${topSector} changes, the ${topSectorWeight.toFixed(0)}% sector weight can affect the portfolio at the same time.`
        : holdings.length <= 2
          ? 'A focused portfolio is simple to track, but it increases sensitivity to individual performance.'
          : 'Ting AI helps clarify portfolio structure and risk context. It does not provide buy or sell signals.'

    const intelligenceLayerEn = wellDiversified
      ? `The portfolio spreads across ${uniqueSectors} sectors: ${sectorText}. This reduces single-sector risk, while limiting dependence on one outperforming theme.`
      : concentrationHigh
        ? `${topWeight}% of the portfolio sits in ${topTicker}. Structurally, the portfolio may behave more like a single-asset exposure than a diversified allocation.`
        : `Sector distribution is ${sectorText}. The dominant layer is ${topSector}, so that sector's macro dynamics matter most.`

    const portfolioImpactEn = marketWeak && highVol
      ? `Market pressure and ${volWeight.toFixed(0)}% volatile exposure can create a larger drawdown effect if weakness continues.`
      : marketUp && wellDefended
        ? `Market tone is constructive, but the defensive tilt may make the portfolio steadier and less responsive to aggressive rallies.`
        : marketWeak
          ? `With ${redCount} of ${totalMkt} monitored stocks negative, market pressure adds risk context to the larger positions.`
          : 'Current market tone is neutral to constructive. Portfolio impact depends more on the specific assets you hold than on the broad market alone.'

    const tradeoffContextEn = concentrationHigh
      ? `Benefit: concentrated portfolios are easier to follow. Trade-off: if ${topTicker} corrects meaningfully, there is limited buffer from other assets.`
      : wellDiversified && wellDefended
        ? 'Benefit: risk is relatively contained. Trade-off: in a strong bull phase, stability can come at the cost of lower upside participation.'
        : highVol
          ? `Benefit: volatile holdings such as ${volatileNames} can respond strongly when momentum improves. Trade-off: short-term swings and drawdowns can be deeper.`
          : 'The portfolio sits in the middle: flexible across conditions, but without a clear sector conviction, potential alpha may be diluted.'

    const scenarioContextEn = topSector === 'Perbankan'
      ? 'Banking exposure is sensitive to Bank Indonesia policy, credit quality, and foreign investor appetite toward Indonesian financials.'
      : topSector === 'Energi'
        ? 'Energy exposure is sensitive to global commodity prices, export policy, and medium-term transition risk.'
        : topSector === 'Teknologi'
          ? 'Technology exposure is sensitive to global risk appetite, liquidity, and valuation pressure when rates stay higher.'
          : 'Scenarios to monitor include Bank Indonesia policy, domestic inflation pressure, and foreign investor sentiment toward emerging markets.'

    const decisionReasoningEn = concentrationHigh && highVol
      ? `A useful question is whether the ${topTicker} weight reflects measured conviction or a position that has not been reviewed recently.`
      : wellDiversified
        ? 'With diversification already in place, the key question is whether each position still matches its original thesis.'
        : 'Start by making sure each position has a clear reason. Ting AI explains the current structure rather than recommending a specific action.'

    return {
      insight: insightEn,
      risk: riskEn,
      awareness: awarenessEn,
      score,
      intelligenceLayer: intelligenceLayerEn,
      portfolioImpact: portfolioImpactEn,
      tradeoffContext: tradeoffContextEn,
      scenarioContext: scenarioContextEn,
      decisionReasoning: decisionReasoningEn,
    }
  }

  return {
    insight,
    risk,
    awareness,
    score,
    intelligenceLayer,
    portfolioImpact,
    tradeoffContext,
    scenarioContext,
    decisionReasoning,
  }
}
