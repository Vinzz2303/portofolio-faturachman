import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { ProjectCaseStudy } from '../data/projects';

interface WorkPosterCardProps {
  project: ProjectCaseStudy;
  index: number;
  cardRef: (el: HTMLDivElement | null) => void;
  onOpen: (project: ProjectCaseStudy) => void;
  onHoverChange: (hovering: boolean) => void;
}

export const WorkPosterCard: React.FC<WorkPosterCardProps> = ({ project, index, cardRef, onOpen, onHoverChange }) => {
  const isRight = index % 2 === 0;
  const side = isRight
    ? 'right-4 sm:right-8 md:right-16 w-[90%] sm:w-[68%] md:w-[54%] lg:w-[46%]'
    : 'left-4 sm:left-8 md:left-16 w-[90%] sm:w-[64%] md:w-[50%] lg:w-[42%]';

  return (
    <div
      ref={cardRef}
      id={`work-card-${index}`}
      role="button"
      tabIndex={0}
      aria-label={`Open ${project.title} case study`}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(project);
        }
      }}
      className={`work-floating-card pointer-events-auto cursor-pointer absolute top-0 ${side} rounded-[24px] overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.18)] border border-black/10 bg-white group block text-left`}
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-900">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white font-mono text-[11px] font-semibold px-3.5 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1 shadow-lg">
          <span>View case</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
