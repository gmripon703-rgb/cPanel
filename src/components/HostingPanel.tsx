import React from 'react';
import { 
  Server, 
  Layers, 
  HardDrive, 
  Package, 
  Globe, 
  Terminal, 
  HelpCircle,
  Plus
} from 'lucide-react';
import { HostedApp, StorageFile, SystemMetrics } from '../types/hosting';
import { OverviewTab } from './panel/OverviewTab';
import { AppsTab } from './panel/AppsTab';
import { StorageTab } from './panel/StorageTab';
import { NpmTab } from './panel/NpmTab';
import { TailscaleTab } from './panel/TailscaleTab';
import { TerminalTab } from './panel/TerminalTab';

interface HostingPanelProps {
  metrics: SystemMetrics;
  apps: HostedApp[];
  files: StorageFile[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onDeployClick: () => void;
  onCleanCache: () => void;
  onAppAction: (appId: string, action: 'start' | 'stop' | 'restart' | 'rebuild') => void;
  onDeleteApp: (appId: string) => void;
  onToggleFunnel: (appId: string) => void;
  onOpenSetupGuide: () => void;
  cleaning: boolean;
  activeAppFilter: string;
  setActiveAppFilter: (appId: string) => void;
}

export const HostingPanel: React.FC<HostingPanelProps> = ({
  metrics,
  apps,
  files,
  activeTab,
  setActiveTab,
  onDeployClick,
  onCleanCache,
  onAppAction,
  onDeleteApp,
  onToggleFunnel,
  onOpenSetupGuide,
  cleaning,
  activeAppFilter,
  setActiveAppFilter,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Server, badge: null },
    { id: 'apps', label: 'Web Apps', icon: Layers, badge: apps.length },
    { id: 'storage', label: '2GB Storage', icon: HardDrive, badge: `${metrics.storage2GBQuota.percentUsed}%` },
    { id: 'npm', label: 'NPM & Runtimes', icon: Package, badge: null },
    { id: 'tailscale', label: 'Tailscale Funnel', icon: Globe, badge: 'TLS' },
    { id: 'terminal', label: 'Terminal & Logs', icon: Terminal, badge: null },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Secondary Segmented Bar for Mobile / Tablet */}
      <div className="flex md:hidden overflow-x-auto gap-2 pb-4 mb-4 border-b border-neutral-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-neutral-800 text-cyan-400 font-semibold border border-neutral-700'
                  : 'text-neutral-400 hover:text-white bg-neutral-900/50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Desktop Sidebar Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar (md:col-span-3) */}
        <aside className="hidden md:block md:col-span-3 space-y-4 sticky top-24">
          {/* Host Quick Status Pill */}
          <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px]">HOST WORKSTATION</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="font-semibold text-white truncate">{metrics.hostname}</div>
            <div className="text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Tailscale IP:</span>
              <span className="text-cyan-300">{metrics.tailscale.nodeIp}</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30'
                      : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-neutral-850 text-neutral-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Clone Guide Callout */}
          <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 text-xs space-y-2.5">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
              <span>Ubuntu Setup Guide</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Step-by-step instructions for git cloning and running TailNode on AMD64 Ubuntu Desktop.
            </p>
            <button
              onClick={onOpenSetupGuide}
              className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] transition-colors"
            >
              Open Walkthrough & Scripts →
            </button>
          </div>
        </aside>

        {/* Main Content Viewport (md:col-span-9) */}
        <main className="md:col-span-9">
          {activeTab === 'overview' && (
            <OverviewTab
              metrics={metrics}
              apps={apps}
              onDeployClick={onDeployClick}
              onCleanCache={onCleanCache}
              onAppAction={onAppAction}
              onNavigateTab={(tab) => setActiveTab(tab)}
              cleaning={cleaning}
            />
          )}

          {activeTab === 'apps' && (
            <AppsTab
              apps={apps}
              onAppAction={onAppAction}
              onDeleteApp={onDeleteApp}
              onToggleFunnel={onToggleFunnel}
              onDeployClick={onDeployClick}
              onViewLogs={(id) => {
                setActiveAppFilter(id);
                setActiveTab('terminal');
              }}
            />
          )}

          {activeTab === 'storage' && (
            <StorageTab
              metrics={metrics}
              files={files}
              onCleanCache={onCleanCache}
              cleaning={cleaning}
            />
          )}

          {activeTab === 'npm' && (
            <NpmTab
              metrics={metrics}
              apps={apps}
              onCleanCache={onCleanCache}
              cleaning={cleaning}
            />
          )}

          {activeTab === 'tailscale' && (
            <TailscaleTab
              metrics={metrics}
              apps={apps}
              onToggleFunnel={onToggleFunnel}
            />
          )}

          {activeTab === 'terminal' && (
            <TerminalTab
              metrics={metrics}
              apps={apps}
              activeAppFilter={activeAppFilter}
              setActiveAppFilter={setActiveAppFilter}
            />
          )}
        </main>
      </div>
    </div>
  );
};
