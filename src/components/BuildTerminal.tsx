import React, { useRef, useEffect } from 'react';
import { Terminal, Download, Trash2, Pause, Play, CheckCircle, RefreshCw } from 'lucide-react';
import { BuildLogLine } from '../types';

interface BuildTerminalProps {
  logs: BuildLogLine[];
  isBuilding: boolean;
  progress: number;
  currentAction: string;
  onClear: () => void;
  onTogglePause?: () => void;
  isPaused?: boolean;
  speed: 'normal' | 'turbo' | 'instant';
  setSpeed: (s: 'normal' | 'turbo' | 'instant') => void;
  onStartBuild: () => void;
}

export const BuildTerminal: React.FC<BuildTerminalProps> = ({
  logs,
  isBuilding,
  progress,
  currentAction,
  onClear,
  onTogglePause,
  isPaused = false,
  speed,
  setSpeed,
  onStartBuild,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = React.useState(true);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const downloadLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `halium-judypn-build-${new Date().toISOString().slice(0, 19)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLineClass = (type: BuildLogLine['type']) => {
    switch (type) {
      case 'header':
        return 'text-indigo-400 font-bold bg-indigo-950/40 px-2 py-0.5 rounded my-1 border-l-2 border-indigo-500';
      case 'cmd':
        return 'text-cyan-300 font-semibold flex items-start gap-1.5';
      case 'success':
        return 'text-emerald-400 font-medium';
      case 'warn':
        return 'text-amber-300';
      case 'error':
        return 'text-rose-400 font-bold';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[580px]">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>runner@halium-builder:~/work/halium$</span>
          </div>
        </div>

        {/* Speed & Actions Controls */}
        <div className="flex items-center gap-2">
          {/* Speed Selector */}
          <div className="flex items-center bg-slate-950 rounded border border-slate-800 text-[11px] p-0.5">
            <button
              onClick={() => setSpeed('normal')}
              className={`px-2 py-0.5 rounded transition ${speed === 'normal' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              title="Real-time paced logs"
            >
              1x
            </button>
            <button
              onClick={() => setSpeed('turbo')}
              className={`px-2 py-0.5 rounded transition ${speed === 'turbo' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              title="Fast build simulation"
            >
              5x
            </button>
            <button
              onClick={() => setSpeed('instant')}
              className={`px-2 py-0.5 rounded transition ${speed === 'instant' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              title="Complete build immediately"
            >
              Instant
            </button>
          </div>

          {isBuilding && onTogglePause && (
            <button
              onClick={onTogglePause}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={isPaused ? "Resume build" : "Pause build"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={downloadLogs}
            disabled={logs.length === 0}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
            title="Download log file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClear}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress & Status Banner */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 truncate">
          <span className="text-slate-400">STATUS:</span>
          {isBuilding ? (
            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin" />
              {currentAction}
            </span>
          ) : progress === 100 ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Build Completed Successfully (Images Ready)
            </span>
          ) : (
            <span className="text-slate-400">Idle - Click "Build Boot Image" to run workflow</span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label className="text-[11px] text-slate-400 flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0 w-3 h-3"
            />
            Auto-scroll
          </label>
          <span className="text-indigo-400 font-bold">{progress}%</span>
        </div>
      </div>

      {/* Progress bar line */}
      <div className="w-full bg-slate-900 h-1">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-1 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 selection:bg-indigo-500/30">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
            <Terminal className="w-10 h-10 opacity-30 text-indigo-400" />
            <p className="text-sm">Ready to compile Halium Boot Image for LG V40 (judypn)</p>
            <p className="text-xs text-slate-600 max-w-md text-center">
              Uses <code className="text-slate-400">lge_judypn.xml</code> manifest with SDM845 kernel and Lineage-21.
              Executes workflow steps: sync, envsetup, breakfast, mkbootimg, and halium-boot.
            </p>
            <button
              onClick={onStartBuild}
              className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              Start Automated Halium Build
            </button>
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`leading-relaxed break-words ${getLineClass(log.type)}`}>
              {log.type === 'cmd' && <span className="text-emerald-400 select-none">$ </span>}
              <span>{log.text}</span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
