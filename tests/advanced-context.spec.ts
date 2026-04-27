import { expect, test } from '@playwright/test'

const mockSession = {
  authenticated: true,
  user: {
    id: 11,
    fullname: 'Playwright Pro',
    email: 'playwright-pro@example.com',
    plan: 'pro'
  }
}

const openAdvancedFold = async (page: import('@playwright/test').Page, label: RegExp) => {
  await page.locator('summary').filter({ hasText: label }).click()
}

const baseSummary = {
  summary: 'Risk tone is constructive and macro pressure is contained for now.',
  meta: {
    context: {
      riskTone: 'Constructive',
      regime: 'Risk-on',
      conviction: 'Medium',
      stressState: 'Contained stress posture',
      macroContext: 'Macro pressure is contained for now.',
      geopoliticContext: 'No major shock is dominating the tape.',
      externalContext: 'Headline flow is balanced.',
      externalWhyItMatters: 'The market can still read risk with discipline.',
      headlinePressure: 'Medium',
      watchLevel: 'Normal watch',
      overnightContext: 'Overnight price action stayed orderly across major assets.',
      drivers: [],
      macroSignals: [],
      stressDrivers: [],
      headlines: [],
      watchItems: []
    },
    instruments: {
      ANTAM: {
        instrument: 'ANTAM',
        latestDate: '2026-04-20',
        latestPrice: 2668623,
        delta: 12000,
        pct: 0.45
      },
      SP500: {
        instrument: 'SP500',
        latestDate: '2026-04-20',
        latestPrice: 5200,
        delta: 18,
        pct: 0.7
      },
      IHSG: {
        instrument: 'IHSG',
        latestDate: '2026-04-20',
        latestPrice: 7200,
        delta: 14,
        pct: 0.3
      },
      BTC: {
        instrument: 'BTC',
        latestDate: '2026-04-20',
        latestPrice: 72000,
        delta: 820,
        pct: 1.2
      }
    }
  }
}

const buildSummary = (overrides: Record<string, unknown>) =>
  JSON.parse(
    JSON.stringify({
      ...baseSummary,
      ...overrides
    })
  )

test.describe('advanced context intelligence', () => {
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

    await page.route('**/api/market/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], note: '' })
      })
    })
  })

  test('screener weakening is reflected in summary and derived insight', async ({ page }) => {
    const weakeningSummary = buildSummary({
      meta: {
        ...baseSummary.meta,
        context: {
          ...baseSummary.meta.context,
          semanticSignals: {
            breadthTone: 'weakening',
            marketTone: 'defensive',
            screenerTone: 'weakening',
            volatilityTrend: 'rising',
            macroPressure: 'tightening',
            marketStress: 'elevated',
            meta: { source: 'multi_provider', ts: Date.now() }
          }
        },
        instruments: {
          ...baseSummary.meta.instruments,
          SP500: { ...baseSummary.meta.instruments.SP500, delta: -28, pct: -1.3 },
          BTC: { ...baseSummary.meta.instruments.BTC, delta: -1350, pct: -2.4 }
        }
      }
    })

    await page.route('**/api/investment-summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(weakeningSummary)
      })
    })

    await page.goto('/dashboard')
    await openAdvancedFold(page, /Konteks Lanjutan|Advanced Context/)
    await openAdvancedFold(page, /^Screener$/)

    await expect(page.getByText(/Sebagian besar aset sedang melemah/i)).toBeVisible()
    await expect(page.getByText(/Breadth yang lemah berarti tekanan jual masih lebih dominan/i)).toBeVisible()
  })

  test('technical improving is reflected in posture and derived detail', async ({ page }) => {
    const improvingSummary = buildSummary({
      meta: {
        ...baseSummary.meta,
        context: {
          ...baseSummary.meta.context,
          semanticSignals: {
            breadthTone: 'constructive',
            marketTone: 'constructive',
            screenerTone: 'broad_strength',
            volatilityTrend: 'falling',
            macroPressure: 'neutral',
            marketStress: 'normal',
            meta: { source: 'multi_provider', ts: Date.now() }
          }
        },
        instruments: {
          ...baseSummary.meta.instruments,
          SP500: { ...baseSummary.meta.instruments.SP500, delta: 42, pct: 1.1 },
          BTC: { ...baseSummary.meta.instruments.BTC, delta: 1600, pct: 1.8 },
          IHSG: { ...baseSummary.meta.instruments.IHSG, delta: 31, pct: 0.7 }
        }
      }
    })

    await page.route('**/api/investment-summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(improvingSummary)
      })
    })

    await page.goto('/dashboard')
    await openAdvancedFold(page, /Konteks Lanjutan|Advanced Context/)
    await openAdvancedFold(page, /^Teknikal$|^Technical$/)

    await expect(page.getByText(/Momentum mulai membaik/i)).toBeVisible()
    await expect(page.getByText(/Momentum dan trend mulai membaik/i)).toBeVisible()
  })

  test('macro can switch from restrictive to supportive without changing UI structure', async ({ page }) => {
    let mode: 'restrictive' | 'supportive' = 'restrictive'

    await page.route('**/api/investment-summary', async (route) => {
      const response =
        mode === 'restrictive'
          ? buildSummary({
              meta: {
                ...baseSummary.meta,
                context: {
                  ...baseSummary.meta.context,
                  semanticSignals: {
                    breadthTone: 'limited',
                    marketTone: 'mixed',
                    screenerTone: 'selective_strength',
                    volatilityTrend: 'stable',
                    macroPressure: 'tightening',
                    marketStress: 'normal',
                    meta: { source: 'multi_provider', ts: Date.now() }
                  }
                }
              }
            })
          : buildSummary({
              meta: {
                ...baseSummary.meta,
                context: {
                  ...baseSummary.meta.context,
                  semanticSignals: {
                    breadthTone: 'constructive',
                    marketTone: 'constructive',
                    screenerTone: 'broad_strength',
                    volatilityTrend: 'falling',
                    macroPressure: 'easing',
                    marketStress: 'normal',
                    meta: { source: 'multi_provider', ts: Date.now() }
                  }
                }
              }
            })

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      })
    })

    await page.goto('/dashboard')
    await openAdvancedFold(page, /Konteks Lanjutan|Advanced Context/)
    await openAdvancedFold(page, /^Makro$|^Macro$/)

    await expect(page.getByText(/Relasi makro saat ini restriktif/i)).toBeVisible()
    await expect(page.getByText(/Tekanan makro masih cukup ketat/i)).toBeVisible()

    mode = 'supportive'
    await page.reload()
    await openAdvancedFold(page, /Konteks Lanjutan|Advanced Context/)
    await openAdvancedFold(page, /^Makro$|^Macro$/)

    await expect(page.getByText(/Relasi makro saat ini cukup mendukung/i)).toBeVisible()
    await expect(page.getByText(/Tekanan makro belum cukup kuat untuk mendominasi/i)).toBeVisible()
  })
})
