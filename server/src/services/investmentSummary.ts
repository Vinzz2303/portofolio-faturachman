import axios from 'axios'
import type { RowDataPacket } from 'mysql2'
import pool from '../db'
import type { InstrumentSummary, InvestmentSummaryResult } from '../types'
import { getXauSpot } from './xauSpot'

type LatestDateRow = RowDataPacket & {
  latestDate: Date | string | null
}

type PriceRow = RowDataPacket & {
  price_close: number | string
  timestamp: Date | string
}

const formatDelta = (delta: number) => {
  const abs = Math.abs(delta)
  return delta >= 0 ? `+${abs}` : `-${abs}`
}

const deltaSign = (value: number) => (value >= 0 ? '+' : '-')

const formatPercent = (pct: number) => {
  const abs = Math.abs(pct)
  return `${deltaSign(pct)}${abs.toFixed(2)}%`
}

const toDateOnly = (value: Date | null) => (value ? value.toISOString().slice(0, 10) : null)

const getLatestAndPrevious = async (instrument: string): Promise<InstrumentSummary> => {
  const [latestDateRows] = await pool.query<LatestDateRow[]>(
    'SELECT DATE(MAX(`timestamp`)) AS latestDate FROM market_prices WHERE instrument_name = ?',
    [instrument]
  )

  const latestDateValue = latestDateRows[0]?.latestDate
  if (!latestDateValue) {
    return { instrument, error: 'No data available' }
  }

  const latestDate = new Date(latestDateValue)
  const latestDateStr = toDateOnly(latestDate)
  const previousDate = new Date(latestDate)
  previousDate.setDate(previousDate.getDate() - 1)
  const previousDateStr = toDateOnly(previousDate)

  const [latestRows] = await pool.query<PriceRow[]>(
    'SELECT price_close, `timestamp` FROM market_prices WHERE instrument_name = ? AND DATE(`timestamp`) = ? ORDER BY `timestamp` DESC LIMIT 1',
    [instrument, latestDateStr]
  )

  const [previousRows] = await pool.query<PriceRow[]>(
    'SELECT price_close, `timestamp` FROM market_prices WHERE instrument_name = ? AND DATE(`timestamp`) = ? ORDER BY `timestamp` DESC LIMIT 1',
    [instrument, previousDateStr]
  )

  const latest = latestRows[0]
  const previous = previousRows[0]
  if (!latest || !previous) {
    return {
      instrument,
      latestDate: latestDateStr,
      previousDate: previousDateStr,
      error: 'Missing comparison data'
    }
  }

  const latestPrice = Number(latest.price_close)
  const previousPrice = Number(previous.price_close)
  const delta = latestPrice - previousPrice
  const pct = previousPrice === 0 ? 0 : (delta / previousPrice) * 100

  return {
    instrument,
    latestDate: latestDateStr,
    previousDate: previousDateStr,
    latestPrice,
    previousPrice,
    delta,
    pct
  }
}

const buildLocalSummary = (antam: InstrumentSummary, sp500: InstrumentSummary) => {
  const parts: string[] = []
  const warnings: string[] = []

  if (antam.error) warnings.push(`XAUUSD: ${antam.error}`)
  if (sp500.error) warnings.push(`SP500: ${sp500.error}`)

  if (!antam.error) {
    const trend = (antam.delta ?? 0) >= 0 ? 'naik' : 'turun'
    parts.push(
      `Emas spot (XAU/USD) ${trend} dari ${antam.previousPrice} ke ${antam.latestPrice} (perubahan ${formatDelta(
        antam.delta ?? 0
      )}, ${formatPercent(antam.pct ?? 0)}).`
    )
  }

  if (!sp500.error) {
    const trend = (sp500.delta ?? 0) >= 0 ? 'naik' : 'turun'
    parts.push(
      `S&P 500 ${trend} dari ${sp500.previousPrice} ke ${sp500.latestPrice} (perubahan ${formatDelta(
        sp500.delta ?? 0
      )}, ${formatPercent(sp500.pct ?? 0)}).`
    )
  }

  let diversification =
    'Untuk diversifikasi, jaga porsi emas dan saham bluechip tetap seimbang.'

  if (!antam.error && !sp500.error) {
    if ((antam.delta ?? 0) > 0 && (sp500.delta ?? 0) < 0) {
      diversification =
        'Karena emas menguat saat saham melemah, porsi emas bisa ditingkatkan sedikit untuk mengimbangi risiko, sambil tetap menjaga eksposur saham bluechip.'
    } else if ((antam.delta ?? 0) < 0 && (sp500.delta ?? 0) > 0) {
      diversification =
        'Karena saham menguat sementara emas melemah, porsi saham bluechip bisa dinaikkan tipis, tetap sisakan emas sebagai penyangga volatilitas.'
    } else if ((antam.delta ?? 0) < 0 && (sp500.delta ?? 0) < 0) {
      diversification =
        'Keduanya melemah, pertahankan diversifikasi dan batasi penambahan posisi sampai tren lebih jelas.'
    } else if ((antam.delta ?? 0) > 0 && (sp500.delta ?? 0) > 0) {
      diversification =
        'Keduanya menguat, pertahankan diversifikasi agar tidak terlalu terkonsentrasi di satu aset.'
    }
  }

  const dateNote =
    !antam.error || !sp500.error
      ? `Perbandingan menggunakan data ${antam.latestDate || sp500.latestDate} vs ${
          antam.previousDate || sp500.previousDate
        }.`
      : ''

  const disclaimer = 'Ringkasan ini bersifat informasi umum, bukan nasihat keuangan.'

  return [
    parts.join(' '),
    dateNote,
    diversification,
    warnings.length ? `Catatan data: ${warnings.join('; ')}.` : '',
    disclaimer
  ]
    .filter(Boolean)
    .join(' ')
}

const generateGroqSummary = async (localSummary: string) => {
  const url = process.env.GROQ_API_URL
  const apiKey = process.env.GROQ_API_KEY
  const model = process.env.GROQ_MODEL

  if (!url || !apiKey || !model) {
    return { summary: localSummary, usedGroq: false }
  }

  const timeoutMs = Number(process.env.GROQ_REQUEST_TIMEOUT_MS || 12000)
  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content:
          "Kamu adalah Fatur's Private Wealth Analyst. Tugasmu adalah menganalisis data harga Emas Antam dan S&P 500 dari database MySQL. Jika harga naik: berikan nada optimis namun tetap waspada. Jika harga turun: berikan analisis tentang titik 'Support' dan saran untuk 'Buy the Dip'. Selalu hubungkan kondisi pasar global dengan strategi diversifikasi yang aman bagi mahasiswa Informatika. Gunakan bahasa yang profesional, ringkas, dan teknis."
      },
      { role: 'user', content: localSummary }
    ],
    temperature: 0.4
  }

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: timeoutMs
    })

    const content = response.data?.choices?.[0]?.message?.content?.trim() as string | undefined
    if (!content) {
      return { summary: localSummary, usedGroq: false }
    }

    return { summary: content, usedGroq: true }
  } catch (error) {
    return { summary: localSummary, usedGroq: false, error }
  }
}

export const getInvestmentSummary = async (): Promise<InvestmentSummaryResult> => {
  let antam: InstrumentSummary
  let antamLiveError: string | null = null

  try {
    antam = await getXauSpot()
  } catch (error) {
    antamLiveError = error instanceof Error ? error.message : 'XAUUSD live fetch failed'
    antam = { instrument: 'XAUUSD', error: antamLiveError }
  }

  const sp500 = await getLatestAndPrevious('SP500')
  const localSummary = buildLocalSummary(antam, sp500)
  const groqResult = await generateGroqSummary(localSummary)

  return {
    summary: groqResult.summary,
    meta: {
      usedGroq: groqResult.usedGroq,
      antamLiveError,
      instruments: {
        ANTAM: antam,
        SP500: sp500
      }
    }
  }
}
