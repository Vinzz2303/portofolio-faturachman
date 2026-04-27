import { expect, test } from '@playwright/test'

const mockInvestmentSummary = {
  summary: 'Risk tone is constructive, but concentration still matters.',
  macro: {
    stressState: 'stable',
    dollarPressure: 'moderate',
    yieldPressure: 'contained'
  }
}

const mockEmptyPortfolio = {
  summary: {
    totalInvested: 0,
    totalCurrentValue: 0,
    totalPnl: 0,
    totalPnlPct: 0,
    totalHoldings: 0
  },
  holdings: []
}

const mockSession = {
  authenticated: true,
  user: {
    id: 7,
    fullname: 'Playwright User',
    email: 'playwright@example.com'
  }
}

test.describe('auth smoke', () => {
  test('redirects unauthenticated users away from protected routes', async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ authenticated: false, user: null })
      })
    })

    await page.goto('/portfolio')

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Masuk ke Ting AI' })).toBeVisible()
    await expect(
      page.getByText('Masuk untuk membuka dashboard dan ringkasan pasar hari ini.')
    ).toBeVisible()
  })

  test('logs in and lands on the protected dashboard', async ({ page }) => {
    await page.route('**/api/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'test.jwt.token',
          user: {
            fullname: 'Playwright User',
            email: 'playwright@example.com'
          }
        })
      })
    })

    await page.route('**/api/investment-summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockInvestmentSummary)
      })
    })

    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSession)
      })
    })

    await page.route('**/api/portfolio/summary', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEmptyPortfolio)
      })
    })

    await page.route('**/api/market/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], points: [], price: null })
      })
    })

    await page.goto('/login')
    await page.getByLabel('Email').fill('playwright@example.com')
    await page.getByLabel('Password').fill('supersecret')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect.poll(async () => {
      return page.evaluate(() => window.localStorage.getItem('lifeOS_token'))
    }).toBe('test.jwt.token')
  })

  test('loads validated profile data from the backend account endpoint', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('lifeOS_token', 'test.jwt.token')
      window.localStorage.setItem('lifeOS_user', 'Playwright User')
      window.localStorage.setItem('lifeOS_user_email', 'playwright@example.com')
      window.localStorage.setItem('lifeos-auth', 'true')
    })

    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSession)
      })
    })

    await page.route('**/api/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 7,
            fullname: 'Playwright User',
            email: 'playwright@example.com'
          }
        })
      })
    })

    await page.goto('/profile')

    await expect(page).toHaveURL(/\/profile$/)
    await expect(page.getByRole('heading', { name: 'Playwright User' })).toBeVisible()
    await expect(page.locator('.profile-email')).toHaveText('playwright@example.com')
    await expect(page.getByText('Halaman ini menampilkan ringkasan akun dan status email untuk sesi aktif saat ini.')).toBeVisible()
  })
})
