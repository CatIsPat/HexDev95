import React from 'react';
import { Download } from 'lucide-react';
import { motion } from 'motion/react';

interface GeneratedImageProps {
  imageUrl: string;
  prompt: string;
  onClick: () => void;
}

export const GeneratedImage: React.FC<GeneratedImageProps> = ({ imageUrl, prompt, onClick }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative rounded-xl overflow-hidden bg-black/20 border border-white/5 cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square w-full relative">
        <img 
          src={imageUrl} 
          alt={prompt} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Download Button - Bottom Right */}
        <button 
          onClick={handleDownload}
          className="absolute bottom-3 right-3 p-2 bg-white/10 hover:bg-emerald-500 text-white rounded-full backdrop-blur-md transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 z-10"
          title="Download"
        >
          <Download size={18} />
        </button>
      </div>
    </motion.div>
  );
}
