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
  ExternalLink 
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
  const [type, setType] = useState<'express' | 'react' | 'nodejs' | 'static'>('express');
  const [port, setPort] = useState(nextPort.toString());
  const [gitRepo, setGitRepo] = useState('');
  const [nodeVersion, setNodeVersion] = useState('v20.18.0');
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
      nodeVersion,
      funnelEnabled: enableFunnel,
      env: envMap
    });

    onClose();
  };

  const selectPreset = (presetType: 'express' | 'react' | 'nodejs' | 'static') => {
    setType(presetType);
    if (presetType === 'express') {
      setName('my-express-api');
      setEnvString(`NODE_ENV=production\nPORT=${port}\nCORS_ORIGIN=*`);
    } else if (presetType === 'react') {
      setName('my-react-app');
      setEnvString(`NODE_ENV=production\nVITE_PORT=${port}`);
    } else if (presetType === 'nodejs') {
      setName('my-node-daemon');
      setEnvString(`NODE_ENV=production\nINTERVAL=5000`);
    } else {
      setName('my-static-site');
      setEnvString(`PORT=${port}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Deploy Web App on Ubuntu Desktop</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preset Cards */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-neutral-400">SELECT APPLICATION STACK</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => selectPreset('express')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                type === 'express'
                  ? 'border-cyan-500/60 bg-cyan-500/10 text-white'
                  : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div className="text-xs font-semibold">Express API</div>
              <div className="text-[10px] text-neutral-500">Node backend</div>
            </button>

            <button
              type="button"
              onClick={() => selectPreset('react')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                type === 'react'
                  ? 'border-cyan-500/60 bg-cyan-500/10 text-white'
                  : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div className="text-xs font-semibold">React / Vite</div>
              <div className="text-[10px] text-neutral-500">Frontend SPA</div>
            </button>

            <button
              type="button"
              onClick={() => selectPreset('nodejs')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                type === 'nodejs'
                  ? 'border-cyan-500/60 bg-cyan-500/10 text-white'
                  : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div className="text-xs font-semibold">Node Worker</div>
              <div className="text-[10px] text-neutral-500">Bot / Cron</div>
            </button>

            <button
              type="button"
              onClick={() => selectPreset('static')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                type === 'static'
                  ? 'border-cyan-500/60 bg-cyan-500/10 text-white'
                  : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div className="text-xs font-semibold">Static HTML</div>
              <div className="text-[10px] text-neutral-500">Static site</div>
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
              <label className="text-xs text-neutral-300 font-medium">Node.js Version</label>
              <select
                value={nodeVersion}
                onChange={(e) => setNodeVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="v20.18.0">v20.18.0 (LTS Iron)</option>
                <option value="v22.12.0">v22.12.0 (Current)</option>
                <option value="v18.20.0">v18.20.0 (Hydrogen)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-300 font-medium">Tailscale Funnel</label>
              <div className="flex items-center h-9 px-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
                <input
                  type="checkbox"
                  id="funnel"
                  checked={enableFunnel}
                  onChange={(e) => setEnableFunnel(e.target.checked)}
                  className="rounded border-neutral-700 text-cyan-400 focus:ring-cyan-500 mr-2"
                />
                <label htmlFor="funnel" className="cursor-pointer">Public HTTPS Funnel</label>
              </div>
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
              Deploy to 2GB Sandbox
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
