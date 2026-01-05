
import React, { useState, useRef, useEffect } from 'react';
import { getResearchAdvice } from '../services/geminiService';

interface Message {
  text: string;
  sender: 'ai' | 'user';
  timestamp: number;
}

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { text: "Assalomu alaykum! ARM AI yordamchisiman. Sizga qanday ko'mak bera olaman?", sender: 'ai', timestamp: Date.now() }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAsk = async (customQuery?: string) => {
    const textToAsk = customQuery || query;
    if (!textToAsk.trim()) return;

    const userMsg: Message = { text: textToAsk, sender: 'user', timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    const advice = await getResearchAdvice(textToAsk);
    
    const aiMsg: Message = { text: advice, sender: 'ai', timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const quickActions = [
    { label: "🕒 Ish vaqti", query: "ARM ish vaqtini aytib bering" },
    { label: "📚 Kitob qidirish", query: "Qanday qilib kitob qidirishim mumkin?" },
    { label: "🌍 Scopus/WoS", query: "Scopus va WoS haqida ma'lumot bering" },
    { label: "🏢 Bo'limlar", query: "ARMda qanday bo'limlar bor?" }
  ];

  return (
    <div className="fixed bottom-28 sm:bottom-6 right-6 z-[150] font-sans">
      {isOpen ? (
        <div className="bg-white w-[88vw] sm:w-[26rem] h-[65vh] sm:h-[34rem] shadow-2xl rounded-[2.5rem] border border-slate-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
          {/* Chat Header */}
          <div className="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
               </div>
               <div>
                 <h4 className="font-bold text-sm tracking-tight">AI Assistant</h4>
                 <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-indigo-100 opacity-80 uppercase tracking-widest">Onlayn</span>
                 </div>
               </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-3 bg-white/10 hover:bg-rose-500 rounded-xl transition-all active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-grow p-5 overflow-y-auto bg-slate-50 space-y-4 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[1.8rem] text-sm shadow-sm leading-relaxed ${
                  msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="px-5 py-3 bg-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
             {quickActions.map((action, i) => (
               <button 
                key={i}
                onClick={() => handleAsk(action.query)}
                className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 hover:text-indigo-600 active:bg-indigo-50 transition-all shadow-sm"
               >
                 {action.label}
               </button>
             ))}
          </div>

          {/* Chat Input */}
          <div className="p-5 bg-white border-t border-slate-100 flex gap-3 shrink-0">
            <input 
              type="text" 
              className="flex-grow bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              placeholder="Savolingizni yozing..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            />
            <button 
              onClick={() => handleAsk()}
              disabled={loading || !query.trim()}
              className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:bg-black transition-all active:scale-90 disabled:opacity-50"
            >
              <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-90 transition-all duration-300 relative border-4 border-white group"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black animate-bounce shadow-lg">1</span>
        </button>
      )}
    </div>
  );
};

export default AIChatbot;
