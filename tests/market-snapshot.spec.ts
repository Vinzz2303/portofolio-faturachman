import { test, expect } from '@playwright/test'

const mockSession = {
  authenticated: true,
  user: {
    fullname: 'Playwright User',
    email: 'playwright@example.com',
    plan: 'pro'
  }
}

const mockInvestmentSummary = {
  summary: 'Risk tone is constructive and macro pressure is contained for now.',
  meta: {
    instruments: {
      ANTAM: {
        instrument: 'ANTAM',
        latestDate: '2026-04-20',
        latestPrice: 2668623,
        delta: 12000
      },
      SP500: {
        instrument: 'SP500',
        delta: 12.5
      },
      IHSG: {
        instrument: 'IHSG',
        delta: 18.2
      },
      BTC: {
        instrument: 'BTC',
        delta: 245.3
      }
    }
  }
}

test('ringkasan pasar tetap sekunder dan muncul di detail lanjutan', async ({ page }) => {
  await page.route('**/api/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'test.jwt.token',
        user: {
          fullname: 'Playwright User',
          email: 'playwright@example.com',
          plan: 'pro'
        }
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

  await page.route('**/api/market/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], note: '' })
    })
  })

  await page.goto('/login')
  await page.getByLabel('Email').fill('playwright@example.com')
  await page.getByLabel('Password').fill('supersecret')
  await page.getByRole('button', { name: 'Masuk' }).click()

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: /Kecocokan Portofolio|Portfolio Fit/ })).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Ringkasan Pasar' })).toHaveCount(0)

  await page.getByText(/Konteks Lanjutan|Advanced Context/).click()
  await page.getByText(/Tampilkan detail data|Show data detail/).click()

  await expect(page.getByRole('heading', { name: 'Ringkasan Pasar' })).toBeVisible()
  await expect(page.getByText(/EMAS \(IDR\)/)).toBeVisible()
})
