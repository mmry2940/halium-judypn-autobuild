import React, { useState, useEffect } from 'react';
import { Zap, ExternalLink, RefreshCw, CheckCircle, Clock, AlertTriangle, Terminal, Copy, Check } from 'lucide-react';

interface GitHubRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_number: number;
  event: string;
}

export const GitHubActionsRunner: React.FC = () => {
  const [repoOwner, setRepoOwner] = useState<string>('mmry2940');
  const [repoName, setRepoName] = useState<string>('halium-judypn-autobuild');
  const [githubToken, setGithubToken] = useState<string>('');
  const [workflowFile] = useState<string>('build.yml');
  const [runs, setRuns] = useState<GitHubRun[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);

  // Fetch real workflow runs from GitHub public REST API
  const fetchRuns = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3+json',
      };
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs?per_page=5`, {
        headers,
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Repository ${repoOwner}/${repoName} not found or has no public Actions.`);
        }
        throw new Error(`GitHub API Error: ${res.statusText}`);
      }

      const data = await res.json();
      setRuns(data.workflow_runs || []);
      if ((data.workflow_runs || []).length === 0) {
        setMessage({
          text: `No runs found yet for ${repoOwner}/${repoName}. Trigger a run using GitHub Actions!`,
          type: 'info',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch runs';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  // Trigger real workflow_dispatch on GitHub Actions
  const dispatchWorkflow = async () => {
    if (!githubToken) {
      setMessage({
        text: 'A GitHub Personal Access Token (PAT) with "workflow" or "repo" permission is required to trigger workflow_dispatch directly via API. Alternatively, use GitHub web UI or the gh CLI command below.',
        type: 'error',
      });
      return;
    }

    setIsDispatching(true);
    setMessage(null);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/${workflowFile}/dispatches`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${githubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: 'hybris',
          }),
        }
      );

      if (res.status === 204) {
        setMessage({
          text: 'Successfully dispatched real Halium Image build on GitHub Actions! It will appear in the runs list shortly.',
          type: 'success',
        });
        setTimeout(fetchRuns, 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Dispatch failed with status ${res.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to dispatch workflow';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setIsDispatching(false);
    }
  };

  const ghCliCommand = `gh workflow run build.yml -R ${repoOwner}/${repoName} --ref hybris`;

  const copyCli = () => {
    navigator.clipboard.writeText(ghCliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-lg">Real Cloud Build via GitHub Actions</h2>
            <p className="text-xs text-slate-400">
              Trigger and download real 250GB Halium full builds running on GitHub's Ubuntu 22.04 infrastructure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://github.com/${repoOwner}/${repoName}/actions/workflows/build.yml`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
          >
            <span>Open in GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={fetchRuns}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh runs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Explanatory Banner: Why GitHub Actions compiles the real files */}
      <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-900/60 text-xs text-indigo-200 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-indigo-300">
          <Zap className="w-4 h-4 text-amber-400" />
          Why Halium Requires Cloud / Dedicated Linux Compilation:
        </div>
        <p className="text-slate-300 leading-relaxed">
          Compiling an entire Halium/Lineage 21 tree requires <strong>250 GB to 300 GB</strong> of disk storage, 16 GB RAM, and ~2–3 hours of CPU time to fetch hundreds of gigabytes from LineageOS and Qualcomm CAF.
          This repository is specifically architected to run this heavy build on <strong>GitHub Actions runners</strong> (defined in <code className="text-indigo-300">.github/workflows/build.yml</code>), which uploads the real <code className="text-emerald-300">hybris-boot.img</code> and <code className="text-emerald-300">system.img</code> directly to GitHub as downloadable artifacts!
        </p>
      </div>

      {/* Repository & Token Input */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs">
        <div>
          <label className="block text-slate-400 font-medium mb-1">GitHub Repository</label>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={repoOwner}
              onChange={(e) => setRepoOwner(e.target.value)}
              className="w-1/3 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
              placeholder="owner"
            />
            <span className="text-slate-500">/</span>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
              placeholder="repo"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-slate-400 font-medium mb-1">
            GitHub Personal Access Token (PAT) <span className="text-slate-500 font-normal">(Optional, for direct 1-click trigger)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx (needs 'workflow' scope)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200 font-mono"
            />
            <button
              onClick={dispatchWorkflow}
              disabled={isDispatching}
              className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold shadow transition whitespace-nowrap flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isDispatching ? 'Dispatching...' : 'Trigger Real Build'}</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : message.type === 'error'
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              : 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : message.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <Clock className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* GitHub CLI / Terminal Dispatch instructions */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            Trigger via GitHub CLI on your local terminal:
          </span>
          <button
            onClick={copyCli}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition"
          >
            {copiedCli ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCli ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 select-all">
          {ghCliCommand}
        </div>
      </div>

      {/* Real Runs List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>Recent Real GitHub Actions Workflow Runs:</span>
          <span className="text-[11px] font-normal text-slate-500 font-mono">
            {runs.length} runs retrieved
          </span>
        </h3>

        {runs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-slate-800 rounded-lg">
            No active runs currently recorded on {repoOwner}/{repoName}. Trigger a run above or via GitHub.
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {runs.map((run) => (
              <div
                key={run.id}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  {run.status === 'completed' && run.conclusion === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : run.status === 'in_progress' ? (
                    <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                  ) : run.conclusion === 'failure' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{run.name} #{run.run_number}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                          run.conclusion === 'success'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : run.status === 'in_progress'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {run.status === 'completed' ? run.conclusion : run.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Event: {run.event} • Started: {new Date(run.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={run.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 text-xs transition"
                  >
                    <span>View Logs & Artifacts</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Local Docker alternative */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
        <h4 className="font-bold text-slate-300 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          Or Build 100% Real Locally using Docker (Requires 250GB storage on your Linux PC):
        </h4>
        <div className="p-3 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
{`# 1. Clone repository on your workstation
git clone https://github.com/${repoOwner}/${repoName}.git
cd ${repoName}

# 2. Run inside Ubuntu 22.04 container with mounted 250GB volume:
docker run -it --rm \\
  -v $(pwd)/android_root:/home/runner/work/halium \\
  -v $(pwd):/workspace \\
  ubuntu:22.04 /bin/bash -c "
    cd /workspace && bash -x .github/workflows/build.yml # or bash -x build-hal.sh
  "`}
        </div>
      </div>
    </div>
  );
};
