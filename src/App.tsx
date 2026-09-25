/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopNavigation } from './components/TopNavigation';
import { LandingPage } from './components/LandingPage';
import { HostingPanel } from './components/HostingPanel';
import { DeployModal } from './components/panel/DeployModal';
import { UbuntuGuideModal } from './components/panel/UbuntuGuideModal';
import { WhatsAppSmartButton } from './components/WhatsAppSmartButton';
import { 
  fetchSystemMetrics, 
  fetchHostedApps, 
  fetchStorageFiles, 
  createApp, 
  executeAppAction, 
  deleteAppApi, 
  toggleAppFunnelApi, 
  cleanStorageCache,
  extendStorageQuota,
  setAppTunnel,
  DEVELOPER_NAME
} from './services/api';
import { HostedApp, StorageFile, SystemMetrics } from './types/hosting';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'panel'>('landing');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    platform: 'linux',
    arch: 'x64 / aarch64 (ARM64)',
    hostname: 'ubuntu-amd64-desktop',
    uptime: 184500,
    nodeVersion: 'v20.18.0',
    pythonVersion: 'Python 3.12.3',
    developer: DEVELOPER_NAME,
    cpuModel: 'AMD Ryzen 7 / ARM Cortex (8-Core)',
    cpuCores: 8,
    memory: {
      totalMb: 32140,
      usedMb: 8420,
      freeMb: 23720,
      percent: 26
    },
    storage2GBQuota: {
      allocatedLimitMb: 2048,
      isDefault2GB: true,
      usedMb: 642.4,
      freeMb: 1405.6,
      percentUsed: 31.3,
      isolatedPath: '/home/ubuntu/tailhost/apps',
      nodeModulesCacheMb: 72.0,
      logsMb: 1.85,
      quotaHistory: [
        { date: '2026-03-24 10:00', limitMb: 2048, reason: 'Default 2GB sandbox initialized on AMD64 / Termux host' }
      ]
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
    },
    tunnels: {
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
        mode: 'quick'
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
    }
  });

  const [apps, setApps] = useState<HostedApp[]>([]);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [activeAppFilter, setActiveAppFilter] = useState('all');

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const [sysMetrics, appList, storageFiles] = await Promise.all([
        fetchSystemMetrics(),
        fetchHostedApps(),
        fetchStorageFiles()
      ]);
      setMetrics(sysMetrics);
      setApps(appList);
      setFiles(storageFiles);
    }
    loadData();
  }, []);

  const handleDeployApp = async (appData: Partial<HostedApp>) => {
    const created = await createApp(appData);
    setApps(prev => [...prev, created]);
    
    // Recalculate storage quota with current limit
    const currentLimit = metrics.storage2GBQuota.allocatedLimitMb;
    const newUsed = metrics.storage2GBQuota.usedMb + created.diskMb;
    setMetrics(prev => ({
      ...prev,
      storage2GBQuota: {
        ...prev.storage2GBQuota,
        usedMb: parseFloat(newUsed.toFixed(1)),
        freeMb: parseFloat(Math.max(0, currentLimit - newUsed).toFixed(1)),
        percentUsed: parseFloat(((newUsed / currentLimit) * 100).toFixed(1))
      }
    }));

    setActiveTab('apps');
  };

  const handleExtendQuota = async (newLimitMb: number, reason?: string) => {
    const res = await extendStorageQuota(newLimitMb, reason);
    if (res.success) {
      setMetrics(prev => {
        const used = prev.storage2GBQuota.usedMb;
        return {
          ...prev,
          storage2GBQuota: {
            ...prev.storage2GBQuota,
            allocatedLimitMb: newLimitMb,
            isDefault2GB: newLimitMb === 2048,
            freeMb: parseFloat(Math.max(0, newLimitMb - used).toFixed(1)),
            percentUsed: parseFloat(((used / newLimitMb) * 100).toFixed(1)),
            quotaHistory: res.quotaHistory || [
              { date: 'Just now', limitMb: newLimitMb, reason: reason || 'Quota adjusted' },
              ...prev.storage2GBQuota.quotaHistory
            ]
          }
        };
      });
    }
  };

  const handleSetAppTunnel = async (appId: string, tunnel: 'tailscale' | 'cloudflare' | 'ngrok' | 'caddy' | 'none') => {
    await setAppTunnel(appId, tunnel);
    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        return { ...a, activeTunnel: tunnel };
      }
      return a;
    }));
  };

  const handleAppAction = async (appId: string, action: 'start' | 'stop' | 'restart' | 'rebuild') => {
    await executeAppAction(appId, action);
    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        return {
          ...a,
          status: action === 'stop' ? 'stopped' : 'online',
          uptimeSeconds: action === 'stop' ? a.uptimeSeconds : 0
        };
      }
      return a;
    }));
  };

  const handleDeleteApp = async (appId: string) => {
    const toDelete = apps.find(a => a.id === appId);
    await deleteAppApi(appId);
    setApps(prev => prev.filter(a => a.id !== appId));
    
    if (toDelete) {
      const currentLimit = metrics.storage2GBQuota.allocatedLimitMb;
      const newUsed = Math.max(0, metrics.storage2GBQuota.usedMb - toDelete.diskMb);
      setMetrics(prev => ({
        ...prev,
        storage2GBQuota: {
          ...prev.storage2GBQuota,
          usedMb: parseFloat(newUsed.toFixed(1)),
          freeMb: parseFloat((currentLimit - newUsed).toFixed(1)),
          percentUsed: parseFloat(((newUsed / currentLimit) * 100).toFixed(1))
        }
      }));
    }
  };

  const handleToggleFunnel = async (appId: string) => {
    await toggleAppFunnelApi(appId);
    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        return { ...a, funnelEnabled: !a.funnelEnabled };
      }
      return a;
    }));
  };

  const handleCleanCache = async () => {
    setCleaning(true);
    await cleanStorageCache();
    setTimeout(() => {
      setCleaning(false);
      setMetrics(prev => {
        const freed = 72;
        const currentLimit = prev.storage2GBQuota.allocatedLimitMb;
        const newUsed = Math.max(0, prev.storage2GBQuota.usedMb - freed);
        return {
          ...prev,
          storage2GBQuota: {
            ...prev.storage2GBQuota,
            usedMb: parseFloat(newUsed.toFixed(1)),
            freeMb: parseFloat((currentLimit - newUsed).toFixed(1)),
            percentUsed: parseFloat(((newUsed / currentLimit) * 100).toFixed(1)),
            nodeModulesCacheMb: 0
          }
        };
      });
    }, 1200);
  };

  const nextAvailablePort = apps.length > 0 
    ? Math.max(...apps.map(a => a.port)) + 1 
    : 4001;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Navigation */}
      <TopNavigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDeploy={() => setIsDeployOpen(true)}
        onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1">
        {currentView === 'landing' ? (
          <LandingPage
            metrics={metrics}
            onLaunchPanel={() => {
              setCurrentView('panel');
              setActiveTab('overview');
            }}
            onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
          />
        ) : (
          <HostingPanel
            metrics={metrics}
            apps={apps}
            files={files}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onDeployClick={() => setIsDeployOpen(true)}
            onCleanCache={handleCleanCache}
            onExtendQuota={handleExtendQuota}
            onAppAction={handleAppAction}
            onDeleteApp={handleDeleteApp}
            onToggleFunnel={handleToggleFunnel}
            onSetAppTunnel={handleSetAppTunnel}
            onDeployShortcutApp={handleDeployApp}
            onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
            cleaning={cleaning}
            activeAppFilter={activeAppFilter}
            setActiveAppFilter={setActiveAppFilter}
          />
        )}
      </div>

      {/* Deploy App Modal */}
      <DeployModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        onDeploy={handleDeployApp}
        nextPort={nextAvailablePort}
      />

      {/* Setup Guide Modal */}
      <UbuntuGuideModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
        magicDnsName={metrics.tailscale.magicDnsName}
      />

      {/* Floating Smart WhatsApp Call & Chat Button */}
      <WhatsAppSmartButton variant="floating" />

      {/* Footer with Developed by GM Ripon & WB WhatsApp Call / Chat Contact */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            <span className="font-semibold text-neutral-300">TailNode Host</span>
            <span>·</span>
            <span className="text-cyan-400 font-mono font-medium">Developed by {DEVELOPER_NAME}</span>
            <span>·</span>
            <span>AMD64 Ubuntu & Termux Mobile Host</span>
            <span>·</span>
            <span className="text-emerald-400 font-mono">Default 2GB (Extendable)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Direct WhatsApp Call or Chat Smart Button */}
            <WhatsAppSmartButton variant="footer" />

            <div className="flex items-center gap-3 text-neutral-400">
              <button
                onClick={() => setIsSetupGuideOpen(true)}
                className="hover:text-white transition-colors"
              >
                Termux & Ubuntu Setup Guides
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  setCurrentView(currentView === 'landing' ? 'panel' : 'landing');
                }}
                className="hover:text-white transition-colors"
              >
                {currentView === 'landing' ? 'Launch cPanel' : 'Landing Page'}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
