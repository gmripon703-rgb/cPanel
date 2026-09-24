# TailNode: AMD64 Ubuntu Web Host & cPanel

> **Self-hosted 2GB isolated Node.js web app & static site hosting on AMD64 Ubuntu Desktop with automatic Tailscale Funnel public HTTPS access.**

TailNode turns your Ubuntu desktop or server into an isolated, lightweight web hosting platform (cPanel) with PM2-style process control, 2GB disk quota enforcement, NPM package management, and zero router port-forwarding via Tailscale Funnel.

---

## 🚀 Quick Start Selection Guide

TailNode supports **4 distinct installation modes** to fit every user environment:

| Mode | Target Environment | Root Required? | TUN Device Needed? |
| :--- | :--- | :---: | :---: |
| **[1. Mainline Native](#1-mainline-native-install-amd64-ubuntu-desktop--server)** | Ubuntu 22.04 / 24.04 Desktop & Server | Yes (`sudo`) | Yes (`/dev/net/tun`) |
| **[2. PRoot (Rootless)](#2-proot-install-unprivileged--termux--rootless-linux)** | Unprivileged users, Termux on Android, WSL | **No** (Rootless) | Userspace networking |
| **[3. Chroot (Jail Sandbox)](#3-chroot-install-isolated-2gb-jail-directory)** | Isolated directory / Linux namespaces | Yes (`sudo chroot`) | Host bridged |
| **[4. 2GB Raw Rootfs Image](#4-rootfs-install-standalone-2gb-ext4-disk-image)** | Loopback mounted 2GB raw disk partition | Yes (`losetup`) | Host or container |
| **[5. Tailscale Setup Guide](#5-tailscale-complete-setup-guide)** | Public HTTPS Funnel & MagicDNS | N/A | Host or Userspace |

---

## 1. Mainline Native Install (AMD64 Ubuntu Desktop / Server)

Best for standard Ubuntu 22.04 LTS or 24.04 LTS running on physical AMD64 hardware.

### Step 1: Install System Prerequisites
```bash
sudo apt-get update -y
sudo apt-get install -y curl git build-essential
```

### Step 2: Install Node.js 20 LTS (or 22)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 3: Clone Repository & Build
```bash
git clone https://github.com/your-username/tailnode-host.git
cd tailnode-host
npm install
npm run build
```

### Step 4: Create Isolated 2GB Hosting Directories
```bash
mkdir -p /home/$USER/tailhost/apps
mkdir -p /home/$USER/tailhost/logs
mkdir -p /home/$USER/tailhost/cache
```

### Step 5: Start TailNode
```bash
npm start
```
The control panel is now live at `http://localhost:3000`.

---

## 2. PRoot Install (Unprivileged / Termux / Rootless Linux)

For environments where you do **not** have root privileges, such as Android Termux, shared seedboxes, HPC clusters, or locked-down workstations.

### Step 1: Install PRoot & Node.js
On Termux / Debian-based userland:
```bash
# In Termux or unprivileged userland
pkg update -y || sudo apt update -y
pkg install -y proot proot-distro git nodejs-lts || apt-get install -y proot git nodejs npm
```

If using `proot-distro` on Termux:
```bash
proot-distro install ubuntu
proot-distro login ubuntu
```

### Step 2: Clone & Build in PRoot
```bash
git clone https://github.com/your-username/tailnode-host.git
cd tailnode-host
npm install
npm run build
```

### Step 3: Run Tailscale in Userspace Mode (No `/dev/net/tun`)
In PRoot environments, Linux kernel TUN devices are generally not accessible. Run Tailscale in userspace networking mode:
```bash
# Download static tailscale binary if not installed
curl -fsSL https://pkgs.tailscale.com/stable/tailscale_latest_amd64.tgz | tar xzf -
cd tailscale_*
# Start daemon in userspace mode
./tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &
./tailscale up
```

### Step 4: Start TailNode in PRoot
```bash
export PORT=3000
npm start
```

---

## 3. Chroot Install (Isolated 2GB Jail Directory)

Isolate the entire web host into a dedicated root filesystem directory so hosted web apps cannot access the host machine's root filesystem.

### Step 1: Bootstrap Ubuntu Minimal into a Jail Directory
```bash
sudo apt-get install -y debootstrap
sudo mkdir -p /var/chroot/tailhost
sudo debootstrap --arch=amd64 jammy /var/chroot/tailhost http://archive.ubuntu.com/ubuntu/
```

### Step 2: Bind Essential Host Devices
```bash
sudo mount --bind /dev /var/chroot/tailhost/dev
sudo mount --bind /proc /var/chroot/tailhost/proc
sudo mount --bind /sys /var/chroot/tailhost/sys
sudo cp /etc/resolv.conf /var/chroot/tailhost/etc/resolv.conf
```

### Step 3: Enter Chroot & Setup TailNode
```bash
sudo chroot /var/chroot/tailhost /bin/bash

# Inside Chroot:
apt update && apt install -y curl git nodejs npm build-essential
git clone https://github.com/your-username/tailnode-host.git /opt/tailnode
cd /opt/tailnode
npm install
npm run build
npm start
```

---

## 4. Rootfs Install (Standalone 2GB Ext4 Disk Image)

Strictly enforce the 2GB quota at the filesystem level by creating a real 2GB raw disk image formatted with `ext4` and mounted to `/home/$USER/tailhost`.

### Step 1: Create a 2GB Sparse Disk Image
```bash
# Create exact 2048 MB (2GB) image
dd if=/dev/zero of=~/tailhost_2gb.img bs=1M count=2048
# Format with ext4
mkfs.ext4 -F ~/tailhost_2gb.img
```

### Step 2: Mount the 2GB Partition
```bash
mkdir -p /home/$USER/tailhost
sudo mount -o loop ~/tailhost_2gb.img /home/$USER/tailhost
sudo chown -R $USER:$USER /home/$USER/tailhost
```

### Step 3: (Optional) Auto-mount on Boot in `/etc/fstab`
Add the following entry to `/etc/fstab`:
```text
/home/ubuntu/tailhost_2gb.img  /home/ubuntu/tailhost  ext4  loop,defaults  0  0
```

### Step 4: Run TailNode with 100% Hardware Quota Enforcement
```bash
cd /home/$USER/tailnode-host
npm start
```
Now even if an app attempts to write more than 2GB, the Linux kernel will strictly enforce the boundary (`ENOSPC: no space left on device`).

---

## 5. Tailscale Complete Setup Guide

Tailscale Funnel provides an automatic HTTPS URL for public access without opening any router ports or configuring DDNS.

### 1. Install Tailscale on AMD64 Ubuntu
```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

### 2. Log In & Set Operator Permissions
```bash
# Authorize without requiring sudo for future funnel commands
sudo tailscale up --operator=$USER
```

### 3. Check Connection & Note Your MagicDNS Name
```bash
tailscale status
tailscale ip -4
```
Your desktop now has a private 100.x.y.z IP and a domain like `ubuntu-desktop.tailnet.ts.net`.

### 4. Expose Port 3000 to the Public Internet (Funnel)
```bash
# Expose port 3000 in the background with auto Let's Encrypt TLS
tailscale funnel --bg 3000
```

To expose any other custom app ports (e.g. 4001, 5000):
```bash
tailscale funnel --bg 4001
tailscale funnel --bg 5000
```

### 5. Check Funnel Status
```bash
tailscale funnel status
```
Output:
```text
# Tailscale Funnel:
https://ubuntu-desktop.tailnet.ts.net:3000 -> http://127.0.0.1:3000 (TLS enabled)
https://ubuntu-desktop.tailnet.ts.net:4001 -> http://127.0.0.1:4001 (TLS enabled)
```

---

## 6. Run 24/7 as a Systemd Service

To keep TailNode running permanently in the background after reboots:

Create `/etc/systemd/system/tailnode.service`:
```ini
[Unit]
Description=TailNode 2GB Web Hosting cPanel
After=network.target tailscaled.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/tailnode-host
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tailnode
sudo systemctl status tailnode
```

---

## 📁 Repository Structure
```text
tailnode-host/
├── server.ts             # Express backend with PM2 process manager & storage APIs
├── src/
│   ├── components/       # Landing page, cPanel dashboard, terminals, modals
│   ├── types/            # TypeScript interfaces (HostedApp, SystemMetrics)
│   └── services/         # Client API hooks
├── dist/                 # Compiled production SPA assets
├── package.json          # Node scripts & dependencies
└── README.md             # This comprehensive setup guide
```

---

## 📜 License
Apache-2.0
