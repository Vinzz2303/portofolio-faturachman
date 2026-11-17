# Faturachman Alkahfi — Systems Portfolio (`faturachman.my.id`)

> **Official Personal Portfolio & Interactive Systems Showcase**  
> Architect of Ting AI, Universitas Primagraha Campus Ecosystem (OPAC, LPM, LPPM, Perpustakaan), and Open Source Contributor.

🌐 **Live Website**: [https://faturachman.my.id](https://faturachman.my.id)  
👤 **GitHub**: [@Vinzz2303](https://github.com/Vinzz2303)  
✉️ **Contact**: faturachmanalkahfi7@gmail.com

---

## ⚡ Tech Stack & Architecture

- **Core**: React 19, TypeScript, Vite
- **Visuals & 3D**: Three.js 3D Physics Scene (`ThreeStage.tsx`)
- **Animation**: GSAP + ScrollTrigger (Pinned Work Showcase Theatre), Lenis Smooth Scrolling
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Interactive Systems**:
  - `AiTerminalPlayground`: Interactive terminal sandbox emulator with `whoami`, `projects`, `benchmarks`, and `ask-ai` RAG query simulation.
  - `CaseStudyDrawer`: Deep-dive architectural case studies for major enterprise systems.
  - `OpenSourceContributions`: Real-world open source PRs and commits timeline.
  - `SoundEngine`: Synthesized UI audio feedback with Web Audio API.

---

## 🛠️ Project Structure

```
argon_source/
├── public/                 # Static assets, logos, and resumes
│   ├── fatur-hero-new.png
│   ├── faturachman-alkahfi-resume.pdf
│   └── works/
├── src/
│   ├── components/
│   │   ├── AiTerminalPlayground.tsx   # Interactive terminal emulator
│   │   ├── CaseStudyDrawer.tsx        # Enterprise deep dive drawer
│   │   ├── OpenSourceContributions.tsx# Open-source contributions track
│   │   ├── ThreeStage.tsx             # Three.js 3D background stage
│   │   └── WorkPosterCard.tsx         # Interactive poster cards
│   ├── data/
│   │   ├── campusProjects.ts          # Universitas Primagraha platform stats
│   │   ├── contributions.ts           # GitHub contributions data
│   │   └── projects.ts                # Flagship project registry
│   ├── utils/
│   │   ├── cliEngine.ts               # Terminal command parser
│   │   ├── physics.ts                 # Time & spatial physics helpers
│   │   └── soundEngine.ts             # Web Audio API synthesizer
│   ├── App.tsx                        # Master layout with pinned scroll
│   ├── index.css                      # Tailwind v4 theme & typography
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 🚀 Development & Build

### Prerequisites
- Node.js 18+ (tested on Node v20/v22)
- npm or bun

### Commands
```bash
# Install dependencies
npm install

# Start local dev server (port 3000)
npm run dev

# Build for production (output to dist/)
npm run build
```

---

## 🌐 IIS Deployment
Production builds are deployed to Windows Server IIS Site `faturachman-portfolio` (`C:\inetpub\wwwroot\portofolio-faturachman`) via `deploy_argon_portfolio.ps1`.
