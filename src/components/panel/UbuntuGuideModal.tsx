import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Globe, 
  HardDrive, 
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface UbuntuGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  magicDnsName: string;
}

export const UbuntuGuideModal: React.FC<UbuntuGuideModalProps> = ({
  isOpen,
  onClose,
  magicDnsName,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fullBashScript = `#!/usr/bin/env bash
# ==============================================================================
# TailNode: Ubuntu Desktop AMD64 Setup & 2GB Web Host Installer
# ==============================================================================
set -e

echo "==> [1/5] Updating Ubuntu packages & installing dependencies..."
sudo apt-get update -y
sudo apt-get install -y curl git build-essential

# Ensure Node.js 20 LTS is installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Ensure Tailscale is installed
if ! command -v tailscale &> /dev/null; then
    echo "Installing Tailscale..."
    curl -fsSL https://tailscale.com/install.sh | sh
fi

echo "==> [2/5] Creating 2GB isolated storage partition directory..."
mkdir -p /home/$USER/tailhost/apps
mkdir -p /home/$USER/tailhost/logs
mkdir -p /home/$USER/tailhost/cache

echo "==> [3/5] Installing application dependencies & building..."
npm install
npm run build

echo "==> [4/5] Enabling Tailscale Funnel on port 3000..."
sudo tailscale up --operator=$USER
tailscale funnel --bg 3000

echo "==> [5/5] TailNode is ready to launch!"
echo "Run: npm start"
`;

  const systemdService = `[Unit]
Description=TailNode Web Hosting cPanel Daemon
After=network.target tailscaled.service

[Service]
Type=simple
User=${typeof window !== 'undefined' ? 'ubuntu' : 'user'}
WorkingDirectory=/home/ubuntu/tailnode-host
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target`;

  const downloadScript = () => {
    const blob = new Blob([fullBashScript], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'install-tailnode.sh';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-6 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ubuntu Desktop Setup & GitHub Clone Guide</h3>
              <p className="text-xs text-neutral-400">
                Deploy this web panel to your AMD64 Ubuntu Desktop with 2GB storage quota.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step-by-Step Flow */}
        <div className="space-y-4 font-mono text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-semibold font-sans text-xs">
                Step 1: Clone Repository from GitHub on Ubuntu Terminal
              </span>
              <button
                onClick={() => handleCopy(
                  `git clone https://github.com/your-username/tailnode-host.git\ncd tailnode-host`,
                  's1'
                )}
                className="text-neutral-400 hover:text-white flex items-center gap-1"
              >
                {copiedKey === 's1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 's1' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded bg-neutral-900 text-neutral-300 select-all">
              git clone https://github.com/your-username/tailnode-host.git<br />
              cd tailnode-host
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-semibold font-sans text-xs">
                Step 2: Install Node.js Dependencies & Build
              </span>
              <button
                onClick={() => handleCopy(`npm install && npm run build`, 's2')}
                className="text-neutral-400 hover:text-white flex items-center gap-1"
              >
                {copiedKey === 's2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 's2' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded bg-neutral-900 text-neutral-300 select-all">
              npm install && npm run build
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-semibold font-sans text-xs">
                Step 3: Enable Tailscale Funnel on Ubuntu Desktop (Public URL)
              </span>
              <button
                onClick={() => handleCopy(
                  `sudo tailscale up --operator=$USER\ntailscale serve --bg 3000\ntailscale funnel 3000 on`,
                  's3'
                )}
                className="text-neutral-400 hover:text-white flex items-center gap-1"
              >
                {copiedKey === 's3' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 's3' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded bg-neutral-900 text-neutral-300 select-all leading-relaxed">
              # Authorize current user and enable public HTTPS funnel<br />
              sudo tailscale up --operator=$USER<br />
              tailscale funnel --bg 3000
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-semibold font-sans text-xs">
                Step 4: Launch TailNode Server (Port 3000)
              </span>
              <button
                onClick={() => handleCopy(`npm start`, 's4')}
                className="text-neutral-400 hover:text-white flex items-center gap-1"
              >
                {copiedKey === 's4' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 's4' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded bg-neutral-900 text-emerald-400 select-all font-bold">
              npm start
            </div>
          </div>
        </div>

        {/* Systemd Background Daemon (Optional) */}
        <div className="p-4 rounded-lg bg-neutral-950/60 border border-neutral-850 space-y-2 text-xs">
          <div className="flex items-center justify-between font-sans">
            <span className="font-semibold text-white">
              Optional: Run 24/7 as an Ubuntu Systemd Service
            </span>
            <button
              onClick={() => handleCopy(systemdService, 'sysd')}
              className="text-neutral-400 hover:text-white font-mono text-[11px] flex items-center gap-1"
            >
              {copiedKey === 'sysd' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>Copy service config</span>
            </button>
          </div>
          <p className="text-neutral-400 text-[11px]">
            Save to <code className="text-cyan-300 font-mono">/etc/systemd/system/tailnode.service</code> and run <code className="text-neutral-200 font-mono">sudo systemctl enable --now tailnode</code> to auto-start on desktop boot.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
          <button
            onClick={downloadScript}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold transition-colors"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            <span>Download install-tailnode.sh</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-semibold transition-colors"
          >
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
