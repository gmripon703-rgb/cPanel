#!/usr/bin/env bash
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

echo "=============================================================================="
echo "✅ TailNode Mainline is ready! Start server: npm start"
echo "Public URL: https://$(tailscale status --json | grep -o '"DNSName":"[^"]*' | head -1 | cut -d'"' -f4 | sed 's/\.$//'):3000"
echo "=============================================================================="
