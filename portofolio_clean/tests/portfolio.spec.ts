import { expect, test } from '@playwright/test'

const mockAssets = {
  assets: [
    {
      id: 1,
      symbol: 'BTC',
      name: 'Bitcoin',
      quoteCurrency: 'USD',
      assetType: 'Crypto',
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
      assetType: 'Crypto',
      region: 'Global',
      fetchedAt: '2026-04-09T06:00:00.000Z'
    }
  ]
}

const mockSession = {
  authenticated: true,
  user: {
    fullname: 'Playwright User',
    email: 'playwright@example.com'
  }
}

test.describe('portfolio smoke', () => {
  test.beforeEach(async ({ page }) => {
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

    await page.route('**/api/assets', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAssets)
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
        body: JSON.stringify(mockPortfolio)
      })
    })

    await page.route('**/api/portfolio/holdings/101', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 101,
          assetId: 1,
          symbol: 'BTC',
          name: 'Bitcoin',
          quantity: 0.05,
          entryPrice: 61000,
          investedAmount: 3050
        })
      })
    })
  })

  test('shows the protected portfolio workspace with holdings data', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('playwright@example.com')
    await page.getByLabel('Password').fill('supersecret')
    await page.getByRole('button', { name: 'Masuk ke Dashboard' }).click()

    await page.goto('/portfolio')

    await expect(page).toHaveURL(/\/portfolio$/)
    await expect(page.getByRole('heading', { name: 'Insight Portofolio' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Intelijensi Portofolio' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Daftar Posisi' })).toBeVisible()
    await expect(page.locator('.portfolio-row').filter({ hasText: 'BTC' })).toHaveCount(1)
    await expect(page.locator('.portfolio-row').filter({ hasText: 'Bitcoin' })).toHaveCount(1)
    await expect(page.getByText('Belum ada posisi. Tambahkan posisi pertama Anda untuk mulai melacak PnL.')).toHaveCount(0)
  })

  test('can switch an existing holding into edit mode and submit the update', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('playwright@example.com')
    await page.getByLabel('Password').fill('supersecret')
    await page.getByRole('button', { name: 'Masuk ke Dashboard' }).click()

    await page.goto('/portfolio')
    await page.getByRole('button', { name: 'Edit' }).click()

    await expect(page.getByRole('heading', { name: 'Edit Posisi' })).toBeVisible()
    await expect(page.getByLabel('Aset', { exact: true })).toBeDisabled()

    await page.getByLabel('Kuantitas').fill('0.05')
    await page.getByLabel('Harga Entry').fill('61000')
    await page.getByRole('button', { name: 'Simpan Perubahan' }).click()

    await expect(page.getByText('Posisi berhasil diperbarui.')).toBeVisible()
  })
})
