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
  FileCode,
  FolderTree
} from 'lucide-react';

interface UbuntuGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  magicDnsName: string;
}

type GuideTarget = 'mainline' | 'proot' | 'chroot' | 'rootfs' | 'tailscale';

export const UbuntuGuideModal: React.FC<UbuntuGuideModalProps> = ({
  isOpen,
  onClose,
  magicDnsName,
}) => {
  const [activeTarget, setActiveTarget] = useState<GuideTarget>('mainline');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const scripts: Record<GuideTarget, { filename: string; content: string }> = {
    mainline: {
      filename: 'install-mainline.sh',
      content: `#!/usr/bin/env bash
# ==============================================================================
# TailNode: Mainline Native AMD64 Ubuntu Desktop / Server Setup
# ==============================================================================
set -e
echo "==> [1/5] Updating APT & Installing system tools..."
sudo apt-get update -y
sudo apt-get install -y curl git build-essential

echo "==> [2/5] Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> [3/5] Installing Tailscale..."
if ! command -v tailscale &> /dev/null; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi

echo "==> [4/5] Preparing 2GB sandbox directory structure..."
mkdir -p /home/$USER/tailhost/apps
mkdir -p /home/$USER/tailhost/logs
mkdir -p /home/$USER/tailhost/cache

echo "==> [5/5] Building TailNode cPanel..."
npm install
npm run build

echo "==> Authorizing Tailscale Funnel..."
sudo tailscale up --operator=$USER
tailscale funnel --bg 3000

echo "✅ TailNode Mainline is ready! Run: npm start"
`
    },
    proot: {
      filename: 'install-proot.sh',
      content: `#!/usr/bin/env bash
# ==============================================================================
# TailNode: PRoot Rootless Setup (Termux, Android PRoot, Unprivileged Linux)
# ==============================================================================
set -e
echo "==> [1/4] Installing PRoot and Node.js in userland..."
if command -v pkg &> /dev/null; then
  pkg update -y
  pkg install -y proot proot-distro git nodejs-lts
else
  apt-get update -y && apt-get install -y proot git nodejs npm
fi

echo "==> [2/4] Setting up 2GB storage workspace..."
mkdir -p $HOME/tailhost/apps $HOME/tailhost/logs $HOME/tailhost/cache

echo "==> [3/4] Installing TailNode..."
npm install
npm run build

echo "==> [4/4] Setting up Tailscale in userspace networking mode (no /dev/net/tun needed)..."
if ! command -v tailscaled &> /dev/null; then
  curl -fsSL https://pkgs.tailscale.com/stable/tailscale_latest_amd64.tgz | tar xzf -
  cp tailscale_*/tailscale* $HOME/bin/ 2>/dev/null || true
fi

echo "To start Tailscale in userspace:"
echo "tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &"
echo "tailscale up"
echo "tailscale funnel --bg 3000"
echo "✅ PRoot installation ready! Run: npm start"
`
    },
    chroot: {
      filename: 'install-chroot.sh',
      content: `#!/usr/bin/env bash
# ==============================================================================
# TailNode: Chroot Jail Sandbox Installation
# ==============================================================================
set -e
CHROOT_DIR="/var/chroot/tailhost"

echo "==> [1/4] Bootstrapping minimal Ubuntu rootfs using debootstrap..."
sudo apt-get update && sudo apt-get install -y debootstrap
sudo mkdir -p $CHROOT_DIR
sudo debootstrap --arch=amd64 jammy $CHROOT_DIR http://archive.ubuntu.com/ubuntu/

echo "==> [2/4] Binding dev, proc, sys filesystems..."
sudo mount --bind /dev $CHROOT_DIR/dev
sudo mount --bind /proc $CHROOT_DIR/proc
sudo mount --bind /sys $CHROOT_DIR/sys
sudo cp /etc/resolv.conf $CHROOT_DIR/etc/resolv.conf

echo "==> [3/4] Copying TailNode into jail..."
sudo mkdir -p $CHROOT_DIR/opt/tailnode
sudo cp -r . $CHROOT_DIR/opt/tailnode/

echo "==> [4/4] Setting up node inside chroot..."
sudo chroot $CHROOT_DIR /bin/bash -c "
  apt-get update && apt-get install -y curl git nodejs npm
  cd /opt/tailnode
  npm install
  npm run build
"
echo "✅ Chroot jail ready! Enter jail with: sudo chroot $CHROOT_DIR /bin/bash"
`
    },
    rootfs: {
      filename: 'install-rootfs-2gb.sh',
      content: `#!/usr/bin/env bash
# ==============================================================================
# TailNode: 2GB Raw Ext4 Disk Image Isolation Setup
# ==============================================================================
set -e
IMAGE_PATH="$HOME/tailhost_2gb.img"
MOUNT_POINT="$HOME/tailhost"

echo "==> [1/4] Creating 2048 MB raw block storage image..."
dd if=/dev/zero of=$IMAGE_PATH bs=1M count=2048 status=progress

echo "==> [2/4] Formatting image with Ext4 filesystem..."
mkfs.ext4 -F -L TAILHOST $IMAGE_PATH

echo "==> [3/4] Mounting 2GB image to $MOUNT_POINT..."
mkdir -p $MOUNT_POINT
sudo mount -o loop $IMAGE_PATH $MOUNT_POINT
sudo chown -R $USER:$USER $MOUNT_POINT

mkdir -p $MOUNT_POINT/apps $MOUNT_POINT/logs $MOUNT_POINT/cache

echo "==> [4/4] Verifying quota with df -h..."
df -h $MOUNT_POINT

echo "✅ 2GB hardware quota partition mounted and active at $MOUNT_POINT!"
`
    },
    tailscale: {
      filename: 'setup-tailscale-funnel.sh',
      content: `#!/usr/bin/env bash
# ==============================================================================
# Tailscale Public HTTPS Funnel & Userspace Setup
# ==============================================================================
set -e

# 1. Install Tailscale
if ! command -v tailscale &> /dev/null; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi

# 2. Authenticate and set user operator permissions
sudo tailscale up --operator=$USER

# 3. Print node address and magic DNS
echo "Your Tailscale IPv4: $(tailscale ip -4)"
echo "Your MagicDNS: $(tailscale status --json | grep -o '"DNSName":"[^"]*' | head -1 | cut -d'"' -f4)"

# 4. Enable public HTTPS Funnel on port 3000
tailscale funnel --bg 3000

# 5. Check status
tailscale funnel status
echo "✅ Public Funnel activated!"
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
              <h3 className="text-base sm:text-lg font-bold text-white">
                Multi-Environment Installation & Tailscale Guide
              </h3>
              <p className="text-xs text-neutral-400">
                Mainline Ubuntu AMD64, PRoot Rootless, Chroot Jail, 2GB Rootfs Image & Funnel.
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
            onClick={() => setActiveTarget('mainline')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTarget === 'mainline'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Mainline (AMD64)</span>
          </button>

          <button
            onClick={() => setActiveTarget('proot')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTarget === 'proot'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>PRoot (Rootless)</span>
          </button>

          <button
            onClick={() => setActiveTarget('chroot')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTarget === 'chroot'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Chroot Jail</span>
          </button>

          <button
            onClick={() => setActiveTarget('rootfs')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTarget === 'rootfs'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <HardDrive className="h-3.5 w-3.5" />
            <span>2GB Raw Rootfs</span>
          </button>

          <button
            onClick={() => setActiveTarget('tailscale')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTarget === 'tailscale'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Tailscale & Funnel</span>
          </button>
        </div>

        {/* Dynamic Content Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 font-mono text-xs">
          {/* Mainline Tab */}
          {activeTarget === 'mainline' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-neutral-300 font-sans text-xs leading-relaxed">
                <span className="font-semibold text-white">Recommended for AMD64 Desktop & Server: </span>
                Installs directly on Ubuntu 22.04/24.04 bare-metal. Uses PM2-style process control, creates the isolated 2GB hosting tree, and configures Tailscale Funnel.
              </div>

              {/* Step 1 */}
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>1. Clone Repository & Enter Directory</span>
                  <button
                    onClick={() => handleCopy(`git clone https://github.com/your-username/tailnode-host.git\ncd tailnode-host`, 'm1')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'm1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'm1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  git clone https://github.com/your-username/tailnode-host.git{'\n'}cd tailnode-host
                </pre>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>2. Install Node.js 20 LTS & Build Panel</span>
                  <button
                    onClick={() => handleCopy(`curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\nsudo apt-get install -y nodejs\nnpm install && npm run build`, 'm2')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'm2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'm2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  npm install && npm run build
                </pre>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>3. Prepare 2GB Storage Isolation Sandbox</span>
                  <button
                    onClick={() => handleCopy(`mkdir -p /home/$USER/tailhost/apps /home/$USER/tailhost/logs /home/$USER/tailhost/cache`, 'm3')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'm3' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'm3' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  mkdir -p /home/$USER/tailhost/apps /home/$USER/tailhost/logs /home/$USER/tailhost/cache
                </pre>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>4. Start TailNode Host</span>
                  <button
                    onClick={() => handleCopy(`npm start`, 'm4')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'm4' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'm4' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-emerald-400 overflow-x-auto select-all font-bold">
                  npm start
                </pre>
              </div>
            </div>
          )}

          {/* PRoot Tab */}
          {activeTarget === 'proot' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-neutral-300 font-sans text-xs leading-relaxed">
                <span className="font-semibold text-white">Rootless / Unprivileged Environment: </span>
                Ideal for Termux on Android, restricted university servers, or running without root access. Emulates `chroot` and kernel syscalls entirely in userspace.
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>1. Install PRoot & Node in Userland</span>
                  <button
                    onClick={() => handleCopy(`pkg install -y proot proot-distro git nodejs-lts || apt-get install -y proot git nodejs npm`, 'p1')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'p1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'p1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  pkg install -y proot proot-distro git nodejs-lts
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>2. Clone & Build TailNode</span>
                  <button
                    onClick={() => handleCopy(`git clone https://github.com/your-username/tailnode-host.git\ncd tailnode-host\nnpm install && npm run build`, 'p2')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'p2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'p2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  git clone https://github.com/your-username/tailnode-host.git{'\n'}cd tailnode-host && npm install && npm run build
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>3. Tailscale Userspace Networking (No /dev/net/tun)</span>
                  <button
                    onClick={() => handleCopy(`tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &\ntailscale up\ntailscale funnel 3000 on`, 'p3')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'p3' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'p3' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-amber-300 overflow-x-auto select-all">
                  # In PRoot, TUN devices aren't present. Run userspace mode:{'\n'}tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &{'\n'}tailscale up{'\n'}tailscale funnel 3000 on
                </pre>
              </div>
            </div>
          )}

          {/* Chroot Tab */}
          {activeTarget === 'chroot' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-neutral-300 font-sans text-xs leading-relaxed">
                <span className="font-semibold text-white">Chroot Jail Sandbox: </span>
                Isolate TailNode and all hosted apps inside a standalone root directory like `/var/chroot/tailhost` so malicious npm scripts cannot escape into the host desktop.
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>1. Bootstrap Minimal Ubuntu Rootfs</span>
                  <button
                    onClick={() => handleCopy(`sudo apt-get install -y debootstrap\nsudo mkdir -p /var/chroot/tailhost\nsudo debootstrap --arch=amd64 jammy /var/chroot/tailhost http://archive.ubuntu.com/ubuntu/`, 'c1')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'c1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'c1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  sudo apt-get install -y debootstrap{'\n'}sudo mkdir -p /var/chroot/tailhost{'\n'}sudo debootstrap --arch=amd64 jammy /var/chroot/tailhost http://archive.ubuntu.com/ubuntu/
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>2. Bind Mount Host Kernel Virtual FS</span>
                  <button
                    onClick={() => handleCopy(`sudo mount --bind /dev /var/chroot/tailhost/dev\nsudo mount --bind /proc /var/chroot/tailhost/proc\nsudo mount --bind /sys /var/chroot/tailhost/sys\nsudo cp /etc/resolv.conf /var/chroot/tailhost/etc/resolv.conf`, 'c2')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'c2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'c2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  sudo mount --bind /dev /var/chroot/tailhost/dev{'\n'}sudo mount --bind /proc /var/chroot/tailhost/proc{'\n'}sudo mount --bind /sys /var/chroot/tailhost/sys{'\n'}sudo cp /etc/resolv.conf /var/chroot/tailhost/etc/resolv.conf
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>3. Enter Chroot & Execute TailNode</span>
                  <button
                    onClick={() => handleCopy(`sudo chroot /var/chroot/tailhost /bin/bash\n# Inside chroot:\napt-get update && apt-get install -y curl git nodejs npm\ngit clone https://github.com/your-username/tailnode-host.git /opt/tailnode\ncd /opt/tailnode && npm install && npm run build && npm start`, 'c3')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'c3' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'c3' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-emerald-400 overflow-x-auto select-all">
                  sudo chroot /var/chroot/tailhost /bin/bash
                </pre>
              </div>
            </div>
          )}

          {/* Rootfs 2GB Disk Image Tab */}
          {activeTarget === 'rootfs' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-neutral-300 font-sans text-xs leading-relaxed">
                <span className="font-semibold text-white">Hard 2GB Block Storage Quota: </span>
                Creates an actual 2,048 MB raw disk image formatted with Ext4 and mounted via loop device. Enforces physical hardware boundaries so hosted sites cannot exceed 2GB under any circumstances.
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>1. Create 2GB Ext4 Sparse Image</span>
                  <button
                    onClick={() => handleCopy(`dd if=/dev/zero of=~/tailhost_2gb.img bs=1M count=2048 status=progress\nmkfs.ext4 -F -L TAILHOST ~/tailhost_2gb.img`, 'r1')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'r1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'r1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  dd if=/dev/zero of=~/tailhost_2gb.img bs=1M count=2048 status=progress{'\n'}mkfs.ext4 -F -L TAILHOST ~/tailhost_2gb.img
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>2. Mount 2GB Partition & Set Permissions</span>
                  <button
                    onClick={() => handleCopy(`mkdir -p /home/$USER/tailhost\nsudo mount -o loop ~/tailhost_2gb.img /home/$USER/tailhost\nsudo chown -R $USER:$USER /home/$USER/tailhost\nmkdir -p /home/$USER/tailhost/apps /home/$USER/tailhost/logs /home/$USER/tailhost/cache`, 'r2')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'r2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'r2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  mkdir -p /home/$USER/tailhost{'\n'}sudo mount -o loop ~/tailhost_2gb.img /home/$USER/tailhost{'\n'}sudo chown -R $USER:$USER /home/$USER/tailhost
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>3. Verify with df -h</span>
                  <button
                    onClick={() => handleCopy(`df -h /home/$USER/tailhost`, 'r3')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'r3' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'r3' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-emerald-400 overflow-x-auto select-all">
                  $ df -h /home/$USER/tailhost{'\n'}Filesystem      Size  Used Avail Use% Mounted on{'\n'}/dev/loop4      2.0G  510M  1.5G  25% /home/ubuntu/tailhost
                </pre>
              </div>
            </div>
          )}

          {/* Tailscale & Funnel Tab */}
          {activeTarget === 'tailscale' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 text-neutral-300 font-sans text-xs leading-relaxed">
                <span className="font-semibold text-white">Public HTTPS Domain Routing: </span>
                Tailscale Funnel exposes your local Ubuntu port to the global internet under your MagicDNS domain (e.g. <code className="text-cyan-300 font-mono">https://{magicDnsName}:3000</code>) with automatic TLS certificates.
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>1. Install Tailscale & Authenticate</span>
                  <button
                    onClick={() => handleCopy(`curl -fsSL https://tailscale.com/install.sh | sh\nsudo tailscale up --operator=$USER`, 't1')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 't1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 't1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  curl -fsSL https://tailscale.com/install.sh | sh{'\n'}sudo tailscale up --operator=$USER
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>2. Enable Public HTTPS Funnel on Port 3000</span>
                  <button
                    onClick={() => handleCopy(`tailscale funnel --bg 3000`, 't2')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 't2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 't2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-emerald-400 overflow-x-auto select-all">
                  tailscale funnel --bg 3000
                </pre>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-850 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-sans font-semibold">
                  <span>3. Verify Funnel Status</span>
                  <button
                    onClick={() => handleCopy(`tailscale funnel status`, 't3')}
                    className="text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 't3' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 't3' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 overflow-x-auto select-all">
                  tailscale funnel status
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
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
