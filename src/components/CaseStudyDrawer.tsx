import React, { useEffect } from 'react';
import { X, ArrowUpRight, ArrowLeft, ArrowRight, Layers, ShieldCheck, Cpu } from 'lucide-react';
import { ProjectCaseStudy, PROJECTS_DATA } from '../data/projects';
import { soundEngine } from '../utils/soundEngine';

interface CaseStudyDrawerProps {
  project: ProjectCaseStudy | null;
  onClose: () => void;
  onSelectProject: (project: ProjectCaseStudy) => void;
}

export const CaseStudyDrawer: React.FC<CaseStudyDrawerProps> = ({
  project,
  onClose,
  onSelectProject,
}) => {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.playDrawerWhoosh(false);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const currentIdx = PROJECTS_DATA.findIndex((p) => p.id === project.id);
  const prevProject = PROJECTS_DATA[(currentIdx - 1 + PROJECTS_DATA.length) % PROJECTS_DATA.length];
  const nextProject = PROJECTS_DATA[(currentIdx + 1) % PROJECTS_DATA.length];

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-black/75 transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-project-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundEngine.playDrawerWhoosh(false);
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-3xl bg-[#0e0e0e] text-white h-full overflow-y-auto border-l border-white/10 shadow-2xl flex flex-col justify-between">
        <div className="sticky top-0 z-20 bg-[#0e0e0e]/95 border-b border-white/10 px-6 sm:px-10 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 font-mono text-xs text-neutral-400">
            <span className="text-[#c84b15] font-semibold">{project.index}</span>
            <span aria-hidden="true">·</span>
            <span>{project.role}</span>
            <span aria-hidden="true">·</span>
            <span className="hidden sm:inline">{project.year}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playDrawerWhoosh(false);
              onClose();
            }}
            aria-label="Close case study drawer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-neutral-200 transition cursor-pointer"
          >
            <span>ESC</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 sm:px-10 py-8 sm:py-10 space-y-10">
          <div>
            <h2
              id="drawer-project-title"
              className="text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[1.02] text-white"
            >
              {project.title}
            </h2>
            <p className="mt-3 text-lg sm:text-xl text-neutral-300 font-medium leading-snug">
              {project.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              {project.isExternal ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => soundEngine.playClick(640, 0.03)}
                  className="bg-[#c84b15] hover:bg-[#df561b] text-white font-semibold text-sm px-5 py-2.5 rounded-lg inline-flex items-center gap-2 transition shadow-lg"
                >
                  <span>Open Live Production App</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              ) : (
                <a
                  href={project.liveUrl}
                  onClick={() => {
                    soundEngine.playDrawerWhoosh(false);
                    onClose();
                  }}
                  className="bg-[#c84b15] hover:bg-[#df561b] text-white font-semibold text-sm px-5 py-2.5 rounded-lg inline-flex items-center gap-2 transition shadow-lg"
                >
                  <span>Test in AI CLI Playground Below</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}

              <div className="font-mono text-xs text-neutral-400">
                {project.tech}
              </div>
            </div>
          </div>

          {project.image && (
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 aspect-[16/10]">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover object-top"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
            {project.metrics.map((m) => (
              <div
                key={m.label}
                className="bg-[#151515] border border-white/[0.07] rounded-xl p-4"
              >
                <div className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                  {m.label}
                </div>
                <div className="text-2xl font-extrabold text-white mt-1 tabular-nums tracking-tight">
                  {m.value}
                </div>
                <div className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                  {m.context}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-6">
              <div className="font-mono text-xs text-[#c84b15] uppercase tracking-wider mb-2">
                01. The Problem
              </div>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                {project.problem}
              </p>
            </div>

            <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-6">
              <div className="font-mono text-xs text-emerald-400 uppercase tracking-wider mb-2">
                02. Engineered Solution
              </div>
              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
                {project.solution}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="font-mono text-xs text-[#c84b15] uppercase tracking-wider block">
                  03. System Topology
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                  End-to-End Architecture Pipeline
                </h3>
              </div>
              <Layers className="w-5 h-5 text-neutral-500" />
            </div>

            <div className="space-y-3">
              {project.architectureNodes.map((node) => (
                <div
                  key={node.layer}
                  className="bg-[#151515] border border-white/[0.08] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="text-[#c84b15] font-semibold">{node.layer}</span>
                      <span aria-hidden="true" className="text-neutral-600">·</span>
                      <span className="text-white font-bold">{node.name}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      {node.detail}
                    </p>
                  </div>

                  <div className="font-mono text-[11px] text-emerald-400 shrink-0 sm:text-right">
                    {node.spec}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="font-mono text-xs text-[#c84b15] uppercase tracking-wider block">
                  04. Key Trade-Offs
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                  Architectural Decisions
                </h3>
              </div>
              <ShieldCheck className="w-5 h-5 text-neutral-500" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {project.engineeringDecisions.map((dec) => (
                <div
                  key={dec.title}
                  className="bg-[#151515] border border-white/[0.07] rounded-xl p-5"
                >
                  <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#c84b15] shrink-0" />
                    <span>{dec.title}</span>
                  </h4>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {dec.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider mb-3">
              Production Stack &amp; Infrastructure
            </div>
            <div className="font-mono text-xs sm:text-sm text-neutral-200 leading-relaxed">
              {project.techList.join('  ·  ')}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 bg-[#0e0e0e]/95 border-t border-white/10 px-6 sm:px-10 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(480, 0.025);
              onSelectProject(prevProject);
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Prev: {prevProject.title}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(560, 0.025);
              onSelectProject(nextProject);
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <span>Next: {nextProject.title}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
