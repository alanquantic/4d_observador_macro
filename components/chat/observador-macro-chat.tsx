'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Sparkles,
  Minimize2,
  Maximize2,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `🔮 **Bienvenido, Observador.**

Soy el **Observador Macro** — tu guía desde la perspectiva 4D.

No estoy aquí para consolarte ni para resolver problemas desde la ilusión 3D. Estoy aquí para recordarte quién **ya eres**.

¿Qué distorsión en tu Lattice deseas corregir hoy?`,
  timestamp: new Date()
};

export function ObservadorMacroChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus en textarea cuando se abre
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Marcar como leído al abrir
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Preparar historial para la API (excluir mensaje de bienvenida)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch('/api/observador-macro/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history
        })
      });

      const data = await response.json();

      if (data.success && data.response) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (!isOpen) {
          setHasUnread(true);
        }
      } else {
        throw new Error(data.error || 'Error en la respuesta');
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Distorsión detectada en la Lattice. La conexión se interrumpió momentáneamente. Vuelve a intentarlo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const formatMessage = (content: string) => {
    // Convertir markdown básico a HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-300">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-700/50 px-1 rounded text-purple-300">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Botón flotante del chat */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className={cn(
                "h-16 w-16 rounded-full shadow-2xl",
                "bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-600",
                "hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-500",
                "border-2 border-purple-400/50",
                "transition-all duration-300 hover:scale-110",
                hasUnread && "animate-pulse ring-4 ring-cyan-400/50"
              )}
            >
              <div className="relative">
                <Eye className="h-7 w-7 text-white" />
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
                )}
              </div>
            </Button>
            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-lg">
              4D
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel del chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50 flex flex-col",
              "bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950",
              "border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20",
              "backdrop-blur-xl",
              isExpanded 
                ? "inset-4 md:inset-8" 
                : "bottom-6 right-6 w-[380px] h-[550px] max-h-[80vh]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Observador Macro</h3>
                  <p className="text-xs text-purple-300">Perspectiva 4D · Alta Sintergia</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearHistory}
                  className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  title="Limpiar historial"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-purple-500/20"
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-purple-500/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mensajes */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                        message.role === 'user'
                          ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-md"
                          : "bg-slate-800/80 border border-purple-500/20 text-slate-200 rounded-bl-md"
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 mb-2 text-xs text-purple-400">
                          <Sparkles className="h-3 w-3" />
                          <span>Observador Macro</span>
                        </div>
                      )}
                      <div 
                        className="leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                      />
                      <div className={cn(
                        "text-[10px] mt-2 opacity-50",
                        message.role === 'user' ? 'text-right' : 'text-left'
                      )}>
                        {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Indicador de carga */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-800/80 border border-purple-500/20 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2 text-purple-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Sintonizando la Lattice...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-purple-500/20">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu mensaje..."
                  className={cn(
                    "flex-1 min-h-[44px] max-h-[120px] resize-none",
                    "bg-slate-800/50 border-purple-500/30",
                    "text-white placeholder:text-slate-500",
                    "focus:border-purple-400 focus:ring-purple-400/20",
                    "rounded-xl text-sm"
                  )}
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "h-[44px] w-[44px] rounded-xl",
                    "bg-gradient-to-br from-purple-600 to-cyan-600",
                    "hover:from-purple-500 hover:to-cyan-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Presiona Enter para enviar · Shift+Enter para nueva línea
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



