// src/utils/exchangeRateService.ts

let cachedRate: number | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const FALLBACK_RATE = 17150;

/**
 * Fetches the current USD to IDR exchange rate.
 * Uses a public API, with in-memory caching for 1 hour.
 * Falls back to 17150 if the API fails.
 */
export async function getUsdToIdrRate(): Promise<number> {
  const now = Date.now();
  
  if (cachedRate !== null && (now - lastFetch < CACHE_DURATION)) {
    return cachedRate;
  }

  try {
    // Attempting to fetch from a public open exchange rate API
    // Using frankfurter.app which is free and requires no API key
    // Alternatively, using floatrates which provides a simple JSON for USD
    const response = await fetch('https://www.floatrates.com/daily/usd.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (data && data.idr && data.idr.rate) {
      cachedRate = data.idr.rate;
      lastFetch = now;
      return cachedRate as number;
    }
    throw new Error('Invalid rate data format');
  } catch (error) {
    console.warn('Failed to fetch exchange rate, using fallback.', error);
    // Use fallback if fetch fails or format changes
    if (cachedRate === null) {
      return FALLBACK_RATE;
    }
    // If we have an old cached rate, it's probably better than the hardcoded fallback
    return cachedRate;
  }
}
