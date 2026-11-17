export type ContributionState = 'merged' | 'open' | 'closed';

export interface Contribution {
  repo: string;
  number: number;
  title: string;
  state: ContributionState;
  date: string;
  url: string;
}

export const GITHUB_PROFILE_URL = 'https://github.com/Vinzz2303';

/** Data pull request publik dari GitHub API (akun Vinzz2303). Status ditampilkan apa adanya. */
export const CONTRIBUTIONS: Contribution[] = [
  {
    "repo": "twentyhq/twenty",
    "number": 20755,
    "title": "fix(email): resolve reply account from thread channel",
    "state": "merged",
    "date": "2026-05-20",
    "url": "https://github.com/twentyhq/twenty/pull/20755"
  },
  {
    "repo": "qtop/qtop",
    "number": 364,
    "title": "fix viewport horizontal scroll indexes",
    "state": "merged",
    "date": "2026-05-16",
    "url": "https://github.com/qtop/qtop/pull/364"
  },
  {
    "repo": "gougousongsong/abk-coding-test",
    "number": 7,
    "title": "Fix: Issue #1",
    "state": "open",
    "date": "2026-09-03",
    "url": "https://github.com/gougousongsong/abk-coding-test/pull/7"
  },
  {
    "repo": "zhangjiayang6835-cyber/bounty-plaza",
    "number": 975,
    "title": "Fix: Issue #834",
    "state": "open",
    "date": "2026-09-03",
    "url": "https://github.com/zhangjiayang6835-cyber/bounty-plaza/pull/975"
  },
  {
    "repo": "tscircuit/schematic-trace-solver",
    "number": 541,
    "title": "feat: add getOutput() to SchematicTracePipelineSolver",
    "state": "open",
    "date": "2026-06-14",
    "url": "https://github.com/tscircuit/schematic-trace-solver/pull/541"
  },
  {
    "repo": "tscircuit/schematic-trace-solver",
    "number": 509,
    "title": "feat: merge same-net trace lines close together (#34)",
    "state": "open",
    "date": "2026-06-09",
    "url": "https://github.com/tscircuit/schematic-trace-solver/pull/509"
  },
  {
    "repo": "tscircuit/matchpack",
    "number": 132,
    "title": "Fix layout issue #12 by isolating passives in ChipPartitionsSolver",
    "state": "open",
    "date": "2026-06-09",
    "url": "https://github.com/tscircuit/matchpack/pull/132"
  },
  {
    "repo": "tscircuit/prompt-benchmarks",
    "number": 94,
    "title": "fix: use auto generated docs in system prompt",
    "state": "open",
    "date": "2026-06-07",
    "url": "https://github.com/tscircuit/prompt-benchmarks/pull/94"
  },
  {
    "repo": "tscircuit/schematic-viewer",
    "number": 222,
    "title": "fix: highlight connected traces on hover",
    "state": "open",
    "date": "2026-06-07",
    "url": "https://github.com/tscircuit/schematic-viewer/pull/222"
  },
  {
    "repo": "highlight/highlight",
    "number": 10549,
    "title": "fix(ui): replace antd Select with ComboboxSelect in GitHubSettingsModal",
    "state": "open",
    "date": "2026-06-05",
    "url": "https://github.com/highlight/highlight/pull/10549"
  },
  {
    "repo": "outerbase/starbasedb",
    "number": 270,
    "title": "fix(export): stream database dump with LIMIT/OFFSET to fix large-DB failure (#59)",
    "state": "open",
    "date": "2026-06-04",
    "url": "https://github.com/outerbase/starbasedb/pull/270"
  },
  {
    "repo": "SolFoundry/solfoundry",
    "number": 1311,
    "title": "Polish mobile responsive layout",
    "state": "open",
    "date": "2026-05-16",
    "url": "https://github.com/SolFoundry/solfoundry/pull/1311"
  },
  {
    "repo": "tscircuit/fake-algora",
    "number": 36,
    "title": "Add fake payment API",
    "state": "open",
    "date": "2026-05-15",
    "url": "https://github.com/tscircuit/fake-algora/pull/36"
  },
  {
    "repo": "tscircuit/circuit-json-to-step",
    "number": 94,
    "title": "test: guard component fallback solids",
    "state": "open",
    "date": "2026-05-14",
    "url": "https://github.com/tscircuit/circuit-json-to-step/pull/94"
  },
  {
    "repo": "aietal/aimengpt",
    "number": 4,
    "title": "feat: improve scientific RAG citations",
    "state": "open",
    "date": "2026-05-13",
    "url": "https://github.com/aietal/aimengpt/pull/4"
  },
  {
    "repo": "typeorm/typeorm",
    "number": 12622,
    "title": "fix: prevent empty criteria mass mutation",
    "state": "closed",
    "date": "2026-06-25",
    "url": "https://github.com/typeorm/typeorm/pull/12622"
  },
  {
    "repo": "tscircuit/docs",
    "number": 745,
    "title": "docs: add Class D Audio Amplifier HAT tutorial",
    "state": "closed",
    "date": "2026-06-14",
    "url": "https://github.com/tscircuit/docs/pull/745"
  },
  {
    "repo": "tscircuit/pcb-viewer",
    "number": 893,
    "title": "fix: replace DisabledAutoFocus with focusOnHover={false}",
    "state": "closed",
    "date": "2026-06-07",
    "url": "https://github.com/tscircuit/pcb-viewer/pull/893"
  },
  {
    "repo": "UnsafeLabs/Bounty-Hunters",
    "number": 6322,
    "title": "[ Antigravity ] [ Laravel ] Implement API authentication controller",
    "state": "closed",
    "date": "2026-06-05",
    "url": "https://github.com/UnsafeLabs/Bounty-Hunters/pull/6322"
  },
  {
    "repo": "typeorm/typeorm",
    "number": 12563,
    "title": "fix(postgres): avoid recreating columns on length change",
    "state": "closed",
    "date": "2026-06-05",
    "url": "https://github.com/typeorm/typeorm/pull/12563"
  },
  {
    "repo": "aibtcdev/aibtc-mcp-server",
    "number": 533,
    "title": "fix: harden native AIBTC bounty requests",
    "state": "closed",
    "date": "2026-05-17",
    "url": "https://github.com/aibtcdev/aibtc-mcp-server/pull/533"
  },
  {
    "repo": "qtop/qtop",
    "number": 365,
    "title": "docs: triage stale qtop pull requests",
    "state": "closed",
    "date": "2026-05-16",
    "url": "https://github.com/qtop/qtop/pull/365"
  },
  {
    "repo": "CapSoftware/Cap",
    "number": 1822,
    "title": "test: add config vite resolver coverage",
    "state": "closed",
    "date": "2026-05-15",
    "url": "https://github.com/CapSoftware/Cap/pull/1822"
  },
  {
    "repo": "INDIGOAZUL/la-tanda-web",
    "number": 317,
    "title": "docs: improve developer onboarding README",
    "state": "closed",
    "date": "2026-05-14",
    "url": "https://github.com/INDIGOAZUL/la-tanda-web/pull/317"
  },
  {
    "repo": "moorcheh-ai/memanto",
    "number": 470,
    "title": "feat: add LangGraph Memanto cross-session memory example",
    "state": "closed",
    "date": "2026-05-13",
    "url": "https://github.com/moorcheh-ai/memanto/pull/470"
  },
  {
    "repo": "typeorm/typeorm",
    "number": 12479,
    "title": "fix: avoid recreating postgres columns on length change",
    "state": "closed",
    "date": "2026-05-13",
    "url": "https://github.com/typeorm/typeorm/pull/12479"
  },
  {
    "repo": "OpenPipe/ART",
    "number": 679,
    "title": "examples: add local ART-E email search task",
    "state": "closed",
    "date": "2026-05-13",
    "url": "https://github.com/OpenPipe/ART/pull/679"
  }
];
