import React, { useState } from 'react';
import { 
  HardDrive, 
  Folder, 
  RefreshCw, 
  FileCode, 
  Check, 
  X, 
  Save,
  FolderTree,
  Sliders,
  Maximize2,
  Clock,
  Terminal,
  Copy,
  Info
} from 'lucide-react';
import { StorageFile, SystemMetrics } from '../../types/hosting';

interface StorageTabProps {
  metrics: SystemMetrics;
  files: StorageFile[];
  onCleanCache: () => void;
  onExtendQuota: (newLimitMb: number, reason?: string) => Promise<void>;
  cleaning: boolean;
}

export const StorageTab: React.FC<StorageTabProps> = ({
  metrics,
  files,
  onCleanCache,
  onExtendQuota,
  cleaning,
}) => {
  const quota = metrics.storage2GBQuota;
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Storage settings state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [targetQuotaMb, setTargetQuotaMb] = useState<number>(quota.allocatedLimitMb);
  const [quotaReason, setQuotaReason] = useState<string>('');
  const [resizing, setResizing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const mockFileContents: Record<string, string> = {
    '/home/ubuntu/tailhost/apps/ecommerce-api/server.js': `// TailNode Self-Hosted Node.js Server
// Developed by GM Ripon
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    developer: 'GM Ripon Developer',
    storageQuota: 'Isolated Sandbox (Default 2GB, Expandable)',
    uptime: process.uptime()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`[ecommerce-api] Running on port \${PORT}\`);
});`,
    '/home/ubuntu/tailhost/apps/flask-service/app.py': `# Python Flask Web Service
# Developed by GM Ripon
import os
from flask import Flask, jsonify

app = Flask(__name__)
PORT = int(os.environ.get("PORT", 5500))

@app.route("/")
def home():
    return jsonify({
        "service": "Python Flask Microservice",
        "developer": "GM Ripon Developer",
        "status": "online",
        "platform": "AMD64 / Termux aarch64",
        "https_tunnel": "Cloudflare / Tailscale / ngrok"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)`,
    '/home/ubuntu/tailhost/apps/ecommerce-api/package.json': `{
  "name": "ecommerce-api",
  "version": "1.0.0",
  "main": "server.js",
  "type": "module",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0"
  }
}`,
    '/home/ubuntu/tailhost/apps/ecommerce-api/.env': `NODE_ENV=production
PORT=4001
DATABASE_URL=sqlite:///data/shop.db
CORS_ORIGIN=*
LOG_LEVEL=info`
  };

  const handleOpenFile = (file: StorageFile) => {
    if (file.type === 'dir') return;
    setSelectedFile(file);
    setEditorContent(
      mockFileContents[file.path] || 
      `// Contents of ${file.path}\n// File size: ${file.sizeKb} KB\nconsole.log("Ready");`
    );
    setSavedSuccess(false);
  };

  const handleSaveFile = () => {
    if (selectedFile) {
      mockFileContents[selectedFile.path] = editorContent;
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const handleApplyQuota = async () => {
    setResizing(true);
    await onExtendQuota(
      targetQuotaMb, 
      quotaReason || `Storage quota configured to ${targetQuotaMb} MB (${(targetQuotaMb / 1024).toFixed(1)} GB)`
    );
    setResizing(false);
    setShowSettingsModal(false);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Storage Quota & Filesystem Explorer</h2>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[11px]">
              Default 2GB (Extendable)
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Safeguards your host by limiting app disk footprints. Extendable from 2GB to 32GB+ anytime.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setTargetQuotaMb(quota.allocatedLimitMb);
              setShowSettingsModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Extend Storage Quota</span>
          </button>

          <button
            onClick={onCleanCache}
            disabled={cleaning}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-850 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${cleaning ? 'animate-spin' : ''}`} />
            <span>{cleaning ? 'Reclaiming...' : 'Purge Cache (72 MB)'}</span>
          </button>
        </div>
      </div>

      {/* Storage Visual Gauge */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">
              Storage Partition Allocation ({quota.allocatedLimitMb} MB / {(quota.allocatedLimitMb / 1024).toFixed(1)} GB Limit)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {quota.isDefault2GB ? (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                2GB Default Active
              </span>
            ) : (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Extended to {(quota.allocatedLimitMb / 1024).toFixed(1)} GB
              </span>
            )}
            <span className="font-mono text-xs text-cyan-400 font-bold">
              {quota.usedMb} MB ({quota.percentUsed}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3.5 w-full rounded-full bg-neutral-950 overflow-hidden flex border border-neutral-850 p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, (quota.usedMb / quota.allocatedLimitMb) * 100)}%` }} 
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
            <div className="text-neutral-500">Allocated Quota</div>
            <div className="text-white font-bold mt-0.5">
              {quota.allocatedLimitMb} MB ({(quota.allocatedLimitMb / 1024).toFixed(1)} GB)
            </div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
            <div className="text-neutral-500">Used by Services</div>
            <div className="text-cyan-400 font-bold mt-0.5">{quota.usedMb} MB</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
            <div className="text-neutral-500">Free Headroom</div>
            <div className="text-emerald-400 font-bold mt-0.5">{quota.freeMb} MB</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
            <div className="text-neutral-500">NPM & Pip Cache</div>
            <div className="text-amber-400 font-bold mt-0.5">{quota.nodeModulesCacheMb} MB</div>
          </div>
        </div>
      </div>

      {/* Interactive Filesystem Explorer */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">Filesystem Explorer</span>
            <span className="text-xs font-mono text-neutral-500">/home/ubuntu/tailhost/apps/</span>
          </div>
          <span className="text-xs text-neutral-400">Click any file to edit code or check dependencies</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-950/40">
                <th className="py-2.5 px-4 font-medium">NAME / PATH</th>
                <th className="py-2.5 px-4 font-medium">TYPE</th>
                <th className="py-2.5 px-4 font-medium">SIZE</th>
                <th className="py-2.5 px-4 font-medium">MODIFIED</th>
                <th className="py-2.5 px-4 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {files.map((file, idx) => (
                <tr 
                  key={idx}
                  onClick={() => handleOpenFile(file)}
                  className={`hover:bg-neutral-850/50 transition-colors ${file.type === 'file' ? 'cursor-pointer' : ''}`}
                >
                  <td className="py-2.5 px-4 text-white flex items-center gap-2">
                    {file.type === 'dir' ? (
                      <Folder className="h-4 w-4 text-amber-400 shrink-0" />
                    ) : (
                      <FileCode className="h-4 w-4 text-cyan-400 shrink-0" />
                    )}
                    <span className="truncate max-w-md">{file.path.replace('/home/ubuntu/tailhost/', '')}</span>
                  </td>
                  <td className="py-2.5 px-4 text-neutral-400 uppercase text-[11px]">
                    {file.type}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-300">
                    {file.sizeKb > 1024 
                      ? `${(file.sizeKb / 1024).toFixed(1)} MB` 
                      : `${file.sizeKb} KB`}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-500">
                    {file.modified}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {file.type === 'file' && (
                      <span className="text-cyan-400 hover:text-cyan-300 hover:underline">
                        Edit & Preview →
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quota Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                <h3 className="text-base font-semibold text-white">Configure & Extend Storage Quota</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 font-sans text-neutral-300 leading-relaxed">
                <span className="font-semibold text-white">Default Baseline: 2,048 MB (2 GB). </span>
                If your hosted Node.js or Flask services require more assets, database files, or dependencies, extend the quota below.
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-mono text-xs">SELECT PRESET QUOTA SIZE:</label>
                <div className="grid grid-cols-4 gap-2 font-mono">
                  <button
                    type="button"
                    onClick={() => setTargetQuotaMb(2048)}
                    className={`p-2.5 rounded-lg border text-center transition-colors ${
                      targetQuotaMb === 2048
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div>2 GB</div>
                    <div className="text-[10px] text-neutral-500">Default</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetQuotaMb(4096)}
                    className={`p-2.5 rounded-lg border text-center transition-colors ${
                      targetQuotaMb === 4096
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div>4 GB</div>
                    <div className="text-[10px] text-neutral-500">Double</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetQuotaMb(8192)}
                    className={`p-2.5 rounded-lg border text-center transition-colors ${
                      targetQuotaMb === 8192
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div>8 GB</div>
                    <div className="text-[10px] text-neutral-500">Medium</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetQuotaMb(16384)}
                    className={`p-2.5 rounded-lg border text-center transition-colors ${
                      targetQuotaMb === 16384
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 font-bold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div>16 GB</div>
                    <div className="text-[10px] text-neutral-500">Large</div>
                  </button>
                </div>
              </div>

              {/* Slider Input */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Custom Target Limit:</span>
                  <span className="text-cyan-400 font-bold text-sm">
                    {targetQuotaMb} MB ({(targetQuotaMb / 1024).toFixed(1)} GB)
                  </span>
                </div>
                <input
                  type="range"
                  min="1024"
                  max="32768"
                  step="512"
                  value={targetQuotaMb}
                  onChange={(e) => setTargetQuotaMb(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>1 GB</span>
                  <span>Default 2 GB</span>
                  <span>8 GB</span>
                  <span>16 GB</span>
                  <span>32 GB</span>
                </div>
              </div>

              {/* CLI Command for raw image resize */}
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 space-y-2">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[11px] font-sans font-semibold text-white flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Raw Disk Image Resize CLI (Loopback Mounts)</span>
                  </span>
                  <button
                    onClick={() => handleCopy(
                      `truncate -s +${Math.max(0, targetQuotaMb - 2048)}M ~/tailhost_2gb.img\nsudo losetup -c /dev/loop4 2>/dev/null || true\nsudo resize2fs ~/tailhost_2gb.img`,
                      'resize_cli'
                    )}
                    className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === 'resize_cli' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="p-2 rounded bg-neutral-900 text-neutral-300 text-[11px] overflow-x-auto">
                  # Grow image file and expand filesystem:{'\n'}
                  truncate -s {targetQuotaMb}M ~/tailhost_2gb.img{'\n'}
                  sudo resize2fs ~/tailhost_2gb.img
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resizing}
                onClick={handleApplyQuota}
                className="px-5 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
              >
                {resizing ? 'Applying...' : `Set Quota to ${(targetQuotaMb / 1024).toFixed(1)} GB`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Editor Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-mono font-semibold text-white truncate max-w-lg">
                  {selectedFile.path}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  ({selectedFile.sizeKb} KB)
                </span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-neutral-950">
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                rows={16}
                className="w-full bg-neutral-950 font-mono text-xs text-neutral-200 focus:outline-none leading-relaxed resize-none selection:bg-cyan-500/20"
                spellCheck={false}
              />
            </div>

            <div className="flex items-center justify-between p-3 border-t border-neutral-800 bg-neutral-950 text-xs">
              <span className="text-neutral-500 font-mono">
                {savedSuccess ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    File saved to sandbox
                  </span>
                ) : (
                  'UTF-8 · GM Ripon Developer · Linux line endings'
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-3 py-1.5 rounded text-neutral-400 hover:text-neutral-200"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveFile}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-semibold transition-colors"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
