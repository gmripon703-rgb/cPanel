import React from 'react';
import { Server, Globe, Terminal, HardDrive, Layers, Download, Play } from 'lucide-react';

interface TopNavigationProps {
  currentView: 'landing' | 'panel';
  setCurrentView: (view: 'landing' | 'panel') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDeploy: () => void;
  onOpenSetupGuide: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentView,
  setCurrentView,
  activeTab,
  setActiveTab,
  onOpenDeploy,
  onOpenSetupGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setCurrentView('landing')}
          className="group flex items-center gap-2 text-left focus:outline-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-500/60 transition-colors">
            <Server className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-white hover:text-cyan-400 transition-colors">
            TailNode
          </span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          {currentView === 'landing' ? (
            <>
              <a href="#architecture" className="hover:text-neutral-100 transition-colors whitespace-nowrap">
                Architecture
              </a>
              <a href="#storage-quota" className="hover:text-neutral-100 transition-colors whitespace-nowrap">
                2GB Quota
              </a>
              <a href="#tailscale-funnel" className="hover:text-neutral-100 transition-colors whitespace-nowrap">
                Tailscale Funnel
              </a>
              <a href="#features" className="hover:text-neutral-100 transition-colors whitespace-nowrap">
                Features
              </a>
              <button
                onClick={onOpenSetupGuide}
                className="hover:text-neutral-100 transition-colors whitespace-nowrap text-left"
              >
                Ubuntu Guide
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('overview')}
                className={`transition-colors whitespace-nowrap ${
                  activeTab === 'overview' ? 'text-cyan-400' : 'hover:text-neutral-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('apps')}
                className={`transition-colors whitespace-nowrap ${
                  activeTab === 'apps' ? 'text-cyan-400' : 'hover:text-neutral-100'
                }`}
              >
                Web Apps
              </button>
              <button
                onClick={() => setActiveTab('storage')}
                className={`transition-colors whitespace-nowrap ${
                  activeTab === 'storage' ? 'text-cyan-400' : 'hover:text-neutral-100'
                }`}
              >
                2GB Storage
              </button>
              <button
                onClick={() => setActiveTab('tailscale')}
                className={`transition-colors whitespace-nowrap ${
                  activeTab === 'tailscale' ? 'text-cyan-400' : 'hover:text-neutral-100'
                }`}
              >
                Tailscale Funnel
              </button>
              <button
                onClick={() => setActiveTab('terminal')}
                className={`transition-colors whitespace-nowrap ${
                  activeTab === 'terminal' ? 'text-cyan-400' : 'hover:text-neutral-100'
                }`}
              >
                Terminal & Logs
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {currentView === 'landing' ? (
            <>
              <button
                onClick={onOpenSetupGuide}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5 text-neutral-400" />
                <span>Clone & Install</span>
              </button>
              <button
                onClick={() => setCurrentView('panel')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-sm shadow-cyan-500/20 whitespace-nowrap"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Launch cPanel</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentView('landing')}
                className="px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors whitespace-nowrap"
              >
                Docs & Overview
              </button>
              <button
                onClick={onOpenDeploy}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors whitespace-nowrap shadow-sm shadow-cyan-500/20"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>+ Deploy App</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
