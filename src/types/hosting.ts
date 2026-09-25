export interface HostedApp {
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

export interface TunnelConfig {
  tailscale: {
    enabled: boolean;
    connected: boolean;
    nodeIp: string;
    magicDnsName: string;
    funnelActive: boolean;
  };
  cloudflare: {
    enabled: boolean;
    activeTunnelUrl: string;
    installed: boolean;
    mode: 'quick' | 'named';
  };
  ngrok: {
    enabled: boolean;
    activeTunnelUrl: string;
    authtokenConfigured: boolean;
    installed: boolean;
  };
  caddy: {
    enabled: boolean;
    domain: string;
    autoHttps: boolean;
    installed: boolean;
  };
}

export interface SystemMetrics {
  platform: string;
  arch: string;
  hostname: string;
  uptime: number;
  nodeVersion: string;
  pythonVersion: string;
  developer: string;
  cpuModel: string;
  cpuCores: number;
  memory: {
    totalMb: number;
    usedMb: number;
    freeMb: number;
    percent: number;
  };
  storage2GBQuota: {
    allocatedLimitMb: number;
    isDefault2GB: boolean;
    usedMb: number;
    freeMb: number;
    percentUsed: number;
    isolatedPath: string;
    nodeModulesCacheMb: number;
    logsMb: number;
    quotaHistory: Array<{ date: string; limitMb: number; reason: string }>;
  };
  tailscale: {
    connected: boolean;
    nodeIp: string;
    nodeIpv6: string;
    magicDnsName: string;
    deviceHostname: string;
    version: string;
    funnelGloballyEnabled: boolean;
    exitNodeActive: boolean;
    taildropAvailable: boolean;
  };
  tunnels: TunnelConfig;
}

export interface StorageFile {
  path: string;
  sizeKb: number;
  modified: string;
  type: 'file' | 'dir';
}
