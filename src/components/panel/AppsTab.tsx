import React, { useState } from 'react';
import { 
  Layers, 
  Play, 
  Square, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  Globe, 
  FileCode, 
  Terminal, 
  Plus, 
  Settings,
  HardDrive,
  Cpu,
  Clock,
  Check,
  GitBranch,
  X
} from 'lucide-react';
import { HostedApp } from '../../types/hosting';

interface AppsTabProps {
  apps: HostedApp[];
  onAppAction: (appId: string, action: 'start' | 'stop' | 'restart' | 'rebuild') => void;
  onDeleteApp: (appId: string) => void;
  onToggleFunnel: (appId: string) => void;
  onDeployClick: () => void;
  onViewLogs: (appId: string) => void;
}

export const AppsTab: React.FC<AppsTabProps> = ({
  apps,
  onAppAction,
  onDeleteApp,
  onToggleFunnel,
  onDeployClick,
  onViewLogs,
}) => {
  const [selectedAppForEnv, setSelectedAppForEnv] = useState<HostedApp | null>(null);
  const [envContent, setEnvContent] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleOpenEnv = (app: HostedApp) => {
    setSelectedAppForEnv(app);
    const lines = Object.entries(app.env).map(([k, v]) => `${k}=${v}`).join('\n');
    setEnvContent(lines);
    setSaveSuccess(false);
  };

  const handleSaveEnv = () => {
    if (!selectedAppForEnv) return;
    const newEnv: Record<string, string> = {};
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...rest] = trimmed.split('=');
        if (k) newEnv[k.trim()] = rest.join('=').trim();
      }
    });
    selectedAppForEnv.env = newEnv;
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setSelectedAppForEnv(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Hosted Web Apps & Services</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Node.js runtime instances running under PM2 on your AMD64 Ubuntu Desktop.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onDeployClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Deploy New Web App</span>
          </button>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {apps.map((app) => (
          <div
            key={app.id}
            className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 hover:border-neutral-750 transition-colors"
          >
            {/* Top Bar of Card */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    app.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'
                  }`} />
                  <h3 className="font-semibold text-white text-base">{app.name}</h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {app.type}
                  </span>
                </div>
                <div className="text-xs font-mono text-neutral-400 mt-1 flex items-center gap-2">
                  <span>Port: :{app.port}</span>
                  <span>·</span>
                  <span>Runtime: {app.nodeVersion}</span>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-medium ${
                  app.status === 'online' ? 'text-emerald-400' : 'text-neutral-500'
                }`}>
                  {app.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-neutral-950/80 p-3 rounded-lg border border-neutral-850">
              <div>
                <div className="text-neutral-500 text-[11px]">RAM Usage</div>
                <div className="text-neutral-200 font-semibold mt-0.5">{app.memoryMb.toFixed(1)} MB</div>
              </div>
              <div>
                <div className="text-neutral-500 text-[11px]">CPU Load</div>
                <div className="text-neutral-200 font-semibold mt-0.5">{app.cpuPercent}%</div>
              </div>
              <div>
                <div className="text-neutral-500 text-[11px]">2GB Footprint</div>
                <div className="text-cyan-400 font-semibold mt-0.5">{app.diskMb.toFixed(1)} MB</div>
              </div>
            </div>

            {/* Public Tailscale Funnel URL */}
            <div className="text-xs bg-neutral-950 p-3 rounded-lg border border-neutral-850 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Tailscale Funnel Public Route</span>
                </span>
                <button
                  onClick={() => onToggleFunnel(app.id)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
                    app.funnelEnabled 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  {app.funnelEnabled ? 'Public On' : 'Tailnet Only'}
                </button>
              </div>

              {app.funnelEnabled ? (
                <div className="flex items-center justify-between font-mono text-cyan-400">
                  <span className="truncate pr-2">{app.tailscalePublicUrl}</span>
                  <a
                    href={app.tailscalePublicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-neutral-400 hover:text-white"
                    title="Open in new browser tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : (
                <span className="text-neutral-500 font-mono text-[11px]">
                  Accessible only within your private Tailnet (100.84.120.45:{app.port})
                </span>
              )}
            </div>

            {/* App Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-neutral-850 text-xs">
              <div className="flex items-center gap-2">
                {app.status === 'online' ? (
                  <button
                    onClick={() => onAppAction(app.id, 'stop')}
                    className="px-2.5 py-1.5 rounded bg-neutral-850 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Square className="h-3 w-3" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onAppAction(app.id, 'start')}
                    className="px-2.5 py-1.5 rounded bg-neutral-850 hover:bg-neutral-800 text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Play className="h-3 w-3" />
                    <span>Start</span>
                  </button>
                )}

                <button
                  onClick={() => onAppAction(app.id, 'restart')}
                  className="px-2.5 py-1.5 rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white font-medium flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Restart</span>
                </button>

                <button
                  onClick={() => onViewLogs(app.id)}
                  className="px-2.5 py-1.5 rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white font-medium flex items-center gap-1 transition-colors"
                >
                  <Terminal className="h-3 w-3" />
                  <span>Logs</span>
                </button>

                <button
                  onClick={() => handleOpenEnv(app)}
                  className="px-2.5 py-1.5 rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white font-medium flex items-center gap-1 transition-colors"
                >
                  <Settings className="h-3 w-3" />
                  <span>.env</span>
                </button>
              </div>

              <button
                onClick={() => onDeleteApp(app.id)}
                className="p-1.5 rounded hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                title="Delete Service"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Environment Variables (.env) Editor Modal */}
      {selectedAppForEnv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Environment Configuration (.env)
                </h3>
                <span className="text-xs text-neutral-400 font-mono">
                  App: {selectedAppForEnv.name} (Port :{selectedAppForEnv.port})
                </span>
              </div>
              <button
                onClick={() => setSelectedAppForEnv(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-neutral-400 font-mono">
                KEY=VALUE (one per line)
              </label>
              <textarea
                value={envContent}
                onChange={(e) => setEnvContent(e.target.value)}
                rows={8}
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 p-3 font-mono text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
                placeholder="NODE_ENV=production&#10;PORT=4001&#10;DATABASE_URL=sqlite:///data.db"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedAppForEnv(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEnv}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
              >
                {saveSuccess ? <Check className="h-4 w-4" /> : null}
                <span>{saveSuccess ? 'Saved!' : 'Save & Restart Process'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
