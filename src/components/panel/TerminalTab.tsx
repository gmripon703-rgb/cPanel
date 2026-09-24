import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  Play,
  RotateCcw,
  Download
} from 'lucide-react';
import { HostedApp, SystemMetrics } from '../../types/hosting';

interface TerminalTabProps {
  metrics: SystemMetrics;
  apps: HostedApp[];
  activeAppFilter: string;
  setActiveAppFilter: (id: string) => void;
}

export const TerminalTab: React.FC<TerminalTabProps> = ({
  metrics,
  apps,
  activeAppFilter,
  setActiveAppFilter,
}) => {
  const [logFilterLevel, setLogFilterLevel] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [copied, setCopied] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<Array<{ cmd: string; output: string }>>([
    {
      cmd: 'tailscale status',
      output: `100.84.120.45   ubuntu-desktop       gmripon703@  linux   -
100.112.40.12   macbook-pro          gmripon703@  macOS   idle
100.99.14.88    pixel-phone          gmripon703@  android idle
# Funnel: Active on https://ubuntu-desktop.tailnet.ts.net:3000`
    },
    {
      cmd: 'df -h /home/ubuntu/tailhost',
      output: `Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p2  2.0G  510M  1.5G  25% /home/ubuntu/tailhost`
    }
  ]);

  const [rawLogs, setRawLogs] = useState<string[]>([
    '[2026-03-24T12:00:01Z] [info] [tailnode] Initializing host daemon on AMD64 Ubuntu Desktop',
    '[2026-03-24T12:00:02Z] [info] [storage] 2GB isolated quota mounted at /home/ubuntu/tailhost/apps',
    '[2026-03-24T12:00:03Z] [info] [tailscale] Verified node IP 100.84.120.45 with MagicDNS',
    '[2026-03-24T12:00:04Z] [info] [funnel] Enabled public ingress on port 3000, 4001, 5000',
    '[2026-03-24T12:05:12Z] [info] [ecommerce-api] GET /api/v1/products 200 OK (14ms)',
    '[2026-03-24T12:08:44Z] [info] [frontend-web] Serving static asset /index.html (304)',
    '[2026-03-24T12:12:01Z] [info] [telemetry] Desktop CPU nominal: 1.8% load, 510MB/2048MB used'
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    let output = '';
    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      output = `TailNode Terminal Commands:
  tailscale status         - View tailnet connections
  tailscale ip -4          - Print Tailscale IPv4 address
  tailscale funnel status  - Inspect public Funnel ports
  df -h                    - Inspect 2GB storage sandbox utilization
  free -m                  - View RAM usage on Ubuntu desktop
  node -v                  - View active Node.js version
  pm2 list                 - Show running web services
  clear                    - Clear terminal output`;
    } else if (lower === 'clear') {
      setCommandHistory([]);
      setCommandInput('');
      return;
    } else if (lower.includes('tailscale status')) {
      output = `100.84.120.45   ubuntu-desktop       gmripon703@  linux   -
Funnel status: Active
Public URL: https://${metrics.tailscale.magicDnsName}:3000`;
    } else if (lower.includes('tailscale ip')) {
      output = metrics.tailscale.nodeIp;
    } else if (lower.includes('tailscale funnel')) {
      output = `Funnel is enabled on node ${metrics.tailscale.magicDnsName}
Routing:
  https://${metrics.tailscale.magicDnsName}:3000 -> 127.0.0.1:3000
  https://${metrics.tailscale.magicDnsName}:4001 -> 127.0.0.1:4001
  https://${metrics.tailscale.magicDnsName}:5000 -> 127.0.0.1:5000`;
    } else if (lower.includes('df -h')) {
      output = `Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p2  2.0G  ${metrics.storage2GBQuota.usedMb}M  ${metrics.storage2GBQuota.freeMb}M  ${metrics.storage2GBQuota.percentUsed}% /home/ubuntu/tailhost`;
    } else if (lower.includes('free -m')) {
      output = `               total        used        free      shared  buff/cache   available
Mem:           32140        8420       23720         240        4100       23200
Swap:           4096           0        4096`;
    } else if (lower.includes('node -v')) {
      output = metrics.nodeVersion;
    } else if (lower.includes('pm2 list') || lower.includes('ps')) {
      output = `┌────┬───────────────────────┬────────┬───────────┬────────┬──────────┬──────────┐
│ id │ name                  │ mode   │ 2GB disk  │ status │ cpu      │ memory   │
├────┼───────────────────────┼────────┼───────────┼────────┼──────────┼──────────┤
│ 0  │ ecommerce-api         │ fork   │ 248.0 MB  │ online │ 1.8%     │ 142.5 MB │
│ 1  │ frontend-web          │ fork   │ 185.4 MB  │ online │ 0.6%     │ 88.2 MB  │
│ 2  │ system-daemon         │ fork   │ 76.5 MB   │ online │ 0.4%     │ 62.1 MB  │
└────┴───────────────────────┴────────┴───────────┴────────┴──────────┴──────────┘`;
    } else {
      output = `bash: ${cmd}: command executed in simulated Ubuntu sandbox. Type "help" for available commands.`;
    }

    setCommandHistory(prev => [...prev, { cmd, output }]);
    setCommandInput('');
  };

  const filteredLogs = rawLogs.filter(line => {
    if (activeAppFilter !== 'all') {
      const app = apps.find(a => a.id === activeAppFilter);
      if (app && !line.includes(app.name) && !line.includes('tailnode')) {
        return false;
      }
    }
    if (logFilterLevel === 'error') return line.includes('[error]');
    if (logFilterLevel === 'warn') return line.includes('[warn]') || line.includes('[error]');
    return true;
  });

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(rawLogs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Terminal & Live Streaming Logs</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time stdout/stderr stream from Ubuntu Desktop processes and interactive shell.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* App filter dropdown */}
          <select
            value={activeAppFilter}
            onChange={(e) => setActiveAppFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-mono focus:outline-none"
          >
            <option value="all">All Web Services</option>
            {apps.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <button
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Copy Logs"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setRawLogs([])}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Interactive Shell Window */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Titlebar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-neutral-400 text-xs ml-2">ubuntu@desktop-amd64: /home/ubuntu/tailhost</span>
          </div>
          <span className="text-neutral-500 text-[11px]">Type "help" for commands</span>
        </div>

        {/* Command History & Terminal Output */}
        <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
          {commandHistory.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400">
                <span className="text-neutral-500">ubuntu@desktop:~$</span>
                <span>{item.cmd}</span>
              </div>
              <pre className="text-neutral-300 pl-4 whitespace-pre-wrap leading-relaxed text-[11px]">
                {item.output}
              </pre>
            </div>
          ))}

          {/* Prompt Form */}
          <form onSubmit={handleRunCommand} className="flex items-center gap-2 pt-1 text-cyan-300">
            <span className="text-neutral-500">ubuntu@desktop:~$</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="e.g. tailscale status, df -h, free -m, pm2 list, help"
              className="flex-1 bg-transparent text-white focus:outline-none placeholder:text-neutral-600"
            />
          </form>
        </div>
      </div>

      {/* Streaming Service Logs */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-neutral-850 pb-2 text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Live stdout / stderr stream</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <button
              onClick={() => setLogFilterLevel('all')}
              className={`px-2 py-0.5 rounded ${logFilterLevel === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}
            >
              All
            </button>
            <button
              onClick={() => setLogFilterLevel('warn')}
              className={`px-2 py-0.5 rounded ${logFilterLevel === 'warn' ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-500'}`}
            >
              Warn
            </button>
            <button
              onClick={() => setLogFilterLevel('error')}
              className={`px-2 py-0.5 rounded ${logFilterLevel === 'error' ? 'bg-red-500/20 text-red-300' : 'text-neutral-500'}`}
            >
              Error
            </button>
          </div>
        </div>

        <div className="space-y-1 max-h-60 overflow-y-auto text-neutral-300 text-[11px] leading-relaxed">
          {filteredLogs.length === 0 ? (
            <div className="text-neutral-500 py-4 text-center">No logs matching filter.</div>
          ) : (
            filteredLogs.map((log, index) => (
              <div 
                key={index} 
                className={`py-0.5 ${
                  log.includes('[error]') 
                    ? 'text-red-400' 
                    : log.includes('[warn]') 
                    ? 'text-amber-400' 
                    : 'text-neutral-300'
                }`}
              >
                {log}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
