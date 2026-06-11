import axios from 'axios'

export type MarketNewsTopic =
  | 'ihsg'
  | 'banking'
  | 'gold'
  | 'crypto'
  | 'us_market'
  | 'macro'
  | 'general'

export type MarketNewsDataStatus = 'live' | 'delayed' | 'cached' | 'unavailable'

export type MarketNewsItem = {
  title: string
  source: string
  url: string
  publishedAt: string
  relatedSymbols: string[]
  topic: MarketNewsTopic
  relevanceReason: string
  dataStatus: Exclude<MarketNewsDataStatus, 'unavailable'>
}

export type MarketNewsResponse = {
  items: MarketNewsItem[]
  dataStatus: MarketNewsDataStatus
  lastUpdated: string | null
  message: string | null
}

type AlphaVantageNewsItem = {
  title?: string
  url?: string
  time_published?: string
  authors?: string[]
  summary?: string
  source?: string
  ticker_sentiment?: Array<{ ticker?: string }>
}

type AlphaVantageNewsResponse = {
  feed?: AlphaVantageNewsItem[]
  Information?: string
  Note?: string
}

type MarketauxNewsItem = {
  title?: string
  description?: string
  url?: string
  source?: string
  published_at?: string
  entities?: Array<{ symbol?: string }>
}

type MarketauxNewsResponse = {
  data?: MarketauxNewsItem[]
}

type RssNewsItem = {
  title: string
  url: string
  publishedAt: string
  source: string
}

const PROVIDER_TIMEOUT_MS = Number(process.env.NEWS_PROVIDER_TIMEOUT_MS || process.env.PROVIDER_TIMEOUT_MS || 3500)
const CACHE_TTL_MS = Number(process.env.NEWS_CACHE_TTL_MS || 15 * 60 * 1000)

let lastGoodCache: { response: MarketNewsResponse; storedAt: number } | null = null

const normalizeSymbol = (symbol: string) => symbol.trim().toUpperCase()

const normalizeSymbols = (symbols: string[]) =>
  [...new Set(symbols.map(normalizeSymbol).filter(Boolean))].slice(0, 20)

const INDONESIA_STOCK_SYMBOLS = new Set([
  'BBCA',
  'BMRI',
  'BBRI',
  'BBNI',
  'TLKM',
  'ASII',
  'UNTR',
  'INDF',
  'ICBP',
  'AMMN',
  'BRPT',
  'ADRO',
  'PTBA',
  'ITMG',
])

const expandIndonesiaSymbols = (symbols: string[]) => {
  const normalized = normalizeSymbols(symbols)
  const expanded = new Set<string>(normalized)
  normalized.forEach((symbol) => {
    const bare = symbol.replace(/\.JK$/i, '')
    if (INDONESIA_STOCK_SYMBOLS.has(bare)) {
      expanded.add(bare)
      expanded.add(`${bare}.JK`)
    }
  })
  return [...expanded].slice(0, 24)
}

const hasAny = (text: string, words: string[]) => words.some((word) => text.includes(word))

const inferTopic = (title: string, summary: string, symbols: string[]): MarketNewsTopic => {
  const text = `${title} ${summary} ${symbols.join(' ')}`.toLowerCase()
  if (hasAny(text, ['bbca', 'bmri', 'bbri', 'bni', 'banking', 'bank ', 'banks ', 'bank indonesia', 'bi rate'])) return 'banking'
  if (hasAny(text, ['ihsg', 'idx ', 'jakarta composite', 'indonesia stock', '.jk'])) return 'ihsg'
  if (hasAny(text, ['gold', 'xau', 'gld', 'treasury yield', 'safe haven'])) return 'gold'
  if (hasAny(text, ['bitcoin', 'btc', 'crypto', 'ethereum', 'etf'])) return 'crypto'
  if (hasAny(text, ['nasdaq', 's&p', 'sp500', 's&p 500', 'spy', 'qqq', 'wall street'])) return 'us_market'
  if (hasAny(text, ['fed', 'inflation', 'rates', 'rate cut', 'rate hike', 'dollar', 'usd', 'macro'])) return 'macro'
  return 'general'
}

const portfolioThemes = (symbols: string[]) => {
  const normalized = expandIndonesiaSymbols(symbols)
  return {
    hasPortfolio: normalized.length > 0,
    hasIdx: normalized.some((symbol) => symbol.endsWith('.JK') || ['^JKSE', 'IHSG'].includes(symbol)),
    hasBanking: normalized.some((symbol) => ['BBCA.JK', 'BMRI.JK', 'BBRI.JK', 'BBNI.JK', 'BBCA', 'BMRI', 'BBRI', 'BBNI'].includes(symbol)),
    hasGold: normalized.some((symbol) => ['XAUUSD', 'XAU/USD', 'GC=F', 'GLD', 'GOLD'].includes(symbol)),
    hasCrypto: normalized.some((symbol) => /BTC|ETH|SOL|BNB|XRP|CRYPTO/.test(symbol)),
    hasUsMarket: normalized.some((symbol) => ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL'].includes(symbol) || /^[A-Z]{1,5}$/.test(symbol)),
  }
}

const getRelevanceReason = (
  topic: MarketNewsTopic,
  relatedSymbols: string[],
  requestedSymbols: string[],
  deeperReason: boolean
) => {
  const themes = portfolioThemes(requestedSymbols)
  const symbols = relatedSymbols.length ? relatedSymbols.join('/') : requestedSymbols.slice(0, 3).join('/')
  const suffix = deeperReason
    ? ' Ini bisa memengaruhi watchlist dan risk budget jika sentimen melebar ke posisi dengan bobot besar.'
    : ''

  if (topic === 'banking' && themes.hasBanking) {
    return `Relevan karena kamu memiliki eksposur ke ${symbols || 'BBCA/BMRI'} dan sektor perbankan.${suffix}`
  }
  if ((topic === 'ihsg' || topic === 'banking') && themes.hasIdx) {
    return `Relevan karena portofolio kamu punya eksposur saham Indonesia atau IDX.${suffix}`
  }
  if (topic === 'gold' && themes.hasGold) {
    return `Relevan karena kamu memiliki eksposur ke emas/XAU yang sensitif terhadap USD, yield AS, inflasi, dan safe haven.${suffix}`
  }
  if (topic === 'crypto' && themes.hasCrypto) {
    return `Relevan karena kamu memiliki eksposur kripto, terutama terhadap BTC dan sentimen risiko global.${suffix}`
  }
  if (topic === 'us_market' && themes.hasUsMarket) {
    return `Relevan karena eksposur saham AS biasanya sensitif terhadap Nasdaq, S&P 500, earnings, dan risk appetite.${suffix}`
  }
  if (topic === 'macro') {
    return `Relevan sebagai konteks makro untuk membaca suku bunga, USD, inflasi, dan risk appetite portofolio.${suffix}`
  }
  if (!themes.hasPortfolio) {
    return 'Berita market umum untuk membaca kondisi pasar sebelum portofolio ditambahkan.'
  }
  return `Relevan sebagai konteks pasar umum untuk aset ${requestedSymbols.slice(0, 3).join('/') || 'di portofolio kamu'}.${suffix}`
}

const scoreItem = (item: MarketNewsItem, requestedSymbols: string[]) => {
  const themes = portfolioThemes(requestedSymbols)
  const expandedSymbols = expandIndonesiaSymbols(requestedSymbols)
  let score = 1
  if (item.relatedSymbols.some((symbol) => expandedSymbols.includes(symbol))) score += 4
  if (themes.hasBanking && item.topic === 'banking') score += 4
  if (themes.hasIdx && (item.topic === 'ihsg' || item.topic === 'banking' || item.topic === 'macro')) score += 3
  if (themes.hasGold && item.topic === 'gold') score += 4
  if (themes.hasCrypto && item.topic === 'crypto') score += 4
  if (themes.hasUsMarket && item.topic === 'us_market') score += 3
  if (item.topic === 'macro') score += 1
  return score
}

const stripCdata = (value: string) => value.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '')

const decodeXml = (value: string) =>
  stripCdata(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()

const tagValue = (xml: string, tag: string) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match ? decodeXml(match[1]) : ''
}

const parseGoogleNewsRss = (xml: string): RssNewsItem[] => {
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || []
  return itemMatches
    .map((itemXml) => {
      const title = tagValue(itemXml, 'title')
      const url = tagValue(itemXml, 'link')
      const publishedAt = tagValue(itemXml, 'pubDate')
      const source = tagValue(itemXml, 'source') || title.split(' - ').pop() || 'Google News'
      const cleanTitle = title.includes(' - ') ? title.split(' - ').slice(0, -1).join(' - ') : title
      return {
        title: cleanTitle,
        url,
        publishedAt,
        source,
      }
    })
    .filter((item) => item.title && item.url)
}

const buildGoogleNewsQueries = (requestedSymbols: string[]) => {
  const themes = portfolioThemes(requestedSymbols)
  const expanded = expandIndonesiaSymbols(requestedSymbols)
  const bareSymbols = expanded.map((symbol) => symbol.replace(/\.JK$/i, ''))
  const queries: string[] = []

  if (themes.hasBanking) queries.push(`${bareSymbols.filter((symbol) => ['BBCA', 'BMRI', 'BBRI', 'BBNI'].includes(symbol)).join(' OR ') || 'BBCA OR BMRI'} saham bank IHSG`)
  if (themes.hasIdx) queries.push(`${bareSymbols.filter((symbol) => INDONESIA_STOCK_SYMBOLS.has(symbol)).join(' OR ') || 'IHSG'} Bursa Efek Indonesia`)
  if (themes.hasGold) queries.push('harga emas XAU USD yield inflasi')
  if (themes.hasCrypto) queries.push('Bitcoin BTC ETF regulation crypto market')
  if (themes.hasUsMarket) queries.push('Nasdaq S&P 500 earnings market')
  if (!queries.length) queries.push('IHSG saham Indonesia market')

  return [...new Set(queries)].slice(0, 3)
}

const toIsoDate = (raw?: string) => {
  if (!raw) return new Date().toISOString()
  if (/^\d{8}T\d{6}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T${raw.slice(9, 11)}:${raw.slice(11, 13)}:${raw.slice(13, 15)}Z`
  }
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

const mapAlphaVantageItem = (item: AlphaVantageNewsItem, requestedSymbols: string[], deeperReason: boolean): MarketNewsItem | null => {
  if (!item.title || !item.url || !item.source) return null
  const relatedSymbols = normalizeSymbols((item.ticker_sentiment || []).map((ticker) => ticker.ticker || ''))
  const topic = inferTopic(item.title, item.summary || '', relatedSymbols)
  return {
    title: item.title,
    source: item.source,
    url: item.url,
    publishedAt: toIsoDate(item.time_published),
    relatedSymbols,
    topic,
    relevanceReason: getRelevanceReason(topic, relatedSymbols, requestedSymbols, deeperReason),
    dataStatus: 'delayed',
  }
}

const mapMarketauxItem = (item: MarketauxNewsItem, requestedSymbols: string[], deeperReason: boolean): MarketNewsItem | null => {
  if (!item.title || !item.url || !item.source) return null
  const relatedSymbols = normalizeSymbols((item.entities || []).map((entity) => entity.symbol || ''))
  const topic = inferTopic(item.title, item.description || '', relatedSymbols)
  return {
    title: item.title,
    source: item.source,
    url: item.url,
    publishedAt: toIsoDate(item.published_at),
    relatedSymbols,
    topic,
    relevanceReason: getRelevanceReason(topic, relatedSymbols, requestedSymbols, deeperReason),
    dataStatus: 'delayed',
  }
}

const mapRssItem = (item: RssNewsItem, requestedSymbols: string[], deeperReason: boolean): MarketNewsItem | null => {
  const relatedSymbols = expandIndonesiaSymbols(requestedSymbols).filter((symbol) => {
    const bare = symbol.replace(/\.JK$/i, '')
    return item.title.toUpperCase().includes(bare) || item.title.toUpperCase().includes(symbol)
  })
  const topic = inferTopic(item.title, '', relatedSymbols)
  return {
    title: item.title,
    source: item.source,
    url: item.url,
    publishedAt: toIsoDate(item.publishedAt),
    relatedSymbols: relatedSymbols.length ? relatedSymbols : expandIndonesiaSymbols(requestedSymbols).slice(0, 4),
    topic,
    relevanceReason: getRelevanceReason(topic, relatedSymbols, requestedSymbols, deeperReason),
    dataStatus: 'delayed',
  }
}

const selectItems = (items: MarketNewsItem[], requestedSymbols: string[], limit: number) => {
  const seen = new Set<string>()
  return items
    .filter((item) => {
      const key = `${item.title}|${item.url}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => {
      const scoreDiff = scoreItem(b, requestedSymbols) - scoreItem(a, requestedSymbols)
      if (scoreDiff !== 0) return scoreDiff
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
    .slice(0, limit)
}

const alphaVantageSymbols = (symbols: string[]) =>
  normalizeSymbols(symbols)
    .map((symbol) => {
      if (symbol === 'BTC-USD') return 'BTCUSD'
      if (symbol === 'GC=F' || symbol === 'XAUUSD' || symbol === 'XAU/USD') return 'GLD'
      if (symbol === '^JKSE' || symbol === 'IHSG') return ''
      if (symbol.endsWith('.JK')) return ''
      return symbol.replace(/[^A-Z0-9]/g, '')
    })
    .filter(Boolean)
    .slice(0, 8)

const fetchFromAlphaVantage = async (requestedSymbols: string[], limit: number, deeperReason: boolean) => {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY?.trim()
  if (!apiKey) return null

  const avSymbols = alphaVantageSymbols(requestedSymbols)
  const urls = [
    avSymbols.length
      ? `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${encodeURIComponent(avSymbols.join(','))}&limit=${limit * 3}&sort=LATEST&apikey=${encodeURIComponent(apiKey)}`
      : '',
    `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets,economy_macro,blockchain&limit=${limit * 3}&sort=LATEST&apikey=${encodeURIComponent(apiKey)}`,
  ].filter(Boolean)

  for (const url of urls) {
    const response = await axios.get<AlphaVantageNewsResponse>(url, { timeout: PROVIDER_TIMEOUT_MS })
    const feed = response.data?.feed || []
    const mapped = feed
      .map((item) => mapAlphaVantageItem(item, requestedSymbols, deeperReason))
      .filter((item): item is MarketNewsItem => item !== null)
    if (mapped.length) return selectItems(mapped, requestedSymbols, limit)
  }

  return []
}

const fetchFromMarketaux = async (requestedSymbols: string[], country: string, limit: number, deeperReason: boolean) => {
  const token = process.env.MARKETAUX_API_TOKEN?.trim()
  if (!token) return null

  const symbols = normalizeSymbols(requestedSymbols)
    .map((symbol) => (symbol === 'GC=F' || symbol === 'XAUUSD' || symbol === 'XAU/USD' ? 'GLD' : symbol))
    .filter((symbol) => symbol !== '^JKSE' && symbol !== 'IHSG')
    .slice(0, 12)

  const params: Record<string, string | number> = {
    api_token: token,
    language: 'en',
    limit: Math.min(50, limit * 4),
    sort: 'published_desc',
  }
  if (symbols.length) params.symbols = symbols.join(',')
  if (country) params.countries = country.toLowerCase()

  const response = await axios.get<MarketauxNewsResponse>('https://api.marketaux.com/v1/news/all', {
    timeout: PROVIDER_TIMEOUT_MS,
    params,
  })
  const mapped = (response.data?.data || [])
    .map((item) => mapMarketauxItem(item, requestedSymbols, deeperReason))
    .filter((item): item is MarketNewsItem => item !== null)

  return selectItems(mapped, requestedSymbols, limit)
}

const fetchFromGoogleNewsRss = async (requestedSymbols: string[], limit: number, deeperReason: boolean) => {
  const queries = buildGoogleNewsQueries(requestedSymbols)
  const results: MarketNewsItem[] = []

  for (const query of queries) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:14d`)}&hl=id&gl=ID&ceid=ID:id`
    const response = await axios.get<string>(url, {
      timeout: PROVIDER_TIMEOUT_MS,
      responseType: 'text',
      headers: {
        'User-Agent': 'TingAI/2.3.1.1 market-news',
      },
    })
    const mapped = parseGoogleNewsRss(response.data)
      .map((item) => mapRssItem(item, requestedSymbols, deeperReason))
      .filter((item): item is MarketNewsItem => item !== null)
    results.push(...mapped)
    if (results.length >= limit) break
  }

  return selectItems(results, requestedSymbols, limit)
}

const cachedResponse = (message: string): MarketNewsResponse | null => {
  if (!lastGoodCache) return null
  const isFreshEnough = Date.now() - lastGoodCache.storedAt <= CACHE_TTL_MS
  if (!isFreshEnough) return null
  return {
    ...lastGoodCache.response,
    items: lastGoodCache.response.items.map((item) => ({ ...item, dataStatus: 'cached' })),
    dataStatus: 'cached',
    message,
  }
}

export const getMarketNews = async (input: {
  symbols: string[]
  country?: string
  limit?: number
  pro?: boolean
}): Promise<MarketNewsResponse> => {
  const requestedSymbols = normalizeSymbols(input.symbols)
  const limit = Math.max(1, Math.min(Number(input.limit || 6), 12))
  const country = (input.country || '').trim()
  const deeperReason = input.pro === true

  if (!process.env.ALPHAVANTAGE_API_KEY?.trim() && !process.env.MARKETAUX_API_TOKEN?.trim()) {
    return (
      cachedResponse('Sumber berita sedang tidak tersedia. Menampilkan cache terakhir.') || {
        items: [],
        dataStatus: 'unavailable',
        lastUpdated: null,
        message: 'Sumber berita belum dikonfigurasi.',
      }
    )
  }

  try {
    const themes = portfolioThemes(requestedSymbols)
    const providers = [
      ...(themes.hasIdx || themes.hasBanking
        ? [() => fetchFromGoogleNewsRss(requestedSymbols, limit, deeperReason)]
        : []),
      () => fetchFromAlphaVantage(requestedSymbols, limit, deeperReason),
      () => fetchFromMarketaux(requestedSymbols, country, limit, deeperReason),
      ...(!themes.hasIdx && !themes.hasBanking
        ? [() => fetchFromGoogleNewsRss(requestedSymbols, limit, deeperReason)]
        : []),
    ]

    let sawConfiguredProvider = false

    for (const provider of providers) {
      const items = await provider()
      if (items === null) continue
      sawConfiguredProvider = true
      if (!items.length) continue

      const response: MarketNewsResponse = {
        items,
        dataStatus: 'delayed',
        lastUpdated: new Date().toISOString(),
        message: null,
      }
      lastGoodCache = { response, storedAt: Date.now() }
      return response
    }

    if (sawConfiguredProvider) {
      return {
        items: [],
        dataStatus: 'delayed',
        lastUpdated: new Date().toISOString(),
        message: 'Tidak ada berita baru yang cukup relevan saat ini.',
      }
    }

    return (
      cachedResponse('Sumber berita sedang tidak tersedia. Menampilkan cache terakhir.') || {
        items: [],
        dataStatus: 'unavailable',
        lastUpdated: null,
        message: 'Sumber berita belum tersedia.',
      }
    )
  } catch {
    return (
      cachedResponse('Sumber berita sedang tidak tersedia. Menampilkan cache terakhir.') || {
        items: [],
        dataStatus: 'unavailable',
        lastUpdated: null,
        message: 'Sumber berita sedang tidak tersedia.',
      }
    )
  }
}
