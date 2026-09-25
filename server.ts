import express, { Request, Response } from 'express';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

export const DEVELOPER_NAME = 'GM Ripon Developer';

interface HostedApp {
  id: string;
  name: string;
  type: 'nodejs' | 'static' | 'react' | 'express' | 'flask' | 'python' | 'fastapi';
  port: number;
  status: 'online' | 'stopped' | 'restarting' | 'error';
  memoryMb: number;
  cpuPercent: number;
  diskMb: number;
  uptimeSeconds: number;
  runtimeVersion: string;
  gitRepo?: string;
  tailscalePublicUrl: string;
  cloudflareUrl?: string;
  ngrokUrl?: string;
  activeTunnel: 'tailscale' | 'cloudflare' | 'ngrok' | 'caddy' | 'none';
  funnelEnabled: boolean;
  env: Record<string, string>;
  createdAt: string;
}

// Configurable storage quota (default 2GB = 2048 MB, expandable via settings)
let currentStorageLimitMb = 2048;
let quotaHistory = [
  { date: '2026-03-24 10:00', limitMb: 2048, reason: 'Default 2GB sandbox initialized on AMD64 / Termux host' }
];

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
    runtimeVersion: 'Node.js v20.18.0',
    gitRepo: 'https://github.com/gmripon/express-shop-backend.git',
    tailscalePublicUrl: 'https://ubuntu-desktop.tailnet.ts.net:4001',
    cloudflareUrl: 'https://ecommerce-api.trycloudflare.com',
    ngrokUrl: 'https://a94f-103-84-12.ngrok-free.app',
    activeTunnel: 'cloudflare',
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
    id: 'app-flask-service',
    name: 'python-flask-analytics',
    type: 'flask',
    port: 5500,
    status: 'online',
    memoryMb: 95.0,
    cpuPercent: 1.2,
    diskMb: 132.5,
    uptimeSeconds: 84200,
    runtimeVersion: 'Python 3.12 (WSGI Flask/Gunicorn)',
    gitRepo: 'https://github.com/gmripon/flask-analytics-server.git',
    tailscalePublicUrl: 'https://ubuntu-desktop.tailnet.ts.net:5500',
    cloudflareUrl: 'https://flask-analytics.trycloudflare.com',
    ngrokUrl: 'https://b12c-103-84-12.ngrok-free.app',
    activeTunnel: 'tailscale',
    funnelEnabled: true,
    env: {
      FLASK_ENV: 'production',
      PORT: '5500',
      PYTHONUNBUFFERED: '1',
      SECRET_KEY: 'tailnode-flask-secret-key'
    },
    createdAt: '2026-03-11T12:00:00Z'
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
    runtimeVersion: 'Node.js v22.12.0 (Vite)',
    gitRepo: 'https://github.com/gmripon/react-client-portal.git',
    tailscalePublicUrl: 'https://ubuntu-desktop.tailnet.ts.net:5000',
    cloudflareUrl: 'https://web-portal.trycloudflare.com',
    ngrokUrl: '',
    activeTunnel: 'cloudflare',
    funnelEnabled: true,
    env: {
      VITE_API_ENDPOINT: 'https://ecommerce-api.trycloudflare.com/api',
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
    runtimeVersion: 'Node.js v20.18.0',
    gitRepo: 'https://github.com/gmripon/node-telemetry-worker.git',
    tailscalePublicUrl: 'https://ubuntu-desktop.tailnet.ts.net:8080',
    cloudflareUrl: '',
    ngrokUrl: '',
    activeTunnel: 'none',
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
    '[2026-03-24T12:00:03Z] [info] [cloudflare] Tunnel connected: https://ecommerce-api.trycloudflare.com -> 127.0.0.1:4001',
    '[2026-03-24T12:02:14Z] [info] [http] GET /api/v1/products 200 OK (24ms) - Client: Cloudflare TLS',
    '[2026-03-24T12:05:40Z] [info] [http] POST /api/v1/orders 201 Created (48ms)',
    '[2026-03-24T12:10:19Z] [info] [database] SQLite checkpoint completed. Storage: 248 MB',
    '[2026-03-24T12:15:30Z] [info] [health] Memory nominal: 142.5 MB / Quota OK'
  ],
  'app-flask-service': [
    '[2026-03-24T12:00:05Z] [info] [flask] Gunicorn worker spawned (PID 78104) on port 5500',
    '[2026-03-24T12:00:06Z] [info] [tailscale] Public HTTPS Funnel active on port 5500',
    '[2026-03-24T12:01:22Z] [info] [python] Loaded NumPy & Flask blueprints in 0.42s',
    '[2026-03-24T12:04:10Z] [info] [http] GET /analytics/telemetry 200 OK (11ms)'
  ],
  'app-web-landing': [
    '[2026-03-24T12:00:10Z] [info] [vite/react] Production SPA bundle served via static proxy',
    '[2026-03-24T12:00:11Z] [info] [cloudflare] Quick tunnel active: https://web-portal.trycloudflare.com',
    '[2026-03-24T12:04:12Z] [info] [http] GET / 200 OK (3ms) - Cloudflare Edge',
    '[2026-03-24T12:12:05Z] [info] [http] GET /assets/index-D7h2k9.js 304 Not Modified'
  ],
  'app-telemetry-bot': [
    '[2026-03-24T12:00:05Z] [info] [daemon] Node process attached to PID 89412',
    '[2026-03-24T12:05:00Z] [info] [telemetry] AMD64 / aarch64 CPU load average: 0.42, 0.38, 0.35',
    '[2026-03-24T12:10:00Z] [info] [telemetry] Storage check: 642.4 MB used of quota limit',
    '[2026-03-24T12:15:00Z] [info] [telemetry] Multi-tunnel check: Cloudflare OK, Tailscale OK, ngrok ready'
  ]
};

// Simulated Virtual Filesystem
let fileSystem = [
  { path: '/home/ubuntu/tailhost/apps/ecommerce-api/server.js', sizeKb: 14.2, modified: '2026-03-24 11:20', type: 'file' },
  { path: '/home/ubuntu/tailhost/apps/ecommerce-api/package.json', sizeKb: 2.1, modified: '2026-03-24 10:45', type: 'file' },
  { path: '/home/ubuntu/tailhost/apps/ecommerce-api/.env', sizeKb: 0.8, modified: '2026-03-24 10:40', type: 'file' },
  { path: '/home/ubuntu/tailhost/apps/ecommerce-api/node_modules/', sizeKb: 248000, modified: '2026-03-24 10:50', type: 'dir' },
  { path: '/home/ubuntu/tailhost/apps/flask-service/app.py', sizeKb: 5.6, modified: '2026-03-24 10:15', type: 'file' },
  { path: '/home/ubuntu/tailhost/apps/flask-service/requirements.txt', sizeKb: 0.9, modified: '2026-03-24 10:10', type: 'file' },
  { path: '/home/ubuntu/tailhost/apps/flask-service/.venv/', sizeKb: 132500, modified: '2026-03-24 10:12', type: 'dir' },
  { path: '/home/ubuntu/tailhost/apps/frontend-web/dist/index.html', sizeKb: 4.8, modified: '2026-03-24 09:12', type: 'file' },
  { path: '/home/ubuntu/tailhost/apps/frontend-web/node_modules/', sizeKb: 185000, modified: '2026-03-24 09:10', type: 'dir' },
  { path: '/home/ubuntu/tailhost/apps/system-daemon/worker.js', sizeKb: 6.4, modified: '2026-03-23 18:00', type: 'file' },
  { path: '/home/ubuntu/tailhost/cache/npm-cache/', sizeKb: 72000, modified: '2026-03-24 08:30', type: 'dir' },
  { path: '/home/ubuntu/tailhost/logs/combined.log', sizeKb: 1850, modified: '2026-03-24 12:15', type: 'file' }
];

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

let tunnelsConfig = {
  tailscale: {
    enabled: true,
    connected: true,
    nodeIp: '100.84.120.45',
    magicDnsName: 'ubuntu-desktop.tailnet.ts.net',
    funnelActive: true
  },
  cloudflare: {
    enabled: true,
    activeTunnelUrl: 'https://tailnode-tunnel.trycloudflare.com',
    installed: true,
    mode: 'quick' as const
  },
  ngrok: {
    enabled: false,
    activeTunnelUrl: 'https://cpanel-ripon.ngrok-free.app',
    authtokenConfigured: true,
    installed: true
  },
  caddy: {
    enabled: false,
    domain: 'myhost.example.com',
    autoHttps: true,
    installed: true
  }
};

// API: System info
app.get('/api/system', (_req: Request, res: Response) => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  const totalQuotaMb = currentStorageLimitMb;
  const usedStorageMb = hostedApps.reduce((acc, app) => acc + app.diskMb, 0) + 72 + 1.85;
  const freeStorageMb = Math.max(0, totalQuotaMb - usedStorageMb);

  res.json({
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname() || 'ubuntu-amd64-desktop',
    uptime: os.uptime(),
    nodeVersion: process.version,
    pythonVersion: 'Python 3.12.3',
    developer: DEVELOPER_NAME,
    cpuModel: cpus[0]?.model || 'AMD Ryzen 7 / ARM Cortex (x86_64/aarch64)',
    cpuCores: cpus.length || 8,
    memory: {
      totalMb: Math.round(totalMem / (1024 * 1024)),
      usedMb: Math.round(usedMem / (1024 * 1024)),
      freeMb: Math.round(freeMem / (1024 * 1024)),
      percent: Math.round((usedMem / totalMem) * 100)
    },
    storage2GBQuota: {
      allocatedLimitMb: totalQuotaMb,
      isDefault2GB: totalQuotaMb === 2048,
      usedMb: parseFloat(usedStorageMb.toFixed(1)),
      freeMb: parseFloat(freeStorageMb.toFixed(1)),
      percentUsed: parseFloat(((usedStorageMb / totalQuotaMb) * 100).toFixed(1)),
      isolatedPath: '/home/ubuntu/tailhost/apps',
      nodeModulesCacheMb: 72.0,
      logsMb: 1.85,
      quotaHistory
    },
    tailscale: tailscaleConfig,
    tunnels: tunnelsConfig
  });
});

// API: Extend or configure storage quota
app.post('/api/storage/quota', (req: Request, res: Response) => {
  const { newLimitMb, reason } = req.body;
  if (!newLimitMb || typeof newLimitMb !== 'number' || newLimitMb < 512) {
    return res.status(400).json({ error: 'Valid storage quota in MB (minimum 512 MB) is required.' });
  }

  const oldLimit = currentStorageLimitMb;
  currentStorageLimitMb = newLimitMb;
  const entry = {
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    limitMb: newLimitMb,
    reason: reason || (newLimitMb > oldLimit ? `Extended quota from ${oldLimit} MB to ${newLimitMb} MB` : `Adjusted quota to ${newLimitMb} MB`)
  };
  quotaHistory.unshift(entry);

  res.json({
    success: true,
    message: `Storage quota successfully updated to ${newLimitMb} MB (${(newLimitMb / 1024).toFixed(1)} GB).`,
    allocatedLimitMb: currentStorageLimitMb,
    isDefault2GB: currentStorageLimitMb === 2048,
    quotaHistory
  });
});

// API: List apps
app.get('/api/apps', (_req: Request, res: Response) => {
  res.json(hostedApps);
});

// API: Create new app (Supports Node.js, Express, React, Flask Python, Static)
app.post('/api/apps', (req: Request, res: Response) => {
  const { name, type, port, gitRepo, env, runtimeVersion } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'App name is required' });
  }

  const assignedPort = port ? parseInt(port, 10) : 3000 + hostedApps.length + 1;
  const isFlask = type === 'flask' || type === 'python' || type === 'fastapi';
  
  const appSlug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const newApp: HostedApp = {
    id: `app-${Date.now()}`,
    name: appSlug,
    type: type || 'nodejs',
    port: assignedPort,
    status: 'online',
    memoryMb: isFlask ? 85.0 : 45.0,
    cpuPercent: 0.2,
    diskMb: isFlask ? 95.0 : 68.5,
    uptimeSeconds: 10,
    runtimeVersion: runtimeVersion || (isFlask ? 'Python 3.12 (Flask/Gunicorn)' : 'Node.js v20.18.0'),
    gitRepo: gitRepo || '',
    tailscalePublicUrl: `https://${tailscaleConfig.magicDnsName}:${assignedPort}`,
    cloudflareUrl: `https://${appSlug}.trycloudflare.com`,
    ngrokUrl: `https://${appSlug}.ngrok-free.app`,
    activeTunnel: 'cloudflare',
    funnelEnabled: true,
    env: env || (isFlask 
      ? { FLASK_ENV: 'production', PORT: assignedPort.toString(), PYTHONUNBUFFERED: '1' } 
      : { NODE_ENV: 'production', PORT: assignedPort.toString() }),
    createdAt: new Date().toISOString()
  };

  hostedApps.push(newApp);
  appLogs[newApp.id] = [
    `[${new Date().toISOString()}] [deploy] Initialized workspace at /home/ubuntu/tailhost/apps/${newApp.name}`,
    `[${new Date().toISOString()}] [${isFlask ? 'pip' : 'npm'}] Installed production dependencies (${isFlask ? 'Flask, gunicorn' : 'package.json'})`,
    `[${new Date().toISOString()}] [daemon] Started service "${newApp.name}" on port ${assignedPort}`,
    `[${new Date().toISOString()}] [cloudflare] Quick tunnel route mapped: ${newApp.cloudflareUrl} -> :${assignedPort}`,
    `[${new Date().toISOString()}] [tailscale] Funnel mapped: ${newApp.tailscalePublicUrl} -> :${assignedPort}`
  ];

  if (isFlask) {
    fileSystem.push(
      { path: `/home/ubuntu/tailhost/apps/${newApp.name}/app.py`, sizeKb: 6.2, modified: 'Just now', type: 'file' },
      { path: `/home/ubuntu/tailhost/apps/${newApp.name}/requirements.txt`, sizeKb: 0.8, modified: 'Just now', type: 'file' },
      { path: `/home/ubuntu/tailhost/apps/${newApp.name}/.venv/`, sizeKb: 95000, modified: 'Just now', type: 'dir' }
    );
  } else {
    fileSystem.push(
      { path: `/home/ubuntu/tailhost/apps/${newApp.name}/server.js`, sizeKb: 8.4, modified: 'Just now', type: 'file' },
      { path: `/home/ubuntu/tailhost/apps/${newApp.name}/package.json`, sizeKb: 1.2, modified: 'Just now', type: 'file' },
      { path: `/home/ubuntu/tailhost/apps/${newApp.name}/node_modules/`, sizeKb: 68500, modified: 'Just now', type: 'dir' }
    );
  }

  res.status(201).json(newApp);
});

// API: Action on app
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
    logs.push(`[${now}] [daemon] App "${appItem.name}" started successfully`);
  } else if (action === 'stop') {
    appItem.status = 'stopped';
    appItem.memoryMb = 0;
    appItem.cpuPercent = 0;
    logs.push(`[${now}] [daemon] App "${appItem.name}" stopped (SIGTERM received)`);
  } else if (action === 'restart') {
    appItem.status = 'online';
    appItem.uptimeSeconds = 0;
    logs.push(`[${now}] [daemon] App "${appItem.name}" restarted gracefully`);
  } else if (action === 'rebuild') {
    appItem.status = 'online';
    logs.push(`[${now}] [build] Rebuilding environment and optimizing assets in 1.2s`);
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }

  appLogs[id] = logs;
  res.json({ success: true, app: appItem });
});

// API: Set active tunnel for app
app.post('/api/apps/:id/tunnel', (req: Request, res: Response) => {
  const { id } = req.params;
  const { tunnelType } = req.body;
  const appItem = hostedApps.find(a => a.id === id);
  if (!appItem) {
    return res.status(404).json({ error: 'App not found' });
  }

  appItem.activeTunnel = tunnelType || 'tailscale';
  const logs = appLogs[id] || [];
  logs.push(`[${new Date().toISOString()}] [tunnel] Active public gateway switched to: ${appItem.activeTunnel.toUpperCase()}`);
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

// API: Toggle global tunnels (Cloudflare, ngrok, Tailscale, Caddy)
app.post('/api/tunnels/toggle', (req: Request, res: Response) => {
  const { service, enabled, token } = req.body;
  if (service === 'cloudflare') {
    tunnelsConfig.cloudflare.enabled = Boolean(enabled);
  } else if (service === 'ngrok') {
    tunnelsConfig.ngrok.enabled = Boolean(enabled);
    if (token) tunnelsConfig.ngrok.authtokenConfigured = true;
  } else if (service === 'tailscale') {
    tunnelsConfig.tailscale.enabled = Boolean(enabled);
  } else if (service === 'caddy') {
    tunnelsConfig.caddy.enabled = Boolean(enabled);
  }

  res.json({ success: true, tunnels: tunnelsConfig });
});

// API: Get logs
app.get('/api/apps/:id/logs', (req: Request, res: Response) => {
  const { id } = req.params;
  const logs = appLogs[id] || [`[info] No active logs recorded for ${id}`];
  res.json({ logs });
});

// API: Storage files and cleanup
app.get('/api/storage', (_req: Request, res: Response) => {
  res.json({
    files: fileSystem,
    totalQuotaMb: currentStorageLimitMb,
    usedMb: hostedApps.reduce((acc, a) => acc + a.diskMb, 0) + 72 + 1.85
  });
});

app.post('/api/storage/clean', (_req: Request, res: Response) => {
  const freedMb = 72;
  res.json({
    success: true,
    message: `Cleaned npm/pip build cache and rotated logs. Reclaimed ${freedMb} MB inside sandbox.`,
    freedMb
  });
});

// API: Tunnels summary
app.get('/api/tunnels', (_req: Request, res: Response) => {
  res.json(tunnelsConfig);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
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
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('📦 Serving production build from dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TailNode (${DEVELOPER_NAME}) Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔒 Tailscale Funnel: https://${tailscaleConfig.magicDnsName}:${PORT}`);
    console.log(`☁️ Cloudflare Tunnel: https://tailnode-tunnel.trycloudflare.com`);
  });
}

startServer();
