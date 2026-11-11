import React, { useState } from 'react';
import { ManifestProject } from '../types';
import { FileCode, Search, Copy, Check, Download, RotateCcw, Plus, ExternalLink, ShieldAlert } from 'lucide-react';
import { DEFAULT_RAW_XML } from '../data/manifestData';

interface ManifestEditorProps {
  projects: ManifestProject[];
  rawXml: string;
  onUpdateXml: (newXml: string) => void;
  onUpdateProjects: (projects: ManifestProject[]) => void;
}

export const ManifestEditor: React.FC<ManifestEditorProps> = ({
  projects,
  rawXml,
  onUpdateXml,
  onUpdateProjects,
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'xml'>('visual');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [editXmlValue, setEditXmlValue] = useState(rawXml);

  const categories = ['all', 'device', 'kernel', 'vendor', 'hardware', 'sepolicy'];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.revision.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(editXmlValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([editXmlValue], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lge_judypn.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setEditXmlValue(DEFAULT_RAW_XML);
    onUpdateXml(DEFAULT_RAW_XML);
  };

  const handleXmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditXmlValue(e.target.value);
    onUpdateXml(e.target.value);
  };

  const handleAddCustomProject = () => {
    const newProj: ManifestProject = {
      path: 'hardware/lge/extras',
      name: 'LineageOS/android_hardware_lge',
      revision: 'lineage-21.0',
      category: 'hardware',
      description: 'Custom extra HAL repository',
    };
    onUpdateProjects([...projects, newProj]);
  };

  const getCategoryBadge = (cat: ManifestProject['category']) => {
    switch (cat) {
      case 'kernel':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'device':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'vendor':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'hardware':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'sepolicy':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Manifest Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-base">lge_judypn.xml Manifest</h2>
            <p className="text-xs text-slate-400">
              Local manifest mounted at <code className="text-slate-300">.repo/local_manifests/lge_judypn.xml</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex text-xs">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === 'visual' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Visual Table ({projects.length})
            </button>
            <button
              onClick={() => setViewMode('xml')}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === 'xml' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw XML
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Copy</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export XML</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
            title="Reset to default lge_judypn.xml"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="p-4 sm:p-5">
          {/* Filters and search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search repository, path or branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-xs capitalize whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}

              <button
                onClick={handleAddCustomProject}
                className="px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 transition shrink-0 ml-1"
              >
                <Plus className="w-3 h-3" />
                Add Repo
              </button>
            </div>
          </div>

          {/* Project Table */}
          <div className="border border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Target Tree Path</th>
                  <th className="py-2.5 px-3">Upstream Repository</th>
                  <th className="py-2.5 px-3">Revision / Branch</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Source Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredProjects.map((proj, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {proj.path}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {proj.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 text-[11px]">
                        {proj.revision}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded border text-[11px] uppercase tracking-wider ${getCategoryBadge(proj.category)}`}>
                        {proj.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <a
                        href={`https://github.com/${proj.name}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Device & Manifest validation note */}
          <div className="mt-4 p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/50 flex items-start gap-2.5 text-xs text-indigo-200">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-300">Manifest Validation:</span> All 14 SDM845 Judypn hardware abstractions are mapped. Lineage 21 kernel matches Snapdragon 845 caf CAF audio, display, and media stacks for proper Halium hybris boot.
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <p className="text-xs text-slate-400 mb-2 font-mono">
            Edit raw XML below. This will be placed into <span className="text-indigo-300">$ANDROID_ROOT/.repo/local_manifests/lge_judypn.xml</span> during Step 3.
          </p>
          <textarea
            value={editXmlValue}
            onChange={handleXmlChange}
            rows={22}
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner selection:bg-indigo-600/50"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
};
