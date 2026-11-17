export interface ProjectMetric {
  label: string;
  value: string;
  context: string;
}

export interface ArchitectureNode {
  layer: string;
  name: string;
  spec: string;
  detail: string;
}

export interface EngineeringDecision {
  title: string;
  rationale: string;
}

export interface ProjectCaseStudy {
  id: string;
  index: string;
  role: string;
  year: string;
  title: string;
  subtitle: string;
  shortDesc: string;
  tech: string;
  techList: string[];
  image: string;
  liveUrl: string;
  isExternal: boolean;
  statusLabel: string;
  metrics: ProjectMetric[];
  problem: string;
  solution: string;
  architectureNodes: ArchitectureNode[];
  engineeringDecisions: EngineeringDecision[];
}

import { CAMPUS_PROJECTS } from './campusProjects';

const BASE_PROJECTS: ProjectCaseStudy[] = [
  {
    id: 'ting-ai',
    index: '01 / 04',
    role: 'FOUNDER & FULL-STACK ENGINEER',
    year: '2025 — 2026',
    title: 'Ting AI',
    subtitle: 'AI Thinking Partner & Portfolio Risk Engine for Retail Investors',
    shortDesc:
      'AI thinking partner for retail investors. Real-time macro intelligence, portfolio risk analysis, and morning command center.',
    tech: 'React / TypeScript / Gemini Pro / Supabase',
    techList: ['React 19', 'TypeScript', 'Gemini Pro API', 'Supabase PostgreSQL', 'Row-Level Security', 'Edge Functions'],
    image: '/works/tingsai.png',
    liveUrl: 'https://app.tingsai.my.id',
    isExternal: true,
    statusLabel: 'Production ↗',
    metrics: [
      {
        label: 'Analysis Latency',
        value: '1.4s p95',
        context: 'Multi-ticker macro & risk synthesis via streaming edge pipeline',
      },
      {
        label: 'Signal Philosophy',
        value: '100% Explainable',
        context: 'Zero black-box buy/sell alerts; deterministic risk decomposition',
      },
      {
        label: 'Database Security',
        value: 'Zero-Trust RLS',
        context: 'Tenant-isolated portfolio positions in Supabase PostgreSQL',
      },
    ],
    problem:
      'Retail investors are overwhelmed by noisy stock-picking groups, fragmented macro news, and emotional FOMO. Existing portfolio trackers only show lagging P&L numbers without explaining concentration risks, sector exposure, or how central bank and commodity shifts affect their specific holdings.',
    solution:
      'Built Ting AI from the ground up as a calm, rigorous "thinking partner" rather than a signal-pumping bot. The platform ingests a user’s actual portfolio allocation, cross-references real-time Indonesian (IDX) & global macro catalysts, and uses structured Gemini Pro reasoning schemas to surface hidden thesis weaknesses before the market opens.',
    architectureNodes: [
      {
        layer: '01 · Client Workspace',
        name: 'React + TypeScript Command Center',
        spec: 'Optimistic state · Tabular risk heatmaps',
        detail: 'Responsive desktop & mobile portfolio health dashboard with zero-jank chart rendering and instant scenario toggles.',
      },
      {
        layer: '02 · Context & Market Ingestion',
        name: 'Macro & Ticker Context Aggregator',
        spec: 'IDX / Global Macro Feed · Deno Edge',
        detail: 'Normalizes position weights, sector correlations, and daily macroeconomic releases into compact token-efficient context windows.',
      },
      {
        layer: '03 · AI Reasoning Engine',
        name: 'Gemini Pro Structured Risk Evaluator',
        spec: 'JSON Schema Enforcement · Deterministic Rubric',
        detail: 'Evaluates portfolio drawdowns, cash buffer adequacy, and thesis invalidation triggers without hallucinating financial figures.',
      },
      {
        layer: '04 · Persistence & Auth',
        name: 'Supabase PostgreSQL + RLS',
        spec: 'Sub-25ms query time · Encrypted snapshots',
        detail: 'Stores historical health audits, investment journals, and user watchlists under strict Row-Level Security policies.',
      },
    ],
    engineeringDecisions: [
      {
        title: 'Deterministic Math in TypeScript, Qualitative Synthesis in LLM',
        rationale:
          'Never let an LLM compute portfolio percentages or Sharpe/drawdown math. All position weights, sector caps, and risk scores are calculated deterministically in TypeScript first, then passed as verified facts to Gemini Pro for narrative critique.',
      },
      {
        title: 'Strict JSON Schema Output with Fallback Guardrails',
        rationale:
          'Enforced strict response schemas on every AI call so the UI reliably renders structured risk cards, exposure bars, and actionable questions even under volatile market news spikes.',
      },
    ],
  },
  {
    id: 'universitas-primagraha',
    index: '02 / 04',
    role: 'FULL-STACK DEVELOPER',
    year: '2024 — 2026',
    title: 'Universitas Primagraha',
    subtitle: 'High-Traffic Institutional Portal & Online Student Admission (PMB) Ecosystem',
    shortDesc:
      'Official university website with faculty programs, student admission portal, and modern campus showcase. 10,000+ monthly visitors.',
    tech: 'Next.js / React / Prisma / PostgreSQL',
    techList: ['Next.js App Router', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'SIAKAD Bridge', 'Linux VPS & Nginx'],
    image: '/works/primagraha.png',
    liveUrl: 'https://primagraha.ac.id',
    isExternal: true,
    statusLabel: '10k+ Visitors/mo ↗',
    metrics: [
      {
        label: 'Monthly Traffic',
        value: '10,000+ Active',
        context: 'Sustained prospective students, faculty, and academic visitors',
      },
      {
        label: 'Core Web Vitals',
        value: '98 / 100 LCP',
        context: 'Sub-second server-rendered academic pages & static ISR caching',
      },
      {
        label: 'Admission Uptime',
        value: '99.95% SLA',
        context: 'Zero downtime during peak PMB 2025/2026 enrollment waves',
      },
    ],
    problem:
      'Universitas Primagraha previously suffered from slow page loads during admission peaks, fragmented faculty micro-sites, and manual document verification bottlenecks that caused prospective students to drop off during online registration (PMB).',
    solution:
      'Architected and deployed a unified Next.js full-stack platform backed by PostgreSQL and Prisma ORM. Implemented Incremental Static Regeneration (ISR) for instant faculty & news discovery alongside a transactional PMB online admission funnel integrated with internal academic administration (SIAKAD).',
    architectureNodes: [
      {
        layer: '01 · Edge & Reverse Proxy',
        name: 'Nginx + Cloudflare Caching Layer',
        spec: 'HTTP/3 · Brotli · Stale-While-Revalidate',
        detail: 'Absorbs regional traffic spikes during scholarship and admission announcements with near-zero origin CPU load.',
      },
      {
        layer: '02 · Application Tier',
        name: 'Next.js App Router (SSR + ISR)',
        spec: 'Server Components · Type-safe Server Actions',
        detail: 'Delivers SEO-optimized program curricula and bilingual institutional pages with instant client transitions.',
      },
      {
        layer: '03 · Data & ORM Layer',
        name: 'Prisma ORM + PostgreSQL',
        spec: 'Connection Pooling · Indexed Search',
        detail: 'Manages applicant pipelines, document uploads, faculty directories, and news publishing workflows.',
      },
      {
        layer: '04 · Internal Integration',
        name: 'SIAKAD & WhatsApp Notification Webhook',
        spec: 'Automated Applicant Status Updates',
        detail: 'Synchronizes verified applicants directly into campus academic records and triggers instant WhatsApp registration confirmations.',
      },
    ],
    engineeringDecisions: [
      {
        title: 'Hybrid ISR for Content + Transactional SSR for Admissions',
        rationale:
          'Decoupled public-facing faculty/curriculum pages (cached at the edge via ISR) from dynamic PMB applicant state so 10,000+ monthly readers never contend with database write locks.',
      },
      {
        title: 'Self-Hosted Linux VPS Optimization',
        rationale:
          'Configured containerized deployment with PgBouncer connection pooling and automated daily backups on Linux VPS, cutting recurring cloud hosting costs by over 65% compared to managed PaaS.',
      },
    ],
  },
  {
    id: 'central-emas',
    index: '03 / 04',
    role: 'FRONTEND ARCHITECT',
    year: '2023 — 2024',
    title: 'Central Jual Emas',
    subtitle: 'Premium Gold Trading & Certified Appraisal Platform',
    shortDesc:
      'Premium gold selling platform with transparent real-time pricing, VIP consultation rooms, and instant WhatsApp appraisal.',
    tech: 'HTML5 / Modern CSS / Vanilla JS / WhatsApp Cloud',
    techList: ['HTML5 Semantic', 'Modern CSS Architecture', 'Vanilla JavaScript ES6+', 'Live Gold Ticker', 'WhatsApp API'],
    image: '/works/central-emas.png',
    liveUrl: 'https://central-jual-emas.netlify.app',
    isExternal: true,
    statusLabel: 'Production ↗',
    metrics: [
      {
        label: 'Client Appraisal Speed',
        value: '5 Minutes',
        context: 'Rapid certified valuation turnaround per customer',
      },
      {
        label: 'Satisfaction Rate',
        value: '100% Transparent',
        context: 'Zero hidden fees with real-time certified market buyback rates',
      },
      {
        label: 'Page Speed',
        value: '99 Performance',
        context: 'Lightweight zero-framework build with sub-300ms first paint',
      },
    ],
    problem:
      'Gold sellers frequently face arbitrary valuation markdowns, non-transparent buyback deductions, and confusing offline physical queues without prior quote verification.',
    solution:
      'Crafted a luxurious, high-converting digital storefront that delivers live transparent pricing estimates, certified appraiser credentials, VIP appointment booking, and direct consultation handoff to WhatsApp.',
    architectureNodes: [
      {
        layer: '01 · High-Conversion UI',
        name: 'Editorial Luxury Design System',
        spec: 'Rich Dark Warm Palette · Gold Accent Tokens',
        detail: 'Builds immediate institutional trust with high net worth clients selling high-value precious metals.',
      },
      {
        layer: '02 · Live Estimation Calculator',
        name: 'Client-Side Real-Time Estimator',
        spec: 'Karat purity multiplier · Weight input',
        detail: 'Calculates immediate transparent cash ranges based on current market spot prices before client contact.',
      },
      {
        layer: '03 · WhatsApp Direct Handoff',
        name: 'Dynamic URL Pre-fill Generator',
        spec: 'Structured Consultation Query',
        detail: 'Automatically generates pre-filled WhatsApp consultation messages detailing the gold type, weight, and branch choice.',
      },
    ],
    engineeringDecisions: [
      {
        title: 'Zero-Dependency Vanilla Architecture for Blazing Speed',
        rationale:
          'Constructed without heavy frameworks to ensure instant loading on mobile devices in retail locations, achieving an instant 99+ Google Lighthouse score.',
      },
    ],
  },
  {
    id: 'rajawali-prestige',
    index: '04 / 04',
    role: 'FULL-STACK DEVELOPER',
    year: '2024',
    title: 'Rajawali Prestige',
    subtitle: 'National Community Arena & Elite Avian Competition Portal',
    shortDesc:
      'Premium platform for the Indonesian bird competition community with event arena, elite equipment catalog, and national directory.',
    tech: 'Next.js / React / TypeScript / Tailwind CSS',
    techList: ['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    image: '/works/rajawali.png',
    liveUrl: 'https://rajawaliprestige.my.id',
    isExternal: true,
    statusLabel: 'Production ↗',
    metrics: [
      {
        label: 'Community Reach',
        value: 'National Scale',
        context: 'Connecting regional bird clubs across Java, Sumatra & Bali',
      },
      {
        label: 'Interactive Arena',
        value: 'Live Schedules',
        context: 'Real-time competition calendar and judging criteria guidelines',
      },
      {
        label: 'Mobile Experience',
        value: '100% Responsive',
        context: 'Engineered for field enthusiasts on mobile viewports',
      },
    ],
    problem:
      'Indonesian avian competition communities historically relied on fragmented Facebook groups, compressed brochure images, and unclear tournament schedules with no centralized catalog.',
    solution:
      'Engineered a prestigious digital arena showcasing certified championship schedules, elite equipment, federation rules, and verified community directories with seamless mobile navigation.',
    architectureNodes: [
      {
        layer: '01 · Digital Arena Front',
        name: 'High-Impact Editorial Showcase',
        spec: 'Modern Tailwind V4 · Dynamic Cards',
        detail: 'Elevates community prestige with cinematic imagery and clear event categorization.',
      },
      {
        layer: '02 · Event & Rulebook System',
        name: 'Structured Tournament Guide',
        spec: 'Fast Filterable Calendar',
        detail: 'Allows participants to inspect judging rubrics, registration deadlines, and venue locations.',
      },
    ],
    engineeringDecisions: [
      {
        title: 'Mobile-First Performance for Field Users',
        rationale:
          'Optimized all assets and interactions so tournament participants on unstable 4G networks at field venues can access schedules without delay.',
      },
    ],
  },
];

/** Urutan tampil resmi — dipakai oleh Selected Work, archive table, dan drawer. */
const PROJECT_ORDER = [
  'ting-ai',
  'universitas-primagraha',
  'opac-upg',
  'lpm-upg',
  'lppm-upg',
  'perpus-upg',
  'rajawali-prestige',
  'central-emas',
];

const ALL_PROJECTS = [...BASE_PROJECTS, ...CAMPUS_PROJECTS];

export const PROJECTS_DATA: ProjectCaseStudy[] = PROJECT_ORDER.map((id, i) => {
  const project = ALL_PROJECTS.find((p) => p.id === id);
  if (!project) throw new Error(`Project "${id}" not found`);
  const pad = (n: number) => String(n).padStart(2, '0');
  return { ...project, index: `${pad(i + 1)} / ${pad(PROJECT_ORDER.length)}` };
});

export function getProjectById(id: string): ProjectCaseStudy | undefined {
  return PROJECTS_DATA.find((p) => p.id === id);
}
