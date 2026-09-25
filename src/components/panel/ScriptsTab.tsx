import React, { useState } from 'react';
import { 
  Sparkles, 
  ShoppingCart, 
  Globe, 
  Terminal, 
  Layers, 
  Check, 
  Play, 
  ExternalLink, 
  DownloadCloud, 
  FileCode,
  HardDrive,
  Cpu,
  Zap,
  Info
} from 'lucide-react';
import { HostedApp, SystemMetrics } from '../../types/hosting';

interface ScriptsTabProps {
  metrics: SystemMetrics;
  onDeployApp: (appData: Partial<HostedApp>) => Promise<void>;
  existingApps: HostedApp[];
  onNavigateApps: () => void;
}

interface ScriptShortcut {
  id: string;
  name: string;
  category: 'cms' | 'ecommerce' | 'php' | 'python' | 'nodejs' | 'static';
  title: string;
  badge: string;
  description: string;
  icon: string;
  defaultPort: number;
  diskRequirementMb: number;
  runtime: string;
  tags: string[];
  defaultEnv: Record<string, string>;
  starterFiles: string[];
  recommendedTunnel: 'cloudflare' | 'tailscale' | 'ngrok';
}

const SHORTCUTS: ScriptShortcut[] = [
  {
    id: 'script-wordpress',
    name: 'wordpress-sqlite-site',
    category: 'cms',
    title: 'WordPress (SQLite Standalone)',
    badge: 'Popular CMS',
    description: 'Instant WordPress engine powered by PHP 8.2 and SQLite driver. No heavy MySQL setup needed; 100% self-contained in 2GB sandbox.',
    icon: 'wordpress',
    defaultPort: 8000,
    diskRequirementMb: 120,
    runtime: 'PHP 8.2 (Built-in Server)',
    tags: ['PHP', 'SQLite', 'Blog', 'CMS'],
    defaultEnv: {
      WP_ENV: 'production',
      WP_SITEURL: 'https://ubuntu-desktop.tailnet.ts.net:8000',
      DB_ENGINE: 'sqlite'
    },
    starterFiles: ['index.php', 'wp-config.php', 'sqlite-database.db'],
    recommendedTunnel: 'cloudflare'
  },
  {
    id: 'script-cart',
    name: 'ecommerce-cart-store',
    category: 'ecommerce',
    title: 'E-Commerce Shopping Cart',
    badge: 'Store & Shop',
    description: 'Complete online web store with product catalog, cart management, checkout API, and instant mobile-friendly storefront.',
    icon: 'cart',
    defaultPort: 4200,
    diskRequirementMb: 85,
    runtime: 'Node.js Express / Vue',
    tags: ['Node.js', 'Shopping Cart', 'E-Commerce', 'Stripe Ready'],
    defaultEnv: {
      NODE_ENV: 'production',
      PORT: '4200',
      CURRENCY: 'USD',
      ENABLE_CHECKOUT: 'true'
    },
    starterFiles: ['server.js', 'products.json', 'public/cart.html'],
    recommendedTunnel: 'cloudflare'
  },
  {
    id: 'script-php',
    name: 'php-web-app',
    category: 'php',
    title: 'PHP Web Application / PHP-FPM',
    badge: 'Native PHP',
    description: 'Run pure PHP scripts, micro-frameworks (Slim/Flight), and traditional dynamic web pages directly on Ubuntu Desktop or Termux.',
    icon: 'php',
    defaultPort: 8088,
    diskRequirementMb: 45,
    runtime: 'PHP 8.2 CLI / FPM',
    tags: ['PHP', 'Backend', 'Dynamic'],
    defaultEnv: {
      PHP_ENV: 'production',
      PORT: '8088',
      DISPLAY_ERRORS: '0'
    },
    starterFiles: ['index.php', 'info.php', 'api.php'],
    recommendedTunnel: 'tailscale'
  },
  {
    id: 'script-flask',
    name: 'python-flask-service',
    category: 'python',
    title: 'Python Flask Microservice (flashk)',
    badge: 'Python WSGI',
    description: 'Lightweight, ultra-fast Python web server with WSGI Gunicorn, Jinja2 templating, and REST endpoints for data or ML tasks.',
    icon: 'python',
    defaultPort: 5500,
    diskRequirementMb: 95,
    runtime: 'Python 3.12 (Gunicorn / Flask)',
    tags: ['Python', 'Flask', 'Gunicorn', 'REST'],
    defaultEnv: {
      FLASK_ENV: 'production',
      PORT: '5500',
      PYTHONUNBUFFERED: '1'
    },
    starterFiles: ['app.py', 'requirements.txt', 'templates/index.html'],
    recommendedTunnel: 'cloudflare'
  },
  {
    id: 'script-express',
    name: 'express-rest-api',
    category: 'nodejs',
    title: 'Express.js REST API & Database',
    badge: 'Fast API',
    description: 'Production-ready Node.js API with CORS, SQLite database, rate limiting, and JWT authentication boilerplate.',
    icon: 'express',
    defaultPort: 4001,
    diskRequirementMb: 75,
    runtime: 'Node.js v20 LTS',
    tags: ['Node.js', 'Express', 'SQLite', 'CORS'],
    defaultEnv: {
      NODE_ENV: 'production',
      PORT: '4001',
      DATABASE_URL: 'sqlite:///data/db.sqlite'
    },
    starterFiles: ['server.js', 'package.json', 'data/db.sqlite'],
    recommendedTunnel: 'cloudflare'
  },
  {
    id: 'script-static',
    name: 'static-landing-portfolio',
    category: 'static',
    title: 'Static HTML & Tailwind Portfolio',
    badge: 'Zero Footprint',
    description: 'Instant static web page or personal portfolio hosted with near-zero RAM and ultra-fast static file delivery.',
    icon: 'static',
    defaultPort: 3300,
    diskRequirementMb: 15,
    runtime: 'Caddy / Static Proxy',
    tags: ['HTML5', 'Tailwind', 'Static', 'Blazing Fast'],
    defaultEnv: {
      PORT: '3300'
    },
    starterFiles: ['index.html', 'styles.css', 'app.js'],
    recommendedTunnel: 'tailscale'
  }
];

export const ScriptsTab: React.FC<ScriptsTabProps> = ({
  metrics,
  onDeployApp,
  existingApps,
  onNavigateApps
}) => {
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installedSuccess, setInstalledSuccess] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const quota = metrics.storage2GBQuota;

  const handleInstallShortcut = async (shortcut: ScriptShortcut) => {
    setInstallingId(shortcut.id);

    // Pick an available port if default is used
    const usedPorts = existingApps.map(a => a.port);
    let port = shortcut.defaultPort;
    while (usedPorts.includes(port)) {
      port += 1;
    }

    try {
      await onDeployApp({
        name: shortcut.name,
        type: shortcut.category === 'python' ? 'flask' : shortcut.category === 'php' ? 'nodejs' : (shortcut.category as any),
        port,
        runtimeVersion: shortcut.runtime,
        diskMb: shortcut.diskRequirementMb,
        funnelEnabled: true,
        activeTunnel: shortcut.recommendedTunnel,
        env: shortcut.defaultEnv
      });

      setInstalledSuccess(shortcut.title);
      setTimeout(() => setInstalledSuccess(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setInstallingId(null);
    }
  };

  const filteredShortcuts = filterCategory === 'all'
    ? SHORTCUTS
    : SHORTCUTS.filter(s => s.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">1-Click App & Script Installers</h2>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[11px]">
              Direct Shortcuts
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Deploy WordPress, E-Commerce Shopping Carts, PHP Web Apps, Python Flask (flashk), and APIs directly into your 2GB host.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterCategory === 'all' ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30' : 'text-neutral-400 hover:text-white bg-neutral-900'
            }`}
          >
            All Scripts
          </button>
          <button
            onClick={() => setFilterCategory('cms')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterCategory === 'cms' ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30' : 'text-neutral-400 hover:text-white bg-neutral-900'
            }`}
          >
            WordPress
          </button>
          <button
            onClick={() => setFilterCategory('ecommerce')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterCategory === 'ecommerce' ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30' : 'text-neutral-400 hover:text-white bg-neutral-900'
            }`}
          >
            Cart / Shop
          </button>
          <button
            onClick={() => setFilterCategory('php')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterCategory === 'php' ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30' : 'text-neutral-400 hover:text-white bg-neutral-900'
            }`}
          >
            PHP
          </button>
          <button
            onClick={() => setFilterCategory('python')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterCategory === 'python' ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30' : 'text-neutral-400 hover:text-white bg-neutral-900'
            }`}
          >
            Python Flask
          </button>
        </div>
      </div>

      {installedSuccess && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>Successfully installed <strong>{installedSuccess}</strong> into the sandbox!</span>
          </div>
          <button
            onClick={onNavigateApps}
            className="text-white underline hover:text-cyan-300 font-sans font-semibold"
          >
            View in Web Apps Tab →
          </button>
        </div>
      )}

      {/* Grid of Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredShortcuts.map((shortcut) => {
          const isInstalled = existingApps.some(a => a.name === shortcut.name);
          const isInstalling = installingId === shortcut.id;

          return (
            <div
              key={shortcut.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      {shortcut.category === 'ecommerce' ? (
                        <ShoppingCart className="h-5 w-5" />
                      ) : shortcut.category === 'cms' ? (
                        <Globe className="h-5 w-5" />
                      ) : shortcut.category === 'python' ? (
                        <Zap className="h-5 w-5 text-amber-400" />
                      ) : (
                        <FileCode className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{shortcut.title}</h3>
                      <span className="text-[10px] font-mono text-neutral-400">Port :{shortcut.defaultPort}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {shortcut.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {shortcut.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {shortcut.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-850 text-neutral-300">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Specs Box */}
                <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-850 text-[11px] font-mono space-y-1 text-neutral-400">
                  <div className="flex justify-between">
                    <span>Runtime:</span>
                    <span className="text-neutral-200">{shortcut.runtime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Required:</span>
                    <span className="text-cyan-400">{shortcut.diskRequirementMb} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Public HTTPS Gateway:</span>
                    <span className="text-emerald-400 capitalize">{shortcut.recommendedTunnel} Tunnel</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-neutral-850 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 font-mono">
                  {isInstalled ? 'Service active' : '1-Click Setup'}
                </span>

                <button
                  type="button"
                  disabled={isInstalling}
                  onClick={() => handleInstallShortcut(shortcut)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isInstalled
                      ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-750'
                      : 'bg-cyan-400 hover:bg-cyan-300 text-neutral-950 shadow-sm shadow-cyan-500/20'
                  }`}
                >
                  {isInstalling ? (
                    <>
                      <DownloadCloud className="h-3.5 w-3.5 animate-spin" />
                      <span>Installing...</span>
                    </>
                  ) : isInstalled ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Re-install</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Install Shortcut</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
