import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Image as ImageIcon, Type, Zap, Settings2, RefreshCw, Home as HomeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateImage, editImage, GenerateImageResult, AspectRatio } from '../services/gemini';
import { ImageUploader } from '../components/ImageUploader';
import { GeneratedImage } from '../components/GeneratedImage';
import { FullScreenViewer } from '../components/FullScreenViewer';

interface GeneratedItem {
  id: string;
  imageUrl: string;
  prompt: string;
}

type Mode = 'text-to-image' | 'image-to-image';

const ASPECT_RATIOS: { label: string; value: AspectRatio; width: string; height: string }[] = [
  { label: 'Square', value: '1:1', width: 'w-6', height: 'h-6' },
  { label: 'Portrait', value: '3:4', width: 'w-5', height: 'h-7' },
  { label: 'Landscape', value: '4:3', width: 'w-7', height: 'h-5' },
  { label: 'Tall', value: '9:16', width: 'w-4', height: 'h-8' },
  { label: 'Wide', value: '16:9', width: 'w-8', height: 'h-4' },
];

interface ImageGenerationProps {
  onBack: () => void;
}

export function ImageGeneration({ onBack }: ImageGenerationProps) {
  const [mode, setMode] = useState<Mode>('text-to-image');
  const [prompt, setPrompt] = useState('');
  const [activePrompt, setActivePrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/png');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [showOptions, setShowOptions] = useState(false);
  
  const [items, setItems] = useState<GeneratedItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);
  const [fullScreenItem, setFullScreenItem] = useState<GeneratedItem | null>(null);
  
  // Ref for the "load more" sentinel at the bottom
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Handle image selection
  const handleImageSelect = (base64: string, mimeType: string) => {
    setSelectedImage(base64);
    setSelectedMimeType(mimeType);
    setMode('image-to-image');
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    if (mode === 'image-to-image') setMode('text-to-image');
  };

  const handleReset = () => {
    setItems([]);
    setPrompt('');
    setActivePrompt('');
    setSelectedImage(null);
    setMode('text-to-image');
    setIsGenerating(false);
    setIsInfiniteLoading(false);
  };

  // Generation logic
  const generateBatch = async (promptText: string, isInitial: boolean = false) => {
    if (!promptText) return;
    
    const loadingStateSetter = isInitial ? setIsGenerating : setIsInfiniteLoading;
    loadingStateSetter(true);

    try {
      // Generate 2 images per batch to fill the row
      const promises = [1, 2].map(() => {
        if (mode === 'image-to-image' && selectedImage) {
          return editImage(selectedImage, promptText, selectedMimeType);
        } else {
          return generateImage(promptText, aspectRatio);
        }
      });

      const results = await Promise.all(promises);
      
      const newItems = results
        .filter(r => r.imageUrl)
        .map(r => ({
          id: Math.random().toString(36).substring(7),
          imageUrl: r.imageUrl!,
          prompt: promptText
        }));

      setItems(prev => isInitial ? newItems : [...prev, ...newItems]);
    } catch (err) {
      console.error("Generation failed", err);
    } finally {
      loadingStateSetter(false);
    }
  };

  // Initial submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setActivePrompt(prompt);
    setItems([]); // Clear previous
    generateBatch(prompt, true);
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && activePrompt && !isGenerating && !isInfiniteLoading) {
          generateBatch(activePrompt, false);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [activePrompt, isGenerating, isInfiniteLoading, mode, selectedImage, aspectRatio]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      {/* Fixed Home Button */}
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-50 p-3 bg-black/50 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-full backdrop-blur-md transition-all shadow-lg"
        title="Back to Home"
      >
        <HomeIcon size={20} />
      </button>

      {/* Fixed Refresh Button */}
      <button
        onClick={handleReset}
        className="fixed top-4 left-16 z-50 p-3 bg-black/50 hover:bg-red-500/20 text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/50 rounded-full backdrop-blur-md transition-all shadow-lg"
        title="Reset All"
      >
        <RefreshCw size={20} />
      </button>

      {/* Simplified Header */}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6 pl-24">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-black fill-current" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white/90">FlashGen</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
              <button
                onClick={() => setMode('text-to-image')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                  mode === 'text-to-image' 
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                <Type size={12} />
                Text
              </button>
              <button
                onClick={() => setMode('image-to-image')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                  mode === 'image-to-image' 
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                <ImageIcon size={12} />
                Image
              </button>
            </div>
            
            {/* Options Toggle */}
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`p-2 rounded-lg border transition-all ${
                showOptions 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-transparent border-transparent text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings2 size={18} />
            </button>
          </div>
        </div>

        {/* Options Panel */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#111] border border-white/10 rounded-xl p-4">
                <label className="text-xs text-white/50 font-medium block mb-3">Aspect Ratio</label>
                <div className="flex flex-wrap gap-3">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                        aspectRatio === ratio.value
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/80'
                      }`}
                    >
                      <div className={`${ratio.width} ${ratio.height} border-2 rounded-sm ${
                        aspectRatio === ratio.value ? 'border-emerald-400 bg-emerald-400/20' : 'border-current'
                      }`} />
                      <span className="text-[10px] font-medium">{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'image-to-image' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <ImageUploader 
                  onImageSelect={handleImageSelect}
                  selectedImage={selectedImage}
                  onClear={handleClearImage}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'image-to-image' ? "Describe changes (e.g., 'make it cyberpunk')..." : "Imagine something..."}
              className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            </button>
          </div>
        </form>
      </div>

      {/* Infinite Feed */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <GeneratedImage 
              key={item.id} 
              imageUrl={item.imageUrl} 
              prompt={item.prompt}
              onClick={() => setFullScreenItem(item)}
            />
          ))}
          
          {/* Glowing Loading Placeholders */}
          {(isGenerating || isInfiniteLoading) && (
            <>
              {[1, 2].map((i) => (
                <motion.div
                  key={`loading-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-square rounded-xl bg-black/20 border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse flex items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
                  <Loader2 className="text-emerald-500 animate-spin relative z-10" size={32} />
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Sentinel */}
        <div ref={loadMoreRef} className="h-10 w-full" />
        
        {!isGenerating && !isInfiniteLoading && items.length > 0 && (
          <div className="text-center py-8 text-white/20 text-xs">Scroll for more</div>
        )}
      </div>

      {/* Full Screen Viewer */}
      <AnimatePresence>
        {fullScreenItem && (
          <FullScreenViewer
            imageUrl={fullScreenItem.imageUrl}
            prompt={fullScreenItem.prompt}
            onClose={() => setFullScreenItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
