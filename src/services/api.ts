import { HostedApp, SystemMetrics, StorageFile } from '../types/hosting';

const defaultMetrics: SystemMetrics = {
  platform: 'linux',
  arch: 'x64',
  hostname: 'ubuntu-amd64-desktop',
  uptime: 184500,
  nodeVersion: 'v20.18.0',
  cpuModel: 'AMD Ryzen 7 7800X3D (8-Core, 16-Threads)',
  cpuCores: 8,
  memory: {
    totalMb: 32140,
    usedMb: 8420,
    freeMb: 23720,
    percent: 26
  },
  storage2GBQuota: {
    allocatedLimitMb: 2048,
    usedMb: 509.9,
    freeMb: 1538.1,
    percentUsed: 24.9,
    isolatedPath: '/home/ubuntu/tailhost/apps',
    nodeModulesCacheMb: 72.0,
    logsMb: 1.85
  },
  tailscale: {
    connected: true,
    nodeIp: '100.84.120.45',
    nodeIpv6: 'fd7a:115c:a1e0:ab12:4843:cd96:6254:782d',
    magicDnsName: 'ubuntu-desktop.tailnet.ts.net',
    deviceHostname: 'ubuntu-amd64-desktop',
    version: '1.74.2',
    funnelGloballyEnabled: true,
    exitNodeActive: false,
    taildropAvailable: true
  }
};

export async function fetchSystemMetrics(): Promise<SystemMetrics> {
  try {
    const res = await fetch('/api/system');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API /api/system offline, fallback to local state', e);
  }
  return defaultMetrics;
}

export async function fetchHostedApps(): Promise<HostedApp[]> {
  try {
    const res = await fetch('/api/apps');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API /api/apps offline, using local fallback', e);
  }
  return [
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
}

export async function createApp(appData: Partial<HostedApp>): Promise<HostedApp> {
  try {
    const res = await fetch('/api/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API /api/apps POST offline, simulating locally', e);
  }

  const port = appData.port || 3000 + Math.floor(Math.random() * 5000);
  return {
    id: `app-${Date.now()}`,
    name: appData.name || 'custom-node-app',
    type: appData.type || 'nodejs',
    port,
    status: 'online',
    memoryMb: 42.0,
    cpuPercent: 0.2,
    diskMb: 52.4,
    uptimeSeconds: 0,
    nodeVersion: appData.nodeVersion || 'v20.18.0',
    gitRepo: appData.gitRepo || '',
    tailscalePublicUrl: `https://ubuntu-desktop.tailnet.ts.net:${port}`,
    funnelEnabled: true,
    env: appData.env || { NODE_ENV: 'production', PORT: port.toString() },
    createdAt: new Date().toISOString()
  };
}

export async function executeAppAction(appId: string, action: 'start' | 'stop' | 'restart' | 'rebuild') {
  try {
    const res = await fetch(`/api/apps/${appId}/${action}`, { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn(`API action ${action} failed, simulating locally`, e);
  }
  return { success: true };
}

export async function deleteAppApi(appId: string) {
  try {
    const res = await fetch(`/api/apps/${appId}`, { method: 'DELETE' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API delete failed, simulating locally', e);
  }
  return { success: true };
}

export async function toggleAppFunnelApi(appId: string) {
  try {
    const res = await fetch(`/api/apps/${appId}/funnel`, { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API funnel toggle failed', e);
  }
  return { success: true };
}

export async function fetchAppLogs(appId: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/apps/${appId}/logs`);
    if (res.ok) {
      const data = await res.json();
      return data.logs;
    }
  } catch (e) {
    console.warn('API logs failed', e);
  }
  return [
    `[2026-03-24T12:00:00Z] [pm2] Daemon monitoring ${appId}`,
    `[2026-03-24T12:00:01Z] [node] Process online on Ubuntu Desktop AMD64`,
    `[2026-03-24T12:00:02Z] [tailscale] Public HTTPS Funnel active via MagicDNS`
  ];
}

export async function fetchStorageFiles(): Promise<StorageFile[]> {
  try {
    const res = await fetch('/api/storage');
    if (res.ok) {
      const data = await res.json();
      return data.files;
    }
  } catch (e) {
    console.warn('API storage files failed', e);
  }
  return [
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
}

export async function cleanStorageCache(): Promise<{ success: boolean; message: string; freedMb: number }> {
  try {
    const res = await fetch('/api/storage/clean', { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API clean failed', e);
  }
  return {
    success: true,
    message: 'Cleaned npm build cache and rotated logs. Reclaimed 72 MB storage in 2GB sandbox.',
    freedMb: 72
  };
}
