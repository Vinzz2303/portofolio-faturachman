import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium, devices } from '@playwright/test'

const BASE_URL = 'https://faturachman.my.id'
const OUTPUT_ROOT = path.resolve('demo-output')
const VIDEO_DIR = path.join(OUTPUT_ROOT, 'videos')
const SCREENSHOT_DIR = path.join(OUTPUT_ROOT, 'screenshots')
const DESKTOP_VIDEO = path.join(VIDEO_DIR, 'ting-ai-demo-desktop.webm')
const MOBILE_VIDEO = path.join(VIDEO_DIR, 'ting-ai-demo-mobile.webm')
const DESKTOP_SCREENSHOT = path.join(SCREENSHOT_DIR, 'ting-ai-demo-desktop-end.png')
const MOBILE_SCREENSHOT = path.join(SCREENSHOT_DIR, 'ting-ai-demo-mobile-end.png')
const DEMO_EMAIL = 'faturachmanalkahfi7@gmail.com'
const DEMO_PASSWORD = '12345678'

const demoUser = {
  id: 7,
  fullname: 'Faturachman Demo',
  email: DEMO_EMAIL,
  plan: 'pro',
  emailVerified: true
}

const investmentSummary = {
  summary:
    'Market brief: BTC moved lower most clearly at the latest checkpoint, with a move of -3.0% on 2026-04-24. What Changed: Cross-asset signals are mixed. Why It Matters: The market does not yet offer one clean narrative. What To Watch: Watch whether risk appetite stabilizes.',
  accessLevel: 'pro',
  meta: {
    usedGroq: false,
    instruments: {
      ANTAM: {
        instrument: 'ANTAM',
        latestDate: '2026-04-24',
        latestPrice: 1965000,
        previousPrice: 1948000,
        delta: 17000,
        pct: 0.87,
        unit: 'IDR'
      },
      SP500: {
        instrument: 'SP500',
        latestDate: '2026-04-24',
        latestPrice: 509.3,
        previousPrice: 513.6,
        delta: -4.3,
        pct: -0.84,
        unit: 'USD'
      },
      IHSG: {
        instrument: 'IHSG',
        latestDate: '2026-04-24',
        latestPrice: 7125,
        previousPrice: 7146,
        delta: -21,
        pct: -0.29,
        unit: 'IDR'
      },
      BTC: {
        instrument: 'BTC',
        latestDate: '2026-04-24',
        latestPrice: 64850,
        previousPrice: 66920,
        delta: -2070,
        pct: -3.09,
        unit: 'USD'
      }
    },
    context: {
      riskTone: 'mixed',
      regime: 'mixed',
      conviction: 'medium conviction',
      stressState: 'normal',
      macroContext: 'tightening aware',
      geopoliticContext: 'calm',
      externalContext: 'mixed global cues',
      externalWhyItMatters: 'External cues remain uneven across assets.',
      headlinePressure: 'watchful',
      watchLevel: 'medium',
      overnightContext: 'Cross-asset signals are mixed',
      drivers: [
        {
          label: 'Rates',
          signal: 'mixed',
          detail: 'Yield pressure is calmer, but not fully gone.'
        },
        {
          label: 'USD',
          signal: 'neutral',
          detail: 'Dollar strength is steady enough to keep risk appetite selective.'
        }
      ],
      macroSignals: [
        {
          label: 'Liquidity',
          signal: 'mixed',
          detail: 'Liquidity is available, but the market is still selective.'
        }
      ],
      stressDrivers: ['Crypto weakness is still shaping intraday mood.'],
      headlines: [
        {
          title: 'Equities pause while crypto slips',
          source: 'Demo Feed',
          url: 'https://example.com/ting-ai-demo',
          publishedAt: '2026-04-24T08:00:00Z',
          whyItMatters: 'The market is still asking for better confirmation.',
          theme: 'equities',
          relevance: 'medium'
        }
      ],
      watchItems: [
        {
          label: 'BTC',
          detail: 'Watch whether risk appetite stabilizes after the recent pullback.',
          priority: 'high'
        }
      ],
      semanticSignals: {
        breadthTone: 'mixed',
        marketTone: 'mixed',
        screenerTone: 'mixed',
        volatilityTrend: 'stable',
        macroPressure: 'tightening',
        marketStress: 'normal',
        meta: {
          source: 'multi_provider',
          ts: Date.now(),
          providers: {
            polygon: 'live',
            fmp: 'live',
            fred: 'live'
          }
        }
      }
    }
  }
}

const portfolioSummary = {
  accessLevel: 'pro',
  summary: {
    totalInvested: 91000,
    totalCurrentValue: 100000,
    totalPnl: 9000,
    totalPnlPct: 9.9,
    totalHoldings: 4,
    displayCurrency: 'USD'
  },
  holdings: [
    {
      id: 1,
      assetId: 1,
      symbol: 'AAPL',
      name: 'Apple',
      assetType: 'stock',
      region: 'US',
      quantity: 100,
      entryPrice: 180,
      investedAmount: 18000,
      currentValue: 42000,
      quoteCurrency: 'USD'
    },
    {
      id: 2,
      assetId: 2,
      symbol: 'BTC',
      name: 'Bitcoin',
      assetType: 'crypto',
      region: 'Global',
      quantity: 0.4,
      entryPrice: 52000,
      investedAmount: 20800,
      currentValue: 26000,
      quoteCurrency: 'USD'
    },
    {
      id: 3,
      assetId: 3,
      symbol: 'TLKM',
      name: 'Telkom Indonesia',
      assetType: 'stock',
      region: 'ID',
      quantity: 1000,
      entryPrice: 3900,
      investedAmount: 3900000,
      currentValue: 18000,
      quoteCurrency: 'USD'
    },
    {
      id: 4,
      assetId: 4,
      symbol: 'GLD',
      name: 'Gold ETF',
      assetType: 'commodity',
      region: 'US',
      quantity: 20,
      entryPrice: 180,
      investedAmount: 3600,
      currentValue: 14000,
      quoteCurrency: 'USD'
    }
  ]
}

const refinedInsight = {
  insight: {
    insightUtama:
      'AAPL masih mendominasi portofolio, jadi perubahan kecil di satu aset bisa cepat terasa di hasil total.',
    alasan: [
      'AAPL menyumbang sekitar 42% nilai portofolio, jadi sensitivitas portofolio masih tinggi pada satu nama.',
      'Sinyal pasar belum sepenuhnya searah, sehingga konsentrasi aset terasa lebih penting daripada mengejar narasi tunggal.'
    ],
    risiko: [
      'Jika aset dominan bergerak berlawanan, koreksi kecil bisa cepat terasa di total portofolio.',
      'Saat konteks lintas aset belum kompak, keputusan impulsif lebih mudah dipicu oleh pergerakan satu posisi besar.'
    ],
    arahan:
      'Baca kondisi ini sebagai pertanyaan tentang seberapa besar satu aset boleh mendikte portofolio kamu.',
    providerStatus: {
      used: 'local',
      fallbackDepth: 0,
      durationMs: 120
    }
  }
}

async function ensureOutputDirs() {
  await fs.mkdir(VIDEO_DIR, { recursive: true })
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true })
}

async function cleanupPreviousArtifacts() {
  const videoEntries = await fs.readdir(VIDEO_DIR).catch(() => [])
  const screenshotEntries = await fs.readdir(SCREENSHOT_DIR).catch(() => [])

  await Promise.all(
    videoEntries
      .filter((entry) => entry.endsWith('.webm'))
      .map((entry) => fs.rm(path.join(VIDEO_DIR, entry), { force: true }))
  )

  await Promise.all(
    screenshotEntries
      .filter((entry) => entry.endsWith('.png'))
      .map((entry) => fs.rm(path.join(SCREENSHOT_DIR, entry), { force: true }))
  )
}

function jsonResponse(body) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body)
  }
}

function buildSeries(days, start, drift, swing = 0.65) {
  const data = []
  let price = start

  for (let offset = days; offset >= 1; offset -= 1) {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - offset)
    const open = Number(price.toFixed(2))
    const directionalMove = drift + Math.sin(offset / 2.4) * swing
    const close = Number((price + directionalMove).toFixed(2))
    const high = Number((Math.max(open, close) + 1.2).toFixed(2))
    const low = Number((Math.min(open, close) - 1.2).toFixed(2))

    data.push({
      time: date.toISOString().slice(0, 10),
      open,
      high,
      low,
      close
    })

    price = close
  }

  return data
}

function marketPayload(kind, days) {
  if (kind === 'gold') {
    return {
      data: buildSeries(days, 1930, 1.15, 0.4),
      source: 'database'
    }
  }

  if (kind === 'btc') {
    return {
      data: buildSeries(days, 70200, -72, 35),
      source: 'coingecko'
    }
  }

  if (kind === 'sp500') {
    return {
      data: buildSeries(days, 525, -0.22, 0.3),
      source: 'yahoo-finance'
    }
  }

  return {
    data: buildSeries(days, 7160, -1.1, 0.9),
    source: 'database'
  }
}

async function installApiMocks(context) {
  await context.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    const pathname = url.pathname

    if (pathname.endsWith('/api/login')) {
      return route.fulfill(
        jsonResponse({
          token: 'demo-token',
          user: demoUser
        })
      )
    }

    if (pathname.endsWith('/api/auth/session')) {
      return route.fulfill(
        jsonResponse({
          authenticated: true,
          user: demoUser
        })
      )
    }

    if (pathname.endsWith('/api/investment-summary')) {
      return route.fulfill(jsonResponse(investmentSummary))
    }

    if (pathname.endsWith('/api/portfolio/summary')) {
      return route.fulfill(jsonResponse(portfolioSummary))
    }

    if (pathname.endsWith('/api/ting-ai/refine')) {
      return route.fulfill(jsonResponse(refinedInsight))
    }

    const marketMatch = pathname.match(/\/api\/market\/(gold|btc|sp500|ihsg)$/)
    if (marketMatch) {
      const days = Number(url.searchParams.get('days') || '30')
      return route.fulfill(jsonResponse(marketPayload(marketMatch[1], days)))
    }

    return route.continue()
  })
}

async function seedAuthState(context) {
  await context.addInitScript((user) => {
    window.localStorage.setItem('lifeos-auth', 'true')
    window.localStorage.setItem('lifeOS_token', 'demo-token')
    window.localStorage.setItem('lifeOS_user', user.fullname)
    window.localStorage.setItem('lifeOS_user_email', user.email)
    window.localStorage.setItem('lifeOS_user_plan', user.plan)
  }, demoUser)
}

async function hold(page, ms) {
  await page.waitForTimeout(ms)
}

async function moveAndClick(page, locator) {
  await locator.waitFor({ state: 'visible', timeout: 30000 })
  const box = await locator.boundingBox()

  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 })
    await page.waitForTimeout(140)
    await page.mouse.down()
    await page.waitForTimeout(90)
    await page.mouse.up()
    return
  }

  await locator.click()
}

async function smoothScroll(page, totalDistance, step = 140, delay = 140) {
  const direction = totalDistance >= 0 ? 1 : -1
  const loops = Math.ceil(Math.abs(totalDistance) / step)

  for (let index = 0; index < loops; index += 1) {
    await page.mouse.wheel(0, direction * step)
    await page.waitForTimeout(delay)
  }
}

async function typeSlowly(locator, value) {
  await locator.click()
  await locator.pressSequentially(value, { delay: 55 })
}

async function finalizeVideo(context, page, targetPath) {
  const video = page.video()
  await context.close()

  if (!video) return null

  const originalPath = await video.path()
  await fs.copyFile(originalPath, targetPath)
  if (path.resolve(originalPath) !== path.resolve(targetPath)) {
    await fs.rm(originalPath, { force: true })
  }
  return targetPath
}

async function recordDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 960 }
    }
  })

  await installApiMocks(context)
  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await hold(page, 2800)

  await moveAndClick(page, page.getByRole('button', { name: 'Buka Ting AI' }))
  await hold(page, 1400)

  if (page.url() === `${BASE_URL}/`) {
    await moveAndClick(page, page.getByRole('link', { name: 'Ikhtisar Produk' }))
  }

  await hold(page, 2400)

  await moveAndClick(page, page.getByRole('link', { name: 'Lihat Status Hari Ini' }))
  await hold(page, 1300)

  await typeSlowly(page.getByLabel('Email'), DEMO_EMAIL)
  await hold(page, 220)
  await typeSlowly(page.getByLabel('Password'), DEMO_PASSWORD)
  await hold(page, 380)
  await moveAndClick(page, page.getByRole('button', { name: 'Masuk' }))

  await page.waitForURL('**/dashboard', { timeout: 30000 })
  await hold(page, 3200)

  await smoothScroll(page, 520, 130, 160)
  await hold(page, 2800)

  const advancedContextSummary = page.locator('summary', { hasText: 'Konteks Lanjutan' })
  await advancedContextSummary.scrollIntoViewIfNeeded()
  await hold(page, 700)
  await moveAndClick(page, advancedContextSummary)
  await hold(page, 1200)

  const showDataSummary = page.locator('summary', { hasText: 'Tampilkan detail data' })
  await showDataSummary.scrollIntoViewIfNeeded()
  await hold(page, 700)
  await moveAndClick(page, showDataSummary)
  await hold(page, 3600)

  const btcCard = page.locator('.market-card.market-chart-card', {
    hasText: 'Bitcoin (BTC/USDT)'
  })
  await btcCard.scrollIntoViewIfNeeded()
  await hold(page, 2200)

  const actionHintBlock = btcCard.locator('.market-spot-note-block', { hasText: 'Action Hint' })
  await actionHintBlock.scrollIntoViewIfNeeded()
  await hold(page, 4200)

  await moveAndClick(page, btcCard.getByRole('button', { name: '1W' }))
  await hold(page, 3200)

  await actionHintBlock.scrollIntoViewIfNeeded()
  await hold(page, 2800)

  await page.screenshot({ path: DESKTOP_SCREENSHOT, fullPage: false })
  await hold(page, 2200)

  return finalizeVideo(context, page, DESKTOP_VIDEO)
}

async function recordMobile(browser) {
  const context = await browser.newContext({
    ...devices['Pixel 5'],
    viewport: { width: 393, height: 851 },
    screen: { width: 393, height: 851 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 393, height: 851 }
    }
  })

  await installApiMocks(context)
  await seedAuthState(context)
  const page = await context.newPage()
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await hold(page, 3400)

  await smoothScroll(page, 620, 110, 160)
  await hold(page, 2200)

  const advancedContextSummary = page.locator('summary', { hasText: 'Konteks Lanjutan' })
  await advancedContextSummary.scrollIntoViewIfNeeded()
  await hold(page, 800)
  await advancedContextSummary.click()
  await hold(page, 1100)

  const showDataSummary = page.locator('summary', { hasText: 'Tampilkan detail data' })
  await showDataSummary.scrollIntoViewIfNeeded()
  await hold(page, 700)
  await showDataSummary.click()
  await hold(page, 2600)

  const btcCard = page.locator('.market-card.market-chart-card', {
    hasText: 'Bitcoin (BTC/USDT)'
  })
  await btcCard.scrollIntoViewIfNeeded()
  await hold(page, 2600)

  const actionHintBlock = btcCard.locator('.market-spot-note-block', { hasText: 'Action Hint' })
  await actionHintBlock.scrollIntoViewIfNeeded()
  await hold(page, 4200)

  await smoothScroll(page, -130, 65, 140)
  await hold(page, 2000)

  await page.screenshot({ path: MOBILE_SCREENSHOT, fullPage: false })
  await hold(page, 2200)

  return finalizeVideo(context, page, MOBILE_VIDEO)
}

async function main() {
  await ensureOutputDirs()
  await cleanupPreviousArtifacts()
  const browser = await chromium.launch({ headless: true })

  try {
    const desktopPath = await recordDesktop(browser)
    const mobilePath = await recordMobile(browser)

    console.log(`desktop=${desktopPath}`)
    console.log(`mobile=${mobilePath}`)
    console.log(`desktop_screenshot=${DESKTOP_SCREENSHOT}`)
    console.log(`mobile_screenshot=${MOBILE_SCREENSHOT}`)
  } finally {
    await browser.close()
  }
}

await main()
