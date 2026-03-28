import React from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import Projects from '../components/Projects'
import Contact from '../components/Contact'

const sections = ['hero', 'about', 'projects', 'contact'] as const

export default function Home() {
  return (
    <>
      <Hero sectionId={sections[0]} />
      <About sectionId={sections[1]} />
      <Projects sectionId={sections[2]} />
      <Contact sectionId={sections[3]} />
    </>
  )
}
