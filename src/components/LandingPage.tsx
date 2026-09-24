import React, { useState } from 'react';
import { 
  Server, 
  HardDrive, 
  ShieldCheck, 
  ArrowRight, 
  Terminal, 
  Copy, 
  Check, 
  Cpu, 
  Globe, 
  Boxes, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  FolderTree
} from 'lucide-react';
import { SystemMetrics } from '../types/hosting';

interface LandingPageProps {
  metrics: SystemMetrics;
  onLaunchPanel: () => void;
  onOpenSetupGuide: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  metrics,
  onLaunchPanel,
  onOpenSetupGuide,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-neutral-850">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-950/25 via-neutral-950/60 to-neutral-950 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              {/* Unboxed metadata separator */}
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span>Ubuntu Desktop amd64</span>
                <span className="text-neutral-600">·</span>
                <span>Tailscale Funnel Public DNS</span>
                <span className="text-neutral-600">·</span>
                <span>2GB Isolated Sandbox</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight text-balance">
                Turn your Ubuntu desktop into a secure 2GB web host.
              </h1>

              <p className="text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed">
                Host real Node.js web applications, NPM packages, and static sites directly from your AMD64 Ubuntu machine. 
                Exposed securely to the public internet using Tailscale Funnel with zero port forwarding, SSL certificates, and strict 2GB storage isolation.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onLaunchPanel}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20"
                >
                  <span>Open Live Control Panel</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={onOpenSetupGuide}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-neutral-200 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 hover:text-white transition-colors"
                >
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  <span>Clone on Ubuntu Desktop</span>
                </button>
              </div>

              {/* Hardware & Spec Bar */}
              <div className="pt-6 border-t border-neutral-900 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-neutral-500 mb-1">Architecture</div>
                  <div className="font-mono text-neutral-200">{metrics.arch} (Ubuntu Linux)</div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1">Storage Quota</div>
                  <div className="font-mono text-cyan-400">2,048 MB Isolated</div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1">Public Domain</div>
                  <div className="font-mono text-neutral-200 truncate">*.tailnet.ts.net</div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Showcase & Active Node Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-2xl backdrop-blur-xl">
                {/* Hardware Photo Preview */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-950 border border-neutral-800 mb-4 group">
                  <img
                    src="/src/assets/images/ubuntu_desktop_server_1790277432418.jpg"
                    alt="AMD64 Ubuntu Desktop Hosting Node"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="font-mono text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      AMD64 Workstation Online
                    </span>
                    <span className="font-mono text-cyan-300">100.84.120.45</span>
                  </div>
                </div>

                {/* 2GB Partition Progress Preview */}
                <div className="space-y-2 p-3 bg-neutral-950/70 rounded-lg border border-neutral-850">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">2GB Partition Utilization</span>
                    <span className="text-cyan-400 font-semibold tabular-nums">
                      {metrics.storage2GBQuota.usedMb} MB / 2,048 MB (24.9%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                      style={{ width: `${metrics.storage2GBQuota.percentUsed}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-1">
                    <span>Apps: 3 Active</span>
                    <span>Node Modules: 248 MB</span>
                    <span>Free: 1,538 MB</span>
                  </div>
                </div>

                {/* Live Terminal Quick Action */}
                <div className="mt-4 pt-3 border-t border-neutral-850 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Ready to test deployment?</span>
                  <button
                    onClick={onLaunchPanel}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Launch cPanel Dashboard</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Architecture & Tailscale Mesh */}
      <section id="architecture" className="py-20 border-b border-neutral-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Zero Router Port Forwarding. 100% Secure Public Access.
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Traditional home hosting requires exposing residential IP addresses, configuring fragile NAT port forward rules, 
              and buying external domains. TailNode utilizes Tailscale Funnel to route TLS traffic through Tailscale's global relay network directly to your Ubuntu workstation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Visual Graphic */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl group">
              <img
                src="/src/assets/images/tailscale_mesh_routing_1790277444940.jpg"
                alt="Tailscale Mesh Routing Architecture"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs font-mono text-neutral-300 flex items-center justify-between">
                <span>MagicDNS: ubuntu-desktop.tailnet.ts.net</span>
                <span className="text-emerald-400">TLS 1.3 Verified</span>
              </div>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Globe className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-white text-base">Automatic Public HTTPS URLs</h3>
                </div>
                <p className="text-sm text-neutral-400">
                  Every hosted web app gets an instant public HTTPS URL like <code className="text-cyan-300 font-mono text-xs bg-neutral-950 px-1.5 py-0.5 rounded">https://ubuntu-desktop.tailnet.ts.net:4001</code> with auto-renewing Let's Encrypt certificates.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-white text-base">Carrier-Grade NAT & Firewall Bypass</h3>
                </div>
                <p className="text-sm text-neutral-400">
                  Works seamlessly even behind strict CGNAT (Carrier-Grade NAT), mobile hotspots, dorm networks, or locked down home routers without opening inbound firewall ports.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-white text-base">Native AMD64 Ubuntu Desktop Speed</h3>
                </div>
                <p className="text-sm text-neutral-400">
                  Runs directly on bare-metal Ubuntu hardware. Enjoy full access to your desktop CPU cores and high-speed NVMe storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 2GB Storage Partitioning */}
      <section id="storage-quota" className="py-20 border-b border-neutral-850 bg-neutral-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-mono text-emerald-400">
                STORAGE ISOLATION & QUOTA MANAGEMENT
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Strict 2GB Storage Safeguard for Desktop Protection
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                Hosting websites on a personal desktop can easily clutter disk space with infinite npm caches and logs. 
                TailNode enforces a hard 2,048 MB isolation boundary with integrated cache reclamation, per-app telemetry, and automated cleanup utilities.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
                  <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums">2,048 MB</div>
                  <div className="text-xs text-neutral-400 mt-1">Total Dedicated Quota</div>
                </div>
                <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
                  <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">1-Click</div>
                  <div className="text-xs text-neutral-400 mt-1">NPM Cache Purge</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onLaunchPanel}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Explore Storage Explorer</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
                <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-950">
                  <img
                    src="/src/assets/images/sandbox_storage_2gb_1790277454817.jpg"
                    alt="2GB Storage Sandbox Partition"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4 bg-neutral-950/90 border-t border-neutral-800">
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                    <span>Path: /home/ubuntu/tailhost/apps/</span>
                    <span className="text-emerald-400">Quota: Active (2GB)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Ubuntu Desktop Setup & GitHub Terminal Clone Preview */}
      <section id="terminal-setup" className="py-20 border-b border-neutral-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Clone from GitHub & Run on Ubuntu Desktop
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base">
              Publish this applet to GitHub, then run these exact terminal commands on your AMD64 Ubuntu Desktop to deploy your own production web host.
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-xl border border-neutral-800 bg-neutral-900/90 overflow-hidden shadow-2xl font-mono text-xs">
            {/* Terminal Titlebar */}
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-neutral-400 text-xs">ubuntu@desktop-amd64:~</span>
              </div>
              <button
                onClick={() => copyToClipboard(
                  `git clone https://github.com/your-username/tailnode-host.git\ncd tailnode-host\nnpm install\nnpm run build\nnpm start`,
                  'all'
                )}
                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-cyan-300 transition-colors"
              >
                {copiedCmd === 'all' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCmd === 'all' ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-5 space-y-4 text-neutral-300">
              <div className="space-y-1">
                <p className="text-neutral-500"># 1. Clone repository from GitHub</p>
                <div className="flex items-center justify-between bg-neutral-950 px-3 py-2 rounded border border-neutral-850">
                  <span className="text-cyan-300 font-semibold">$ git clone https://github.com/your-username/tailnode-host.git</span>
                  <button 
                    onClick={() => copyToClipboard('git clone https://github.com/your-username/tailnode-host.git', 'cmd1')}
                    className="text-neutral-500 hover:text-white"
                  >
                    {copiedCmd === 'cmd1' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-neutral-500"># 2. Enter directory and install dependencies</p>
                <div className="flex items-center justify-between bg-neutral-950 px-3 py-2 rounded border border-neutral-850">
                  <span className="text-cyan-300 font-semibold">$ cd tailnode-host && npm install</span>
                  <button 
                    onClick={() => copyToClipboard('cd tailnode-host && npm install', 'cmd2')}
                    className="text-neutral-500 hover:text-white"
                  >
                    {copiedCmd === 'cmd2' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-neutral-500"># 3. Build & start full-stack Node.js server</p>
                <div className="flex items-center justify-between bg-neutral-950 px-3 py-2 rounded border border-neutral-850">
                  <span className="text-emerald-400 font-semibold">$ npm run build && npm start</span>
                  <button 
                    onClick={() => copyToClipboard('npm run build && npm start', 'cmd3')}
                    className="text-neutral-500 hover:text-white"
                  >
                    {copiedCmd === 'cmd3' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-neutral-500"># 4. Expose public web access via Tailscale Funnel</p>
                <div className="flex items-center justify-between bg-neutral-950 px-3 py-2 rounded border border-neutral-850">
                  <span className="text-amber-300 font-semibold">$ tailscale funnel --bg 3000</span>
                  <button 
                    onClick={() => copyToClipboard('tailscale funnel --bg 3000', 'cmd4')}
                    className="text-neutral-500 hover:text-white"
                  >
                    {copiedCmd === 'cmd4' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-neutral-950/70 border-t border-neutral-850 flex items-center justify-between text-neutral-400 text-xs">
              <span>Automatic systemd service configuration also included.</span>
              <button
                onClick={onOpenSetupGuide}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <span>Full Setup Walkthrough</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 border-b border-neutral-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Everything in a Modern cPanel, Built for Desktop Self-Hosting
            </h2>
            <p className="text-neutral-400 text-sm">
              Manage apps, files, ports, NPM packages, and terminal logs without SSHing into your terminal every time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 transition-all">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Boxes className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Process Lifecycle</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Full PM2-style process control. Start, stop, restart, and rebuild Node.js web services with auto-restart on crash.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 transition-all">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <FolderTree className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">File Manager & Code Editor</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Browse directories inside the 2GB sandbox, edit <code className="text-neutral-200">.env</code> keys, adjust <code className="text-neutral-200">package.json</code>, and view static dist assets.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 transition-all">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Live Logs & Terminal</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Real-time streaming console logs with error filtering, autoscroll, and embedded terminal commands for instant debugging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to manage your AMD64 Ubuntu web apps?
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto text-sm">
            Launch the live cPanel interface to monitor CPU, RAM, 2GB storage quota, and active Tailscale Funnel ports.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onLaunchPanel}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Open Live cPanel
            </button>
            <button
              onClick={onOpenSetupGuide}
              className="px-5 py-3 rounded-lg text-sm font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors"
            >
              View GitHub Clone Guide
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
