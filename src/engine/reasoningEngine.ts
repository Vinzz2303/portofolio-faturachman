import type { EngineContext } from './contextBuilder'

export type ReasoningOutput = {
  tradeOff: string
  direction: string
}

export function buildReasoning(context: EngineContext, lang: 'id' | 'en'): ReasoningOutput {
  const isHighConc = context.concentrationLevel === 'high'
  const isHighVol = context.volatility === 'high'
  const asset = context.dominantAsset || (lang === 'id' ? 'aset dominan' : 'dominant asset')
  const weight = context.dominantWeight ? `${context.dominantWeight.toFixed(0)}%` : lang === 'id' ? 'porsi terbesar' : 'the largest weight'

  let tradeOff = ''
  let direction = ''

  if (lang === 'id') {
    if (context.stance === 'risk_pressure') {
      tradeOff = `${asset} memegang sekitar ${weight}, sementara volatilitas atau konteks makro membuat portofolio cukup sensitif terhadap tekanan di satu aset.`
      direction = 'Fokusnya bukan sinyal beli atau jual, melainkan memahami seberapa besar portofoliomu ikut bergerak ketika aset dominan berubah arah.'
    } else if (context.stance === 'supportive') {
      tradeOff = `Konteksnya relatif mendukung, tetapi ${asset} masih menjadi aset dominan dengan bobot sekitar ${weight}. Kondisi yang terlihat lebih tenang tidak otomatis menghapus risiko konsentrasi.`
      direction = 'Gunakan konteks ini untuk menilai apakah struktur portofoliomu masih sejalan dengan tujuan, bukan untuk mengejar keputusan cepat.'
    } else if (isHighConc && isHighVol) {
      tradeOff = `Konsentrasi pada ${asset} sangat tinggi di sekitar ${weight} di tengah volatilitas yang kuat. Ini berarti keuntungan bisa besar, namun risiko penurunan juga sangat diamplifikasi.`
      direction = 'Perhatikan kembali batas toleransi risiko. Jangan hanya fokus pada potensi kenaikan, tapi siapkan skenario jika harga berbalik tajam.'
    } else if (isHighConc) {
      tradeOff = `Portofolio terfokus pada ${asset} dengan bobot sekitar ${weight}. Ini membuat performa sangat bergantung pada satu aset, mengorbankan manfaat diversifikasi.`
      direction = 'Perhatikan apakah tingkat konsentrasi ini memang disengaja berdasarkan keyakinan tinggi, atau terjadi secara pasif. Pantau katalis spesifik aset ini.'
    } else if (isHighVol) {
      tradeOff = `Pasar sedang volatil, dan ${asset} tetap menjadi aset dominan portofoliomu di sekitar ${weight}. Dalam kondisi ini, keputusan yang tergesa-gesa bisa mengurangi modal.`
      direction = 'Fokus pada perlindungan modal. Evaluasi apakah ada aset dalam portofolio yang terlalu sensitif terhadap ayunan pasar saat ini.'
    } else {
      tradeOff = `Kondisi relatif stabil dengan ${asset} sebagai aset dominan di sekitar ${weight}, sehingga risiko utama lebih banyak berasal dari struktur alokasi daripada sinyal market tunggal.`
      direction = 'Ini adalah waktu yang baik untuk memastikan kembali bahwa alokasi portofolio sejalan dengan tujuan jangka panjang.'
    }
  } else {
    // English
    if (context.stance === 'risk_pressure') {
      tradeOff = `${asset} is roughly ${weight}, while volatility or macro context makes the portfolio fairly sensitive to pressure in one asset.`
      direction = 'This is not a buy or sell signal. The point is to understand how much your portfolio moves when the dominant asset changes direction.'
    } else if (context.stance === 'supportive') {
      tradeOff = `The context is relatively supportive, but ${asset} remains the dominant asset at roughly ${weight}. A calmer backdrop does not erase concentration risk.`
      direction = 'Use this context to judge whether the portfolio structure still matches your goal, not to chase a fast decision.'
    } else if (isHighConc && isHighVol) {
      tradeOff = `High concentration in ${asset} at roughly ${weight} during strong volatility means gains can be outsized, but downside risk is severely amplified.`
      direction = 'Consider re-evaluating risk tolerance bounds. Do not just focus on upside potential; prepare scenarios for sharp reversals.'
    } else if (isHighConc) {
      tradeOff = `The portfolio is heavily focused on ${asset} at roughly ${weight}. This makes performance highly dependent on it, sacrificing diversification benefits.`
      direction = 'Observe if this concentration is intentional based on high conviction or happened passively. Monitor specific catalysts for this asset.'
    } else if (isHighVol) {
      tradeOff = `The market is volatile, and ${asset} is still your dominant asset at roughly ${weight}. In these conditions, rushed decisions can erode capital.`
      direction = 'Focus on capital preservation. Evaluate if any portfolio assets are overly sensitive to current market swings.'
    } else {
      tradeOff = `Conditions are relatively stable with ${asset} as the dominant asset at roughly ${weight}, so the main risk is more about allocation structure than one market signal.`
      direction = 'This is a good time to ensure the portfolio allocation aligns with long-term goals.'
    }
  }

  return { tradeOff, direction }
}
