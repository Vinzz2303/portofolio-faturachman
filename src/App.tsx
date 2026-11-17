import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Volume2, VolumeX, Copy, Check, Sparkles, ArrowUpRight } from 'lucide-react';
import { PROJECTS_DATA, ProjectCaseStudy } from './data/projects';
import { formatJakartaTime } from './utils/physics';
import { soundEngine } from './utils/soundEngine';
import { ThreeStage } from './components/ThreeStage';
import { CaseStudyDrawer } from './components/CaseStudyDrawer';
import { AiTerminalPlayground } from './components/AiTerminalPlayground';
import { WorkPosterCard } from './components/WorkPosterCard';
import { OpenSourceContributions } from './components/OpenSourceContributions';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [navTheme, setNavTheme] = useState<'dark' | 'light'>('dark');
  const [activeProjectIdx, setActiveProjectIdx] = useState<number>(0);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<ProjectCaseStudy | null>(null);
  const [jakartaTime, setJakartaTime] = useState<string>(() => formatJakartaTime());
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [pulseCount, setPulseCount] = useState<number>(0);
  const [tileInteractionCount, setTileInteractionCount] = useState<number>(0);

  // Cursor pill state
  const [cursorMode, setCursorMode] = useState<'hidden' | 'project' | 'tile-hover' | 'tile-drag'>('hidden');
  const cursorElRef = useRef<HTMLDivElement | null>(null);
  const workPinProgressRef = useRef<number>(0);
  const lenisRef = useRef<Lenis | null>(null);

  // Refs for the floating showcase cards in Selected Work (one per project)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const workStageRef = useRef<HTMLDivElement | null>(null);

  // Live Jakarta Clock (GMT+7)
  useEffect(() => {
    const interval = window.setInterval(() => {
      setJakartaTime(formatJakartaTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Custom Cursor Follower
  useEffect(() => {
    const cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouseClient = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mouseClient.x = e.clientX;
      mouseClient.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const updateCursor = () => {
      cursorPos.x += (mouseClient.x - cursorPos.x) * 0.2;
      cursorPos.y += (mouseClient.y - cursorPos.y) * 0.2;
      if (cursorElRef.current) {
        cursorElRef.current.style.transform = `translate3d(${cursorPos.x + 14}px, ${cursorPos.y + 14}px, 0)`;
      }
      rafId = requestAnimationFrame(updateCursor);
    };
    rafId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Lenis Smooth Scroll + GSAP ScrollTrigger Pinned Work Theatre
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // Accurate Adaptive Navbar Theme Detection based on section under header (y=70px)
    const checkNavTheme = () => {
      const y = 70;
      const lightIds = ["work", "services", "about"];
      let isLight = false;
      for (const id of lightIds) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= y && r.bottom > y) {
            isLight = true;
            break;
          }
        }
      }
      setNavTheme(isLight ? "light" : "dark");
    };
    window.addEventListener("scroll", checkNavTheme, { passive: true });
    checkNavTheme();

    // Pinned Selected Work Theatre (David Estrada Style)
    const cards = cardRefs.current.filter((c): c is HTMLDivElement => c !== null);
    const total = PROJECTS_DATA.length;
    const stage = workStageRef.current;

    let workTl: gsap.core.Timeline | null = null;

    if (cards.length === total && stage) {
      // First card rests in view, the rest wait below the viewport
      cards.forEach((card, i) => {
        gsap.set(card, { y: () => window.innerHeight * (i === 0 ? 0.16 : 1.35) });
      });

      // Each step: current card exits upward while the next one rises into place
      const STEP = 1.15;
      workTl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${Math.round((total - 1) * 95)}%`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            workPinProgressRef.current = self.progress;
            const idx = Math.min(total - 1, Math.round(self.progress * (total - 1)));
            setActiveProjectIdx(idx);
          },
        },
      });

      cards.forEach((card, i) => {
        if (i < total - 1) {
          workTl!.to(card, { y: () => -window.innerHeight * 0.9, ease: 'none', duration: 1 }, i * STEP);
        }
        if (i > 0) {
          workTl!.to(card, { y: () => window.innerHeight * 0.16, ease: 'none', duration: 1 }, (i - 1) * STEP + 0.15);
        }
      });
    }

    return () => {
      window.removeEventListener("scroll", checkNavTheme);
      workTl?.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetSelector: string) => {
    const targetEl = document.querySelector(targetSelector);
    if (targetEl && lenisRef.current) {
      e.preventDefault();
      soundEngine.playClick(540, 0.02);
      lenisRef.current.scrollTo(targetEl as HTMLElement, { offset: 0, duration: 1.1 });
    }
  };

  const handleOpenCaseStudy = useCallback((project: ProjectCaseStudy) => {
    soundEngine.playDrawerWhoosh(true);
    setSelectedCaseStudy(project);
  }, []);

  const handleToggleAudio = () => {
    const next = soundEngine.toggle();
    setAudioEnabled(next);
  };

  const handleCopyEmail = async () => {
    soundEngine.playClick(680, 0.03);
    try {
      await navigator.clipboard.writeText('faturachmanalkahfi7@gmail.com');
    } catch {
      // Fallback copy handled silently
    }
    setCopiedEmail(true);
    window.setTimeout(() => setCopiedEmail(false), 2600);
  };

  const handleTileHoverChange = useCallback((hovering: boolean, isDragging: boolean) => {
    setCursorMode((prev) => {
      if (isDragging) return 'tile-drag';
      if (hovering) return 'tile-hover';
      if (prev === 'tile-hover' || prev === 'tile-drag') return 'hidden';
      return prev;
    });
  }, []);

  const handleTileInteraction = useCallback(() => {
    setTileInteractionCount((c) => c + 1);
  }, []);

  const activeProject = PROJECTS_DATA[activeProjectIdx] || PROJECTS_DATA[0];

  const cursorLabel =
    cursorMode === 'project'
      ? 'Explore Case Study ↗'
      : cursorMode === 'tile-drag'
      ? 'Release to Snap 3D ✦'
      : 'Drag & Flick 3D ✦';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#c84b15] selection:text-white">
      {/* Custom Magnetic Floating Cursor Pill */}
      <div
        ref={cursorElRef}
        id="case-cursor"
        aria-hidden="true"
        className={`fixed top-0 left-0 z-[60] pointer-events-none transition-opacity duration-150 ${
          cursorMode === 'hidden' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
        }`}
      >
        <div className="bg-[#c84b15] text-white font-semibold text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 whitespace-nowrap">
          <span>{cursorLabel}</span>
        </div>
      </div>

      {/* Fullscreen Three.js 3D Squircle Engine (Z-Index 18) */}
      <ThreeStage
        workPinProgressRef={workPinProgressRef}
        onTileHoverChange={handleTileHoverChange}
        onTileInteraction={handleTileInteraction}
        pulseCount={pulseCount}
      />

      {/* Adaptive Top Bar (Strict 3-Zone Contract) */}
      <header
        id="main-navbar"
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 border-b ${
          navTheme === 'light'
            ? 'bg-[#f4f3ef]/95 border-black/[0.08]'
            : 'bg-[#0a0a0a]/90 border-white/[0.08]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            id="nav-brand"
            onClick={(e) => handleNavClick(e, '#top')}
            className={`font-mono text-sm font-semibold whitespace-nowrap shrink-0 transition hover:opacity-75 ${
              navTheme === 'light' ? 'text-[#0a0a0a]' : 'text-neutral-100'
            }`}
          >
            @FaturAI
          </a>

          {/* Zone 2: 5 Single-Line Navigation Links */}
          <nav
            id="nav-links"
            aria-label="Primary Navigation"
            className={`hidden md:flex items-center gap-8 text-sm font-medium ${
              navTheme === 'light' ? 'text-neutral-700' : 'text-neutral-300'
            }`}
          >
            <a
              href="#work"
              onClick={(e) => handleNavClick(e, '#work')}
              className="hover:underline underline-offset-4 transition whitespace-nowrap shrink-0"
            >
              Work
            </a>
            <a
              href="#playground"
              onClick={(e) => handleNavClick(e, '#playground')}
              className="hover:underline underline-offset-4 transition whitespace-nowrap shrink-0"
            >
              AI Playground
            </a>
            <a
              href="#services"
              onClick={(e) => handleNavClick(e, '#services')}
              className="hover:underline underline-offset-4 transition whitespace-nowrap shrink-0"
            >
              Services
            </a>
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, '#about')}
              className="hover:underline underline-offset-4 transition whitespace-nowrap shrink-0"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="hover:underline underline-offset-4 transition whitespace-nowrap shrink-0"
            >
              Contact
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center shrink-0">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              id="nav-cta"
              onClick={() => soundEngine.playClick(620, 0.025)}
              className={`text-xs md:text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                navTheme === 'light'
                  ? 'bg-[#0a0a0a] text-white hover:bg-neutral-800'
                  : 'bg-white text-[#0a0a0a] hover:bg-neutral-200'
              }`}
            >
              <span>WhatsApp ↗</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* =================================================================
           1. HERO SECTION (DARK #0a0a0a)
           ================================================================= */}
        <section
          id="top"
          className="relative min-h-screen bg-[#0a0a0a] pt-24 pb-0 flex flex-col justify-between overflow-hidden"
        >
          <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 pt-6 md:pt-10 pb-12 relative z-20">
            {/* Live Jakarta Telemetry & Tactile Controls Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-6 border-b border-white/[0.08] font-mono text-xs text-neutral-400">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-emerald-400 font-semibold">Available for select builds</span>
                <span aria-hidden="true">·</span>
                <span>Jakarta, ID</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums text-neutral-200" data-testid="jakarta-live-clock">
                  {jakartaTime}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPulseCount((c) => c + 1);
                    setTileInteractionCount((c) => c + 1);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 transition whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#c84b15]" />
                  <span>Pulse 3D Physics</span>
                  {tileInteractionCount > 0 && (
                    <span className="ml-1 text-amber-300 tabular-nums">({tileInteractionCount})</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleToggleAudio}
                  aria-pressed={audioEnabled}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition whitespace-nowrap shrink-0 cursor-pointer ${
                    audioEnabled
                      ? 'bg-[#c84b15]/20 border-[#c84b15] text-white'
                      : 'bg-white/[0.04] border-white/10 text-neutral-300 hover:text-white'
                  }`}
                >
                  {audioEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#c84b15]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                  <span>{audioEnabled ? 'Haptic Audio: ON' : 'Haptic Audio: OFF'}</span>
                </button>
              </div>
            </div>

            {/* Hero Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 relative">


                <h1 className="text-[3.1rem] sm:text-[4.6rem] md:text-[5.5rem] font-extrabold tracking-[-0.045em] leading-[0.94] text-white text-balance">
                  Full-stack
                  <br />
                  Engineer
                  <br />
                  <span className="text-[#737373]">&amp; AI Builder.</span>
                </h1>

                <div className="relative mt-6 flex items-center">
                  <p className="text-neutral-300 text-lg md:text-xl font-normal tracking-tight max-w-xl">
                    For systems that actually ship—from UI and PostgreSQL architecture to grounded Gemini Pro pipelines.
                  </p>
                  {/* Anchor 3D Tile that flies to Selected [ 3D ] work */}
                  <div
                    id="anchor-sub-badge"
                    className="hidden md:block ml-10 w-16 h-16 pointer-events-none shrink-0"
                  />
                </div>

                {/* Primary & Secondary Actions */}
                <div className="mt-8 flex flex-wrap items-center gap-5 relative z-30">
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundEngine.playClick(600, 0.03)}
                    className="bg-[#c84b15] hover:bg-[#df561b] text-white font-semibold text-sm md:text-base px-6 py-3 rounded-lg flex items-center gap-3 transition shadow-lg whitespace-nowrap shrink-0"
                  >
                    <span>Hubungi via WhatsApp ↗</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenCaseStudy(PROJECTS_DATA[0])}
                    className="px-5 py-3 rounded-lg bg-white/[0.07] hover:bg-white/[0.13] border border-white/10 text-white text-sm md:text-base font-medium transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Inspect Architecture Case Studies
                  </button>

                  <a
                    href="#work"
                    onClick={(e) => handleNavClick(e, '#work')}
                    className="text-neutral-400 hover:text-white text-sm md:text-base font-medium transition whitespace-nowrap shrink-0"
                  >
                    See selected work ↓
                  </a>
                </div>

                {/* Unboxed Tech Stack Metadata */}
                <div className="mt-9 font-mono text-xs tracking-[0.16em] text-neutral-400">
                  React &nbsp;·&nbsp; TypeScript &nbsp;·&nbsp; Next.js &nbsp;·&nbsp; Gemini Pro &nbsp;·&nbsp; PostgreSQL &nbsp;·&nbsp; Drag any 3D tile
                </div>


              </div>

              {/* Right Column (3D Obsidian Gold Emblem & Satellite Tech Tiles) */}
              <div className="lg:col-span-5 relative h-[280px] md:h-[380px] flex items-center justify-center">
                <div
                  id="anchor-react"
                  className="hidden md:block absolute top-2 left-4 w-20 h-20 pointer-events-none"
                />
                <div id="anchor-main-hero" className="w-52 h-52 md:w-64 md:h-64 pointer-events-none" />
                <div
                  id="anchor-ts"
                  className="hidden md:block absolute bottom-2 left-6 w-20 h-20 pointer-events-none"
                />
                <div
                  id="anchor-next"
                  className="hidden md:block absolute bottom-4 right-4 w-20 h-20 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Giant Name Cutout */}
          <div className="w-full overflow-hidden pt-2 relative z-10">
            <div className="giant-name text-white text-center px-2 translate-y-[10%]">
              Faturachman
            </div>
          </div>
        </section>

        {/* =================================================================
           2. SELECTED WORK — PINNED SCROLL THEATRE
           ================================================================= */}
        <section id="work" className="relative bg-[#f4f3ef] text-[#0a0a0a]">
          <div
            ref={workStageRef}
            id="work-pin-stage"
            className="relative w-full h-screen overflow-hidden flex flex-col justify-between"
          >
            {/* Center Fixed Layer (Z-10): Giant "Selected [ 3D ] work" Title */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-4">
              <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 lg:-translate-x-16 select-none">
                <span className="text-[3.2rem] sm:text-[5.8rem] md:text-[8.2rem] lg:text-[9.5rem] font-extrabold tracking-[-0.05em] leading-none text-[#0a0a0a]">
                  Selected
                </span>

                {/* Landing Slot for 3D Squircle between Selected and work */}
                <div
                  id="anchor-work-slot"
                  className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 inline-flex items-center justify-center"
                />

                <span className="text-[3.2rem] sm:text-[5.8rem] md:text-[8.2rem] lg:text-[9.5rem] font-extrabold tracking-[-0.05em] leading-none text-[#0a0a0a]">
                  work
                </span>
              </div>
            </div>

            {/* Top Floating Layer (Z-25): Alternating Pure Showcase Poster Cards (David Estrada Style) */}
            <div className="relative w-full h-full max-w-[1440px] mx-auto px-6 md:px-12 z-[25] pointer-events-none">
              {PROJECTS_DATA.map((project, i) => (
                <WorkPosterCard
                  key={project.id}
                  project={project}
                  index={i}
                  cardRef={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  onOpen={handleOpenCaseStudy}
                  onHoverChange={(hovering) => setCursorMode(hovering ? 'project' : 'hidden')}
                />
              ))}
            </div>

            {/* Pinned Bottom Info HUD (Z-30) — Exact David Estrada Editorial Layout */}
            <div className="relative z-[35] w-full max-w-[1440px] mx-auto px-6 md:px-12 pb-6 md:pb-8 mt-auto bg-gradient-to-t from-[#f4f3ef] via-[#f4f3ef]/95 to-transparent pt-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-black/10 pt-5">
                {/* Left Bottom: Project Title & Description */}
                <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span id="hud-index" className="font-mono text-xs text-[#c84b15] font-semibold tabular-nums">
                      {activeProject.index}
                    </span>
                    <span aria-hidden="true" className="text-neutral-400">·</span>
                    <span id="hud-role" className="font-mono text-[11px] text-neutral-600 uppercase tracking-wider">
                      {activeProject.role}
                    </span>
                  </div>

                  <h2
                    id="hud-title"
                    className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[-0.04em] leading-[0.95] text-[#0a0a0a]"
                  >
                    {activeProject.title}
                  </h2>

                  <p id="hud-desc" className="mt-2.5 text-neutral-600 text-sm sm:text-base leading-relaxed max-w-lg line-clamp-2">
                    {activeProject.shortDesc}
                  </p>
                </div>

                {/* Right Bottom: Tech Tags, Read Case Study & Visit Live */}
                <div className="flex flex-col md:items-end justify-end gap-2 text-left md:text-right">
                  <div id="hud-tech" className="font-mono text-xs text-neutral-500 uppercase tracking-wider mb-1">
                    {activeProject.tech}
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenCaseStudy(activeProject)}
                      className="text-sm sm:text-base font-bold text-[#0a0a0a] hover:text-[#c84b15] border-b-2 border-[#0a0a0a] hover:border-[#c84b15] pb-0.5 inline-flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Read the case study</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    {activeProject.isExternal && (
                      <a
                        id="hud-link"
                        href={activeProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm sm:text-base font-semibold text-neutral-500 hover:text-[#0a0a0a] inline-flex items-center gap-1.5 transition"
                      >
                        <span>Visit live project</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
           3. INTERACTIVE AI BUILDER TERMINAL & SYSTEM PLAYGROUND
           ================================================================= */}
        <AiTerminalPlayground onOpenProject={handleOpenCaseStudy} />

        {/* =================================================================
           4. SERVICES / FOUR THINGS YOU CAN COUNT ON + ARCHIVE
           ================================================================= */}
        <section
          id="services"
          className="relative bg-[#f4f3ef] text-[#0a0a0a] py-24 md:py-36 border-t border-black/10 z-20"
        >
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="max-w-3xl mb-16">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#c84b15] font-semibold">
                03 · How I Work
              </span>
              <h2 className="text-3xl sm:text-6xl font-extrabold tracking-[-0.04em] leading-[1.04] mt-3 text-balance">
                Four things you can count on, whatever the size of the build.
              </h2>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
              <div className="bg-white p-8 rounded-2xl border border-black/[0.08]">
                <div className="font-mono text-xs text-[#c84b15] font-semibold mb-4">01. Production Grade</div>
                <h3 className="text-xl font-extrabold tracking-tight mb-3">Systems that actually ship.</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Clean architecture built for real users and sustained traffic—not fragile prototypes that break in production.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-black/[0.08]">
                <div className="font-mono text-xs text-[#c84b15] font-semibold mb-4">02. End-to-End Ownership</div>
                <h3 className="text-xl font-extrabold tracking-tight mb-3">One engineer, start to finish.</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  I design the UI, write the frontend &amp; backend, integrate the AI, and deploy it to your Linux VPS. Nothing gets lost in handoffs.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-black/[0.08]">
                <div className="font-mono text-xs text-[#c84b15] font-semibold mb-4">03. Grounded Intelligence</div>
                <h3 className="text-xl font-extrabold tracking-tight mb-3">Applied AI with real ROI.</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  From Gemini Pro structured reasoning to hybrid pgvector RAG search and WhatsApp automation that saves hours of manual operations.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-black/[0.08]">
                <div className="font-mono text-xs text-[#c84b15] font-semibold mb-4">04. Direct Collaboration</div>
                <h3 className="text-xl font-extrabold tracking-tight mb-3">Fast, direct communication.</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Based in Jakarta (GMT+7). Quick answers via WhatsApp, transparent milestones, and clean TypeScript your team can maintain.
                </p>
              </div>
            </div>

            {/* Archive / Shipped Systems Table */}
            <div id="projects" className="pt-16 border-t border-black/10">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#c84b15] font-semibold block mb-2">
                    04 · Architecture Index
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                    Shipped systems &amp; case study archive
                  </h3>
                </div>
                <span className="font-mono text-xs text-neutral-600 mt-2 md:mt-0 tabular-nums">
                  Click any system to open engineering drawer (2024 — 2026)
                </span>
              </div>

              <div className="divide-y divide-black/10 border-t border-b border-black/10">
                {PROJECTS_DATA.map((proj) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => handleOpenCaseStudy(proj)}
                    className="w-full py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.03] px-4 transition text-left cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-lg group-hover:text-[#c84b15] transition">
                        {proj.title} — {proj.subtitle}
                      </div>
                      <div className="text-xs text-neutral-600 mt-0.5">{proj.shortDesc}</div>
                    </div>
                    <div className="font-mono text-xs text-neutral-600 shrink-0">{proj.tech}</div>
                    <div className="font-mono text-xs text-[#0a0a0a] font-semibold shrink-0 flex items-center gap-1.5">
                      <span>Inspect Case Study</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#c84b15]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* GitHub bounty & open-source PR log */}
            <OpenSourceContributions />
          </div>
        </section>

        {/* =================================================================
           5. ABOUT FATURACHMAN SECTION
           ================================================================= */}
        <section
          id="about"
          className="relative bg-[#eae8e1] text-[#0a0a0a] py-24 md:py-36 border-t border-black/10 z-20"
        >
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Engineer Identity Card */}
              <div className="lg:col-span-5">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#c84b15] font-semibold block mb-4">
                  05 · About Faturachman
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[1.05] mb-8 text-balance">
                  One person from architecture to production.
                </h2>

                <div className="bg-[#0a0a0a] text-white rounded-2xl p-8 shadow-xl border border-black/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 text-black font-extrabold text-xl flex items-center justify-center shrink-0">
                      FA
                    </div>
                    <div>
                      <div className="font-bold text-xl">Faturachman Alkahfi</div>
                      <div className="font-mono text-xs text-neutral-400">
                        @FaturAI · Jakarta, Indonesia
                      </div>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                    Full-stack Engineer &amp; AI Builder focused on turning complex institutional and investment workflows into fast, reliable web software.
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/10 font-mono text-xs">
                    <div>
                      <div className="text-neutral-400">AVAILABILITY</div>
                      <div className="text-emerald-400 font-semibold mt-1">
                        Available for projects
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-400">LOCAL TIME</div>
                      <div className="text-white font-semibold mt-1 tabular-nums">{jakartaTime}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Narrative & Unboxed Tech Stack */}
              <div className="lg:col-span-7 lg:pl-8">
                <p className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug text-[#0a0a0a] mb-8">
                  I design the interface, engineer the full-stack architecture, and integrate the AI models—so you only ever deal with one person.
                </p>

                <div className="space-y-6 text-neutral-700 text-base sm:text-lg leading-relaxed">
                  <p>
                    I&apos;m <strong>Faturachman Alkahfi</strong>, a Full-stack Engineer and AI Builder based in Jakarta. I&apos;ve built high-traffic institutional platforms like{' '}
                    <strong>Universitas Primagraha</strong> (serving 10,000+ monthly visitors with 99.95% admission uptime) and founded{' '}
                    <strong>Ting AI</strong>, a real-time macro intelligence and portfolio risk analysis platform for retail investors.
                  </p>
                  <p>
                    Most software projects slow down because frontend designers, backend developers, and AI engineers work in silos. My approach is different: I handle the entire lifecycle from product UI and database schema (PostgreSQL / Supabase / Prisma) to LLM reasoning pipelines (Gemini Pro / Hybrid RAG) and Linux VPS deployment.
                  </p>
                  <p>
                    When you need more than a static template—whether it&apos;s an AI-powered SaaS, an internal command center, or a high-conversion web platform with interactive 3D—I build it cleanly so your team can scale and maintain it effortlessly once it&apos;s live.
                  </p>
                </div>

                {/* Unboxed Core Technologies & Quantitative Proof */}
                <div className="mt-10 pt-8 border-t border-black/15 space-y-6">
                  <div>
                    <div className="font-mono text-xs text-neutral-600 uppercase tracking-wider mb-2">
                      Core Technologies &amp; Infrastructure
                    </div>
                    <div className="font-mono text-xs sm:text-sm text-[#0a0a0a] font-medium leading-relaxed">
                      React 19 &amp; Next.js &nbsp;·&nbsp; TypeScript &nbsp;·&nbsp; Gemini Pro &amp; Hybrid RAG &nbsp;·&nbsp; PostgreSQL &amp; Supabase &nbsp;·&nbsp; Prisma ORM &nbsp;·&nbsp; Three.js &amp; WebGL &nbsp;·&nbsp; Docker &amp; Linux VPS
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-black/10 font-mono">
                    <div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] tabular-nums">10k+</div>
                      <div className="text-xs text-neutral-600 mt-0.5">Monthly Visitors (UPG)</div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] tabular-nums">&lt; 1.2s</div>
                      <div className="text-xs text-neutral-600 mt-0.5">p90 Hybrid RAG Latency</div>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] tabular-nums">99.95%</div>
                      <div className="text-xs text-neutral-600 mt-0.5">Production Uptime SLA</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =================================================================
         6. CONTACT / FOOTER SECTION (SIGNAL ORANGE #c84b15)
         ================================================================= */}
      <footer id="contact" className="relative bg-[#c84b15] text-white pt-20 md:pt-28 pb-12 z-40">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <h2 className="text-[2.6rem] sm:text-[4.4rem] md:text-[5.8rem] font-extrabold tracking-[-0.045em] leading-[0.96] max-w-5xl text-balance">
            Tell me what you
            <br />
            need built.
            <br />
            I&apos;ll show you how
            <br />
            I&apos;d approach it.
          </h2>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playClick(640, 0.03)}
              className="bg-white text-[#0a0a0a] font-bold text-sm md:text-base px-6 py-3.5 rounded-lg flex items-center gap-3 hover:bg-neutral-100 transition shadow-xl whitespace-nowrap shrink-0"
            >
              <span>Hubungi via WhatsApp ↗</span>
            </a>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="bg-black/25 hover:bg-black/40 border border-white/25 text-white font-mono text-xs sm:text-sm px-5 py-3.5 rounded-lg inline-flex items-center gap-2.5 transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Copied: faturachmanalkahfi7@gmail.com</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy email: faturachmanalkahfi7@gmail.com</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 font-mono text-xs sm:text-sm text-white/90">
            Fast response &nbsp;·&nbsp; Tersedia untuk proyek &nbsp;·&nbsp; Jakarta ({jakartaTime}) &nbsp;·&nbsp;{' '}
            <a
              href="mailto:faturachmanalkahfi7@gmail.com"
              className="underline hover:text-white transition"
            >
              Send direct email ↗
            </a>
          </div>

          <div className="mt-20 pt-7 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/90">
            <div className="font-mono">© 2026 Faturachman Alkahfi · Jakarta, Indonesia</div>

            <div className="flex flex-wrap items-center gap-6 font-medium">
              <a href="#work" onClick={(e) => handleNavClick(e, '#work')} className="hover:text-white transition">
                Work
              </a>
              <a
                href="#playground"
                onClick={(e) => handleNavClick(e, '#playground')}
                className="hover:text-white transition"
              >
                AI Playground
              </a>
              <a
                href="#services"
                onClick={(e) => handleNavClick(e, '#services')}
                className="hover:text-white transition"
              >
                Services
              </a>
              <a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="hover:text-white transition">
                About
              </a>
            </div>

            <a
              href="#top"
              onClick={(e) => handleNavClick(e, '#top')}
              className="hover:text-white transition font-semibold whitespace-nowrap"
            >
              Back to top ↑
            </a>
          </div>
        </div>
      </footer>

      {/* Slide-Over Deep Engineering Case Study Drawer */}
      <CaseStudyDrawer
        project={selectedCaseStudy}
        onClose={() => setSelectedCaseStudy(null)}
        onSelectProject={(proj) => setSelectedCaseStudy(proj)}
      />
    </div>
  );
}
