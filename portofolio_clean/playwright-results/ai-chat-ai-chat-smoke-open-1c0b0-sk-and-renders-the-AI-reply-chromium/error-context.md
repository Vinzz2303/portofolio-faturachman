# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai-chat.spec.ts >> ai chat smoke >> opens the reasoning desk and renders the AI reply
- Location: tests\ai-chat.spec.ts:61:3

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel('Password') resolved to 2 elements:
    1) <input value="" required="" type="password" id="login-password" class="auth-field-input" autocomplete="current-password" placeholder="Masukkan password Anda"/> aka getByRole('textbox', { name: 'Password' })
    2) <button type="button" tabindex="-1" class="auth-field-toggle" aria-label="Toggle password visibility">…</button> aka getByRole('button', { name: 'Toggle password visibility' })

Call log:
  - waiting for getByLabel('Password')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - img [ref=e8]
      - generic [ref=e11]: Ting AI
    - generic [ref=e12]:
      - heading "AI Copilot untuk Investasi yang Lebih Cerdas" [level=2] [ref=e13]
      - paragraph [ref=e14]: Interface berbasis kejernihan yang menggabungkan konteks makro, kesadaran portofolio, dan dukungan keputusan berbasis AI — sebelum Anda bertransaksi.
      - generic [ref=e15]:
        - generic [ref=e16]:
          - img [ref=e18]
          - generic [ref=e21]:
            - paragraph [ref=e22]: AI Decision Intelligence
            - paragraph [ref=e23]: Insight berbasis data & konteks pasar
        - generic [ref=e24]:
          - img [ref=e26]
          - generic [ref=e28]:
            - paragraph [ref=e29]: Risk & Portfolio Awareness
            - paragraph [ref=e30]: Pahami risiko sebelum mengambil keputusan
        - generic [ref=e31]:
          - img [ref=e33]
          - generic [ref=e35]:
            - paragraph [ref=e36]: Real-time Market Context
            - paragraph [ref=e37]: Update kondisi pasar secara real-time
    - img [ref=e39]
    - generic [ref=e42]:
      - generic [ref=e43]:
        - img [ref=e44]
        - generic [ref=e47]:
          - paragraph [ref=e48]: Data terenkripsi end-to-end
          - paragraph [ref=e49]: Keamanan tingkat bank
      - generic [ref=e50]:
        - img [ref=e51]
        - generic [ref=e53]:
          - paragraph [ref=e54]: Tidak ada data dijual
          - paragraph [ref=e55]: Privasi Anda prioritas kami
      - generic [ref=e56]:
        - img [ref=e57]
        - generic [ref=e60]:
          - paragraph [ref=e61]: Dibuat untuk investor ritel
          - paragraph [ref=e62]: Sederhana, cerdas, relevan
  - generic [ref=e64]:
    - generic [ref=e65]:
      - button "EN" [ref=e66] [cursor=pointer]:
        - img [ref=e67]
        - text: EN
      - generic [ref=e70]:
        - img [ref=e71]
        - text: Aman & Terlindungi
    - generic [ref=e73]: Selamat datang kembali
    - heading "Masuk ke Ting AI" [level=1] [ref=e74]
    - paragraph [ref=e75]: Buka Morning Command Center, workspace portofolio, dan ringkasan pasar hari ini.
    - generic [ref=e76]:
      - generic [ref=e77]:
        - generic [ref=e78]: Alamat email
        - generic [ref=e79]:
          - img
          - textbox "Alamat email" [active] [ref=e80]:
            - /placeholder: Masukkan email Anda
            - text: playwright@example.com
      - generic [ref=e81]:
        - generic [ref=e82]: Password
        - generic [ref=e83]:
          - img
          - textbox "Password" [ref=e84]:
            - /placeholder: Masukkan password Anda
          - button "Toggle password visibility" [ref=e85] [cursor=pointer]:
            - img [ref=e86]
      - generic [ref=e89]:
        - generic [ref=e90] [cursor=pointer]: Ingat saya
        - link "Lupa password?" [ref=e92] [cursor=pointer]:
          - /url: /forgot
      - button "Masuk ke Ting AI" [ref=e93] [cursor=pointer]:
        - text: Masuk ke Ting AI
        - img [ref=e94]
    - generic [ref=e97]: atau lanjutkan dengan
    - generic [ref=e98]:
      - button "Google" [ref=e99] [cursor=pointer]:
        - img [ref=e100]
        - text: Google
      - button "Apple" [ref=e105] [cursor=pointer]:
        - img [ref=e106]
        - text: Apple
      - button "Email" [ref=e108] [cursor=pointer]:
        - img [ref=e109]
        - text: Email
    - paragraph [ref=e112]:
      - text: Belum punya akun?
      - link "Buat akun baru" [ref=e113] [cursor=pointer]:
        - /url: /signup
        - text: Buat akun baru
        - img [ref=e114]
```

# Test source

```ts
  19  |       macroContext: 'Dollar pressure is stable and yields are not accelerating.',
  20  |       geopoliticContext: 'No major geopolitic shock is dominating this session.',
  21  |       externalContext: 'Headline flow is supportive but still mixed.',
  22  |       externalWhyItMatters: 'It keeps the brief usable without forcing a defensive read.',
  23  |       headlinePressure: 'Medium',
  24  |       watchLevel: 'Watch BTC and US equities follow-through',
  25  |       overnightContext: 'Overnight price action stayed orderly across major assets.',
  26  |       drivers: [],
  27  |       macroSignals: [],
  28  |       stressDrivers: [],
  29  |       headlines: [],
  30  |       watchItems: []
  31  |     }
  32  |   }
  33  | }
  34  | 
  35  | const mockPortfolio = {
  36  |   summary: {
  37  |     totalInvested: 1500,
  38  |     totalCurrentValue: 1800,
  39  |     totalPnl: 300,
  40  |     totalPnlPct: 20,
  41  |     totalHoldings: 1
  42  |   },
  43  |   holdings: []
  44  | }
  45  | 
  46  | test.describe('ai chat smoke', () => {
  47  |   test('loads the public Ting AI route without console errors', async ({ page }) => {
  48  |     const consoleErrors: string[] = []
  49  |     page.on('console', (message) => {
  50  |       if (message.type() === 'error') {
  51  |         consoleErrors.push(message.text())
  52  |       }
  53  |     })
  54  | 
  55  |     await page.goto('/ting-ai')
  56  | 
  57  |     await expect(page.getByRole('heading', { name: 'Meja Briefing Ting AI' })).toBeVisible()
  58  |     expect(consoleErrors).toEqual([])
  59  |   })
  60  | 
  61  |   test('opens the reasoning desk and renders the AI reply', async ({ page }) => {
  62  |     await page.route('**/api/login', async (route) => {
  63  |       await route.fulfill({
  64  |         status: 200,
  65  |         contentType: 'application/json',
  66  |         body: JSON.stringify({
  67  |           token: 'test.jwt.token',
  68  |           user: mockSession.user
  69  |         })
  70  |       })
  71  |     })
  72  | 
  73  |     await page.route('**/api/auth/session', async (route) => {
  74  |       await route.fulfill({
  75  |         status: 200,
  76  |         contentType: 'application/json',
  77  |         body: JSON.stringify(mockSession)
  78  |       })
  79  |     })
  80  | 
  81  |     await page.route('**/api/investment-summary', async (route) => {
  82  |       await route.fulfill({
  83  |         status: 200,
  84  |         contentType: 'application/json',
  85  |         body: JSON.stringify(mockInvestmentSummary)
  86  |       })
  87  |     })
  88  | 
  89  |     await page.route('**/api/portfolio/summary', async (route) => {
  90  |       await route.fulfill({
  91  |         status: 200,
  92  |         contentType: 'application/json',
  93  |         body: JSON.stringify(mockPortfolio)
  94  |       })
  95  |     })
  96  | 
  97  |     await page.route('**/api/market/**', async (route) => {
  98  |       await route.fulfill({
  99  |         status: 200,
  100 |         contentType: 'application/json',
  101 |         body: JSON.stringify({ data: [], note: '' })
  102 |       })
  103 |     })
  104 | 
  105 |     await page.route('**/api/ai-chat', async (route) => {
  106 |       const payload = route.request().postDataJSON() as { messages?: Array<{ content?: string }> }
  107 | 
  108 |       await route.fulfill({
  109 |         status: 200,
  110 |         contentType: 'application/json',
  111 |         body: JSON.stringify({
  112 |           reply: `Ringkasan aktif untuk pertanyaan: ${payload.messages?.at(-1)?.content || ''}`
  113 |         })
  114 |       })
  115 |     })
  116 | 
  117 |     await page.goto('/login')
  118 |     await page.getByLabel('Email').fill('playwright@example.com')
> 119 |     await page.getByLabel('Password').fill('supersecret')
      |                                       ^ Error: locator.fill: Error: strict mode violation: getByLabel('Password') resolved to 2 elements:
  120 |     await page.getByRole('button', { name: 'Masuk ke Dashboard' }).click()
  121 | 
  122 |     await expect(page).toHaveURL(/\/dashboard$/)
  123 |     await page
  124 |       .getByRole('link', { name: /Pahami dampaknya ke portofolio Anda|Lihat implikasi lengkap/i })
  125 |       .click()
  126 | 
  127 |     await expect(page).toHaveURL(/\/ting-ai$/)
  128 |     await expect(page.getByRole('heading', { name: 'Meja Briefing Ting AI' })).toBeVisible()
  129 |     await expect(page.getByText(/Reasoning Surface|Surface Reasoning/)).toBeVisible()
  130 | 
  131 |     const chatInput = page.getByRole('textbox', { name: /Tanyakan konteks|Tanyakan kondisi/i })
  132 |     await chatInput.fill('What matters most this morning?')
  133 |     await page.getByRole('button', { name: 'Kirim' }).click()
  134 | 
  135 |     await expect(page.locator('.ai-msg.user .ai-msg-content').last()).toHaveText(
  136 |       'What matters most this morning?'
  137 |     )
  138 |     await expect(page.locator('.ai-msg.assistant .ai-msg-content').last()).toContainText(
  139 |       'Ringkasan aktif untuk pertanyaan: What matters most this morning?'
  140 |     )
  141 |   })
  142 | })
  143 | 
```