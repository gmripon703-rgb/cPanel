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
import { 
  fetchSystemMetrics, 
  fetchHostedApps, 
  fetchStorageFiles, 
  createApp, 
  executeAppAction, 
  deleteAppApi, 
  toggleAppFunnelApi, 
  cleanStorageCache 
} from './services/api';
import { HostedApp, StorageFile, SystemMetrics } from './types/hosting';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'panel'>('landing');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    platform: 'linux',
    arch: 'x64',
    hostname: 'ubuntu-amd64-desktop',
    uptime: 184500,
    nodeVersion: 'v20.18.0',
    cpuModel: 'AMD Ryzen 7 7800X3D (8-Core)',
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
    
    // Recalculate 2GB storage
    const newUsed = metrics.storage2GBQuota.usedMb + created.diskMb;
    setMetrics(prev => ({
      ...prev,
      storage2GBQuota: {
        ...prev.storage2GBQuota,
        usedMb: parseFloat(newUsed.toFixed(1)),
        freeMb: parseFloat(Math.max(0, 2048 - newUsed).toFixed(1)),
        percentUsed: parseFloat(((newUsed / 2048) * 100).toFixed(1))
      }
    }));

    // Switch to apps tab
    setActiveTab('apps');
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
      const newUsed = Math.max(0, metrics.storage2GBQuota.usedMb - toDelete.diskMb);
      setMetrics(prev => ({
        ...prev,
        storage2GBQuota: {
          ...prev.storage2GBQuota,
          usedMb: parseFloat(newUsed.toFixed(1)),
          freeMb: parseFloat((2048 - newUsed).toFixed(1)),
          percentUsed: parseFloat(((newUsed / 2048) * 100).toFixed(1))
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
        const newUsed = Math.max(0, prev.storage2GBQuota.usedMb - freed);
        return {
          ...prev,
          storage2GBQuota: {
            ...prev.storage2GBQuota,
            usedMb: parseFloat(newUsed.toFixed(1)),
            freeMb: parseFloat((2048 - newUsed).toFixed(1)),
            percentUsed: parseFloat(((newUsed / 2048) * 100).toFixed(1)),
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
      {/* Top Bar Contract Navigation */}
      <TopNavigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDeploy={() => setIsDeployOpen(true)}
        onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
      />

      {/* Main Content: Landing Page or Live Hosting Panel */}
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
            onAppAction={handleAppAction}
            onDeleteApp={handleDeleteApp}
            onToggleFunnel={handleToggleFunnel}
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

      {/* Ubuntu Desktop Setup & GitHub Clone Guide Modal */}
      <UbuntuGuideModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
        magicDnsName={metrics.tailscale.magicDnsName}
      />

      {/* Clean, quiet footer adhering to anti-slop rules */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400">TailNode</span>
            <span>·</span>
            <span>AMD64 Ubuntu Desktop Self-Hosted Web cPanel</span>
            <span>·</span>
            <span className="text-cyan-400 font-mono">2GB Quota Isolated</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <button
              onClick={() => setIsSetupGuideOpen(true)}
              className="hover:text-white transition-colors"
            >
              GitHub Clone Instructions
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setCurrentView(currentView === 'landing' ? 'panel' : 'landing');
              }}
              className="hover:text-white transition-colors"
            >
              {currentView === 'landing' ? 'Go to cPanel' : 'Go to Product Overview'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
