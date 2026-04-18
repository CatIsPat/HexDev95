import React, { useEffect } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';

interface ChatBotProps {
  onBack: () => void;
}

export function ChatBot({ onBack }: ChatBotProps) {
  useEffect(() => {
    // Dynamically load the script to activate the chatbot
    const initWidget = async () => {
      try {
        // @ts-ignore - Dynamic import from CDN
        const { embedWidget } = await import("https://cdn.jsdelivr.net/npm/agent-embed-widget/dist/agent-embed-widget.es.js");
        
        embedWidget({
          type: "full-screen",
          url: "https://console.thesys.dev/app/SD1BiVsWdcijLETgmjtGA",
          theme: "light",
        });
      } catch (error) {
        console.error("Failed to load ChatBot widget:", error);
      }
    };

    initWidget();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors flex items-center gap-2 z-20"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium pr-2">Back to Home</span>
      </button>

      <div className="flex flex-col items-center gap-6 z-10">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-[2px] animate-pulse">
          <div className="w-full h-full bg-[#0B0F19] rounded-full flex items-center justify-center">
            <MessageSquare size={40} className="text-cyan-300" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-center px-4">
          ChatBot
        </h1>
        <p className="text-xl text-white/40 tracking-widest uppercase font-medium text-center">
          Initializing secure connection...
        </p>
      </div>
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
