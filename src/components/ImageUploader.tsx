import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageUploaderProps {
  onImageSelect: (base64: string, mimeType: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export function ImageUploader({ onImageSelect, selectedImage, onClear }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  }, [onImageSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [onImageSelect]);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelect(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {selectedImage ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden border border-white/10 bg-black/20 group"
          >
            <img 
              src={selectedImage} 
              alt="Selected for editing" 
              className="w-full h-32 object-contain bg-black/40" 
            />
            <button
              onClick={onClear}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                flex flex-col items-center justify-center w-full h-24
                border border-dashed rounded-xl cursor-pointer 
                transition-all duration-200 ease-in-out
                ${isDragging 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }
              `}
            >
              <div className="flex flex-col items-center justify-center py-4">
                <Upload className={`w-5 h-5 mb-2 ${isDragging ? 'text-emerald-400' : 'text-white/40'}`} />
                <p className="text-xs text-white/40">
                  <span className="font-semibold text-white/60">Upload</span> reference image
                </p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileInput}
              />
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
