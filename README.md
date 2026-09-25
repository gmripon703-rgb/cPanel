# TailNode: AMD64 & Termux Web Host & cPanel

> **Engineered & Developed by GM Ripon Developer**
>
> **Self-hosted Node.js, Python Flask (flashk), WordPress, PHP, and E-Commerce Web Host with Default 2GB Isolated Storage (Extendable) & Multi-Tunnel Free HTTPS (Cloudflare, Tailscale, ngrok).**

TailNode turns your **AMD64 Ubuntu Desktop / Server** or **Android Termux Phone** into a full-featured, lightweight web hosting platform (cPanel) with PM2-style process control, 1-click script shortcuts, dynamic storage quota expansion, and zero router port-forwarding via free HTTPS tunnels.

---

## 🌟 Key Highlights & Architecture

- **Developed by GM Ripon Developer**
- **Default 2GB Isolated Storage**: Protects host drive space from runaway npm/pip caches. Extendable dynamically to 4GB, 8GB, 16GB, or 32GB+ via settings.
- **1-Click Script & App Shortcuts**:
  - 🌐 **WordPress** (PHP 8.2 + standalone SQLite engine, zero MySQL overhead)
  - 🛒 **E-Commerce Shopping Cart** (Storefront with catalog & checkout API)
  - 🐍 **Python Flask (`flashk`)** (WSGI Gunicorn + Flask microservice)
  - 🐘 **Native PHP Web App** (PHP 8.2 CLI / FPM)
  - ⚡ **Express REST API** & **React Vite SPA**
- **Free & Open-Source HTTPS Ingress (Zero Port Forwarding)**:
  - ☁️ **Cloudflare Tunnel (`cloudflared`)**: 100% Free & Open-Source, unlimited bandwidth, instant Cloudflare Edge SSL.
  - 🔒 **Tailscale Funnel & MagicDNS**: Direct WireGuard mesh with Let's Encrypt certificates.
  - ⚡ **ngrok**: Instant HTTPS public ingress with web request replay inspection.
  - 🛡️ **Caddy**: Open-source automatic HTTPS reverse proxy.
- **Supported Environments**:
  - 📱 **Termux Native `pkg`** (Android mobile, both Rooted with `tsu` and Non-Rooted)
  - 📦 **Termux PRoot-Distro** (Full Ubuntu 24.04 LTS Noble on Android)
  - 🖥️ **Mainline AMD64 Ubuntu Desktop & Server** (22.04 / 24.04)
  - 🛡️ **Chroot Jail Sandbox** (Debootstrap container rootfs)
  - 💾 **Raw Ext4 Rootfs Loop Image** (Hard physical boundary with resize commands)

---

## 🚀 Quick Installation Modes

### Mode 1: Termux Mobile Native (`pkg` Rooted & Non-Rooted)

For running directly on Android phones inside the Termux app:

```bash
# 1. Update Termux packages & install runtimes
pkg update -y
pkg install -y nodejs-lts git python php curl build-essential

# 2. Clone repository & build
git clone https://github.com/gmripon/tailnode-host.git
cd tailnode-host
npm install
npm run build

# 3. Start TailNode Host
npm start

# (Optional: Rooted devices can bind to port 80 via tsu)
# tsu -c "npm start"
```

To expose your Termux phone to the public internet with free HTTPS via Cloudflare:
```bash
pkg install -y cloudflared
cloudflared tunnel --url http://localhost:3000
```

---

### Mode 2: Termux PRoot-Distro (Ubuntu 24.04 Noble LTS)

To run a genuine Ubuntu 24.04 environment on your phone without rooting:

```bash
# 1. Install proot-distro in Termux
pkg install -y proot-distro git curl
proot-distro install ubuntu

# 2. Login to Ubuntu 24.04
proot-distro login ubuntu

# 3. Install packages & run TailNode inside Ubuntu 24.04:
apt update && apt install -y curl git build-essential nodejs npm python3 python3-flask php
git clone https://github.com/gmripon/tailnode-host.git
cd tailnode-host
npm install
npm run build
npm start
```

---

### Mode 3: Mainline AMD64 Ubuntu Desktop / Server

For physical AMD64 / x86_64 Ubuntu workstations:

```bash
# 1. Install prerequisites & Node.js 20 LTS
sudo apt-get update -y
sudo apt-get install -y curl git build-essential python3 python3-pip php php-cli
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone repository & build
git clone https://github.com/gmripon/tailnode-host.git
cd tailnode-host
npm install
npm run build

# 3. Start server
npm start
```

---

### Mode 4: Default 2GB Storage & How to Extend

TailNode defaults to 2GB (2,048 MB) storage quota. You can extend it inside the cPanel UI or at the Linux filesystem level:

```bash
# To create a raw 2GB loopback disk image:
dd if=/dev/zero of=~/tailhost_2gb.img bs=1M count=2048 status=progress
mkfs.ext4 -F ~/tailhost_2gb.img
mkdir -p ~/tailhost
sudo mount -o loop ~/tailhost_2gb.img ~/tailhost

# To EXTEND the quota from 2GB to 4GB, 8GB, or 16GB:
truncate -s +2048M ~/tailhost_2gb.img
sudo resize2fs ~/tailhost_2gb.img
```

---

### Mode 5: Multi-Tunnel Free HTTPS Ingress Setup

TailNode supports multiple public tunnel options:

#### Option A: Cloudflare Quick Tunnel (Free & Open Source)
```bash
# 1-line command exposes localhost:3000 to https://*.trycloudflare.com with instant SSL
cloudflared tunnel --url http://localhost:3000
```

#### Option B: Tailscale Public Funnel (Zero Router Ports)
```bash
sudo tailscale up --operator=$USER
tailscale funnel --bg 3000
# In PRoot or Termux where /dev/net/tun is restricted:
tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &
tailscale funnel 3000 on
```

#### Option C: ngrok
```bash
ngrok config add-authtoken YOUR_TOKEN
ngrok http 3000
```

---

## 🛠️ 1-Click Script Shortcuts

Inside the cPanel **1-Click Scripts** tab, click **Install Shortcut** to launch:
- **WordPress**: Auto-configured with PHP 8.2 and SQLite driver
- **E-Commerce Cart**: Node/Express storefront with cart & checkout endpoints
- **Python Flask (`flashk`)**: WSGI server with Gunicorn, routes, and `requirements.txt`
- **Native PHP**: Standalone PHP runner with `index.php` and dynamic templates
- **Express REST API** & **React Vite SPA**

---

## 📁 Repository Structure

```text
tailnode-host/
├── server.ts                  # Express backend, process manager, multi-tunnel & quota APIs
├── src/
│   ├── components/
│   │   ├── TopNavigation.tsx  # Navigation with GM Ripon Developer badge
│   │   ├── LandingPage.tsx    # Showcase for 2GB quota, tunnels, and shortcuts
│   │   ├── HostingPanel.tsx   # cPanel layout & tab controller
│   │   └── panel/
│   │       ├── OverviewTab.tsx # Host metrics & quick script launcher
│   │       ├── AppsTab.tsx     # Process lifecycle (Start, Stop, Restart)
│   │       ├── ScriptsTab.tsx  # 1-Click shortcuts (WordPress, Cart, PHP, Flask)
│   │       ├── StorageTab.tsx  # Extend Storage Quota & File Manager
│   │       ├── TailscaleTab.tsx# Multi-tunnel ingress (Cloudflare, Tailscale, ngrok)
│   │       ├── NpmTab.tsx      # NPM & Python package manager
│   │       └── TerminalTab.tsx # Interactive terminal shell & live logs
│   ├── types/hosting.ts       # TypeScript definitions
│   └── services/api.ts        # Client API hooks
├── scripts/                   # Downloadable bash setup scripts
├── dist/                      # Compiled production bundle
├── package.json               # Dependencies & build scripts
└── README.md                  # This documentation
```

---

## 👨‍💻 Developer & Direct WhatsApp Contact

- **Lead Developer**: **Developed by GM Ripon**
- **Email**: `gmripon703@gmail.com`
- **WhatsApp Call & Chat**: [**+8801911527072**](https://wa.me/8801911527072?text=Hello%20GM%20Ripon,%20I'm%20contacting%20you%20regarding%20TailNode%20Web%20Hosting)
- **Direct Phone / WhatsApp**: `+8801911527072`
- **WhatsApp Web Link**: [Click to Chat on WhatsApp with GM Ripon](https://wa.me/8801911527072)
- **License**: Apache-2.0
