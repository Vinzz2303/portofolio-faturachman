/**
 * LegalDisclaimerBanner.tsx
 * Global sticky legal disclaimer — wajib tampil di semua halaman utama.
 * Mitigasi risiko OJK (POJK 24/2016) & UU PDP 2024.
 *
 * Framing:
 * - Ting AI adalah alat bantu analisis, BUKAN penasihat investasi.
 * - Semua data dari sumber publik (Yahoo Finance / OpenBB) — bukan lisensi resmi.
 * - Keputusan investasi sepenuhnya tanggung jawab pengguna.
 */
import { useState } from 'react'

interface Props {
  language: 'id' | 'en'
  /** Halaman mana yang sedang ditampilkan — untuk menyesuaikan teks kontekstual */
  context?: 'explore' | 'portfolio' | 'copilot' | 'morning' | 'default'
}

const TEXT = {
  id: {
    main: 'Ting AI adalah alat bantu analisis mandiri, bukan penasihat investasi berlisensi. Seluruh informasi yang ditampilkan bersifat edukatif dan tidak merupakan rekomendasi beli/jual/tahan atas efek apapun.',
    data: 'Data harga bersumber dari pihak ketiga (Yahoo Finance, OpenBB) secara berkala dan dapat memiliki keterlambatan. Ting AI tidak menjamin keakuratan atau keterkinian data.',
    decision: 'Keputusan investasi sepenuhnya ada pada Anda. Konsultasikan dengan penasihat investasi berlisensi OJK sebelum mengambil keputusan finansial.',
    expand: 'Lihat detail disclaimer',
    collapse: 'Sembunyikan',
  },
  en: {
    main: 'Ting AI is an independent analysis tool, not a licensed investment advisor. All information displayed is educational and does not constitute a buy/sell/hold recommendation for any security.',
    data: 'Price data is sourced from third parties (Yahoo Finance, OpenBB) on a periodic basis and may have delays. Ting AI does not guarantee the accuracy or timeliness of any data.',
    decision: 'All investment decisions are solely your responsibility. Consult an OJK-licensed investment advisor before making any financial decision.',
    expand: 'View full disclaimer',
    collapse: 'Collapse',
  },
}

export default function LegalDisclaimerBanner({ language, context = 'default' }: Props) {
  const [expanded, setExpanded] = useState(false)
  const t = TEXT[language]

  return (
    <div
      role="complementary"
      aria-label="Legal disclaimer"
      style={{
        background: 'rgba(251,191,36,0.04)',
        border: '1px solid rgba(251,191,36,0.12)',
        borderRadius: 14,
        padding: expanded ? '1rem 1.25rem' : '0.65rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Top row: icon + brief + toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Warning icon */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="rgba(251,191,36,0.7)" strokeWidth={2}
          style={{ flexShrink: 0, marginTop: 1 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>

        {/* Main text */}
        <p style={{
          margin: 0, flex: 1,
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.55,
          fontFamily: 'inherit',
        }}>
          {t.main}
        </p>

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => setExpanded(p => !p)}
          style={{
            flexShrink: 0,
            fontSize: '0.62rem',
            color: 'rgba(251,191,36,0.5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            textDecoration: 'underline',
          }}
        >
          {expanded ? t.collapse : t.expand}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 24 }}>
          {/* Data disclaimer */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(251,191,36,0.4)', marginTop: 1 }}>①</span>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.55 }}>
              {t.data}
            </p>
          </div>
          {/* Decision disclaimer */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(251,191,36,0.4)', marginTop: 1 }}>②</span>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.55 }}>
              {t.decision}
            </p>
          </div>
          {/* OJK reference */}
          <p style={{
            margin: '4px 0 0',
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.2)',
            fontFamily: 'monospace',
            lineHeight: 1.4,
          }}>
            {language === 'id'
              ? 'Ref: POJK No. 24/POJK.04/2016 · UU No. 27 Tahun 2022 (UU PDP) · Ting AI tidak terdaftar sebagai Penasihat Investasi di OJK.'
              : 'Ref: POJK No. 24/POJK.04/2016 · UU No. 27/2022 (Personal Data Protection) · Ting AI is not registered as an Investment Advisor with OJK.'
            }
          </p>
        </div>
      )}
    </div>
  )
}
