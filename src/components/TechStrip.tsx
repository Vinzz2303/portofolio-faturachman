import React from 'react'

const techs = [
  "React", "FastAPI", "Gemini", "GPT", "Groq", "Polygon", "FRED"
]

export default function TechStrip() {
  return (
    <div className="py-12 border-y border-white/5 bg-white/[0.01]">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all">
          {techs.map((tech) => (
            <span key={tech} className="text-xl font-bold tracking-tighter text-white hover:text-accent cursor-default transition-colors">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
