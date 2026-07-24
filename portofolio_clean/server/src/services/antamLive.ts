import axios from 'axios'
import type { RowDataPacket } from 'mysql2'
import pool from '../db'
import type { InstrumentSummary } from '../types'

const LOGAM_MULIA_URL = 'https://logammulia.com/id/harga-emas-hari-ini'

type PriceRow = RowDataPacket & {
  price_close: number | string | null
}

const stripHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()

const parseIdNumber = (value: string | number | null | undefined) => {
  const digits = String(value || '').replace(/[^\d]/g, '')
  if (!digits) return null
  return Number(digits)
}

const toDateOnly = (value: Date | null) => (value ? value.toISOString().slice(0, 10) : null)

const parseLogamMulia = (html: string) => {
  const text = stripHtml(html)
  const dateMatch = text.match(
    /Harga Emas Hari Ini,?\s*([0-9]{1,2}\s+[A-Za-z]{3,}\s+[0-9]{4})/i
  )
  const dateText = dateMatch ? dateMatch[1] : null

  const start = text.indexOf('Emas Batangan')
  const end = text.indexOf('Emas Batangan Gift Series')
  const section =
    start >= 0 ? text.slice(start, end > start ? end : Math.min(text.length, start + 1500)) : text

  const rowMatch = section.match(/1\s*gr\s*([0-9.,]+)\s*([0-9.,]+)/i)
  if (!rowMatch) {
    throw new Error('Harga 1 gr tidak ditemukan')
  }

  const priceBase = parseIdNumber(rowMatch[1])
  const priceTaxed = parseIdNumber(rowMatch[2])
  if (!priceBase || !priceTaxed) {
    throw new Error('Format harga tidak valid')
  }

  return { dateText, priceBase, priceTaxed }
}

export const getAntamLive = async (): Promise<InstrumentSummary> => {
  const response = await axios.get<string>(LOGAM_MULIA_URL, {
    timeout: 12000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
      Accept: 'text/html'
    }
  })

  const parsed = parseLogamMulia(response.data || '')
  const latestDate = toDateOnly(parsed.dateText ? new Date(parsed.dateText) : new Date())
  const previousDate = new Date(latestDate || Date.now())
  previousDate.setDate(previousDate.getDate() - 1)
  const previousDateStr = toDateOnly(previousDate)

  let previousPrice = parsed.priceTaxed
  try {
    const [previousRows] = await pool.query<PriceRow[]>(
      "SELECT price_close FROM market_prices WHERE instrument_name = ? AND DATE(`timestamp`) = ? ORDER BY `timestamp` DESC LIMIT 1",
      ['ANTAM', previousDateStr]
    )
    if (previousRows[0]?.price_close != null) {
      previousPrice = Number(previousRows[0].price_close)
    }
  } catch {
    // Ignore historical lookup failure; still return live price.
  }

  const delta = parsed.priceTaxed - previousPrice
  const pct = previousPrice === 0 ? 0 : (delta / previousPrice) * 100

  return {
    instrument: 'ANTAM',
    latestDate,
    previousDate: previousDateStr,
    latestPrice: parsed.priceTaxed,
    previousPrice,
    delta,
    pct,
    unit: 'IDR/gram',
    source: 'logammulia.com'
  }
}
