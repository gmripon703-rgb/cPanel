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
  Cloud,
  Zap,
  Radio,
  Server,
  Layers
} from 'lucide-react';
import { HostedApp, SystemMetrics, TunnelConfig } from '../../types/hosting';

interface TailscaleTabProps {
  metrics: SystemMetrics;
  apps: HostedApp[];
  onToggleFunnel: (appId: string) => void;
  onSetAppTunnel?: (appId: string, tunnel: 'tailscale' | 'cloudflare' | 'ngrok' | 'caddy' | 'none') => void;
  onToggleTunnelService?: (service: 'cloudflare' | 'ngrok' | 'tailscale' | 'caddy', enabled: boolean, token?: string) => void;
}

export const TailscaleTab: React.FC<TailscaleTabProps> = ({
  metrics,
  apps,
  onToggleFunnel,
  onSetAppTunnel,
  onToggleTunnelService
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTunnelCategory, setActiveTunnelCategory] = useState<'all' | 'cloudflare' | 'tailscale' | 'ngrok' | 'caddy'>('all');
  const [ngrokTokenInput, setNgrokTokenInput] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);

  const ts = metrics.tailscale;
  const tunnels = metrics.tunnels;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveNgrokToken = () => {
    if (onToggleTunnelService) {
      onToggleTunnelService('ngrok', true, ngrokTokenInput);
      setTokenSaved(true);
      setTimeout(() => setTokenSaved(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Multi-Tunnel Ingress & Free HTTPS Gateways</h2>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
              Cloudflare + Tailscale + ngrok
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Expose self-hosted Node.js & Python Flask apps to the public internet without opening router ports or buying domains.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Tailscale & Cloudflare Ready</span>
          </span>
        </div>
      </div>

      {/* Gateway Service Cards (Cloudflare, Tailscale, ngrok, Caddy) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cloudflare Tunnel Card */}
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-neutral-900/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Cloud className="h-4 w-4 text-cyan-400" />
              <span>Cloudflare Tunnel</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              Free & Open Source
            </span>
          </div>
          <div className="text-xs text-neutral-400 leading-relaxed">
            Zero port forwarding, unlimited bandwidth, and automatic Cloudflare Edge SSL certificates for any port.
          </div>
          <div className="p-2 rounded bg-neutral-950 border border-neutral-850 font-mono text-[11px] text-cyan-300 truncate">
            https://tailnode-tunnel.trycloudflare.com
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-500">Termux & AMD64: Supported</span>
            <button
              onClick={() => handleCopy('cloudflared tunnel --url http://localhost:3000', 'cf_cmd')}
              className="text-cyan-400 hover:underline"
            >
              {copiedKey === 'cf_cmd' ? 'Copied CLI' : 'Copy CLI'}
            </button>
          </div>
        </div>

        {/* Tailscale Funnel Card */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Globe className="h-4 w-4 text-emerald-400" />
              <span>Tailscale Funnel</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Active TLS
            </span>
          </div>
          <div className="text-xs text-neutral-400 leading-relaxed">
            Direct mesh routing via MagicDNS with automatic Let's Encrypt certificates and userspace mode for PRoot.
          </div>
          <div className="p-2 rounded bg-neutral-950 border border-neutral-850 font-mono text-[11px] text-emerald-300 truncate">
            https://{ts.magicDnsName}:3000
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-500">IP: {ts.nodeIp}</span>
            <button
              onClick={() => handleCopy('tailscale funnel --bg 3000', 'ts_cmd')}
              className="text-emerald-400 hover:underline"
            >
              {copiedKey === 'ts_cmd' ? 'Copied CLI' : 'Copy CLI'}
            </button>
          </div>
        </div>

        {/* ngrok Tunnel Card */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>ngrok Tunnel</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              Instant Ingress
            </span>
          </div>
          <div className="text-xs text-neutral-400 leading-relaxed">
            Fast testing tunnel with real-time HTTP request inspection and web traffic replay dashboard.
          </div>
          <div className="p-2 rounded bg-neutral-950 border border-neutral-850 font-mono text-[11px] text-amber-300 truncate">
            https://cpanel-ripon.ngrok-free.app
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-500">CLI: ngrok http 3000</span>
            <button
              onClick={() => handleCopy('ngrok http 3000', 'ngrok_cmd')}
              className="text-amber-400 hover:underline"
            >
              {copiedKey === 'ngrok_cmd' ? 'Copied CLI' : 'Copy CLI'}
            </button>
          </div>
        </div>
      </div>

      {/* App Public Ingress Mapping Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Active Hosted Apps & Public HTTPS Gateways</h3>
            <p className="text-xs text-neutral-400">Select which tunnel provider serves each web app.</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setActiveTunnelCategory('all')}
              className={`px-2.5 py-1 rounded ${activeTunnelCategory === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              All Tunnels
            </button>
            <button
              onClick={() => setActiveTunnelCategory('cloudflare')}
              className={`px-2.5 py-1 rounded ${activeTunnelCategory === 'cloudflare' ? 'bg-cyan-500/20 text-cyan-300' : 'text-neutral-400 hover:text-white'}`}
            >
              Cloudflare
            </button>
            <button
              onClick={() => setActiveTunnelCategory('tailscale')}
              className={`px-2.5 py-1 rounded ${activeTunnelCategory === 'tailscale' ? 'bg-emerald-500/20 text-emerald-300' : 'text-neutral-400 hover:text-white'}`}
            >
              Tailscale
            </button>
            <button
              onClick={() => setActiveTunnelCategory('ngrok')}
              className={`px-2.5 py-1 rounded ${activeTunnelCategory === 'ngrok' ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-400 hover:text-white'}`}
            >
              ngrok
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 font-medium">LOCAL PORT</th>
                <th className="pb-3 font-medium">SERVICE NAME & TYPE</th>
                <th className="pb-3 font-medium">ACTIVE PUBLIC HTTPS URL</th>
                <th className="pb-3 font-medium">GATEWAY PROVIDER</th>
                <th className="pb-3 font-medium text-right">SWITCH GATEWAY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {/* Main Panel Port */}
              <tr className="hover:bg-neutral-850/40">
                <td className="py-3 text-cyan-300 font-semibold">:3000</td>
                <td className="py-3 text-white font-medium">
                  TailNode cPanel (Main Host)
                </td>
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
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                    Tailscale Funnel TLS
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-neutral-500 text-[11px]">Default Root</span>
                </td>
              </tr>

              {/* Dynamic Apps */}
              {apps.map((app) => {
                const activeUrl = app.activeTunnel === 'cloudflare'
                  ? app.cloudflareUrl
                  : app.activeTunnel === 'ngrok'
                  ? app.ngrokUrl
                  : app.tailscalePublicUrl;

                return (
                  <tr key={app.id} className="hover:bg-neutral-850/40">
                    <td className="py-3 text-cyan-300 font-semibold">:{app.port}</td>
                    <td className="py-3 text-white">
                      <div className="font-semibold">{app.name}</div>
                      <div className="text-[10px] text-neutral-500 uppercase">{app.type} ({app.runtimeVersion})</div>
                    </td>
                    <td className="py-3">
                      {activeUrl ? (
                        <a 
                          href={activeUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 max-w-[260px] truncate"
                        >
                          <span className="truncate">{activeUrl}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-neutral-500">Private Host Only</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        app.activeTunnel === 'cloudflare' 
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' 
                          : app.activeTunnel === 'tailscale'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {app.activeTunnel.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <select
                        value={app.activeTunnel}
                        onChange={(e) => {
                          if (onSetAppTunnel) {
                            onSetAppTunnel(app.id, e.target.value as any);
                          }
                        }}
                        className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-[11px] text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="cloudflare">Cloudflare Tunnel</option>
                        <option value="tailscale">Tailscale Funnel</option>
                        <option value="ngrok">ngrok Tunnel</option>
                        <option value="none">Private Only</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal Ingress Commands Grid */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-white text-sm">Quick CLI Ingress Commands</span>
          </div>
          <span className="text-neutral-500 text-[11px]">Run directly on Ubuntu Desktop or Termux</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-neutral-300">
          {/* Cloudflare quick command */}
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
            <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
              <span className="flex items-center gap-1.5">
                <Cloud className="h-3.5 w-3.5" />
                <span>1. Cloudflare Quick Tunnel (Free & Open Source)</span>
              </span>
              <button
                onClick={() => handleCopy('cloudflared tunnel --url http://localhost:3000', 'cf1')}
                className="text-neutral-400 hover:text-white"
              >
                {copiedKey === 'cf1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <pre className="p-2 rounded bg-neutral-900 text-neutral-300 text-[11px] overflow-x-auto select-all">
              cloudflared tunnel --url http://localhost:3000
            </pre>
          </div>

          {/* Tailscale userspace command */}
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
            <div className="flex items-center justify-between text-emerald-400 font-sans font-semibold">
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span>2. Tailscale Userspace (For PRoot & Termux)</span>
              </span>
              <button
                onClick={() => handleCopy('tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &\ntailscale up\ntailscale funnel 3000 on', 'ts1')}
                className="text-neutral-400 hover:text-white"
              >
                {copiedKey === 'ts1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <pre className="p-2 rounded bg-neutral-900 text-neutral-300 text-[11px] overflow-x-auto select-all">
              tailscaled --tun=userspace-networking &{'\n'}tailscale funnel 3000 on
            </pre>
          </div>

          {/* ngrok quick command */}
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
            <div className="flex items-center justify-between text-amber-400 font-sans font-semibold">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                <span>3. ngrok HTTPS Ingress</span>
              </span>
              <button
                onClick={() => handleCopy('ngrok http 3000', 'ng1')}
                className="text-neutral-400 hover:text-white"
              >
                {copiedKey === 'ng1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <pre className="p-2 rounded bg-neutral-900 text-neutral-300 text-[11px] overflow-x-auto select-all">
              ngrok http 3000
            </pre>
          </div>

          {/* Caddy Open Source Reverse Proxy */}
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
            <div className="flex items-center justify-between text-indigo-400 font-sans font-semibold">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>4. Caddy Automatic Let's Encrypt HTTPS</span>
              </span>
              <button
                onClick={() => handleCopy('caddy reverse-proxy --from yourdomain.com --to localhost:3000', 'caddy1')}
                className="text-neutral-400 hover:text-white"
              >
                {copiedKey === 'caddy1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <pre className="p-2 rounded bg-neutral-900 text-neutral-300 text-[11px] overflow-x-auto select-all">
              caddy reverse-proxy --from mydomain.com --to localhost:3000
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
