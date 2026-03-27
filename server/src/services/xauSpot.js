const axios = require("axios");
const pool = require("../db");

const GOLD_API_URL = "https://api.gold-api.com/price/XAU";
const FX_API_URL = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=IDR";
const TROY_OUNCE_IN_GRAMS = 31.1034768;

function toDateOnly(d) {
  return d ? d.toISOString().slice(0, 10) : null;
}

async function getUsdPerOz() {
  const response = await axios.get(GOLD_API_URL, { timeout: 12000 });
  const price = Number(response?.data?.price);
  if (!price) throw new Error("Gold API price unavailable");
  return {
    usdPerOz: price,
    updatedAt: response?.data?.updatedAt || null,
  };
}

async function getUsdIdrRate() {
  const response = await axios.get(FX_API_URL, { timeout: 12000 });
  const rate = Number(response?.data?.rates?.IDR);
  if (!rate) throw new Error("FX rate unavailable");
  return rate;
}

async function getPreviousFromDb(previousDateStr) {
  try {
    const [previousRows] = await pool.query(
      "SELECT price_close FROM market_prices WHERE instrument_name = ? AND DATE(`timestamp`) = ? ORDER BY `timestamp` DESC LIMIT 1",
      ["XAUUSD", previousDateStr]
    );
    if (previousRows[0]?.price_close != null) {
      return Number(previousRows[0].price_close);
    }
  } catch (err) {
    // Ignore history failures.
  }
  return null;
}

async function getXauSpot() {
  const [{ usdPerOz, updatedAt }, usdIdr] = await Promise.all([
    getUsdPerOz(),
    getUsdIdrRate(),
  ]);

  const latestPrice = (usdPerOz * usdIdr) / TROY_OUNCE_IN_GRAMS;
  const latestDate = toDateOnly(updatedAt ? new Date(updatedAt) : new Date());
  const previousDate = new Date(latestDate || Date.now());
  previousDate.setDate(previousDate.getDate() - 1);
  const previousDateStr = toDateOnly(previousDate);

  const previousPrice =
    (await getPreviousFromDb(previousDateStr)) ?? latestPrice;
  const delta = latestPrice - previousPrice;
  const pct = previousPrice === 0 ? 0 : (delta / previousPrice) * 100;

  return {
    instrument: "XAUUSD",
    latestDate,
    previousDate: previousDateStr,
    latestPrice: Number(latestPrice.toFixed(0)),
    previousPrice: Number(previousPrice.toFixed(0)),
    delta: Number(delta.toFixed(0)),
    pct,
    unit: "IDR/gram",
    usdPerOz,
    usdIdr,
    source: "gold-api.com",
  };
}

module.exports = {
  getXauSpot,
};
