
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { getChatResponse } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

export const ChatBot: React.FC = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Reset welcome message when language changes or on first load
    if (!hasInitialized.current || messages.length === 0) {
       setMessages([{
         id: 'welcome',
         role: 'model',
         text: t('welcomeMsg'),
         timestamp: Date.now()
       }]);
       hasInitialized.current = true;
    }
  }, [t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await getChatResponse(history, userMsg.text, language);
      
      if (responseText) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: t('errorMsg'),
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-1.5 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold">{t('botTitle')}</h2>
            <p className="text-primary-100 text-xs md:text-sm opacity-90">{t('poweredBy')}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50 dark:bg-gray-900/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'user' 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' 
                : 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
            }`}>
              {msg.role === 'user' ? <User size={16} className="md:w-5 md:h-5" /> : <Bot size={16} className="md:w-5 md:h-5" />}
            </div>
            
            <div className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-xl md:rounded-2xl leading-relaxed shadow-sm text-sm md:text-base ${
              msg.role === 'user'
                ? 'bg-gray-800 dark:bg-gray-700 text-white rounded-tl-none rtl:rounded-tl-none rtl:rounded-tr-2xl ltr:rounded-tr-none ltr:rounded-tl-2xl'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-none rtl:rounded-tr-none rtl:rounded-tl-2xl ltr:rounded-tl-none ltr:rounded-tr-2xl border border-gray-100 dark:border-gray-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 md:gap-4 flex-row">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center animate-pulse">
              <Bot size={16} className="md:w-5 md:h-5" />
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-primary-500 md:w-[18px] md:h-[18px]" />
              <span className="text-gray-500 text-xs md:text-sm">{t('typing')}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            className="w-full rtl:pl-10 rtl:pr-4 ltr:pr-10 ltr:pl-4 py-3 md:py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white placeholder-gray-400 text-sm md:text-base"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute rtl:left-2 ltr:right-2 top-2 bottom-2 p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center aspect-square"
          >
            <Send size={18} className={`md:w-5 md:h-5 ${document.dir === 'rtl' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
