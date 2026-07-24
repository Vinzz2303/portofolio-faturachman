import { expect, test } from '@playwright/test'

const mockSession = {
  authenticated: true,
  user: {
    id: 7,
    fullname: 'Playwright User',
    email: 'playwright@example.com'
  }
}

const mockInvestmentSummary = {
  summary: 'Risk tone is constructive and macro pressure is contained for now.',
  meta: {
    context: {
      riskTone: 'Constructive',
      regime: 'Risk-on',
      conviction: 'Medium',
      stressState: 'Contained',
      macroContext: 'Dollar pressure is stable and yields are not accelerating.',
      geopoliticContext: 'No major geopolitic shock is dominating this session.',
      externalContext: 'Headline flow is supportive but still mixed.',
      externalWhyItMatters: 'It keeps the brief usable without forcing a defensive read.',
      headlinePressure: 'Medium',
      watchLevel: 'Watch BTC and US equities follow-through',
      overnightContext: 'Overnight price action stayed orderly across major assets.',
      drivers: [],
      macroSignals: [],
      stressDrivers: [],
      headlines: [],
      watchItems: []
    }
  }
}

const mockAssets = {
  assets: [
    {
      id: 1,
      symbol: 'BTC',
      name: 'Bitcoin',
      quoteCurrency: 'USD',
      assetType: 'crypto',
      region: 'GLOBAL',
      provider: 'coingecko'
    }
  ]
}

const mockPortfolio = {
  summary: {
    totalInvested: 1500,
    totalCurrentValue: 1800,
    totalPnl: 300,
    totalPnlPct: 20,
    totalHoldings: 1
  },
  holdings: [
    {
      id: 101,
      assetId: 1,
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 0.025,
      entryPrice: 60000,
      latestPrice: 72000,
      currentValue: 1800,
      investedAmount: 1500,
      pnl: 300,
      pnlPct: 20,
      dayChange: 45,
      dayChangePct: 2.56,
      trend: 'up',
      quoteCurrency: 'USD',
      assetType: 'crypto',
      region: 'GLOBAL',
      fetchedAt: '2026-04-09T06:00:00.000Z',
      openedAt: '2026-04-01'
    }
  ]
}

test.describe('mobile smoke', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('lifeOS_token', 'test.jwt.token')
      window.localStorage.setItem('lifeos-auth', 'true')
    })

    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSession)
      })
    })

    await page.route('**/api/investment-summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockInvestmentSummary)
      })
    })

    await page.route('**/api/portfolio/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPortfolio)
      })
    })

    await page.route('**/api/assets', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAssets)
      })
    })

    await page.route('**/api/market/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], note: '' })
      })
    })
  })

  test('dashboard stays readable on mobile without horizontal overflow', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { name: 'Status Hari Ini' })).toBeVisible()
    await expect(page.getByText('Satu tampilan terpandu untuk kondisi pasar, kecocokan portofolio, dan langkah rasional berikutnya.')).toBeVisible()

    const hasOverflow = await page.evaluate(() => {
      const doc = document.documentElement
      return doc.scrollWidth > window.innerWidth
    })

    expect(hasOverflow).toBe(false)
  })

  test('portfolio filters and edit form remain usable on mobile', async ({ page }) => {
    await page.goto('/portfolio')

    await expect(page.getByRole('heading', { name: 'Insight Portofolio' })).toBeVisible()
    await expect(page.getByText('Filter Tipe Aset')).toBeVisible()
    await expect(page.getByText('Filter Wilayah')).toBeVisible()
    await expect(page.getByLabel('Tanggal Buka')).toBeVisible()

    const hasOverflow = await page.evaluate(() => {
      const doc = document.documentElement
      return doc.scrollWidth > window.innerWidth
    })

    expect(hasOverflow).toBe(false)
  })
})
