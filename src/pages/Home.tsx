import React from 'react';
import { Camera, Video, MessageSquare, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onNavigate: (page: 'image' | 'video' | 'chatbot') => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] relative overflow-hidden font-sans">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-50 mix-blend-screen"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#0B0F19]/80 to-[#0B0F19]" />

      {/* Header */}
      <header className="relative z-10 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center">
        <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center mr-3">
          <Zap className="w-5 h-5 text-black fill-current" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-wide">FlashGen</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 gap-6">
        <Card 
          icon={<Camera size={40} className="text-cyan-300" strokeWidth={1.5} />}
          title="IMAGE GENERATION"
          onClick={() => onNavigate('image')}
          gradient="from-cyan-400 via-purple-500 to-pink-500"
        />
        <Card 
          icon={<Video size={40} className="text-cyan-300" strokeWidth={1.5} />}
          title="VIDEO GENERATION"
          onClick={() => onNavigate('video')}
          gradient="from-cyan-400 via-purple-500 to-pink-500"
        />
        <Card 
          icon={<MessageSquare size={40} className="text-cyan-300" strokeWidth={1.5} />}
          title="ChatBot"
          onClick={() => onNavigate('chatbot')}
          gradient="from-cyan-400 via-purple-500 to-pink-500"
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-white/60 text-xs tracking-widest uppercase font-medium">
          SPONSORED BY CD HARSHITH
        </p>
      </footer>
    </div>
  );
}

function Card({ icon, title, onClick, gradient }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-[2px] rounded-2xl bg-gradient-to-r ${gradient} w-full max-w-sm cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-shadow`}
      onClick={onClick}
    >
      <div className="bg-[#0B0F19]/95 backdrop-blur-xl rounded-2xl p-8 flex flex-col items-center justify-center gap-4 h-full">
        <div className="mb-2">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-white tracking-wider text-center">
          {title}
        </h2>
        <button className={`mt-2 px-6 py-2 rounded-lg border border-transparent bg-clip-padding relative overflow-hidden group`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-80`} />
          <div className="absolute inset-[1px] bg-[#0B0F19] rounded-md transition-colors group-hover:bg-transparent" />
          <span className="relative z-10 text-xs font-bold text-white tracking-wider group-hover:text-black transition-colors">GET STARTED</span>
        </button>
      </div>
    </motion.div>
  );
}
