import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FullScreenViewerProps {
  imageUrl: string;
  prompt: string;
  onClose: () => void;
}

export function FullScreenViewer({ imageUrl, prompt, onClose }: FullScreenViewerProps) {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-md border-b border-white/10">
        <button 
          onClick={onClose}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center gap-2"
        >
          <ChevronLeft size={24} />
          <span className="text-sm font-medium">Back</span>
        </button>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleZoomOut}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-xs font-mono text-white/50 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button 
            onClick={handleZoomIn}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button 
            onClick={handleDownload}
            className="p-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full transition-colors"
            title="Download"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-4 relative">
        <motion.div
          drag
          dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
          style={{ scale }}
          className="relative cursor-grab active:cursor-grabbing"
        >
          <img 
            src={imageUrl} 
            alt={prompt} 
            className="max-w-full max-h-[80vh] object-contain shadow-2xl"
            draggable={false}
          />
        </motion.div>
      </div>

      {/* Footer/Prompt */}
      <div className="p-6 bg-black/50 backdrop-blur-md border-t border-white/10">
        <p className="text-white/80 text-center text-sm max-w-2xl mx-auto font-medium">
          {prompt}
        </p>
      </div>
    </motion.div>
  );
}
