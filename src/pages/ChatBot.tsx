import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ChatBotProps {
  onBack: () => void;
}

export function ChatBot({ onBack }: ChatBotProps) {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="relative z-20 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="group p-2 hover:bg-white/10 rounded-full transition-all flex items-center gap-2 text-white/70 hover:text-white"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-semibold tracking-wide uppercase">Back to Dashboard</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">Secure Channel Active</span>
        </div>
      </header>

      {/* Chat Content */}
      <div className="flex-1 relative z-10 bg-[#050505]">
        <iframe 
          src="https://console.thesys.dev/app/SD1BiVsWdcijLETgmjtGA"
          className="w-full h-full border-none"
          title="ChatBot Interface"
          allow="microphone; camera; clipboard-read; clipboard-write; geolocation"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        />
      </div>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full opacity-30 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

