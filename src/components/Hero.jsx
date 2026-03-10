import React from 'react'
import profileImg from '../assets/profile.png'

export default function Hero(){
  return (
    <section className="hero container">
      <div className="hero-inner">
        <div className="hero-photo">
          <img src={profileImg} alt="Faturachman Al kahfi" />
        </div>
        <h1>Hi, I'm Faturachman Al kahfi</h1>
        <p>Frontend dev yang suka bikin landing page bisnis yang enak dilihat dan jelas arahnya. I build fast, responsive UI with React and modern web tech.</p>
        <a className="btn" href="#projects">Lihat projek saya</a>
      </div>
    </section>
  )
}
