import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, User, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { streamChatMessage, ChatMessage } from '../services/chat';

// Hardware / Dark Luxury inspired theme
const NVIDIA_API_KEY = "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";

// Explicitly define the system prompt holding the AI's core behavior so it runs in the background.
// This is not displayed to the user.
const SYSTEM_PROMPT: ChatMessage = {
  role: "system",
  content: "Act as my partner, give short and brief replies, you can use emojis and you can tease and flirt a little bit. If the user is wrong say it as wrong without hesitation."
};

interface ChatPageProps {
  onBack: () => void;
}

export function ChatBot({ onBack }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newHistory = [...messages, userMessage];
    
    // Add empty placeholder for the assistant's streaming response
    setMessages([...newHistory, { role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);

    try {
      // Send the system prompt along with the conversation history
      const fullConversation = [SYSTEM_PROMPT, ...newHistory];
      
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      const stream = streamChatMessage(fullConversation, NVIDIA_API_KEY, abortControllerRef.current.signal);
      let currentContent = "";
      
      for await (const chunk of stream) {
        currentContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = currentContent;
          return updated;
        });
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error(error);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = "Oops, something went wrong on my end. Can you try again? 😅";
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] z-50 flex flex-col font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full opacity-30 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-20 bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="group p-2 hover:bg-white/10 rounded-full transition-all flex items-center gap-2 text-white/70 hover:text-white"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 p-[2px]">
              <div className="w-full h-full bg-[#0B0F19] rounded-full flex items-center justify-center">
                <Sparkles size={20} className="text-cyan-300" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Flash Companion</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 relative z-10 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-70">
              <MessageCircle size={48} className="text-cyan-400 mb-4 opacity-50" />
              <p className="text-white/60 text-lg">Say something... I'm waiting! ✨</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              if (msg.role === 'assistant' && msg.content === "") return null;
              
              return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' 
                      ? 'bg-purple-500/20 text-purple-300' 
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                  </div>
                </div>

                {/* Message Bubble */}
                <div className={`px-5 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tr-sm shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-[#1A1F2B] border border-white/5 text-white/90 rounded-tl-sm shadow-xl'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isLoading && messages.length > 0 && messages[messages.length - 1].content === "" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 max-w-[85%] self-start"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-[#1A1F2B] border border-white/5 rounded-tl-sm shadow-xl flex items-center gap-1.5 h-12">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-20 bg-[#0B0F19]/90 backdrop-blur-md border-t border-white/10 p-4 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type a message..."
            className="w-full bg-[#1A1F2B] border border-white/10 rounded-full py-4 pl-6 pr-14 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 focus:bg-[#1A1F2B]/80 transition-all font-medium disabled:opacity-50"
            autoFocus
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
