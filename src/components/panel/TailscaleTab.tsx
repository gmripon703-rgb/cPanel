import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Lock, 
  RefreshCw,
  Cpu,
  Radio,
  ArrowUpRight
} from 'lucide-react';
import { HostedApp, SystemMetrics } from '../../types/hosting';

interface TailscaleTabProps {
  metrics: SystemMetrics;
  apps: HostedApp[];
  onToggleFunnel: (appId: string) => void;
}

export const TailscaleTab: React.FC<TailscaleTabProps> = ({
  metrics,
  apps,
  onToggleFunnel,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const ts = metrics.tailscale;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Tailscale Funnel & Public DNS Gateway</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Expose your self-hosted 2GB web apps to the public internet securely without port forwarding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Tailscale Connected (v{ts.version})</span>
          </span>
        </div>
      </div>

      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-1">
          <div className="text-neutral-500 text-xs font-mono">TAILSCALE IP (IPV4)</div>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold font-mono text-cyan-400">{ts.nodeIp}</span>
            <button
              onClick={() => handleCopy(ts.nodeIp, 'ip')}
              className="text-neutral-400 hover:text-white"
            >
              {copiedKey === 'ip' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="text-[11px] text-neutral-500">Accessible inside private tailnet</div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-1">
          <div className="text-neutral-500 text-xs font-mono">MAGICDNS HOSTNAME</div>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold font-mono text-white truncate max-w-[180px]">
              {ts.magicDnsName}
            </span>
            <button
              onClick={() => handleCopy(ts.magicDnsName, 'dns')}
              className="text-neutral-400 hover:text-white"
            >
              {copiedKey === 'dns' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="text-[11px] text-neutral-500">Auto TLS certificate issued</div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-1">
          <div className="text-neutral-500 text-xs font-mono">GLOBAL PUBLIC ACCESS</div>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold font-mono text-emerald-400">Tailscale Funnel ON</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-[11px] text-neutral-500">Public HTTPS worldwide traffic</div>
        </div>
      </div>

      {/* Port & App Routing Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Active Tailscale Funnel Port Mappings</h3>
            <p className="text-xs text-neutral-400">Public ingress URLs mapped to local Ubuntu Desktop ports.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 font-medium">LOCAL PORT</th>
                <th className="pb-3 font-medium">SERVICE NAME</th>
                <th className="pb-3 font-medium">PUBLIC FUNNEL HTTPS URL</th>
                <th className="pb-3 font-medium">TLS STATUS</th>
                <th className="pb-3 font-medium text-right">FUNNEL TOGGLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {/* Main Panel Port */}
              <tr className="hover:bg-neutral-850/40">
                <td className="py-3 text-cyan-300 font-semibold">:3000</td>
                <td className="py-3 text-white font-medium">tailnode-cpanel (This Panel)</td>
                <td className="py-3 text-cyan-400">
                  <a 
                    href={`https://${ts.magicDnsName}:3000`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>https://{ts.magicDnsName}:3000</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
                <td className="py-3 text-emerald-400">Let's Encrypt (Valid)</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                    Always Active
                  </span>
                </td>
              </tr>

              {/* Dynamic Apps */}
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-neutral-850/40">
                  <td className="py-3 text-cyan-300 font-semibold">:{app.port}</td>
                  <td className="py-3 text-white">{app.name}</td>
                  <td className="py-3">
                    {app.funnelEnabled ? (
                      <a 
                        href={app.tailscalePublicUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>{app.tailscalePublicUrl}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-neutral-500">Private Tailnet Only</span>
                    )}
                  </td>
                  <td className="py-3">
                    {app.funnelEnabled ? (
                      <span className="text-emerald-400">TLS 1.3 Active</span>
                    ) : (
                      <span className="text-neutral-500">Disabled</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onToggleFunnel(app.id)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors ${
                        app.funnelEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-750'
                      }`}
                    >
                      {app.funnelEnabled ? 'Public On' : 'Make Public'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Useful CLI commands generator */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-white text-sm">Tailscale Funnel Terminal Commands</span>
          </div>
          <span className="text-neutral-500 text-[11px]">Run in your Ubuntu Desktop terminal</span>
        </div>

        <div className="space-y-2 text-neutral-300">
          <div className="flex items-center justify-between p-2.5 rounded bg-neutral-950 border border-neutral-850">
            <div>
              <span className="text-neutral-500"># Check funnel status: </span>
              <span className="text-cyan-300">tailscale funnel status</span>
            </div>
            <button
              onClick={() => handleCopy('tailscale funnel status', 'c1')}
              className="text-neutral-400 hover:text-white"
            >
              {copiedKey === 'c1' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded bg-neutral-950 border border-neutral-850">
            <div>
              <span className="text-neutral-500"># Enable public funnel on port 3000: </span>
              <span className="text-emerald-400">tailscale funnel --bg 3000</span>
            </div>
            <button
              onClick={() => handleCopy('tailscale funnel --bg 3000', 'c2')}
              className="text-neutral-400 hover:text-white"
            >
              {copiedKey === 'c2' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded bg-neutral-950 border border-neutral-850">
            <div>
              <span className="text-neutral-500"># Get your public node IP: </span>
              <span className="text-amber-300">tailscale ip -4</span>
            </div>
            <button
              onClick={() => handleCopy('tailscale ip -4', 'c3')}
              className="text-neutral-400 hover:text-white"
            >
              {copiedKey === 'c3' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
