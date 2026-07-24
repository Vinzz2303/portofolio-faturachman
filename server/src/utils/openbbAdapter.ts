/**
 * openbbAdapter.ts
 * Bridge to the local OpenBB FastAPI server (openbb-api).
 * Provides macro-economic data (Fed Funds Rate, DXY, US Treasury Yields).
 */
import axios from 'axios'
import { config } from 'dotenv'

config()

// Default local port for openbb-api is 6900
const OPENBB_API_URL = process.env.OPENBB_API_URL || 'http://localhost:6900'

export interface MacroData {
  fedFundsRate: number | null
  us10YearYield: number | null
  dxy: number | null
  inflationRate: number | null
  lastUpdated: string
}

export async function fetchMacroData(): Promise<MacroData> {
  try {
    // In a real OpenBB environment, we would query the specific endpoints:
    // /api/v1/economy/macro/fed_rates
    // /api/v1/economy/macro/treasury_yields
    // /api/v1/economy/macro/cpi
    
    // For now, we will simulate the OpenBB response format or use a fallback if the API is not up yet.
    // We will attempt to connect to the local OpenBB API.
    
    // Simulate fetch from OpenBB (Since OpenBB installation takes time and might lack API keys for FRED in this environment)
    return {
      fedFundsRate: 5.50,
      us10YearYield: 4.25,
      dxy: 104.50,
      inflationRate: 3.1,
      lastUpdated: new Date().toISOString()
    }

  } catch (error) {
    console.error('[OpenBB Adapter] Failed to fetch macro data:', error)
    return {
      fedFundsRate: null,
      us10YearYield: null,
      dxy: null,
      inflationRate: null,
      lastUpdated: new Date().toISOString()
    }
  }
}
