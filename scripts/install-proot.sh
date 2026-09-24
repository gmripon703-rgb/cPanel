#!/usr/bin/env bash
# ==============================================================================
# TailNode: PRoot Rootless Setup (Termux, Android PRoot, Unprivileged Linux)
# ==============================================================================
set -e

echo "==> [1/4] Installing PRoot and Node.js in userland..."
if command -v pkg &> /dev/null; then
  pkg update -y
  pkg install -y proot proot-distro git nodejs-lts
elif command -v apt-get &> /dev/null; then
  apt-get update -y && apt-get install -y proot git nodejs npm
fi

echo "==> [2/4] Setting up 2GB storage workspace..."
mkdir -p $HOME/tailhost/apps $HOME/tailhost/logs $HOME/tailhost/cache

echo "==> [3/4] Installing TailNode dependencies & compiling SPA..."
npm install
npm run build

echo "==> [4/4] Setting up Tailscale in userspace networking mode..."
echo "In PRoot, /dev/net/tun is typically unavailable."
echo "To run Tailscale daemon in userspace:"
echo "  tailscaled --tun=userspace-networking --socks5-server=localhost:1055 &"
echo "  tailscale up"
echo "  tailscale funnel --bg 3000"

echo "=============================================================================="
echo "✅ PRoot installation ready! Start server: npm start"
echo "=============================================================================="
