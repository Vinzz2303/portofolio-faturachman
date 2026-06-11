import { expect, test } from '@playwright/test'

const mockSession = {
  authenticated: true,
  user: {
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

const mockPortfolio = {
  summary: {
    totalInvested: 1500,
    totalCurrentValue: 1800,
    totalPnl: 300,
    totalPnlPct: 20,
    totalHoldings: 1
  },
  holdings: []
}

test.describe('ai chat smoke', () => {
  test('loads the public Ting AI route without console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text())
      }
    })

    await page.goto('/ting-ai')

    await expect(page.getByRole('heading', { name: 'Meja Briefing Ting AI' })).toBeVisible()
    expect(consoleErrors).toEqual([])
  })

  test('opens the reasoning desk and renders the AI reply', async ({ page }) => {
    await page.route('**/api/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'test.jwt.token',
          user: mockSession.user
        })
      })
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

    await page.route('**/api/market/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], note: '' })
      })
    })

    await page.route('**/api/ai-chat', async (route) => {
      const payload = route.request().postDataJSON() as { messages?: Array<{ content?: string }> }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: `Ringkasan aktif untuk pertanyaan: ${payload.messages?.at(-1)?.content || ''}`
        })
      })
    })

    await page.goto('/login')
    await page.getByLabel('Email').fill('playwright@example.com')
    await page.getByLabel('Password').fill('supersecret')
    await page.getByRole('button', { name: 'Masuk ke Dashboard' }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await page
      .getByRole('link', { name: /Pahami dampaknya ke portofolio Anda|Lihat implikasi lengkap/i })
      .click()

    await expect(page).toHaveURL(/\/ting-ai$/)
    await expect(page.getByRole('heading', { name: 'Meja Briefing Ting AI' })).toBeVisible()
    await expect(page.getByText(/Reasoning Surface|Surface Reasoning/)).toBeVisible()

    const chatInput = page.getByRole('textbox', { name: /Tanyakan konteks|Tanyakan kondisi/i })
    await chatInput.fill('What matters most this morning?')
    await page.getByRole('button', { name: 'Kirim' }).click()

    await expect(page.locator('.ai-msg.user .ai-msg-content').last()).toHaveText(
      'What matters most this morning?'
    )
    await expect(page.locator('.ai-msg.assistant .ai-msg-content').last()).toContainText(
      'Ringkasan aktif untuk pertanyaan: What matters most this morning?'
    )
  })
})
