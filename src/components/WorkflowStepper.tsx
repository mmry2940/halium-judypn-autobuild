import React from 'react';
import { BuildStep } from '../types';
import { CheckCircle2, Clock, Terminal, ChevronRight, Copy, Check } from 'lucide-react';

interface WorkflowStepperProps {
  steps: BuildStep[];
  currentStepIndex: number;
  selectedStep: BuildStep;
  onSelectStep: (step: BuildStep) => void;
  isBuilding: boolean;
  completedSteps: string[];
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  steps,
  currentStepIndex,
  selectedStep,
  onSelectStep,
  isBuilding,
  completedSteps,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h2 className="font-semibold text-slate-100 text-sm sm:text-base">
            GitHub Actions Workflow Instructions (.github/workflows/build.yml)
          </h2>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
          ubuntu-22.04 runner
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Step list on left */}
        <div className="lg:col-span-5 p-3 space-y-2 max-h-[500px] overflow-y-auto">
          {steps.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = isBuilding && currentStepIndex === idx;
            const isSelected = selectedStep.id === step.id;

            return (
              <button
                key={step.id}
                onClick={() => onSelectStep(step)}
                className={`w-full text-left p-3 rounded-lg border transition flex items-start gap-3 ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs sm:text-sm truncate">{step.name}</span>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">{step.durationEst}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{step.description}</p>
                </div>

                <ChevronRight className={`w-4 h-4 text-slate-500 transition ${isSelected ? 'rotate-90 text-indigo-400' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Selected Step Inspector on right */}
        <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Workflow Step Command</span>
                <h3 className="font-bold text-slate-100 text-base sm:text-lg">{selectedStep.name}</h3>
              </div>
              <button
                onClick={() => handleCopy(selectedStep.command)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Bash'}</span>
              </button>
            </div>

            <p className="text-sm text-slate-300 mt-3">{selectedStep.description}</p>

            {/* Bash Command Code Block */}
            <div className="mt-4">
              <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                {selectedStep.command}
              </div>
            </div>

            {/* Key step highlights */}
            <div className="mt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Step Highlights & Context:</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedStep.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Environment: <code className="text-indigo-300">ANDROID_ROOT=/home/runner/work/halium/</code></span>
            <span>Device: <code className="text-indigo-300">DEVICE=judypn</code></span>
          </div>
        </div>
      </div>
    </div>
  );
};
