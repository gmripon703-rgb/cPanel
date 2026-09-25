import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  Check, 
  Copy, 
  X, 
  Sparkles, 
  User, 
  PhoneCall,
  ShieldCheck
} from 'lucide-react';

export const WHATSAPP_NUMBER = '+8801911527072';
export const WHATSAPP_RAW = '8801911527072';
export const DEVELOPER_NAME = 'GM Ripon';

export const WhatsAppIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.486-8.413Z"/>
  </svg>
);

interface WhatsAppSmartButtonProps {
  variant?: 'floating' | 'footer' | 'inline' | 'compact';
  className?: string;
}

export const WhatsAppSmartButton: React.FC<WhatsAppSmartButtonProps> = ({ 
  variant = 'floating',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const defaultMsg = encodeURIComponent(
    `Hello GM Ripon, I am reaching out regarding TailNode Web Host / cPanel (+8801911527072).`
  );
  const chatUrl = `https://wa.me/${WHATSAPP_RAW}?text=${defaultMsg}`;
  const callUrl = `https://wa.me/${WHATSAPP_RAW}`;
  const directTelUrl = `tel:${WHATSAPP_NUMBER}`;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(WHATSAPP_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compact button for headers or inline bars
  if (variant === 'compact') {
    return (
      <a
        href={chatUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp Call / Chat with GM Ripon (+8801911527072)"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300 transition-colors ${className}`}
      >
        <WhatsAppIcon className="h-3.5 w-3.5 fill-current text-emerald-400" />
        <span className="font-mono text-[11px]">WhatsApp WB</span>
      </a>
    );
  }

  // Footer button variant: modern smart button with chat and call action triggers
  if (variant === 'footer') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-neutral-900 border border-emerald-500/30 shadow-sm">
          <a
            href={chatUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat with GM Ripon on WhatsApp (+8801911527072)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-emerald-300 bg-emerald-600/20 hover:bg-emerald-600/30 hover:text-emerald-200 transition-colors"
          >
            <WhatsAppIcon className="h-3.5 w-3.5 fill-emerald-400" />
            <span>WhatsApp Chat</span>
          </a>

          <a
            href={callUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Voice/Video Call GM Ripon on WhatsApp"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-neutral-300 hover:text-emerald-300 hover:bg-neutral-800 transition-colors"
          >
            <PhoneCall className="h-3 w-3 text-emerald-400" />
            <span className="hidden sm:inline">Call</span>
          </a>

          <button
            onClick={handleCopyNumber}
            title="Copy WhatsApp phone number +8801911527072"
            className="px-2 py-1 rounded text-xs font-mono text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-sans">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-neutral-400" />
                <span className="text-[11px]">{WHATSAPP_NUMBER}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Inline smart card variant (for CTA sections)
  if (variant === 'inline') {
    return (
      <div className={`rounded-xl border border-emerald-500/30 bg-neutral-900/90 p-4 shadow-xl backdrop-blur-md ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <WhatsAppIcon className="h-5 w-5 fill-emerald-400" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-neutral-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Developed by {DEVELOPER_NAME}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono">
                  WB Contact
                </span>
              </div>
              <div className="text-xs text-neutral-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span>WhatsApp:</span>
                <span className="text-emerald-400 font-semibold">{WHATSAPP_NUMBER}</span>
                <span>·</span>
                <span className="text-neutral-400">Live Support & Chat</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-md shadow-emerald-500/20"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 fill-current" />
              <span>WhatsApp Chat</span>
            </a>

            <a
              href={callUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-neutral-800 border border-neutral-700 hover:bg-neutral-750 transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
              <span>WhatsApp Call</span>
            </a>

            <button
              onClick={handleCopyNumber}
              className="p-1.5 rounded-lg text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-800/80 border border-neutral-700 hover:bg-neutral-750 transition-colors"
              title="Copy phone number"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Floating variant (Bottom-Right corner widget)
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex flex-col items-end ${className}`}>
      {/* Expanded Smart Contact Modal / Popover */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 rounded-2xl bg-neutral-900 border border-emerald-500/40 shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-3 duration-200 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <WhatsAppIcon className="h-5 w-5 fill-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-neutral-900" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{DEVELOPER_NAME}</span>
                  <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/50">
                    WB Direct
                  </span>
                </h4>
                <p className="text-[11px] text-neutral-400">Lead Developer · TailNode Host</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick info */}
          <div className="my-3 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-[11px]">
              <span className="text-neutral-400">WhatsApp Number</span>
              <span className="text-emerald-400 font-bold">{WHATSAPP_NUMBER}</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-snug">
              Direct developer contact for TailNode installation on Ubuntu, Termux, Tailscale, scripts, custom hosting setups, and questions.
            </p>
          </div>

          {/* Actions: Chat, Call, Direct Call */}
          <div className="space-y-2">
            <a
              href={chatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
            >
              <WhatsAppIcon className="h-4 w-4 fill-neutral-950" />
              <span>Start WhatsApp Chat</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={callUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-emerald-300 font-medium text-xs border border-neutral-700 transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                <span>WhatsApp Call</span>
              </a>

              <a
                href={directTelUrl}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-medium text-xs border border-neutral-700 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-cyan-400" />
                <span>Direct Phone</span>
              </a>
            </div>

            <button
              onClick={handleCopyNumber}
              className="w-full py-1.5 px-2 text-center text-[11px] font-mono text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Copy: {WHATSAPP_NUMBER}</span>
                </>
              )}
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
            <span>Developed by {DEVELOPER_NAME}</span>
            <span className="text-emerald-400">Available on WhatsApp</span>
          </div>
        </div>
      )}

      {/* Floating Smart Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 border-2 border-white/20"
        title="WhatsApp Call or Chat with GM Ripon (+8801911527072)"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-950 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-950"></span>
        </span>
        <WhatsAppIcon className="h-4 w-4 fill-neutral-950" />
        <span className="tracking-wide">WhatsApp WB: GM Ripon</span>
      </button>
    </div>
  );
};
