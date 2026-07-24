export interface BlogPost {
  id: string
  slug: string
  title: string
  titleEn: string
  excerpt: string
  excerptEn: string
  date: string
  readTime: string
  category: string
  content: string
  contentEn: string
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'arsitektur-ting-ai',
    title: 'Membangun Ting AI: Arsitektur Financial Data Layer di Next.js',
    titleEn: 'Building Ting AI: Financial Data Layer Architecture in Next.js',
    excerpt: 'Bagaimana saya merancang abstraksi data untuk menggabungkan Polygon, FRED, dan Model LLM dalam satu antarmuka yang cepat.',
    excerptEn: 'How I designed a data abstraction to combine Polygon, FRED, and LLM Models in one fast interface.',
    date: '2026-06-11',
    readTime: '4 min read',
    category: 'Engineering',
    content: `
# Membangun Ting AI: Arsitektur Financial Data Layer di Next.js

Saat membangun **Ting AI**, tantangan terbesar bukanlah pada antarmuka (UI), melainkan bagaimana menggabungkan berbagai sumber data keuangan yang tidak seragam menjadi satu sumber kebenaran (*single source of truth*) yang bisa diproses oleh AI.

## Masalah Data Finansial

Data dari penyedia seperti Polygon.io (untuk harga saham) dan FRED (untuk metrik ekonomi makro) memiliki format JSON yang sangat berbeda. Mengirim data mentah ini langsung ke LLM (seperti Gemini Pro) akan membuang token secara sia-sia dan memperlambat latensi.

## Solusi: Abstraction Layer

Saya membangun sebuah *Abstraction Layer* di backend menggunakan **FastAPI** dan **Python**, yang bertugas untuk:
1. **Fetch & Normalize**: Mengambil data dan menormalisasinya ke dalam struktur standar Ting AI.
2. **Caching**: Menggunakan Redis untuk menyimpan hasil *query* yang sering diminta (misal: S&P 500 harian).
3. **Context Injection**: Hanya mengirim metadata yang relevan ke LLM.

\`\`\`python
# Contoh pseudocode Abstraction Layer
@app.get("/api/market-pulse")
async def get_market_pulse():
    cached_data = redis.get("market_pulse_today")
    if cached_data:
        return cached_data
        
    polygon_data = await fetch_polygon_indices()
    fred_data = await fetch_fred_macro()
    
    normalized = normalize_market_data(polygon_data, fred_data)
    redis.set("market_pulse_today", normalized, ex=3600)
    
    return normalized
\`\`\`

## Dampak pada Performa

Dengan pendekatan ini, Ting AI berhasil:
- **Mengurangi ukuran payload ke LLM sebesar 60%**.
- **Memangkas waktu respons rata-rata dari 4 detik menjadi 1.2 detik**.
- Membuat pengalaman pengguna di *Morning Command Center* terasa instan.

Terima kasih sudah membaca! Ini adalah catatan awal dari banyak eksperimen engineering yang akan saya bagikan di masa depan.
`,
    contentEn: `
# Building Ting AI: Financial Data Layer Architecture in Next.js

When building **Ting AI**, the biggest challenge wasn't the user interface, but how to aggregate wildly different financial data sources into a single source of truth that the AI could process efficiently.

## The Financial Data Problem

Data from providers like Polygon.io (for stock prices) and FRED (for macro metrics) have very different JSON structures. Sending this raw data directly to an LLM (like Gemini Pro) wastes tokens and slows down latency.

## The Solution: Abstraction Layer

I built an *Abstraction Layer* in the backend using **FastAPI** and **Python**, responsible for:
1. **Fetch & Normalize**: Retrieving data and normalizing it into Ting AI's standard structure.
2. **Caching**: Using Redis to store frequently requested queries (e.g., daily S&P 500).
3. **Context Injection**: Only sending relevant metadata to the LLM.

\`\`\`python
# Pseudocode example of the Abstraction Layer
@app.get("/api/market-pulse")
async def get_market_pulse():
    cached_data = redis.get("market_pulse_today")
    if cached_data:
        return cached_data
        
    polygon_data = await fetch_polygon_indices()
    fred_data = await fetch_fred_macro()
    
    normalized = normalize_market_data(polygon_data, fred_data)
    redis.set("market_pulse_today", normalized, ex=3600)
    
    return normalized
\`\`\`

## Impact on Performance

With this approach, Ting AI successfully:
- **Reduced payload size to the LLM by 60%**.
- **Cut average response time from 4 seconds to 1.2 seconds**.
- Made the user experience in the *Morning Command Center* feel instant.

Thanks for reading! This is just the first note of many engineering experiments I will share in the future.
`
  }
]
