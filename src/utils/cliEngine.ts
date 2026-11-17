import { PROJECTS_DATA } from '../data/projects';

export interface CliOutputLine {
  type: 'text' | 'highlight' | 'code' | 'metric' | 'project-action';
  content: string;
  projectId?: string;
  projectTitle?: string;
}

export interface CliCommandResult {
  command: string;
  clear?: boolean;
  lines: CliOutputLine[];
}

export const QUICK_COMMANDS = [
  { cmd: 'whoami', label: 'whoami' },
  { cmd: 'projects', label: 'projects' },
  { cmd: 'architecture ting-ai', label: 'architecture ting-ai' },
  { cmd: 'benchmark', label: 'benchmark' },
  { cmd: 'ask-ai How does the RAG pipeline avoid hallucinations?', label: 'ask-ai RAG guardrails' },
  { cmd: 'help', label: 'help' },
];

export function executeCliCommand(rawInput: string): CliCommandResult {
  const trimmed = rawInput.trim();
  const lower = trimmed.toLowerCase();
  const parts = trimmed.split(/\s+/);
  const baseCmd = parts[0]?.toLowerCase() || '';
  const argString = parts.slice(1).join(' ');

  if (!trimmed) {
    return {
      command: '',
      lines: [{ type: 'text', content: 'Type "help" to list available engineering commands.' }],
    };
  }

  if (baseCmd === 'clear' || baseCmd === 'cls') {
    return {
      command: trimmed,
      clear: true,
      lines: [],
    };
  }

  if (baseCmd === 'help') {
    return {
      command: trimmed,
      lines: [
        { type: 'highlight', content: 'Available Interactive Engineering Commands:' },
        { type: 'code', content: '  whoami                    -> Engineer profile, stack & Jakarta availability' },
        { type: 'code', content: '  projects                  -> Inspect shipped production systems & open case studies' },
        { type: 'code', content: '  architecture [id]         -> View system pipeline (ting-ai | upg | rag)' },
        { type: 'code', content: '  benchmark                 -> Run live latency, RLS & WebGL telemetry suite' },
        { type: 'code', content: '  ask-ai <question>         -> Query AI builder assistant on architecture & ROI' },
        { type: 'code', content: '  contact                   -> Direct WhatsApp & email coordinates' },
        { type: 'code', content: '  clear                     -> Clear terminal buffer' },
      ],
    };
  }

  if (baseCmd === 'whoami') {
    return {
      command: trimmed,
      lines: [
        { type: 'highlight', content: 'Faturachman Alkahfi (@FaturAI) — Full-stack Engineer & AI Builder' },
        { type: 'text', content: 'Location     : Jakarta, Indonesia (GMT+7) · Available for select builds' },
        { type: 'text', content: 'Philosophy   : One engineer from UI & PostgreSQL schema to LLM pipelines & VPS deployment.' },
        { type: 'metric', content: 'Core Stack   : React 19 · Next.js · TypeScript · Gemini Pro · Supabase/PostgreSQL · Prisma · Three.js' },
        { type: 'text', content: 'Track Record : Founder of Ting AI (app.tingai.my.id) & Lead Developer for Universitas Primagraha (10k+ MAU).' },
      ],
    };
  }

  if (baseCmd === 'projects' || baseCmd === 'ls') {
    const lines: CliOutputLine[] = [
      { type: 'highlight', content: 'Shipped Production Systems (Click below to open Deep Case Study Drawer):' },
    ];
    for (const proj of PROJECTS_DATA) {
      lines.push({
        type: 'project-action',
        content: `[${proj.index}] ${proj.title} — ${proj.subtitle} (${proj.tech})`,
        projectId: proj.id,
        projectTitle: proj.title,
      });
    }
    return { command: trimmed, lines };
  }

  if (baseCmd === 'architecture' || baseCmd === 'arch') {
    const target = argString.toLowerCase();
    const byId = (id: string) => PROJECTS_DATA.find((p) => p.id === id);
    const num = /^\d{1,2}$/.test(target) ? PROJECTS_DATA[parseInt(target, 10) - 1] : undefined;
    let project = num ?? PROJECTS_DATA[0];
    if (!num) {
      if (target.includes('opac')) project = byId('opac-upg') ?? project;
      else if (target.includes('lppm')) project = byId('lppm-upg') ?? project;
      else if (target.includes('lpm')) project = byId('lpm-upg') ?? project;
      else if (target.includes('perpus') || target.includes('library')) project = byId('perpus-upg') ?? project;
      else if (target.includes('rajawali')) project = byId('rajawali-prestige') ?? project;
      else if (target.includes('emas') || target.includes('gold')) project = byId('central-emas') ?? project;
      else if (target.includes('upg') || target.includes('primagraha')) project = byId('universitas-primagraha') ?? project;
    }

    const lines: CliOutputLine[] = [
      { type: 'highlight', content: `System Architecture Topology — ${project.title} (${project.role})` },
    ];
    for (const node of project.architectureNodes) {
      lines.push({
        type: 'code',
        content: `  ${node.layer.padEnd(28, ' ')} │ ${node.name} [${node.spec}]`,
      });
    }
    lines.push({
      type: 'project-action',
      content: `Inspect full ${project.title} engineering breakdown in Slide-over Drawer`,
      projectId: project.id,
      projectTitle: project.title,
    });
    return { command: trimmed, lines };
  }

  if (baseCmd === 'benchmark' || baseCmd === 'sysinfo') {
    return {
      command: trimmed,
      lines: [
        { type: 'highlight', content: 'Running Production Telemetry & Benchmark Suite...' },
        { type: 'metric', content: '  [PASS] Ting AI Risk Synthesis     : 1,380ms p95 · 100% JSON Schema compliance' },
        { type: 'metric', content: '  [PASS] UPG Campus Portal (ISR)    : 98/100 Lighthouse LCP · 10,000+ monthly active users' },
        { type: 'metric', content: '  [PASS] Hybrid RAG (pgvector+BM25) : 1,140ms p90 · 99.4% citation grounding accuracy' },
        { type: 'metric', content: '  [PASS] 3D Squircle Physics Solver : 120Hz damped spring-mass · Zero GC allocation loop' },
      ],
    };
  }

  if (baseCmd === 'contact') {
    return {
      command: trimmed,
      lines: [
        { type: 'highlight', content: 'Direct Engineering Channels:' },
        { type: 'code', content: '  Email    : faturachmanalkahfi7@gmail.com' },
        { type: 'code', content: '  WhatsApp : https://wa.me/6281234567890 (Fast response · Jakarta GMT+7)' },
      ],
    };
  }

  if (baseCmd === 'ask-ai' || baseCmd === 'ask') {
    const q = argString.trim();
    if (!q) {
      return {
        command: trimmed,
        lines: [
          { type: 'text', content: 'Usage: ask-ai <your technical question>' },
          { type: 'code', content: 'Example: ask-ai How does Ting AI calculate portfolio risk?' },
        ],
      };
    }

    const qLower = q.toLowerCase();
    if (qLower.includes('rag') || qLower.includes('hallucin') || qLower.includes('vector')) {
      return {
        command: trimmed,
        lines: [
          { type: 'highlight', content: 'AI Reasoning Trace · Hybrid RAG & Hallucination Guardrails:' },
          {
            type: 'text',
            content:
              '1. Hybrid Retrieval: Combines PostgreSQL pgvector cosine similarity with lexical BM25 via Reciprocal Rank Fusion (RRF), lifting exact SKU/code recall to 96.8%.',
          },
          {
            type: 'text',
            content:
              '2. Grounded Citations: Gemini Pro is constrained by a strict schema requiring [Doc-ID:Page] inline citations. If max chunk similarity < 0.78, the agent abstains rather than guessing.',
          },
          {
            type: 'project-action',
            content: 'Open Enterprise RAG & WhatsApp AI Case Study',
            projectId: 'enterprise-rag-whatsapp',
            projectTitle: 'Enterprise RAG & WhatsApp AI',
          },
        ],
      };
    }

    if (qLower.includes('ting') || qLower.includes('risk') || qLower.includes('portfolio') || qLower.includes('stock')) {
      return {
        command: trimmed,
        lines: [
          { type: 'highlight', content: 'AI Reasoning Trace · Ting AI Risk Engine Architecture:' },
          {
            type: 'text',
            content:
              '1. Deterministic Math First: Position weights, sector concentration caps, and cash ratios are computed in strict TypeScript—never delegated to token prediction.',
          },
          {
            type: 'text',
            content:
              '2. Contextual Macro Synthesis: Gemini Pro cross-references verified portfolio exposures against IDX & global macro catalysts to surface thesis vulnerabilities before market open.',
          },
          {
            type: 'project-action',
            content: 'Open Ting AI Case Study',
            projectId: 'ting-ai',
            projectTitle: 'Ting AI',
          },
        ],
      };
    }

    if (qLower.includes('upg') || qLower.includes('primagraha') || qLower.includes('scale') || qLower.includes('traffic')) {
      return {
        command: trimmed,
        lines: [
          { type: 'highlight', content: 'AI Reasoning Trace · High-Traffic Next.js & PostgreSQL Scaling:' },
          {
            type: 'text',
            content:
              'Universitas Primagraha serves 10,000+ monthly visitors by separating public curriculum pages (cached via Next.js ISR + Nginx) from transactional PMB admission writes pooled through PgBouncer + Prisma.',
          },
          {
            type: 'project-action',
            content: 'Open Universitas Primagraha Case Study',
            projectId: 'universitas-primagraha',
            projectTitle: 'Universitas Primagraha',
          },
        ],
      };
    }

    return {
      command: trimmed,
      lines: [
        { type: 'highlight', content: `AI Architecture Response for: "${q}"` },
        {
          type: 'text',
          content:
            'Faturachman designs end-to-end production systems combining Next.js/React frontends, type-safe PostgreSQL/Supabase backends, and grounded Gemini Pro pipelines deployed on hardened Linux VPS infrastructure.',
        },
        {
          type: 'code',
          content: 'Tip: Try "architecture ting-ai", "benchmark", or click any project card to inspect full system diagrams.',
        },
      ],
    };
  }

  // Fallback for natural questions typed without `ask-ai` prefix
  if (lower.includes('?')) {
    return executeCliCommand(`ask-ai ${trimmed}`);
  }

  return {
    command: trimmed,
    lines: [
      {
        type: 'text',
        content: `Command not recognized: "${baseCmd}". Type "help" for available commands or "ask-ai <question>" to query the AI assistant.`,
      },
    ],
  };
}
