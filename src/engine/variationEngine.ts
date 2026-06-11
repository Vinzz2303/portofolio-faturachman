import type { EngineContext } from './contextBuilder'

function pick<T>(items: T[], seed: string): T {
  const total = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return items[total % items.length]
}

export function buildDynamicOpener(
  lang: 'id' | 'en',
  context: EngineContext,
  seed = ''
): string {
  const asset = context.dominantAsset || (lang === 'id' ? 'aset utama' : 'the dominant asset')
  const weight = context.dominantWeight ? `${context.dominantWeight.toFixed(0)}%` : lang === 'id' ? 'porsi terbesar' : 'the largest weight'

  if (lang === 'id') {
    const options = context.stance === 'risk_pressure'
      ? [
          `Yang paling perlu dibaca dulu adalah tekanan di ${asset}, karena porsinya sekitar ${weight}.`,
          `Di portofoliomu, titik tekan utamanya ada pada ${asset} dengan bobot sekitar ${weight}.`,
          `Saya melihat ini dari sisi sensitivitas: ${asset} adalah penggerak terbesar portofoliomu di ${weight}.`,
        ]
      : context.stance === 'supportive'
        ? [
            `Konteksnya relatif lebih mendukung, tapi pembacaan tetap harus dimulai dari ${asset} yang memegang sekitar ${weight}.`,
            `Struktur portofoliomu memberi ruang bernapas, dengan ${asset} tetap menjadi aset dominan di sekitar ${weight}.`,
            `Bacaan awalnya cukup konstruktif, selama kita ingat ${asset} masih menjadi posisi terbesar di ${weight}.`,
          ]
        : [
            `Bacaan paling berguna dimulai dari ${asset}, karena bobotnya sekitar ${weight} di portofoliomu.`,
            `Konteksnya belum ekstrem; tetap saja, ${asset} adalah pusat gravitasi portofoliomu di sekitar ${weight}.`,
            `Saya akan membacanya dari struktur portofolio dulu: ${asset} masih menjadi posisi terbesar dengan bobot sekitar ${weight}.`,
          ]
    return pick(options, `${seed}-${context.stance}-${asset}`)
  }

  const options = context.stance === 'risk_pressure'
    ? [
        `The first thing to read is pressure around ${asset}, because it is roughly ${weight} of your portfolio.`,
        `In your portfolio, the main stress point is ${asset} at about ${weight}.`,
        `I would frame this through sensitivity: ${asset} is your largest portfolio driver at roughly ${weight}.`,
      ]
    : context.stance === 'supportive'
      ? [
          `The backdrop is more supportive, but the read still starts with ${asset} at about ${weight}.`,
          `Your structure has more breathing room, with ${asset} still the dominant asset around ${weight}.`,
          `The setup is reasonably constructive, as long as ${asset} remains the largest position at about ${weight}.`,
        ]
      : [
          `The useful read starts with ${asset}, because it carries roughly ${weight} of your portfolio.`,
          `The context is not extreme, but ${asset} is still the portfolio's center of gravity at about ${weight}.`,
          `I would start from the portfolio structure: ${asset} remains your largest position at roughly ${weight}.`,
        ]

  return pick(options, `${seed}-${context.stance}-${asset}`)
}

export function buildTrustLanguage(
  lang: 'id' | 'en',
  context: EngineContext,
  trustNote?: string
): string {
  if (lang === 'id') {
    if (context.trustLevel === 'LOW') {
      return `Karena datanya belum sepenuhnya kuat${trustNote ? ` (${trustNote})` : ''}, ini lebih tepat dibaca sebagai peta risiko sementara, bukan kesimpulan final.`
    }
    if (context.trustLevel === 'MEDIUM') {
      return `Dengan data yang ada, bacaan ini cukup masuk akal, tapi tetap perlu ruang untuk berubah kalau konteks market bergeser.`
    }
    return `Data saat ini terlihat cukup konsisten, jadi bacaan risikonya bisa dipakai sebagai kerangka berpikir, bukan kepastian.`
  }

  if (context.trustLevel === 'LOW') {
    return `Because the data is not fully strong${trustNote ? ` (${trustNote})` : ''}, this is better treated as a temporary risk map, not a final conclusion.`
  }
  if (context.trustLevel === 'MEDIUM') {
    return `With the data available, this read is reasonable, but it should leave room for change if market context shifts.`
  }
  return `The current data looks reasonably consistent, so the risk read is useful as a thinking frame, not certainty.`
}
