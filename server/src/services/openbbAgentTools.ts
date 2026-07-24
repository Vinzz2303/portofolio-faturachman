import axios from 'axios'
import { FunctionDeclaration, SchemaType } from '@google/generative-ai'

const OPENBB_API_URL = process.env.OPENBB_API_URL || 'http://localhost:6900'

export const getInsiderTradingDeclaration: FunctionDeclaration = {
  name: 'getInsiderTrading',
  description: 'Mendapatkan data transaksi insider trading (pembelian/penjualan oleh direksi atau manajemen) dari sebuah perusahaan berdasarkan ticker saham.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      symbol: {
        type: SchemaType.STRING,
        description: 'Ticker saham perusahaan, contoh: AAPL, TSLA, NVDA'
      }
    },
    required: ['symbol']
  }
}

export async function getInsiderTrading(symbol: string) {
  try {
    const res = await axios.get(`${OPENBB_API_URL}/api/v1/equity/ownership/insider_trading`, {
      params: {
        symbol,
        limit: 5,
        provider: 'sec'
      }
    })
    return res.data?.results || []
  } catch (error) {
    console.error('[OpenBB Tool] Insider trading fetch failed:', error)
    return { error: 'Gagal mengambil data insider trading. Mungkin ticker tidak valid atau server bermasalah.' }
  }
}
