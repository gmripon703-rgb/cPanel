import React from 'react';
import { 
  HardDrive, 
  Cpu, 
  Layers, 
  Globe, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink, 
  Play, 
  Square, 
  Terminal, 
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { HostedApp, SystemMetrics } from '../../types/hosting';

interface OverviewTabProps {
  metrics: SystemMetrics;
  apps: HostedApp[];
  onDeployClick: () => void;
  onCleanCache: () => void;
  onAppAction: (appId: string, action: 'start' | 'stop' | 'restart' | 'rebuild') => void;
  onNavigateTab: (tab: string) => void;
  cleaning: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  metrics,
  apps,
  onDeployClick,
  onCleanCache,
  onAppAction,
  onNavigateTab,
  cleaning
}) => {
  const quota = metrics.storage2GBQuota;
  const runningAppsCount = apps.filter(a => a.status === 'online').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>UBUNTU AMD64 DESKTOP HOSTING ACTIVE</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400 font-normal">Node: {metrics.nodeVersion}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Hosting Control Panel (cPanel)
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Managing <span className="text-neutral-200 font-semibold">{apps.length} web services</span> inside the 2GB sandbox exposed via Tailscale.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onCleanCache}
            disabled={cleaning}
            className="px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-850 border border-neutral-750 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${cleaning ? 'animate-spin' : ''}`} />
            <span>{cleaning ? 'Reclaiming...' : 'Purge Cache'}</span>
          </button>
          <button
            onClick={onDeployClick}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>+ Deploy App</span>
          </button>
        </div>
      </div>

      {/* Grid: 2GB Storage Meter & Host Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2GB Partition Quota Meter (Dominant Widget) */}
        <div className="lg:col-span-7 rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <HardDrive className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">2GB Storage Quota Monitor</h3>
                <span className="text-xs text-neutral-400 font-mono">/home/ubuntu/tailhost/apps/</span>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-cyan-400">
              {quota.percentUsed}% Utilized
            </span>
          </div>

          {/* Large Segmented Storage Bar */}
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-neutral-950 overflow-hidden flex border border-neutral-850 p-0.5">
              {/* Web Apps Segment */}
              <div 
                className="h-full bg-cyan-400 rounded-l-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (apps.reduce((a, b) => a + b.diskMb, 0) / quota.allocatedLimitMb) * 100)}%` }} 
                title="Web Apps Storage"
              />
              {/* NPM Cache Segment */}
              <div 
                className="h-full bg-amber-400 transition-all duration-500" 
                style={{ width: `${(quota.nodeModulesCacheMb / quota.allocatedLimitMb) * 100}%` }} 
                title="NPM Modules & Build Cache"
              />
              {/* Logs Segment */}
              <div 
                className="h-full bg-emerald-400 transition-all duration-500" 
                style={{ width: `${(quota.logsMb / quota.allocatedLimitMb) * 100}%` }} 
                title="Process Logs"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-1 text-neutral-400">
              <span>Used: <strong className="text-white">{quota.usedMb} MB</strong></span>
              <span>Total Quota: <strong className="text-white">{quota.allocatedLimitMb} MB (2.0 GB)</strong></span>
              <span>Available: <strong className="text-emerald-400">{quota.freeMb} MB</strong></span>
            </div>
          </div>

          {/* Breakdown Chips */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400 inline-block" />
                <span>Web Apps</span>
              </div>
              <div className="font-mono font-semibold text-white">
                {apps.reduce((acc, a) => acc + a.diskMb, 0).toFixed(1)} MB
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
                <span>NPM Cache</span>
              </div>
              <div className="font-mono font-semibold text-white">
                {quota.nodeModulesCacheMb} MB
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
                <span>Logs & Temp</span>
              </div>
              <div className="font-mono font-semibold text-white">
                {quota.logsMb} MB
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-neutral-400">Strict limit prevents desktop drive exhaustion</span>
            <button
              onClick={() => onNavigateTab('storage')}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Open File Manager & Editor →
            </button>
          </div>
        </div>

        {/* AMD64 Ubuntu Desktop & Tailscale Card */}
        <div className="lg:col-span-5 rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Tailscale Funnel Network</h3>
                <span className="text-xs text-neutral-400 font-mono">Public Internet Gateway</span>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Connected
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono bg-neutral-950 p-3 rounded-lg border border-neutral-850">
            <div className="flex justify-between">
              <span className="text-neutral-500">Tailscale IP:</span>
              <span className="text-neutral-200 font-semibold">{metrics.tailscale.nodeIp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">MagicDNS Domain:</span>
              <span className="text-cyan-300 font-semibold truncate max-w-[200px]" title={metrics.tailscale.magicDnsName}>
                {metrics.tailscale.magicDnsName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Public Funnel TLS:</span>
              <span className="text-emerald-400 font-semibold">Active (Port 3000, 4001, 5000)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Desktop Hardware:</span>
              <span className="text-neutral-200">Ubuntu Linux ({metrics.arch})</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <div className="text-neutral-400 mb-1">RAM Used</div>
              <div className="font-mono font-semibold text-white">
                {metrics.memory.usedMb} MB / {metrics.memory.totalMb} MB
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <div className="text-neutral-400 mb-1">Active Services</div>
              <div className="font-mono font-semibold text-emerald-400">
                {runningAppsCount} Online / {apps.length} Total
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Zero port forwarding required</span>
            <button
              onClick={() => onNavigateTab('tailscale')}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Configure Ports →
            </button>
          </div>
        </div>
      </div>

      {/* Active Hosted Web Apps Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Active Hosted Web Apps</h3>
            <p className="text-xs text-neutral-400">Node.js web servers, API endpoints, and static SPAs hosted on this desktop.</p>
          </div>
          <button
            onClick={() => onNavigateTab('apps')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Manage All ({apps.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-mono">
                <th className="pb-3 font-medium">SERVICE NAME</th>
                <th className="pb-3 font-medium">STATUS</th>
                <th className="pb-3 font-medium">PORT</th>
                <th className="pb-3 font-medium">2GB FOOTPRINT</th>
                <th className="pb-3 font-medium">RAM / CPU</th>
                <th className="pb-3 font-medium">PUBLIC FUNNEL URL</th>
                <th className="pb-3 font-medium text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 font-mono">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-neutral-850/40 transition-colors">
                  <td className="py-3 font-medium text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span>{app.name}</span>
                    <span className="text-[10px] text-neutral-500 uppercase">{app.type}</span>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1.5 ${
                      app.status === 'online' ? 'text-emerald-400' : 'text-neutral-500'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        app.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'
                      }`} />
                      <span className="capitalize">{app.status}</span>
                    </span>
                  </td>
                  <td className="py-3 text-cyan-300">:{app.port}</td>
                  <td className="py-3 text-neutral-300">{app.diskMb.toFixed(1)} MB</td>
                  <td className="py-3 text-neutral-400">
                    {app.memoryMb.toFixed(1)} MB · {app.cpuPercent}%
                  </td>
                  <td className="py-3">
                    {app.funnelEnabled ? (
                      <a
                        href={app.tailscalePublicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 max-w-[240px] truncate"
                      >
                        <span className="truncate">{app.tailscalePublicUrl}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-neutral-500">Private Tailnet Only</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {app.status === 'online' ? (
                        <button
                          onClick={() => onAppAction(app.id, 'stop')}
                          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 transition-colors"
                          title="Stop Process"
                        >
                          <Square className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onAppAction(app.id, 'start')}
                          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-emerald-400 transition-colors"
                          title="Start Process"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onAppAction(app.id, 'restart')}
                        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-cyan-400 transition-colors"
                        title="Restart"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
