# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai-chat.spec.ts >> ai chat smoke >> loads the public Ting AI route without console errors
- Location: tests\ai-chat.spec.ts:47:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Meja Briefing Ting AI' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Meja Briefing Ting AI' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - navigation [ref=e4]:
      - generic [ref=e5]:
        - link "Kembali" [ref=e6] [cursor=pointer]:
          - /url: /
          - img [ref=e7]
          - text: Kembali
        - generic [ref=e9]:
          - img [ref=e11]
          - generic [ref=e13]: Ting AI
        - generic [ref=e14]:
          - link "Masuk" [ref=e15] [cursor=pointer]:
            - /url: /login
          - link "Lihat Pro" [ref=e16] [cursor=pointer]:
            - /url: /upgrade
    - main [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]:
            - generic [ref=e21]: Kopilot Portofolio AI
            - generic [ref=e22]: Indonesia
          - heading "Pahami portofolio, bukan cuma pasar." [level=1] [ref=e23]
          - paragraph [ref=e24]: Masukkan alokasi. Ting AI membaca konsentrasi, risiko, dan konteks pasar tanpa memberi sinyal beli atau jual.
        - generic [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e30]: Gratis
            - generic [ref=e31]:
              - generic [ref=e32]: Komposisi
              - generic [ref=e33]: Risiko utama
              - generic [ref=e34]: Konteks IHSG
          - generic [ref=e35]:
            - generic [ref=e36]:
              - img [ref=e37]
              - generic [ref=e39]: Pro
            - generic [ref=e40]:
              - generic [ref=e41]: Lapisan intelijen
              - generic [ref=e42]: Dampak detail
              - generic [ref=e43]: Skenario risiko
        - generic [ref=e45]:
          - generic [ref=e47]:
            - 'textbox "Contoh: BBCA 40%, BBRI 30%, TLKM 30%" [ref=e48]'
            - generic [ref=e49]:
              - generic [ref=e50]:
                - button "Opsi 1" [ref=e51]
                - button "Opsi 2" [ref=e52]
                - button "Opsi 3" [ref=e53]
              - button "Analisis Portofolio" [disabled] [ref=e54]
          - paragraph [ref=e55]: Tekan Ctrl + Enter untuk menganalisis cepat
      - generic [ref=e56]:
        - generic [ref=e57]:
          - generic [ref=e58]:
            - generic [ref=e59]: Konteks Pasar
            - generic [ref=e60]: Tertunda
          - heading "Kondisi IDX hari ini" [level=2] [ref=e62]
          - paragraph [ref=e63]: IHSG membantu membaca tekanan pasar saham Indonesia, terutama jika portofoliomu berisi saham domestik.
        - generic [ref=e64]:
          - generic [ref=e65]:
            - generic [ref=e66]:
              - generic [ref=e67]:
                - generic [ref=e68]: IDX / IHSG
                - generic [ref=e69]: Tertunda
              - paragraph [ref=e71]: Konteks pasar Indonesia hari ini
            - generic [ref=e72]: Bullish
          - generic [ref=e73]:
            - generic [ref=e74]:
              - generic [ref=e75]: "20"
              - generic [ref=e76]: Naik
            - generic [ref=e77]:
              - generic [ref=e78]: "1"
              - generic [ref=e79]: Turun
            - generic [ref=e80]:
              - generic [ref=e81]: +0,52%
              - generic [ref=e82]: Rata-rata
          - generic [ref=e83]:
            - generic [ref=e84]: Pergerakan signifikan
            - generic [ref=e85]:
              - generic [ref=e86]:
                - generic [ref=e87]: SI=F
                - generic [ref=e88]: +3,80%
              - generic [ref=e89]:
                - generic [ref=e90]: BTC-USD
                - generic [ref=e91]: +2,67%
              - generic [ref=e92]:
                - generic [ref=e93]: CL=F
                - generic [ref=e94]: "-2,49%"
              - generic [ref=e95]:
                - generic [ref=e96]: ETH-USD
                - generic [ref=e97]: +2,05%
              - generic [ref=e98]:
                - generic [ref=e99]: XRP-USD
                - generic [ref=e100]: +1,97%
              - generic [ref=e101]:
                - generic [ref=e102]: SOL-USD
                - generic [ref=e103]: +1,49%
          - paragraph [ref=e104]: Berdasarkan 21 emiten IDX - bukan rekomendasi investasi
        - generic [ref=e105]:
          - generic [ref=e106]:
            - generic [ref=e107]:
              - text: Visualisasi teknikal
              - generic [ref=e108]:
                - heading "IHSG" [level=3] [ref=e109]
                - generic [ref=e110]: Data IHSG belum tersedia.
            - generic [ref=e111]:
              - button "5H" [ref=e112]
              - button "1B" [ref=e113]
              - button "3B" [ref=e114]
              - button "6B" [ref=e115]
          - img [ref=e120]:
            - generic [ref=e124]:
              - generic [ref=e126]: 01 Apr
              - generic [ref=e128]: 02 Apr
              - generic [ref=e130]: 06 Apr
              - generic [ref=e132]: 07 Apr
              - generic [ref=e134]: 08 Apr
              - generic [ref=e136]: 09 Apr
              - generic [ref=e138]: 10 Apr
              - generic [ref=e140]: 13 Apr
              - generic [ref=e142]: 14 Apr
              - generic [ref=e144]: 15 Apr
              - generic [ref=e146]: 16 Apr
              - generic [ref=e148]: 17 Apr
              - generic [ref=e150]: 20 Apr
              - generic [ref=e152]: 21 Apr
              - generic [ref=e154]: 22 Apr
              - generic [ref=e156]: 23 Apr
              - generic [ref=e158]: 24 Apr
              - generic [ref=e160]: 27 Apr
              - generic [ref=e162]: 28 Apr
              - generic [ref=e164]: 30 Apr
            - generic [ref=e166]:
              - generic [ref=e168]: "6.750"
              - generic [ref=e170]: "7.000"
              - generic [ref=e172]: "7.250"
              - generic [ref=e174]: "7.500"
              - generic [ref=e176]: "7.750"
          - generic [ref=e183]:
            - generic [ref=e184]: Min Rentang 6.956,8
            - generic [ref=e185]: Maks Rentang 7.675,95
        - generic [ref=e186]:
          - generic [ref=e187]:
            - button "BBCA Bank ↑ 5.850 +0,00%" [ref=e188]:
              - generic [ref=e189]:
                - generic [ref=e190]:
                  - generic [ref=e191]: BBCA
                  - generic [ref=e192]: Bank
                - generic [ref=e193]: ↑
              - generic [ref=e194]:
                - generic [ref=e195]: "5.850"
                - generic [ref=e196]: +0,00%
            - button "BBRI Bank ↑ 2.990 +0,00%" [ref=e197]:
              - generic [ref=e198]:
                - generic [ref=e199]:
                  - generic [ref=e200]: BBRI
                  - generic [ref=e201]: Bank
                - generic [ref=e202]: ↑
              - generic [ref=e203]:
                - generic [ref=e204]: "2.990"
                - generic [ref=e205]: +0,00%
            - button "BMRI Bank ↑ 4.390 +0,00%" [ref=e206]:
              - generic [ref=e207]:
                - generic [ref=e208]:
                  - generic [ref=e209]: BMRI
                  - generic [ref=e210]: Bank
                - generic [ref=e211]: ↑
              - generic [ref=e212]:
                - generic [ref=e213]: "4.390"
                - generic [ref=e214]: +0,00%
            - button "BBNI Bank ↑ 3.720 +0,00%" [ref=e215]:
              - generic [ref=e216]:
                - generic [ref=e217]:
                  - generic [ref=e218]: BBNI
                  - generic [ref=e219]: Bank
                - generic [ref=e220]: ↑
              - generic [ref=e221]:
                - generic [ref=e222]: "3.720"
                - generic [ref=e223]: +0,00%
            - button "TLKM Telco ↑ 2.810 +0,00%" [ref=e224]:
              - generic [ref=e225]:
                - generic [ref=e226]:
                  - generic [ref=e227]: TLKM
                  - generic [ref=e228]: Telco
                - generic [ref=e229]: ↑
              - generic [ref=e230]:
                - generic [ref=e231]: "2.810"
                - generic [ref=e232]: +0,00%
            - button "GOTO Tech ↑ 54 +0,00%" [ref=e233]:
              - generic [ref=e234]:
                - generic [ref=e235]:
                  - generic [ref=e236]: GOTO
                  - generic [ref=e237]: Tech
                - generic [ref=e238]: ↑
              - generic [ref=e239]:
                - generic [ref=e240]: "54"
                - generic [ref=e241]: +0,00%
            - button "ASII Industri ↑ 5.975 +0,00%" [ref=e242]:
              - generic [ref=e243]:
                - generic [ref=e244]:
                  - generic [ref=e245]: ASII
                  - generic [ref=e246]: Industri
                - generic [ref=e247]: ↑
              - generic [ref=e248]:
                - generic [ref=e249]: "5.975"
                - generic [ref=e250]: +0,00%
            - button "ADRO Energi ↑ 2.520 +0,00%" [ref=e251]:
              - generic [ref=e252]:
                - generic [ref=e253]:
                  - generic [ref=e254]: ADRO
                  - generic [ref=e255]: Energi
                - generic [ref=e256]: ↑
              - generic [ref=e257]:
                - generic [ref=e258]: "2.520"
                - generic [ref=e259]: +0,00%
            - button "PTBA Energi ↑ 2.870 +0,00%" [ref=e260]:
              - generic [ref=e261]:
                - generic [ref=e262]:
                  - generic [ref=e263]: PTBA
                  - generic [ref=e264]: Energi
                - generic [ref=e265]: ↑
              - generic [ref=e266]:
                - generic [ref=e267]: "2.870"
                - generic [ref=e268]: +0,00%
            - button "ANTM Tambang ↑ 3.740 +0,00%" [ref=e269]:
              - generic [ref=e270]:
                - generic [ref=e271]:
                  - generic [ref=e272]: ANTM
                  - generic [ref=e273]: Tambang
                - generic [ref=e274]: ↑
              - generic [ref=e275]:
                - generic [ref=e276]: "3.740"
                - generic [ref=e277]: +0,00%
            - button "ICBP Konsumer ↑ 6.775 +0,00%" [ref=e278]:
              - generic [ref=e279]:
                - generic [ref=e280]:
                  - generic [ref=e281]: ICBP
                  - generic [ref=e282]: Konsumer
                - generic [ref=e283]: ↑
              - generic [ref=e284]:
                - generic [ref=e285]: "6.775"
                - generic [ref=e286]: +0,00%
            - button "INDF Konsumer ↑ 6.750 +0,00%" [ref=e287]:
              - generic [ref=e288]:
                - generic [ref=e289]:
                  - generic [ref=e290]: INDF
                  - generic [ref=e291]: Konsumer
                - generic [ref=e292]: ↑
              - generic [ref=e293]:
                - generic [ref=e294]: "6.750"
                - generic [ref=e295]: +0,00%
            - button "UNVR Konsumer ↑ 1.535 +0,00%" [ref=e296]:
              - generic [ref=e297]:
                - generic [ref=e298]:
                  - generic [ref=e299]: UNVR
                  - generic [ref=e300]: Konsumer
                - generic [ref=e301]: ↑
              - generic [ref=e302]:
                - generic [ref=e303]: "1.535"
                - generic [ref=e304]: +0,00%
            - button "GC=F COMMODITY ↑ US$4.649,40 +0,75%" [ref=e305]:
              - generic [ref=e306]:
                - generic [ref=e307]:
                  - generic [ref=e308]: GC=F
                  - generic [ref=e309]: COMMODITY
                - generic [ref=e310]: ↑
              - generic [ref=e311]:
                - generic [ref=e312]: US$4.649,40
                - generic [ref=e313]: +0,75%
            - button "SI=F COMMODITY ↑ US$76,33 +3,80%" [ref=e314]:
              - generic [ref=e315]:
                - generic [ref=e316]:
                  - generic [ref=e317]: SI=F
                  - generic [ref=e318]: COMMODITY
                - generic [ref=e319]: ↑
              - generic [ref=e320]:
                - generic [ref=e321]: US$76,33
                - generic [ref=e322]: +3,80%
            - button "CL=F COMMODITY ↓ US$102,45 -2,49%" [ref=e323]:
              - generic [ref=e324]:
                - generic [ref=e325]:
                  - generic [ref=e326]: CL=F
                  - generic [ref=e327]: COMMODITY
                - generic [ref=e328]: ↓
              - generic [ref=e329]:
                - generic [ref=e330]: US$102,45
                - generic [ref=e331]: "-2,49%"
            - button "BTC-USD CRYPTO ↑ US$78.341,31 +2,67%" [ref=e332]:
              - generic [ref=e333]:
                - generic [ref=e334]:
                  - generic [ref=e335]: BTC-USD
                  - generic [ref=e336]: CRYPTO
                - generic [ref=e337]: ↑
              - generic [ref=e338]:
                - generic [ref=e339]: US$78.341,31
                - generic [ref=e340]: +2,67%
            - button "ETH-USD CRYPTO ↑ US$2.302,41 +2,05%" [ref=e341]:
              - generic [ref=e342]:
                - generic [ref=e343]:
                  - generic [ref=e344]: ETH-USD
                  - generic [ref=e345]: CRYPTO
                - generic [ref=e346]: ↑
              - generic [ref=e347]:
                - generic [ref=e348]: US$2.302,41
                - generic [ref=e349]: +2,05%
            - button "SOL-USD CRYPTO ↑ US$84,26 +1,49%" [ref=e350]:
              - generic [ref=e351]:
                - generic [ref=e352]:
                  - generic [ref=e353]: SOL-USD
                  - generic [ref=e354]: CRYPTO
                - generic [ref=e355]: ↑
              - generic [ref=e356]:
                - generic [ref=e357]: US$84,26
                - generic [ref=e358]: +1,49%
            - button "BNB-USD CRYPTO ↑ US$619,92 +0,79%" [ref=e359]:
              - generic [ref=e360]:
                - generic [ref=e361]:
                  - generic [ref=e362]: BNB-USD
                  - generic [ref=e363]: CRYPTO
                - generic [ref=e364]: ↑
              - generic [ref=e365]:
                - generic [ref=e366]: US$619,92
                - generic [ref=e367]: +0,79%
            - button "XRP-USD CRYPTO ↑ US$1,39 +1,97%" [ref=e368]:
              - generic [ref=e369]:
                - generic [ref=e370]:
                  - generic [ref=e371]: XRP-USD
                  - generic [ref=e372]: CRYPTO
                - generic [ref=e373]: ↑
              - generic [ref=e374]:
                - generic [ref=e375]: US$1,39
                - generic [ref=e376]: +1,97%
          - generic [ref=e377]:
            - generic [ref=e378]: 20Bullish
            - generic [ref=e379]: 1Bearish
            - text: Klik untuk visualisasi teknikal
        - generic [ref=e380]:
          - generic [ref=e381]:
            - generic [ref=e382]:
              - text: Visualisasi teknikal
              - generic [ref=e383]:
                - heading "BBCA" [level=3] [ref=e384]
                - generic [ref=e385]: 5.850+0,00%
            - generic [ref=e386]:
              - button "5H" [ref=e387]
              - button "1B" [ref=e388]
              - button "3B" [ref=e389]
              - button "6B" [ref=e390]
          - img [ref=e395]:
            - generic [ref=e399]:
              - generic [ref=e401]: 01 Apr
              - generic [ref=e403]: 02 Apr
              - generic [ref=e405]: 06 Apr
              - generic [ref=e407]: 07 Apr
              - generic [ref=e409]: 08 Apr
              - generic [ref=e411]: 09 Apr
              - generic [ref=e413]: 10 Apr
              - generic [ref=e415]: 13 Apr
              - generic [ref=e417]: 14 Apr
              - generic [ref=e419]: 15 Apr
              - generic [ref=e421]: 16 Apr
              - generic [ref=e423]: 17 Apr
              - generic [ref=e425]: 20 Apr
              - generic [ref=e427]: 21 Apr
              - generic [ref=e429]: 22 Apr
              - generic [ref=e431]: 23 Apr
              - generic [ref=e433]: 24 Apr
              - generic [ref=e435]: 27 Apr
              - generic [ref=e437]: 28 Apr
              - generic [ref=e439]: 30 Apr
            - generic [ref=e441]:
              - generic [ref=e443]: "5.750"
              - generic [ref=e445]: "6.000"
              - generic [ref=e447]: "6.250"
              - generic [ref=e449]: "6.500"
              - generic [ref=e451]: "6.750"
          - generic [ref=e458]:
            - generic [ref=e459]: Min Rentang 5.850
            - generic [ref=e460]: Maks Rentang 6.750
      - generic [ref=e461]:
        - generic [ref=e462]:
          - generic [ref=e463]:
            - heading "Filosofi Analisis" [level=4] [ref=e464]
            - paragraph [ref=e465]: Ting AI membaca konsentrasi, korelasi sektoral, dan sensitivitas portofolio terhadap kondisi pasar. Investor ritel membutuhkan kejernihan, bukan sinyal transaksi.
          - generic [ref=e466]:
            - heading "Metodologi Data" [level=4] [ref=e467]
            - paragraph [ref=e468]: Harga disinkronkan berkala melalui sumber pasar publik. Seluruh analisis bersifat informatif dan bukan saran investasi.
        - paragraph [ref=e469]: Ting AI - Intelligence Engine v2.1 - Dibangun oleh Faturachman Alkahfi - Bukan rekomendasi investasi
  - generic [ref=e470]: "5.750"
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test'
  2   | 
  3   | const mockSession = {
  4   |   authenticated: true,
  5   |   user: {
  6   |     fullname: 'Playwright User',
  7   |     email: 'playwright@example.com'
  8   |   }
  9   | }
  10  | 
  11  | const mockInvestmentSummary = {
  12  |   summary: 'Risk tone is constructive and macro pressure is contained for now.',
  13  |   meta: {
  14  |     context: {
  15  |       riskTone: 'Constructive',
  16  |       regime: 'Risk-on',
  17  |       conviction: 'Medium',
  18  |       stressState: 'Contained',
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
> 57  |     await expect(page.getByRole('heading', { name: 'Meja Briefing Ting AI' })).toBeVisible()
      |                                                                                ^ Error: expect(locator).toBeVisible() failed
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
  119 |     await page.getByLabel('Password').fill('supersecret')
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