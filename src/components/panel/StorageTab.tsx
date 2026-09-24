import React, { useState } from 'react';
import { 
  HardDrive, 
  Folder, 
  FileText, 
  RefreshCw, 
  Trash2, 
  FileCode, 
  Check, 
  X, 
  Save,
  AlertTriangle,
  FolderTree,
  Sparkles,
  Download
} from 'lucide-react';
import { StorageFile, SystemMetrics } from '../../types/hosting';

interface StorageTabProps {
  metrics: SystemMetrics;
  files: StorageFile[];
  onCleanCache: () => void;
  cleaning: boolean;
}

export const StorageTab: React.FC<StorageTabProps> = ({
  metrics,
  files,
  onCleanCache,
  cleaning,
}) => {
  const quota = metrics.storage2GBQuota;
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const mockFileContents: Record<string, string> = {
    '/home/ubuntu/tailhost/apps/ecommerce-api/server.js': `// TailNode Self-Hosted Node.js Server on AMD64 Ubuntu Desktop
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    storageQuota: '2GB Isolated Partition',
    arch: process.arch
  });
});

app.get('/api/v1/products', (req, res) => {
  res.json([
    { id: 'p1', name: 'Workstation Node', price: 299 },
    { id: 'p2', name: 'Tailscale Mesh Node', price: 99 }
  ]);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`[ecommerce-api] Running on port \${PORT}\`);
});`,
    '/home/ubuntu/tailhost/apps/ecommerce-api/package.json': `{
  "name": "ecommerce-api",
  "version": "1.0.0",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
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
LOG_LEVEL=info`,
    '/home/ubuntu/tailhost/apps/system-daemon/worker.js': `// Background Telemetry Worker
import os from 'os';

console.log('[daemon] Ubuntu Desktop Telemetry Worker started');
setInterval(() => {
  const load = os.loadavg()[0];
  console.log(\`[telemetry] 1-min CPU load: \${load.toFixed(2)}\`);
}, 10000);`
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">2GB Storage Quota & File Explorer</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Isolated local disk allocation <span className="font-mono text-cyan-300">/home/ubuntu/tailhost/</span> prevents filling your AMD64 Ubuntu desktop.
          </p>
        </div>

        <button
          onClick={onCleanCache}
          disabled={cleaning}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-200 bg-neutral-900 border border-neutral-750 rounded-lg hover:bg-neutral-850 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${cleaning ? 'animate-spin' : ''}`} />
          <span>{cleaning ? 'Reclaiming 72 MB...' : 'Purge NPM Cache & Logs'}</span>
        </button>
      </div>

      {/* Storage Visual Gauge */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">Partition Allocation (2,048 MB Limit)</span>
          </div>
          <span className="font-mono text-xs text-cyan-400 font-bold">
            {quota.usedMb} MB / {quota.allocatedLimitMb} MB ({quota.percentUsed}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full rounded-full bg-neutral-950 overflow-hidden flex border border-neutral-850 p-0.5">
          <div 
            className="h-full bg-cyan-400 rounded-l-full transition-all duration-500" 
            style={{ width: `${Math.min(100, (quota.usedMb / quota.allocatedLimitMb) * 100)}%` }} 
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
            <div className="text-neutral-500">Allocated Quota</div>
            <div className="text-white font-bold mt-0.5">2,048.0 MB</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
            <div className="text-neutral-500">Used by Apps</div>
            <div className="text-cyan-400 font-bold mt-0.5">{quota.usedMb} MB</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
            <div className="text-neutral-500">Free Headroom</div>
            <div className="text-emerald-400 font-bold mt-0.5">{quota.freeMb} MB</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-850">
            <div className="text-neutral-500">NPM Cache Size</div>
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
          <span className="text-xs text-neutral-400">Click any file to inspect or edit code</span>
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

      {/* Code Editor Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
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

            {/* Code Body */}
            <div className="p-4 flex-1 overflow-auto bg-neutral-950">
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                rows={16}
                className="w-full bg-neutral-950 font-mono text-xs text-neutral-200 focus:outline-none leading-relaxed resize-none selection:bg-cyan-500/20"
                spellCheck={false}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-3 border-t border-neutral-800 bg-neutral-950 text-xs">
              <span className="text-neutral-500 font-mono">
                {savedSuccess ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    File saved to 2GB sandbox
                  </span>
                ) : (
                  'UTF-8 · JavaScript/JSON · Linux line endings'
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
