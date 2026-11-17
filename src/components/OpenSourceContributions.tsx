import React from 'react';
import { ArrowUpRight, GitMerge, GitPullRequest, GitPullRequestClosed } from 'lucide-react';
import { CONTRIBUTIONS, GITHUB_PROFILE_URL, type ContributionState } from '../data/contributions';

const STATE_STYLE: Record<ContributionState, { label: string; cls: string; Icon: typeof GitMerge }> = {
  merged: { label: 'Merged', cls: 'bg-violet-50 text-violet-700 border-violet-200', Icon: GitMerge },
  open: { label: 'Open', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: GitPullRequest },
  closed: { label: 'Closed', cls: 'bg-neutral-100 text-neutral-500 border-neutral-200', Icon: GitPullRequestClosed },
};

export const OpenSourceContributions: React.FC = () => {
  const count = (s: ContributionState) => CONTRIBUTIONS.filter((c) => c.state === s).length;
  const repos = new Set(CONTRIBUTIONS.map((c) => c.repo)).size;

  const stats = [
    { label: 'Pull requests', value: CONTRIBUTIONS.length },
    { label: 'Merged', value: count('merged') },
    { label: 'Open', value: count('open') },
    { label: 'Repositories', value: repos },
  ];

  return (
    <div id="open-source" className="pt-16 mt-16 border-t border-black/10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#c84b15] font-semibold block mb-2">
            04.1 · Open Source &amp; Bounties
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">GitHub bounty &amp; contribution log</h3>
          <p className="text-sm text-neutral-600 mt-2 max-w-xl">
            Pull request publik di repositori orang lain. Status diambil apa adanya dari GitHub — tidak semua di-merge.
          </p>
        </div>
        <a
          href={GITHUB_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs font-semibold text-[#0a0a0a] hover:text-[#c84b15] inline-flex items-center gap-1.5 transition"
        >
          github.com/Vinzz2303 <ArrowUpRight className="w-3.5 h-3.5 text-[#c84b15]" />
        </a>
      </div>

      <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/10 border border-black/10 rounded-2xl overflow-hidden mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#f4f3ef] px-6 py-5">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">{s.label}</dt>
            <dd className="text-3xl font-extrabold tracking-tight tabular-nums mt-1">{s.value}</dd>
          </div>
        ))}
      </dl>

      <ul className="divide-y divide-black/10 border-t border-b border-black/10">
        {CONTRIBUTIONS.map((c) => {
          const { label, cls, Icon } = STATE_STYLE[c.state];
          return (
            <li key={c.url}>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-4 px-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 hover:bg-black/[0.03] transition group"
              >
                <span
                  className={`inline-flex items-center gap-1.5 w-fit shrink-0 sm:w-24 justify-center border rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold ${cls}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </span>
                <span className="font-mono text-xs text-neutral-500 shrink-0 sm:w-72 truncate">
                  {c.repo}#{c.number}
                </span>
                <span className="font-semibold text-sm flex-1 group-hover:text-[#c84b15] transition">{c.title}</span>
                <span className="font-mono text-xs text-neutral-500 shrink-0 tabular-nums">{c.date}</span>
                <ArrowUpRight className="hidden sm:block w-3.5 h-3.5 text-[#c84b15] shrink-0" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

