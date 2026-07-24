import React from 'react'
import { Link } from 'react-router-dom'
import { isPersonalDomain } from '../utils/domain'
import { useLanguagePreference } from '../utils/language'

export default function Footer() {
  const isPersonal = isPersonalDomain()
  const { language } = useLanguagePreference()
  const isEn = language === 'en'
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer-grid">
          {/* Brand column */}
          <div className="site-footer-brand">
            <div className="site-footer-brand-name">
              {isPersonal ? 'Faturachman Alkahfi' : 'Ting AI'}
            </div>
            <p className="site-footer-brand-tagline">
              {isPersonal
                ? (isEn
                  ? 'AI Product Builder & Full Stack Developer. Building intelligence into products.'
                  : 'AI Product Builder & Full Stack Developer. Membangun kecerdasan ke dalam produk.')
                : (isEn
                  ? 'Designed to help you think, not to tell you what to do. A thinking partner for retail investors.'
                  : 'Didesain untuk membantumu berpikir, bukan memberi arahan. Partner berpikir untuk investor ritel.')}
            </p>
            <div className="site-footer-social">
              <a href="https://github.com/Vinzz2303" target="_blank" rel="noreferrer" aria-label="GitHub">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/faturachman-al-kahfi-662283304/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://instagram.com/alvinstzy" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>

          {/* Product column */}
          <div className="site-footer-col">
            <h4>{isEn ? 'Product' : 'Produk'}</h4>
            <ul>
              <li><Link to="/ting-ai">{isEn ? 'Ting AI Overview' : 'Ikhtisar Ting AI'}</Link></li>
              <li><Link to="/komando-pagi">{isEn ? 'Morning Command' : 'Komando Pagi'}</Link></li>
              <li><Link to="/portfolio">{isEn ? 'Portfolio Workspace' : 'Workspace Portofolio'}</Link></li>
              <li><Link to="/explore-intelligence">Explore Intelligence</Link></li>
            </ul>
          </div>

          {/* Features column */}
          <div className="site-footer-col">
            <h4>{isEn ? 'Features' : 'Fitur'}</h4>
            <ul>
              <li><Link to="/decision-journal">{isEn ? 'Decision Journal' : 'Jurnal Keputusan'}</Link></li>
              <li><Link to="/personal-space">{isEn ? 'Personal Space' : 'Ruang Personal'}</Link></li>
              <li><Link to="/upgrade">{isEn ? 'Upgrade to Pro' : 'Upgrade ke Pro'}</Link></li>
            </ul>
          </div>

          {/* Account column */}
          <div className="site-footer-col">
            <h4>{isEn ? 'Account' : 'Akun'}</h4>
            <ul>
              <li><Link to="/login">{isEn ? 'Sign In' : 'Masuk'}</Link></li>
              <li><Link to="/signup">{isEn ? 'Create Account' : 'Buat Akun'}</Link></li>
              <li><Link to="/profile">{isEn ? 'Profile' : 'Profil'}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="site-footer-bottom">
          <span className="site-footer-copy">
            © {year} {isPersonal ? 'Faturachman Alkahfi' : 'Ting AI'}. {isEn ? 'All rights reserved.' : 'Hak cipta dilindungi.'}
          </span>
          <span className="site-footer-motto">
            {isEn ? 'Designed to help you think, not to tell you what to do.' : 'Didesain untuk membantumu berpikir, bukan memberitahumu apa yang harus dilakukan.'}
          </span>
        </div>
      </div>
    </footer>
  )
}
