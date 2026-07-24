import React from 'react'
import { isPersonalDomain } from '../utils/domain'

export default function Footer() {
  const isPersonal = isPersonalDomain()

  return (
    <footer className="site-footer">
      <div className="container">
        {isPersonal ? (
          <>
            (c) {new Date().getFullYear()} Faturachman Alkahfi. Ting AI membantu investor ritel memahami risiko sebelum mengambil keputusan.
          </>
        ) : (
          <>
            (c) {new Date().getFullYear()} Ting AI. Hak Cipta Dilindungi. Membantu investor ritel menganalisis risiko dan mengambil keputusan investasi dengan lebih cerdas.
          </>
        )}
      </div>
    </footer>
  )
}
