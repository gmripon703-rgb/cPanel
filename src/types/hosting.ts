export interface HostedApp {
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

export interface SystemMetrics {
  platform: string;
  arch: string;
  hostname: string;
  uptime: number;
  nodeVersion: string;
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
    usedMb: number;
    freeMb: number;
    percentUsed: number;
    isolatedPath: string;
    nodeModulesCacheMb: number;
    logsMb: number;
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
}

export interface StorageFile {
  path: string;
  sizeKb: number;
  modified: string;
  type: 'file' | 'dir';
}
