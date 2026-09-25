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
  FolderTree,
  Cloud,
  ShoppingCart,
  Smartphone,
  Sliders,
  FileCode
} from 'lucide-react';
import { SystemMetrics } from '../types/hosting';
import { DEVELOPER_NAME } from '../services/api';
import { WhatsAppSmartButton } from './WhatsAppSmartButton';

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
              {/* Creator & Spec pill */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold">
                  {DEVELOPER_NAME}
                </span>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-400">Ubuntu AMD64 & Termux (Android)</span>
                <span className="text-neutral-600">·</span>
                <span className="text-emerald-400">2GB Default Storage (Extendable)</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight text-balance">
                Your Ubuntu desktop & Termux phone turned into a real web host.
              </h1>

              <p className="text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed">
                Host real Node.js web apps, Python Flask services, WordPress, PHP, and shopping carts directly on your AMD64 Ubuntu Desktop or Android Termux terminal. 
                Expose instantly to the world with <strong>Cloudflare Tunnel, Tailscale Funnel & ngrok</strong> with free automatic HTTPS.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onLaunchPanel}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20"
                >
                  <span>Open Live cPanel</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={onOpenSetupGuide}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-neutral-200 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 hover:text-white transition-colors"
                >
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  <span>Setup Guide (Termux & Ubuntu)</span>
                </button>
              </div>

              {/* Hardware & Spec Bar */}
              <div className="pt-6 border-t border-neutral-900 grid grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <div className="text-neutral-500 mb-1">Architecture</div>
                  <div className="text-neutral-200 font-semibold">{metrics.arch}</div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1">Storage Quota</div>
                  <div className="text-cyan-400 font-semibold">{metrics.storage2GBQuota.allocatedLimitMb} MB (Extendable)</div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1">Public Ingress</div>
                  <div className="text-emerald-400 font-semibold">Cloudflare + Tailscale</div>
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
                    alt="AMD64 Ubuntu Desktop & Mobile Node"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="font-mono text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Host Node Online ({metrics.hostname})
                    </span>
                    <span className="font-mono text-cyan-300">100.84.120.45</span>
                  </div>
                </div>

                {/* Storage Quota Progress Preview */}
                <div className="space-y-2 p-3 bg-neutral-950/70 rounded-lg border border-neutral-850">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Sandbox Disk Allocation</span>
                    <span className="text-cyan-400 font-semibold tabular-nums">
                      {metrics.storage2GBQuota.usedMb} MB / {metrics.storage2GBQuota.allocatedLimitMb} MB ({metrics.storage2GBQuota.percentUsed}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                      style={{ width: `${metrics.storage2GBQuota.percentUsed}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-1">
                    <span>Default: 2GB</span>
                    <span className="text-emerald-400">Extendable to 32GB+</span>
                    <span>Free: {metrics.storage2GBQuota.freeMb} MB</span>
                  </div>
                </div>

                {/* Ingress Gateways Preview */}
                <div className="mt-4 pt-3 border-t border-neutral-850 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px]">Cloudflare</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">Tailscale</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px]">ngrok</span>
                  </div>
                  <button
                    onClick={onLaunchPanel}
                    className="font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Open cPanel</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: 1-Click Script Shortcuts (WordPress, Cart, PHP, Flask) */}
      <section className="py-20 border-b border-neutral-850 bg-neutral-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-mono text-cyan-400 mb-1">SOFTACULOUS-STYLE SHORTCUTS</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              1-Click Direct Script & App Installation Shortcuts
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Install popular web platforms and microservices directly into the 2GB sandbox without manual terminal bootstrapping.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* WordPress */}
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-all space-y-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">WordPress (SQLite)</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Self-contained WordPress site with zero-config SQLite engine. No external MySQL container needed.
              </p>
              <div className="text-[11px] font-mono text-cyan-400 pt-1">
                Port :8000 · 120 MB
              </div>
            </div>

            {/* Shopping Cart */}
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-all space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">E-Commerce Cart</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Online storefront with product catalog, cart persistence, checkout routes, and Stripe payment webhook support.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 pt-1">
                Port :4200 · 85 MB
              </div>
            </div>

            {/* Python Flask */}
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-all space-y-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Python Flask (flashk)</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                WSGI Python web service with Gunicorn worker, Jinja2 templating, and REST endpoints for data pipelines.
              </p>
              <div className="text-[11px] font-mono text-amber-400 pt-1">
                Port :5500 · 95 MB
              </div>
            </div>

            {/* Native PHP */}
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-all space-y-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileCode className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Native PHP Web App</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Direct PHP-FPM / CLI server for custom PHP scripts, micro-APIs, and dynamic web templates.
              </p>
              <div className="text-[11px] font-mono text-indigo-400 pt-1">
                Port :8088 · 45 MB
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Storage Quota & Extension */}
      <section id="storage-quota" className="py-20 border-b border-neutral-850">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-mono text-emerald-400">STORAGE FLEXIBILITY</div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Default 2GB Storage with 1-Click Quota Extension
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                By default, TailNode isolates apps within a protected 2,048 MB (2GB) quota boundary to ensure web hosting never consumes your entire desktop or phone drive. Need more space? Simply extend the quota to 4GB, 8GB, 16GB, or custom limits via the in-app slider.
              </p>

              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <div className="text-neutral-500">Default Quota</div>
                  <div className="text-cyan-400 font-bold mt-0.5">2,048 MB</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <div className="text-neutral-500">Presets</div>
                  <div className="text-emerald-400 font-bold mt-0.5">4GB - 32GB</div>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <div className="text-neutral-500">Cache Reclaim</div>
                  <div className="text-white font-bold mt-0.5">1-Click Purge</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onLaunchPanel}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <span>Explore Storage Settings in cPanel</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

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
                <div className="p-4 bg-neutral-950/90 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>/home/ubuntu/tailhost/apps/</span>
                  <span className="text-emerald-400">Extendable Quota Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Multi-Tunnel & Free HTTPS Ingress */}
      <section id="tunnels-https" className="py-20 border-b border-neutral-850 bg-neutral-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-mono text-cyan-400 mb-1">INGRESS GATEWAYS</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Cloudflare Tunnel, ngrok & Tailscale Funnel
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              TailNode gives you multiple ways to access your apps from the public internet with zero router port forwarding and 100% free open-source SSL.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-cyan-500/20 bg-neutral-900/60 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <Cloud className="h-5 w-5" />
                <span>Cloudflare Tunnel</span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                100% free and open-source with unlimited bandwidth. Connects your port directly to Cloudflare edge with free automatic SSL. Works on both Termux and desktop.
              </p>
              <div className="font-mono text-xs text-neutral-300 bg-neutral-950 p-2 rounded">
                cloudflared tunnel --url :3000
              </div>
            </div>

            <div className="p-6 rounded-xl border border-emerald-500/20 bg-neutral-900/60 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Globe className="h-5 w-5" />
                <span>Tailscale Funnel</span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Zero configuration wireguard mesh routing with automatic MagicDNS domains and Let's Encrypt certificates.
              </p>
              <div className="font-mono text-xs text-neutral-300 bg-neutral-950 p-2 rounded">
                tailscale funnel --bg 3000
              </div>
            </div>

            <div className="p-6 rounded-xl border border-amber-500/20 bg-neutral-900/60 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <Zap className="h-5 w-5" />
                <span>ngrok Tunnel</span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Instant HTTPS tunnels with real-time web inspection dashboard for testing incoming webhooks and mobile APIs.
              </p>
              <div className="font-mono text-xs text-neutral-300 bg-neutral-950 p-2 rounded">
                ngrok http 3000
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-xs font-mono text-cyan-400 mb-2">ENGINEERED BY GM RIPON</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to deploy your self-hosted web apps?
          </h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto text-sm">
            Launch the live cPanel interface to manage processes, extend storage quota, install 1-click scripts, and monitor public tunnels.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
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
              Termux & Ubuntu Guides
            </button>
          </div>

          {/* WhatsApp Direct Contact Smart Card */}
          <WhatsAppSmartButton variant="inline" className="max-w-2xl mx-auto text-left" />
        </div>
      </section>
    </div>
  );
};
