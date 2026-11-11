import React from 'react';
import { Cpu, Terminal, FileCode, Smartphone, Play, Zap, Download, Cloud, Server } from 'lucide-react';
import { DEVICE_SPECS } from '../data/manifestData';

interface NavbarProps {
  activeTab: 'pipeline' | 'manifest' | 'config' | 'workflow' | 'flashing' | 'real-boot' | 'cloud-build' | 'cloud-boot' | 'remote-pc' | 'scripts';
  setActiveTab: (tab: 'pipeline' | 'manifest' | 'config' | 'workflow' | 'flashing' | 'real-boot' | 'cloud-build' | 'cloud-boot' | 'remote-pc' | 'scripts') => void;
  isBuilding: boolean;
  onStartBuild: () => void;
  hasBuilt: boolean;
  onOpenArtifacts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBuilding,
  onStartBuild,
  hasBuilt,
  onOpenArtifacts,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Device Info */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-lg">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-lg tracking-tight">Halium Autobuild Studio</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  {DEVICE_SPECS.codename}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  SDM845
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                LG V40 ThinQ • Ubuntu Touch / postmarketOS Boot Image
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('scripts')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'scripts'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4 text-emerald-300" />
              <span>Build Scripts</span>
            </button>
            <button
              onClick={() => setActiveTab('remote-pc')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'remote-pc'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                  : 'text-indigo-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Remote PC</span>
            </button>
            <button
              onClick={() => setActiveTab('cloud-boot')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'cloud-boot'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Cloud className="w-4 h-4 text-emerald-400" />
              <span>Cloud Boot (No PC)</span>
            </button>
            <button
              onClick={() => setActiveTab('real-boot')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'real-boot'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>boot.img Packer</span>
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'pipeline'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Pipeline
            </button>
            <button
              onClick={() => setActiveTab('cloud-build')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'cloud-build'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Full AOSP</span>
            </button>
            <button
              onClick={() => setActiveTab('manifest')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'manifest'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4" />
              lge_judypn.xml
            </button>
            <button
              onClick={() => setActiveTab('flashing')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'flashing'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Fastboot Flash
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {hasBuilt && (
              <button
                onClick={onOpenArtifacts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-sm font-medium transition"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Images Ready</span>
              </button>
            )}

            <button
              onClick={onStartBuild}
              disabled={isBuilding}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md ${
                isBuilding
                  ? 'bg-amber-600 text-white cursor-wait animate-pulse'
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white'
              }`}
            >
              <Play className={`w-4 h-4 ${isBuilding ? 'animate-spin' : ''}`} />
              <span>{isBuilding ? 'Simulating Build...' : 'Simulate Pipeline'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-800 text-xs">
          {(['remote-pc', 'cloud-boot', 'real-boot', 'pipeline', 'cloud-build', 'manifest', 'config', 'flashing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded whitespace-nowrap capitalize ${
                activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'remote-pc' ? 'Remote PC' : tab === 'cloud-boot' ? 'Cloud Boot' : tab === 'manifest' ? 'Manifest XML' : tab === 'real-boot' ? 'Real boot.img' : tab === 'cloud-build' ? 'AOSP Build' : tab}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
