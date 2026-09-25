import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Globe, 
  Terminal, 
  Check, 
  Server, 
  Code, 
  Cpu, 
  ExternalLink,
  ShoppingCart,
  FileCode,
  Zap,
  Cloud
} from 'lucide-react';
import { HostedApp } from '../../types/hosting';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (appData: Partial<HostedApp>) => void;
  nextPort: number;
}

export const DeployModal: React.FC<DeployModalProps> = ({
  isOpen,
  onClose,
  onDeploy,
  nextPort,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'express' | 'react' | 'nodejs' | 'static' | 'flask' | 'python'>('express');
  const [port, setPort] = useState(nextPort.toString());
  const [gitRepo, setGitRepo] = useState('');
  const [runtimeVersion, setRuntimeVersion] = useState('Node.js v20.18.0');
  const [activeTunnel, setActiveTunnel] = useState<'cloudflare' | 'tailscale' | 'ngrok'>('cloudflare');
  const [enableFunnel, setEnableFunnel] = useState(true);
  const [envString, setEnvString] = useState('NODE_ENV=production\nPORT=' + nextPort);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const envMap: Record<string, string> = {};
    envString.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...rest] = trimmed.split('=');
        if (k) envMap[k.trim()] = rest.join('=').trim();
      }
    });

    onDeploy({
      name: name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      type,
      port: parseInt(port, 10) || nextPort,
      gitRepo: gitRepo.trim(),
      runtimeVersion,
      activeTunnel,
      funnelEnabled: enableFunnel,
      env: envMap
    });

    onClose();
  };

  const selectPreset = (preset: string) => {
    if (preset === 'wordpress') {
      setType('nodejs');
      setName('my-wordpress-blog');
      setRuntimeVersion('PHP 8.2 (SQLite Engine)');
      setEnvString(`WP_ENV=production\nPORT=${port}\nDB_ENGINE=sqlite`);
    } else if (preset === 'cart') {
      setType('express');
      setName('my-shopping-cart');
      setRuntimeVersion('Node.js v20.18.0');
      setEnvString(`NODE_ENV=production\nPORT=${port}\nSTORE_NAME="TailShop"\nCURRENCY=USD`);
    } else if (preset === 'php') {
      setType('nodejs');
      setName('my-php-site');
      setRuntimeVersion('PHP 8.2 CLI/FPM');
      setEnvString(`PHP_ENV=production\nPORT=${port}`);
    } else if (preset === 'flask') {
      setType('flask');
      setName('my-flask-app');
      setRuntimeVersion('Python 3.12 (Flask/Gunicorn)');
      setEnvString(`FLASK_ENV=production\nPORT=${port}\nPYTHONUNBUFFERED=1`);
    } else if (preset === 'react') {
      setType('react');
      setName('my-react-spa');
      setRuntimeVersion('Node.js v22.12.0 (Vite)');
      setEnvString(`NODE_ENV=production\nVITE_PORT=${port}`);
    } else if (preset === 'express') {
      setType('express');
      setName('my-express-api');
      setRuntimeVersion('Node.js v20.18.0');
      setEnvString(`NODE_ENV=production\nPORT=${port}\nCORS_ORIGIN=*`);
    } else {
      setType('static');
      setName('my-static-site');
      setRuntimeVersion('Static Proxy');
      setEnvString(`PORT=${port}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-5 shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Deploy Web App / Script on Host</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 1-Click Script & Stack Shortcuts */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-neutral-400">1-CLICK SCRIPT PRESETS</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => selectPreset('wordpress')}
              className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-cyan-500/50 hover:bg-neutral-900 text-left transition-all"
            >
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                <span>WordPress</span>
              </div>
              <div className="text-[10px] text-neutral-500">PHP + SQLite</div>
            </button>

            <button
              type="button"
              onClick={() => selectPreset('cart')}
              className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-cyan-500/50 hover:bg-neutral-900 text-left transition-all"
            >
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5 text-emerald-400" />
                <span>Shop / Cart</span>
              </div>
              <div className="text-[10px] text-neutral-500">Web Storefront</div>
            </button>

            <button
              type="button"
              onClick={() => selectPreset('flask')}
              className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-cyan-500/50 hover:bg-neutral-900 text-left transition-all"
            >
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Python Flask</span>
              </div>
              <div className="text-[10px] text-neutral-500">WSGI microservice</div>
            </button>

            <button
              type="button"
              onClick={() => selectPreset('php')}
              className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-cyan-500/50 hover:bg-neutral-900 text-left transition-all"
            >
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                <span>PHP Web</span>
              </div>
              <div className="text-[10px] text-neutral-500">Native PHP script</div>
            </button>

            <button
              type="button"
              onClick={() => selectPreset('express')}
              className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-cyan-500/50 hover:bg-neutral-900 text-left transition-all"
            >
              <div className="text-xs font-semibold text-white">Express API</div>
              <div className="text-[10px] text-neutral-500">Node.js backend</div>
            </button>

            <button
              type="button"
              onClick={() => selectPreset('react')}
              className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-cyan-500/50 hover:bg-neutral-900 text-left transition-all"
            >
              <div className="text-xs font-semibold text-white">React / Vite</div>
              <div className="text-[10px] text-neutral-500">Frontend SPA</div>
            </button>

            <button
              type="button"
              onClick={() => selectPreset('static')}
              className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-cyan-500/50 hover:bg-neutral-900 text-left transition-all"
            >
              <div className="text-xs font-semibold text-white">Static HTML</div>
              <div className="text-[10px] text-neutral-500">Lightweight HTML</div>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-neutral-300 font-medium">Service Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. shop-backend"
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-300 font-medium">Port</label>
              <input
                type="number"
                required
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-cyan-400 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-300 font-medium">
              Git Repository Clone URL (Optional)
            </label>
            <input
              type="text"
              value={gitRepo}
              onChange={(e) => setGitRepo(e.target.value)}
              placeholder="https://github.com/username/my-repo.git"
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-neutral-300 font-medium">Runtime Stack</label>
              <input
                type="text"
                value={runtimeVersion}
                onChange={(e) => setRuntimeVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-300 font-medium">Default HTTPS Tunnel</label>
              <select
                value={activeTunnel}
                onChange={(e) => setActiveTunnel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="cloudflare">Cloudflare Tunnel (Free SSL)</option>
                <option value="tailscale">Tailscale Funnel (MagicDNS)</option>
                <option value="ngrok">ngrok HTTPS</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-300 font-medium">
              Environment Variables (.env)
            </label>
            <textarea
              value={envString}
              onChange={(e) => setEnvString(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
            >
              Deploy Service to Sandbox
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
