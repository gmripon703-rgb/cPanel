import express, { Request, Response } from 'express';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory persistent state for hosted web apps & 2GB storage management
interface HostedApp {
  id: string;
  name: string;
  type: 'nodejs' | 'static' | 'react' | 'express';
  port: number;
  status: 'online' | 'stopped' | 'restarting' | 'error';
  memoryMb: number;
  cpuPercent: number;
  diskMb: number;
  uptimeSeconds: number;
  nodeVersion: string;
  gitRepo?: string;
  tailscalePublicUrl: string;
  funnelEnabled: boolean;
  env: Record<string, string>;
  createdAt: string;
}

let hostedApps: HostedApp[] = [
  {
    id: 'app-main-api',
    name: 'ecommerce-api-service',
    type: 'express',
    port: 4001,
    status: 'online',
    memoryMb: 142.5,
    cpuPercent: 1.8,
    diskMb: 248.0,
    uptimeSeconds: 148200,
    nodeVersion: 'v20.18.0',
    gitRepo: 'https://github.com/user/express-shop-backend.git',
    tailscalePublicUrl: 'https://ubuntu-desktop.tailnet.ts.net:4001',
    funnelEnabled: true,
    env: {
      NODE_ENV: 'production',
      PORT: '4001',
      DATABASE_URL: 'sqlite:///data/shop.db',
      CORS_ORIGIN: '*'
    },
    createdAt: '2026-03-10T10:15:00Z'
  },
  {
    id: 'app-web-landing',
    name: 'frontend-web-portal',
    type: 'react',
    port: 5000,
    status: 'online',
    memoryMb: 88.2,
    cpuPercent: 0.6,
    diskMb: 185.4,
    uptimeSeconds: 96400,
    nodeVersion: 'v22.12.0',
    gitRepo: 'https://github.com/user/react-client-portal.git',
    tailscalePublicUrl: 'https://ubuntu-desktop.tailnet.ts.net:5000',
    funnelEnabled: true,
    env: {
      VITE_API_ENDPOINT: 'https://ubuntu-desktop.tailnet.ts.net:4001/api',
      NODE_ENV: 'production'
    },
    createdAt: '2026-03-12T14:30:00Z'
  },
  {
    id: 'app-telemetry-bot',
    name: 'system-monitor-daemon',
    type: 'nodejs',
    port: 8080,
    status: 'online',
    memoryMb: 62.1,
    cpuPercent: 0.4,
    diskMb: 76.5,
    uptimeSeconds: 245000,
    nodeVersion: 'v20.18.0',
    gitRepo: 'https://github.com/user/node-telemetry-worker.git',
    tailscalePublicUrl: 'https://ubuntu-desktop.tailnet.ts.net:8080',
    funnelEnabled: false,
    env: {
      METRICS_INTERVAL: '5000',
      ALERT_THRESHOLD: '90'
    },
    createdAt: '2026-03-08T09:00:00Z'
  }
];

// App logs store
const appLogs: Record<string, string[]> = {
  'app-main-api': [
    '[2026-03-24T12:00:01Z] [info] [express] Server initialized on port 4001',
    '[2026-03-24T12:00:02Z] [info] [tailscale] Funnel mapped: https://ubuntu-desktop.tailnet.ts.net:4001 -> 127.0.0.1:4001',
    '[2026-03-24T12:02:14Z] [info] [http] GET /api/v1/products 200 OK (24ms) - Client: Tailscale Funnel TLS',
    '[2026-03-24T12:05:40Z] [info] [http] POST /api/v1/orders 201 Created (48ms)',
    '[2026-03-24T12:10:19Z] [info] [database] SQLite checkpoint completed. Storage: 248 MB',
    '[2026-03-24T12:15:30Z] [info] [health] Memory nominal: 142.5 MB / Quota OK'
  ],
  'app-web-landing': [
    '[2026-03-24T12:00:10Z] [info] [vite/react] Production SPA bundle served via static proxy',
    '[2026-03-24T12:00:11Z] [info] [tailscale] Funnel TLS cert verified via MagicDNS',
    '[2026-03-24T12:04:12Z] [info] [http] GET / 200 OK (3ms) - Tailscale Funnel',
    '[2026-03-24T12:12:05Z] [info] [http] GET /assets/index-D7h2k9.js 304 Not Modified'
  ],
  'app-telemetry-bot': [
    '[2026-03-24T12:00:05Z] [info] [daemon] Node process attached to PID 89412',
    '[2026-03-24T12:05:00Z] [info] [telemetry] AMD64 CPU load average: 0.42, 0.38, 0.35',
    '[2026-03-24T12:10:00Z] [info] [telemetry] 2GB hosting partition check: 510 MB used / 1538 MB remaining (24.9%)',
    '[2026-03-24T12:15:00Z] [info] [telemetry] Tailscale node 100.84.120.45 ping response: 12ms'
  ]
};

// Simulated Virtual Filesystem inside the 2GB Ubuntu Desktop partition
let fileSystem = [
  { path: '/home/ubuntu/tailhost/apps/ecommerce-api/server.js', sizeKb: 14.2, modified: '2026-03-24 11:20', type: 'file' },
  { path: '/home/ubuntu/tailhost/apps/ecommerce-api/package.json', sizeKb: 2.1, modified: '2026-03-24 10:45', type: 'file' },
  { path: '/home/ubuntu/tailhost/apps/ecommerce-api/.env', sizeKb: 0.8, modified: '2026-03-24 10:40', type: 'file' },
  { path: '/home/ubuntu/tailhost/apps/ecommerce-api/node_modules/', sizeKb: 248000, modified: '2026-03-24 10:50', type: 'dir' },
  { path: '/home/ubuntu/tailhost/apps/frontend-web/dist/index.html', sizeKb: 4.8, modified: '2026-03-24 09:12', type: 'file' },
  { path: '/home/ubuntu/tailhost/apps/frontend-web/node_modules/', sizeKb: 185000, modified: '2026-03-24 09:10', type: 'dir' },
  { path: '/home/ubuntu/tailhost/apps/system-daemon/worker.js', sizeKb: 6.4, modified: '2026-03-23 18:00', type: 'file' },
  { path: '/home/ubuntu/tailhost/cache/npm-cache/', sizeKb: 72000, modified: '2026-03-24 08:30', type: 'dir' },
  { path: '/home/ubuntu/tailhost/logs/combined.log', sizeKb: 1850, modified: '2026-03-24 12:15', type: 'file' }
];

// Tailscale configuration state
let tailscaleConfig = {
  connected: true,
  nodeIp: '100.84.120.45',
  nodeIpv6: 'fd7a:115c:a1e0:ab12:4843:cd96:6254:782d',
  magicDnsName: 'ubuntu-desktop.tailnet.ts.net',
  deviceHostname: 'ubuntu-amd64-desktop',
  version: '1.74.2',
  funnelGloballyEnabled: true,
  exitNodeActive: false,
  taildropAvailable: true
};

// API: System info (reads actual OS stats if running on desktop or fallback gracefully)
app.get('/api/system', (_req: Request, res: Response) => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  // 2GB (2048 MB) quota calculation
  const totalQuotaMb = 2048;
  const usedStorageMb = hostedApps.reduce((acc, app) => acc + app.diskMb, 0) + 72 + 1.85; // apps + cache + logs
  const freeStorageMb = Math.max(0, totalQuotaMb - usedStorageMb);

  res.json({
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname() || 'ubuntu-amd64-desktop',
    uptime: os.uptime(),
    nodeVersion: process.version,
    cpuModel: cpus[0]?.model || 'AMD Ryzen 7 / EPYC (x86_64)',
    cpuCores: cpus.length || 8,
    memory: {
      totalMb: Math.round(totalMem / (1024 * 1024)),
      usedMb: Math.round(usedMem / (1024 * 1024)),
      freeMb: Math.round(freeMem / (1024 * 1024)),
      percent: Math.round((usedMem / totalMem) * 100)
    },
    storage2GBQuota: {
      allocatedLimitMb: totalQuotaMb,
      usedMb: parseFloat(usedStorageMb.toFixed(1)),
      freeMb: parseFloat(freeStorageMb.toFixed(1)),
      percentUsed: parseFloat(((usedStorageMb / totalQuotaMb) * 100).toFixed(1)),
      isolatedPath: '/home/ubuntu/tailhost/apps',
      nodeModulesCacheMb: 72.0,
      logsMb: 1.85
    },
    tailscale: tailscaleConfig
  });
});

// API: List apps
app.get('/api/apps', (_req: Request, res: Response) => {
  res.json(hostedApps);
});

// API: Create new app
app.post('/api/apps', (req: Request, res: Response) => {
  const { name, type, port, gitRepo, env, nodeVersion } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'App name is required' });
  }

  const assignedPort = port ? parseInt(port, 10) : 3000 + hostedApps.length + 1;
  const newApp: HostedApp = {
    id: `app-${Date.now()}`,
    name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    type: type || 'nodejs',
    port: assignedPort,
    status: 'online',
    memoryMb: 45.0,
    cpuPercent: 0.2,
    diskMb: 68.5,
    uptimeSeconds: 10,
    nodeVersion: nodeVersion || 'v20.18.0',
    gitRepo: gitRepo || '',
    tailscalePublicUrl: `https://${tailscaleConfig.magicDnsName}:${assignedPort}`,
    funnelEnabled: true,
    env: env || { NODE_ENV: 'production', PORT: assignedPort.toString() },
    createdAt: new Date().toISOString()
  };

  hostedApps.push(newApp);
  appLogs[newApp.id] = [
    `[${new Date().toISOString()}] [deploy] Created workspace at /home/ubuntu/tailhost/apps/${newApp.name}`,
    `[${new Date().toISOString()}] [npm] Installing production dependencies...`,
    `[${new Date().toISOString()}] [pm2] Started process "${newApp.name}" on port ${assignedPort}`,
    `[${new Date().toISOString()}] [tailscale] Funnel mapped: ${newApp.tailscalePublicUrl} -> 127.0.0.1:${assignedPort}`
  ];

  fileSystem.push(
    { path: `/home/ubuntu/tailhost/apps/${newApp.name}/server.js`, sizeKb: 8.4, modified: 'Just now', type: 'file' },
    { path: `/home/ubuntu/tailhost/apps/${newApp.name}/package.json`, sizeKb: 1.2, modified: 'Just now', type: 'file' },
    { path: `/home/ubuntu/tailhost/apps/${newApp.name}/node_modules/`, sizeKb: 68500, modified: 'Just now', type: 'dir' }
  );

  res.status(201).json(newApp);
});

// API: Action on app (start, stop, restart, rebuild)
app.post('/api/apps/:id/:action', (req: Request, res: Response) => {
  const { id, action } = req.params;
  const appItem = hostedApps.find(a => a.id === id);
  if (!appItem) {
    return res.status(404).json({ error: 'App not found' });
  }

  const logs = appLogs[id] || [];
  const now = new Date().toISOString();

  if (action === 'start') {
    appItem.status = 'online';
    appItem.uptimeSeconds = 0;
    logs.push(`[${now}] [pm2] App "${appItem.name}" started successfully`);
  } else if (action === 'stop') {
    appItem.status = 'stopped';
    appItem.memoryMb = 0;
    appItem.cpuPercent = 0;
    logs.push(`[${now}] [pm2] App "${appItem.name}" stopped (SIGTERM received)`);
  } else if (action === 'restart') {
    appItem.status = 'online';
    appItem.uptimeSeconds = 0;
    logs.push(`[${now}] [pm2] App "${appItem.name}" restarted gracefully`);
  } else if (action === 'rebuild') {
    appItem.status = 'online';
    logs.push(`[${now}] [npm] Running "npm install && npm run build"...`);
    logs.push(`[${now}] [build] Build artifacts optimized in 1.4s`);
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }

  appLogs[id] = logs;
  res.json({ success: true, app: appItem });
});

// API: Delete app
app.delete('/api/apps/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = hostedApps.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'App not found' });
  }
  const deleted = hostedApps.splice(idx, 1)[0];
  delete appLogs[id];
  res.json({ success: true, deletedApp: deleted });
});

// API: Toggle app funnel
app.post('/api/apps/:id/funnel', (req: Request, res: Response) => {
  const { id } = req.params;
  const appItem = hostedApps.find(a => a.id === id);
  if (!appItem) {
    return res.status(404).json({ error: 'App not found' });
  }
  appItem.funnelEnabled = !appItem.funnelEnabled;
  const logs = appLogs[id] || [];
  logs.push(`[${new Date().toISOString()}] [tailscale] Funnel public access ${appItem.funnelEnabled ? 'ENABLED' : 'DISABLED'} for port ${appItem.port}`);
  appLogs[id] = logs;
  res.json({ success: true, app: appItem });
});

// API: Get logs
app.get('/api/apps/:id/logs', (req: Request, res: Response) => {
  const { id } = req.params;
  const logs = appLogs[id] || [`[info] No active logs recorded for ${id}`];
  res.json({ logs });
});

// API: Storage files and 2GB cleanup
app.get('/api/storage', (_req: Request, res: Response) => {
  res.json({
    files: fileSystem,
    totalQuotaMb: 2048,
    usedMb: hostedApps.reduce((acc, a) => acc + a.diskMb, 0) + 72 + 1.85
  });
});

app.post('/api/storage/clean', (_req: Request, res: Response) => {
  // Free up npm cache and old logs
  const freedMb = 72; // Freed cache
  res.json({
    success: true,
    message: `Cleaned npm cache and pruned rotated logs. Reclaimed ${freedMb} MB inside 2GB sandbox.`,
    freedMb
  });
});

// API: Tailscale details & terminal command helper
app.get('/api/tailscale', (_req: Request, res: Response) => {
  res.json({
    config: tailscaleConfig,
    cliCommands: {
      status: 'tailscale status',
      ip: 'tailscale ip -4',
      serve: 'tailscale serve --bg 3000',
      funnel: 'tailscale funnel 3000 on',
      statusFull: 'tailscale funnel status'
    }
  });
});

// API: Standalone install script for Ubuntu Desktop terminal
app.get('/api/install-script', (_req: Request, res: Response) => {
  const script = `#!/usr/bin/env bash
# ==============================================================================
# TailNode Ubuntu Desktop (AMD64) 2GB Web Host & cPanel Installer
# ==============================================================================
set -e

echo "==> [1/5] Updating Ubuntu package repositories..."
sudo apt-get update -y

echo "==> [2/5] Installing Node.js, NPM, Git, and Tailscale..."
sudo apt-get install -y curl git build-essential

# Install Node.js 20 LTS if not present
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Tailscale if not present
if ! command -v tailscale &> /dev/null; then
    curl -fsSL https://tailscale.com/install.sh | sh
fi

echo "==> [3/5] Setting up isolated 2GB hosting partition at /home/$USER/tailhost..."
mkdir -p /home/$USER/tailhost/apps
mkdir -p /home/$USER/tailhost/logs
mkdir -p /home/$USER/tailhost/cache

echo "==> [4/5] Building TailNode Web Control Panel..."
npm install
npm run build

echo "==> [5/5] Activating Tailscale Funnel for public access..."
echo "Please authenticate Tailscale if not logged in: 'sudo tailscale up'"
echo "To expose public port 3000 via Tailscale Funnel:"
echo "tailscale funnel --bg 3000"

echo "=============================================================================="
echo "TailNode is ready! Start server: npm start"
echo "Public URL: https://\$(tailscale status --json | grep -o '"DNSName":"[^"]*' | head -1 | cut -d'"' -f4 | sed 's/\\.$//')"
echo "=============================================================================="
`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(script);
});

// Production static file handling or Dev Vite Middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev mode, mount Vite middleware
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
      console.log('⚡ Vite dev middleware mounted');
    } catch (err) {
      console.error('Error mounting Vite middleware in dev:', err);
    }
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('📦 Serving production build from dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TailNode Ubuntu Desktop Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔒 Tailscale Funnel endpoint mapped: https://${tailscaleConfig.magicDnsName}:${PORT}`);
  });
}

startServer();
