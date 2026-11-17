import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ArrowUpRight, CornerDownLeft, RotateCcw } from 'lucide-react';
import { executeCliCommand, QUICK_COMMANDS, CliOutputLine } from '../utils/cliEngine';
import { getProjectById, ProjectCaseStudy } from '../data/projects';
import { soundEngine } from '../utils/soundEngine';

interface HistoryEntry {
  id: string;
  command: string;
  lines: CliOutputLine[];
}

interface AiTerminalPlaygroundProps {
  onOpenProject: (project: ProjectCaseStudy) => void;
}

const INITIAL_HISTORY: HistoryEntry[] = [
  {
    id: 'boot-0',
    command: 'whoami',
    lines: executeCliCommand('whoami').lines,
  },
  {
    id: 'boot-1',
    command: 'benchmark',
    lines: executeCliCommand('benchmark').lines,
  },
];

export const AiTerminalPlayground: React.FC<AiTerminalPlaygroundProps> = ({ onOpenProject }) => {
  const [history, setHistory] = useState<HistoryEntry[]>(INITIAL_HISTORY);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>(['whoami', 'benchmark']);
  const [historyCursor, setHistoryCursor] = useState<number>(-1);
  const outputContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (outputContainerRef.current) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
    }
  }, [history]);

  const runCommand = (rawCmd: string) => {
    soundEngine.playClick(590, 0.025);
    const result = executeCliCommand(rawCmd);

    if (result.clear) {
      setHistory([]);
      setInput('');
      return;
    }

    const newEntry: HistoryEntry = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      command: result.command || rawCmd,
      lines: result.lines,
    };

    setHistory((prev) => [...prev, newEntry]);
    if (rawCmd.trim()) {
      setCmdHistory((prev) => [...prev, rawCmd.trim()]);
    }
    setHistoryCursor(-1);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyCursor === -1 ? cmdHistory.length - 1 : Math.max(0, historyCursor - 1);
      setHistoryCursor(nextIdx);
      setInput(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyCursor === -1) return;
      const nextIdx = historyCursor + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistoryCursor(-1);
        setInput('');
      } else {
        setHistoryCursor(nextIdx);
        setInput(cmdHistory[nextIdx]);
      }
    }
  };

  return (
    <section
      id="playground"
      className="relative bg-[#0a0a0a] text-white py-24 md:py-32 border-t border-white/10 z-20"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#c84b15] font-semibold">
              02 · Interactive AI &amp; Architecture Playground
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[1.04] mt-3 text-white">
              Inspect the engineering behind the interface.
            </h2>
          </div>

          <p className="text-neutral-400 text-sm sm:text-base max-w-md leading-relaxed">
            Run live CLI diagnostics, inspect system architecture pipelines, or query the AI assistant on how Ting AI, Universitas Primagraha, and the RAG engine are built.
          </p>
        </div>

        {/* Interactive Terminal Window */}
        <div className="rounded-2xl bg-[#111111] border border-white/10 shadow-2xl overflow-hidden">
          {/* Terminal Title Bar */}
          <div className="px-4 sm:px-6 py-3.5 bg-[#161616] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-neutral-300">
                <Terminal className="w-3.5 h-3.5 text-[#c84b15]" />
                <span>fatur@ai-builder: ~/production-systems</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] text-neutral-500 hidden sm:inline">
                Interactive Shell · Tabular Telemetry
              </span>
              <button
                type="button"
                onClick={() => runCommand('clear')}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition cursor-pointer"
                aria-label="Clear terminal output"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Quick Command Action Bar */}
          <div className="px-4 sm:px-6 py-3 bg-[#131313] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto">
            <span className="font-mono text-[11px] text-neutral-500 shrink-0 mr-1">
              Quick run:
            </span>
            {QUICK_COMMANDS.map((item) => (
              <button
                key={item.cmd}
                type="button"
                onClick={() => runCommand(item.cmd)}
                className="px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-[#c84b15] text-neutral-200 hover:text-white font-mono text-xs transition whitespace-nowrap shrink-0 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Terminal Scrollable Output */}
          <div
            ref={outputContainerRef}
            className="p-5 sm:p-7 h-[340px] sm:h-[380px] overflow-y-auto font-mono text-xs sm:text-sm space-y-6 bg-[#0d0d0d]"
            aria-live="polite"
          >
            {history.length === 0 ? (
              <div className="text-neutral-500">
                Terminal buffer cleared. Click a quick command above or type{' '}
                <span className="text-white">help</span> and press Enter.
              </div>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-[#c84b15] font-bold">fatur@ai-builder:~$</span>
                    <span className="text-white font-semibold">{entry.command}</span>
                  </div>

                  <div className="pl-0 sm:pl-4 space-y-1.5">
                    {entry.lines.map((line, i) => {
                      if (line.type === 'highlight') {
                        return (
                          <div key={i} className="text-amber-300 font-semibold pt-1">
                            {line.content}
                          </div>
                        );
                      }
                      if (line.type === 'metric') {
                        return (
                          <div key={i} className="text-emerald-400 tabular-nums">
                            {line.content}
                          </div>
                        );
                      }
                      if (line.type === 'code') {
                        return (
                          <div key={i} className="text-neutral-300 whitespace-pre-wrap">
                            {line.content}
                          </div>
                        );
                      }
                      if (line.type === 'project-action' && line.projectId) {
                        return (
                          <div key={i} className="pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const proj = getProjectById(line.projectId!);
                                if (proj) {
                                  soundEngine.playDrawerWhoosh(true);
                                  onOpenProject(proj);
                                }
                              }}
                              className="inline-flex items-center gap-2 text-left text-sky-400 hover:text-sky-300 underline underline-offset-4 transition cursor-pointer"
                            >
                              <span>{line.content}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                            </button>
                          </div>
                        );
                      }
                      return (
                        <div key={i} className="text-neutral-300 leading-relaxed">
                          {line.content}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Command Prompt Input Form */}
          <form
            onSubmit={handleSubmit}
            className="px-4 sm:px-6 py-3.5 bg-[#141414] border-t border-white/10 flex items-center gap-3"
          >
            <label htmlFor="cli-command-input" className="font-mono text-xs sm:text-sm text-[#c84b15] font-bold shrink-0">
              fatur@ai-builder:~$
            </label>
            <input
              id="cli-command-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command (help, whoami, projects, benchmark, ask-ai ...)"
              className="w-full bg-transparent text-white font-mono text-xs sm:text-sm focus:outline-none placeholder:text-neutral-600"
              autoComplete="off"
            />
            <button
              type="submit"
              aria-label="Execute CLI command"
              className="px-3.5 py-1.5 rounded-md bg-[#c84b15] hover:bg-[#df561b] text-white font-mono text-xs font-semibold inline-flex items-center gap-1.5 transition shrink-0 cursor-pointer"
            >
              <span>Run</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
