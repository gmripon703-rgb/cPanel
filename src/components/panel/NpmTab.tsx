import React, { useState } from 'react';
import { 
  Package, 
  DownloadCloud, 
  Check, 
  RefreshCw, 
  Search, 
  Trash2, 
  Layers, 
  Sparkles,
  ArrowRight,
  Code
} from 'lucide-react';
import { HostedApp, SystemMetrics } from '../../types/hosting';

interface NpmTabProps {
  metrics: SystemMetrics;
  apps: HostedApp[];
  onCleanCache: () => void;
  cleaning: boolean;
}

export const NpmTab: React.FC<NpmTabProps> = ({
  metrics,
  apps,
  onCleanCache,
  cleaning,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(apps[0]?.id || '');
  const [packageNameInput, setPackageNameInput] = useState('');
  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState<string | null>(null);

  const [installedPackages, setInstalledPackages] = useState<Record<string, Array<{ name: string; version: string; sizeKb: number }>>>({
    'app-main-api': [
      { name: 'express', version: '^4.21.0', sizeKb: 2100 },
      { name: 'cors', version: '^2.8.5', sizeKb: 140 },
      { name: 'dotenv', version: '^16.4.5', sizeKb: 90 },
      { name: 'better-sqlite3', version: '^9.4.3', sizeKb: 18400 },
      { name: 'helmet', version: '^7.1.0', sizeKb: 340 }
    ],
    'app-web-landing': [
      { name: 'react', version: '^19.0.0', sizeKb: 310 },
      { name: 'react-dom', version: '^19.0.0', sizeKb: 4200 },
      { name: 'vite', version: '^6.0.0', sizeKb: 42000 },
      { name: 'lucide-react', version: '^0.460.0', sizeKb: 5400 }
    ],
    'app-telemetry-bot': [
      { name: 'axios', version: '^1.7.7', sizeKb: 1200 },
      { name: 'systeminformation', version: '^5.22.0', sizeKb: 3100 }
    ]
  });

  const activePackages = installedPackages[selectedAppId] || [];

  const handleInstallPackage = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = packageNameInput.trim();
    if (!pkg) return;

    setInstalling(true);
    setTimeout(() => {
      setInstalling(false);
      setInstalledPackages(prev => ({
        ...prev,
        [selectedAppId]: [
          ...(prev[selectedAppId] || []),
          { name: pkg, version: '^1.0.0', sizeKb: Math.floor(Math.random() * 2000) + 150 }
        ]
      }));
      setInstalledSuccess(pkg);
      setPackageNameInput('');
      setTimeout(() => setInstalledSuccess(null), 3000);
    }, 1400);
  };

  const selectedApp = apps.find(a => a.id === selectedAppId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">NPM & Node.js Runtime Manager</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage production dependencies and Node.js versions on your AMD64 Ubuntu Desktop host.
          </p>
        </div>

        <button
          onClick={onCleanCache}
          disabled={cleaning}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-850 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${cleaning ? 'animate-spin' : ''}`} />
          <span>{cleaning ? 'Pruning...' : 'Prune ~/.npm Cache (72 MB)'}</span>
        </button>
      </div>

      {/* Runtimes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-neutral-900/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 font-semibold">Node.js 20.x (Active LTS)</span>
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
          </div>
          <div className="text-base font-bold text-white font-mono">v20.18.0</div>
          <div className="text-[11px] text-neutral-400">Default for backend APIs & Express services</div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400">Node.js 22.x (Current)</span>
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
          </div>
          <div className="text-base font-bold text-neutral-200 font-mono">v22.12.0</div>
          <div className="text-[11px] text-neutral-400">Available for frontend Vite builds</div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400">Package Manager</span>
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
          </div>
          <div className="text-base font-bold text-neutral-200 font-mono">npm v10.8.2</div>
          <div className="text-[11px] text-neutral-400">Native npm CLI on Ubuntu amd64</div>
        </div>
      </div>

      {/* Package Installer Form */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Install NPM Package into App</h3>
            <p className="text-xs text-neutral-400">Runs <code className="text-cyan-300 font-mono">npm install --save &lt;package&gt;</code> inside the app's 2GB sandbox.</p>
          </div>
        </div>

        <form onSubmit={handleInstallPackage} className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
          >
            {apps.map(a => (
              <option key={a.id} value={a.id}>App: {a.name} (:{a.port})</option>
            ))}
          </select>

          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={packageNameInput}
              onChange={(e) => setPackageNameInput(e.target.value)}
              placeholder="e.g. lodash, fastify, sharp, jsonwebtoken"
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder:text-neutral-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={installing || !packageNameInput.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {installing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <DownloadCloud className="h-3.5 w-3.5" />}
            <span>{installing ? 'Installing...' : 'Install Dependency'}</span>
          </button>
        </form>

        {installedSuccess && (
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
            <Check className="h-4 w-4 shrink-0" />
            <span>Successfully installed "{installedSuccess}" into {selectedApp?.name}</span>
          </div>
        )}
      </div>

      {/* Installed Packages Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">
              Installed Packages: <span className="text-cyan-400 font-mono">{selectedApp?.name}</span>
            </span>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {activePackages.length} dependencies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-950/40">
                <th className="py-2.5 px-4 font-medium">PACKAGE NAME</th>
                <th className="py-2.5 px-4 font-medium">SEMVER VERSION</th>
                <th className="py-2.5 px-4 font-medium">BUNDLE FOOTPRINT</th>
                <th className="py-2.5 px-4 font-medium text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {activePackages.map((pkg, idx) => (
                <tr key={idx} className="hover:bg-neutral-850/40 transition-colors">
                  <td className="py-2.5 px-4 text-white font-medium flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span>{pkg.name}</span>
                  </td>
                  <td className="py-2.5 px-4 text-neutral-400">{pkg.version}</td>
                  <td className="py-2.5 px-4 text-neutral-300">
                    {pkg.sizeKb > 1024 
                      ? `${(pkg.sizeKb / 1024).toFixed(1)} MB` 
                      : `${pkg.sizeKb} KB`}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="text-emerald-400 text-[11px]">Installed & Resolved</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
