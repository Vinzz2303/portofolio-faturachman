import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import AiChat from './components/AiChat'
import Contact from './components/Contact'
import Footer from './components/Footer'

const sections = [
  'hero',
  'about',
  'projects',
  'ai',
  'contact'
]

export default function App() {
  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const elements = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    )
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero sectionId={sections[0]} />
        <About sectionId={sections[1]} />
        <Projects sectionId={sections[2]} />
        <AiChat sectionId={sections[3]} />
        <Contact sectionId={sections[4]} />
      </main>
      <Footer />
    </div>
  )
}
