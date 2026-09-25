import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Globe, 
  HardDrive, 
  ShieldCheck, 
  ChevronRight,
  Boxes,
  Cpu,
  Layers,
  Smartphone,
  Cloud,
  Zap
} from 'lucide-react';
import { DEVELOPER_NAME } from '../../services/api';

interface UbuntuGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  magicDnsName: string;
}

type GuideTarget = 'termux_pkg' | 'termux_proot' | 'mainline' | 'chroot' | 'rootfs' | 'tunnels';

export const UbuntuGuideModal: React.FC<UbuntuGuideModalProps> = ({
  isOpen,
  onClose,
  magicDnsName,
}) => {
  const [activeTarget, setActiveTarget] = useState<GuideTarget>('termux_pkg');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const scripts: Record<GuideTarget, { filename: string; content: string }> = {
    termux_pkg: {
      filename: 'install-termux-pkg.sh',
      content: `#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# TailNode: Termux Native (Rooted & Non-Rooted) Installation
# Developed by GM Ripon Developer
# ==============================================================================
set -e

echo "==> [1/4] Updating Termux packages..."
pkg update -y && pkg upgrade -y

echo "==> [2/4] Installing Node.js LTS, Git, Python, and PHP..."
pkg install -y nodejs-lts git python php curl build-essential openssh

echo "==> [3/4] Setting up 2GB sandbox directory at $HOME/tailhost..."
mkdir -p $HOME/tailhost/apps $HOME/tailhost/logs $HOME/tailhost/cache

echo "==> [4/4] Cloning and building TailNode..."
git clone https://github.com/gmripon/tailnode-host.git || true
cd tailnode-host
npm install
npm run build

echo "==> Installing Cloudflare tunnel for Termux public HTTPS..."
pkg install -y cloudflared 2>/dev/null || true

echo "=============================================================================="
echo "✅ Termux Native install complete! Run: npm start"
echo "To expose to internet via Cloudflare tunnel:"
echo "cloudflared tunnel --url http://localhost:3000"
echo "=============================================================================="
`
    },
    termux_proot: {
      filename: 'install-termux-proot-ubuntu24.sh',
      content: `#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# TailNode: Termux PRoot-Distro Ubuntu 24.04 (Noble) Full Web Host
# Developed by GM Ripon Developer
# ==============================================================================
set -e

echo "==> [1/4] Installing PRoot-Distro in Termux..."
pkg update -y
pkg install -y proot-distro git curl

echo "==> [2/4] Installing Ubuntu 24.04 (Noble) in PRoot..."
proot-distro install ubuntu || true

echo "==> [3/4] Bootstrapping Node.js, Python Flask & PHP inside Ubuntu 24.04..."
proot-distro login ubuntu -- bash -c "
  apt-get update -y && apt-get upgrade -y
  apt-get install -y curl git build-essential nodejs npm python3 python3-pip python3-flask php php-cli
  mkdir -p /root/tailhost/apps /root/tailhost/logs /root/tailhost/cache
  git clone https://github.com/gmripon/tailnode-host.git /root/tailnode-host || true
  cd /root/tailnode-host
  npm install
  npm run build
"

echo "==> [4/4] TailNode is installed inside Ubuntu 24.04!"
echo "Login command: proot-distro login ubuntu"
echo "Start command: cd /root/tailnode-host && npm start"
`
    },
    mainline: {
      filename: 'install-mainline-ubuntu.sh',
      content: `#!/usr/bin/env bash
# ==============================================================================
# TailNode: Mainline Native AMD64 Ubuntu Desktop / Server Setup
# Developed by GM Ripon Developer
# ==============================================================================
set -e

echo "==> [1/5] Updating APT & Installing system tools..."
sudo apt-get update -y
sudo apt-get install -y curl git build-essential python3 python3-pip php php-cli

echo "==> [2/5] Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> [3/5] Installing Tailscale & Cloudflared..."
if ! command -v tailscale &> /dev/null; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi
if ! command -v cloudflared &> /dev/null; then
  curl -fsSL https://pkg.cloudflare.com/cloudflared-ascii.repo | sudo tee /etc/apt/sources.list.d/cloudflared.list 2>/dev/null || true
  sudo apt-get install -y cloudflared 2>/dev/null || true
fi

echo "==> [4/5] Preparing 2GB sandbox directory structure..."
mkdir -p /home/$USER/tailhost/apps
mkdir -p /home/$USER/tailhost/logs
mkdir -p /home/$USER/tailhost/cache

echo "==> [5/5] Building TailNode cPanel..."
npm install
npm run build

echo "✅ TailNode Mainline is ready! Run: npm start"
`
    },
    chroot: {
      filename: 'install-chroot-jail.sh',
      content: `#!/usr/bin/env bash
# ==============================================================================
# TailNode: Chroot Jail Sandbox Installation
# Developed by GM Ripon Developer
# ==============================================================================
set -e
CHROOT_DIR="/var/chroot/tailhost"

echo "==> [1/4] Bootstrapping minimal Ubuntu rootfs using debootstrap..."
sudo apt-get update && sudo apt-get install -y debootstrap
sudo mkdir -p $CHROOT_DIR
sudo debootstrap --arch=amd64 noble $CHROOT_DIR http://archive.ubuntu.com/ubuntu/

echo "==> [2/4] Binding dev, proc, sys filesystems..."
sudo mount --bind /dev $CHROOT_DIR/dev
sudo mount --bind /proc $CHROOT_DIR/proc
sudo mount --bind /sys $CHROOT_DIR/sys
sudo cp /etc/resolv.conf $CHROOT_DIR/etc/resolv.conf

echo "==> [3/4] Copying TailNode into jail..."
sudo mkdir -p $CHROOT_DIR/opt/tailnode
sudo cp -r . $CHROOT_DIR/opt/tailnode/

echo "==> [4/4] Setting up inside chroot..."
sudo chroot $CHROOT_DIR /bin/bash -c "
  apt-get update && apt-get install -y curl git nodejs npm python3 php
  cd /opt/tailnode
  npm install
  npm run build
"
echo "✅ Chroot jail ready! Enter jail with: sudo chroot $CHROOT_DIR /bin/bash"
`
    },
    rootfs: {
      filename: 'setup-2gb-rootfs-image.sh',
      content: `#!/usr/bin/env bash
# ==============================================================================
# TailNode: 2GB Raw Ext4 Disk Image Isolation & Extension
# Developed by GM Ripon Developer
# ==============================================================================
set -e
IMAGE_PATH="$HOME/tailhost_2gb.img"
MOUNT_POINT="$HOME/tailhost"

echo "==> [1/3] Creating 2048 MB raw block storage image..."
dd if=/dev/zero of=$IMAGE_PATH bs=1M count=2048 status=progress
mkfs.ext4 -F -L TAILHOST $IMAGE_PATH

echo "==> [2/3] Mounting 2GB image to $MOUNT_POINT..."
mkdir -p $MOUNT_POINT
sudo mount -o loop $IMAGE_PATH $MOUNT_POINT
sudo chown -R $USER:$USER $MOUNT_POINT
mkdir -p $MOUNT_POINT/apps $MOUNT_POINT/logs $MOUNT_POINT/cache

echo "==> [3/3] How to extend storage from 2GB to 4GB or more later:"
echo "truncate -s +2048M $IMAGE_PATH"
echo "sudo resize2fs $IMAGE_PATH"
echo "✅ 2GB hardware quota partition mounted and active at $MOUNT_POINT!"
`
    },
    tunnels: {
      filename: 'setup-all-tunnels.sh',
      content: `#!/usr/bin/env bash
# ==============================================================================
# TailNode: Multi-Tunnel Public HTTPS Setup (Cloudflare, Tailscale, ngrok)
# Developed by GM Ripon Developer
# ==============================================================================
set -e

echo "==> [Option 1] Cloudflare Quick Tunnel (Free & Open Source, No Port Forwarding)"
echo "cloudflared tunnel --url http://localhost:3000"

echo "==> [Option 2] Tailscale Public HTTPS Funnel"
echo "sudo tailscale up --operator=$USER"
echo "tailscale funnel --bg 3000"

echo "==> [Option 3] ngrok Instant HTTPS Ingress"
echo "ngrok config add-authtoken YOUR_TOKEN"
echo "ngrok http 3000"

echo "==> [Option 4] Caddy Automatic Let's Encrypt HTTPS"
echo "caddy reverse-proxy --from yourdomain.com --to localhost:3000"
`
    }
  };

  const handleDownload = () => {
    const active = scripts[activeTarget];
    const blob = new Blob([active.content], { type: 'text/x-sh' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = active.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6 space-y-5 shadow-2xl my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Installation Guides & Ingress Setup
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-cyan-400">
                  Dev: GM Ripon
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Termux Native, PRoot-Distro Ubuntu 24.04, Mainline AMD64, 2GB Rootfs, and Tunnels.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Target Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-800 text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTarget('termux_pkg')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTarget === 'termux_pkg'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Termux (pkg Rooted & Non-Rooted)</span>
          </button>

          <button
            onClick={() => setActiveTarget('termux_proot')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTarget === 'termux_proot'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>Termux PRoot (Ubuntu 24.04)</span>
          </button>

          <button
            onClick={() => setActiveTarget('mainline')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTarget === 'mainline'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Mainline (AMD64)</span>
          </button>

          <button
            onClick={() => setActiveTarget('rootfs')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTarget === 'rootfs'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <HardDrive className="h-3.5 w-3.5" />
            <span>2GB Rootfs & Extension</span>
          </button>

          <button
            onClick={() => setActiveTarget('tunnels')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTarget === 'tunnels'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Cloud className="h-3.5 w-3.5" />
            <span>Cloudflare / ngrok / Tailscale</span>
          </button>
        </div>

        {/* Dynamic Content Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 font-mono text-xs">
          {/* Termux pkg Tab */}
          {activeTarget === 'termux_pkg' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-neutral-300 font-sans text-xs leading-relaxed">
                <span className="font-semibold text-white">Termux Mobile Native (Both Rooted & Non-Rooted): </span>
                Runs directly in Termux userland without full virtualization. Perfect for turning Android phones into battery-efficient web servers with Node.js, Python Flask, and PHP.
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>1. Install Node.js, Python, PHP & Git via pkg</span>
                  <button
                    onClick={() => handleCopy(`pkg update -y && pkg install -y nodejs-lts git python php curl build-essential openssh`, 'tp1')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'tp1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'tp1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  pkg update -y && pkg install -y nodejs-lts git python php curl build-essential
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>2. Clone TailNode from GitHub & Build</span>
                  <button
                    onClick={() => handleCopy(`git clone https://github.com/gmripon/tailnode-host.git\ncd tailnode-host\nnpm install && npm run build`, 'tp2')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'tp2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'tp2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  git clone https://github.com/gmripon/tailnode-host.git{'\n'}cd tailnode-host && npm install && npm run build
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>3. Rooted Users Optional: Access Port 80 & Raw Block Devices</span>
                  <button
                    onClick={() => handleCopy(`tsu -c "npm start -- --port=80"`, 'tp3')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'tp3' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'tp3' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-amber-300 overflow-x-auto select-all">
                  # Non-rooted uses port 3000 (default){'\n'}# Rooted devices (Magisk/tsu) can bind to standard port 80:{'\n'}tsu -c "npm start"
                </pre>
              </div>
            </div>
          )}

          {/* Termux PRoot Ubuntu 24.04 Tab */}
          {activeTarget === 'termux_proot' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-neutral-300 font-sans text-xs leading-relaxed">
                <span className="font-semibold text-white">Termux PRoot-Distro Ubuntu 24.04 LTS (Noble): </span>
                Installs a complete, true Ubuntu 24.04 environment on your phone. Provides full apt package management, system tools, and compatibility with all mainline packages without needing root!
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>1. Install proot-distro & Ubuntu 24.04</span>
                  <button
                    onClick={() => handleCopy(`pkg update -y\npkg install -y proot-distro git curl\nproot-distro install ubuntu`, 'tpr1')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'tpr1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'tpr1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  pkg install -y proot-distro{'\n'}proot-distro install ubuntu
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>2. Login to Ubuntu 24.04 & Install Web Host</span>
                  <button
                    onClick={() => handleCopy(`proot-distro login ubuntu\n# Inside Ubuntu 24.04:\napt update && apt install -y nodejs npm git python3 python3-flask php\ngit clone https://github.com/gmripon/tailnode-host.git\ncd tailnode-host && npm install && npm run build && npm start`, 'tpr2')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'tpr2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'tpr2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  proot-distro login ubuntu{'\n'}apt update && apt install -y nodejs npm git python3 python3-flask php{'\n'}git clone https://github.com/gmripon/tailnode-host.git{'\n'}cd tailnode-host && npm install && npm run build && npm start
                </pre>
              </div>
            </div>
          )}

          {/* Mainline Tab */}
          {activeTarget === 'mainline' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-neutral-300 font-sans text-xs leading-relaxed">
                <span className="font-semibold text-white">Mainline AMD64 Desktop & Server: </span>
                Installs natively on Ubuntu 22.04 or 24.04 physical workstation or VPS.
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>1. Clone Repository & Setup</span>
                  <button
                    onClick={() => handleCopy(`git clone https://github.com/gmripon/tailnode-host.git\ncd tailnode-host\nnpm install && npm run build\nnpm start`, 'm1')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'm1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'm1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  git clone https://github.com/gmripon/tailnode-host.git{'\n'}cd tailnode-host && npm install && npm run build && npm start
                </pre>
              </div>
            </div>
          )}

          {/* 2GB Rootfs Tab */}
          {activeTarget === 'rootfs' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-neutral-300 font-sans text-xs leading-relaxed">
                <span className="font-semibold text-white">Default 2GB Storage & How to Extend: </span>
                2GB (2,048 MB) is the default baseline quota. You can expand it anytime to 4GB, 8GB, 16GB, or more via the Storage Settings or using the CLI lines below.
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>1. Initial 2GB Ext4 Sparse Loop Image</span>
                  <button
                    onClick={() => handleCopy(`dd if=/dev/zero of=~/tailhost_2gb.img bs=1M count=2048 status=progress\nmkfs.ext4 -F ~/tailhost_2gb.img\nmkdir -p ~/tailhost && sudo mount -o loop ~/tailhost_2gb.img ~/tailhost`, 'r1')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'r1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'r1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  dd if=/dev/zero of=~/tailhost_2gb.img bs=1M count=2048 status=progress{'\n'}mkfs.ext4 -F ~/tailhost_2gb.img{'\n'}mkdir -p ~/tailhost && sudo mount -o loop ~/tailhost_2gb.img ~/tailhost
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>2. Extend Partition to 4GB, 8GB, or 16GB</span>
                  <button
                    onClick={() => handleCopy(`truncate -s +2048M ~/tailhost_2gb.img\nsudo resize2fs ~/tailhost_2gb.img`, 'r2')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'r2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'r2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-emerald-400 overflow-x-auto select-all">
                  # Grow disk image file by +2GB:{'\n'}truncate -s +2048M ~/tailhost_2gb.img{'\n'}sudo resize2fs ~/tailhost_2gb.img
                </pre>
              </div>
            </div>
          )}

          {/* Tunnels Tab */}
          {activeTarget === 'tunnels' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-neutral-300 font-sans text-xs leading-relaxed">
                <span className="font-semibold text-white">Free & Open Source Ingress: </span>
                Cloudflare Tunnel (100% free, automatic SSL, no port forwarding), Tailscale Funnel, and ngrok.
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>1. Cloudflare Quick Tunnel (Free SSL, Works on Termux & Desktop)</span>
                  <button
                    onClick={() => handleCopy(`cloudflared tunnel --url http://localhost:3000`, 't1')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 't1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 't1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  cloudflared tunnel --url http://localhost:3000
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-emerald-400 font-sans font-semibold">
                  <span>2. Tailscale Public Funnel</span>
                  <button
                    onClick={() => handleCopy(`tailscale funnel --bg 3000`, 't2')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 't2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 't2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  tailscale funnel --bg 3000
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800 shrink-0">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-semibold transition-colors"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            <span>Download {scripts[activeTarget].filename}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
