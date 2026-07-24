export type UserIntent = 'portfolio' | 'commodity' | 'crypto' | 'macro' | 'stock' | 'general' | 'follow-up-question'

export function detectUserIntent(message: string): UserIntent {
  const m = message.toLowerCase()
  if (/emas|gold|xau|perak|silver|minyak|oil|komoditas|commodity|crude/.test(m)) return 'commodity'
  if (/btc|bitcoin|eth|ethereum|kripto|crypto|altcoin|defi|sol|bnb|xrp/.test(m)) return 'crypto'
  if (/geopolitik|inflasi|fed|suku bunga|rate|makro|macro|perang|war/.test(m))   return 'macro'
  if (/portofolio|portfolio|holding|alokasi|allocation|posisi|weight/.test(m))  return 'portfolio'
  if (/saham|stock|equity|emiten|idx|jkse|ihsg|ticker|bbca|tlkm|bbri|gorengan/.test(m))  return 'stock'
  if (/^(bagaimana kalau|kalau untuk|terus kalau|bagaimana dengan|lalu bagaimana|what if|how about|and if)/.test(m)) return 'follow-up-question'
  return 'general'
}
