import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Code, BarChart2, Lock, Loader2, User, Sparkles, Copy, Check, ChevronDown, Info, Trash2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useApp } from '../context/AppContext';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// --- Custom Code Block Component ---
const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';

  if (inline) {
    return (
      <code className="bg-slate-800 px-1.5 py-0.5 rounded text-red-400 font-mono text-sm" {...props}>
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-slate-800 bg-[#0d1117] group shadow-lg">
      {/* Code Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 select-none">
        <div className="flex items-center gap-3">
           <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
           </div>
           <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-bold">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md border border-slate-700"
          title="Copiar código"
        >
          {isCopied ? (
            <>
              <Check size={12} className="text-green-500" />
              <span className="text-green-500">Copiado</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code Content */}
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <code className={`!bg-transparent !p-0 font-mono text-sm leading-relaxed text-slate-300 ${className}`} {...props}>
          {children}
        </code>
      </div>
    </div>
  );
};

const STORAGE_KEY = 'fxbros_ai_history';

const AIAssistant: React.FC = () => {
  const { user, plans, dashboardContent } = useApp();
  const [input, setInput] = useState('');
  
  // Initialize messages from LocalStorage
  const [messages, setMessages] = useState<Message[]>(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              // Rehydrate Dates
              return parsed.map((m: any) => ({
                  ...m,
                  timestamp: new Date(m.timestamp)
              }));
          } catch (e) {
              console.error("Failed to load chat history", e);
          }
      }
      // Default Initial Message
      return [{
          id: '1',
          role: 'model',
          text: 'Olá. Sou a IA Oficial da FXBROS. Posso analisar cenários macroeconômicos ou, dependendo do seu plano, criar algoritmos de trading. Como posso ajudar hoje?',
          timestamp: new Date()
      }];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'analyst' | 'coder'>('analyst');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save to LocalStorage whenever messages change
  useEffect(() => {
      // Keep only the last 20 messages (approx 10 conversations) to manage storage size
      const historyToSave = messages.length > 20 ? messages.slice(messages.length - 20) : messages;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historyToSave));
  }, [messages]);

  // Check Plan Permissions
  // IDs defined in AppContext: 'starter', 'pro', 'professional', 'elite'
  const allowedCoderPlans = ['elite']; 
  if (dashboardContent.devQuantForPro) {
      allowedCoderPlans.push('pro');
      allowedCoderPlans.push('professional');
  }
  
  const hasCoderAccess = 
      user?.role === 'admin' || 
      user?.role === 'super_admin' || 
      (user?.planId && allowedCoderPlans.includes(user.planId));

  const handleModeSwitch = (newMode: 'analyst' | 'coder') => {
    if (newMode === 'coder' && !hasCoderAccess) {
        return; // Blocked logic
    }
    setMode(newMode);
  };

  const handleClearHistory = () => {
      if (window.confirm("Deseja limpar todo o histórico de conversa?")) {
          const resetMessage: Message = {
              id: Date.now().toString(),
              role: 'model',
              text: 'Histórico limpo. Como posso ajudar você agora?',
              timestamp: new Date()
          };
          setMessages([resetMessage]);
          localStorage.removeItem(STORAGE_KEY);
      }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Initialize Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let systemInstruction = "";
      let modelName = "gemini-3-flash-preview"; // Default fast model

      if (mode === 'analyst') {
          systemInstruction = `Você é o FXBROS Analyst, um especialista sênior em mercado Forex, Macroeconomia e Análise Técnica Institucional.
          
          Diretrizes:
          1. Analise notícias (NFP, FOMC, CPI, Taxas de Juros) explicando o impacto direto nos pares maiores (EURUSD, USDJPY, GBPUSD).
          2. Use terminologia institucional (Liquidez, Order Block, Fair Value Gap, Estrutura de Mercado).
          3. Seja direto, profissional e foque em probabilidade, nunca em certeza.
          4. Se o usuário perguntar sobre gerenciamento de risco, seja conservador e estrito.
          5. Mantenha as respostas concisas e formatadas com Markdown.`;
      } else {
          modelName = "gemini-3-pro-preview"; // Smarter model for code
          systemInstruction = `Você é o FXBROS Quant Dev, um especialista em programação para Mercado Financeiro.
          
          Diretrizes:
          1. Você é expert em MQL4 (MetaTrader 4), MQL5 (MetaTrader 5) e PineScript (TradingView).
          2. Quando solicitado um robô (EA) ou indicador, forneça o código COMPLETO, estruturado e SEM BUGS.
          3. Comente o código extensivamente para fins educacionais.
          4. Explique brevemente a lógica de entrada e saída do algoritmo antes de mostrar o código.
          5. Use blocos de código markdown para a saída (ex: \`\`\`mql5 ... \`\`\`).`;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: userMsg.text,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      const aiText = response.text || "Desculpe, não consegui processar essa solicitação no momento.";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Erro na IA:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Ocorreu um erro ao conectar com o servidor neural da FXBROS. Tente novamente em instantes.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Robot Icon URL
  const ROBOT_ICON_URL = "https://cdn-icons-png.flaticon.com/512/4712/4712109.png";

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Header / Mode Switcher */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${mode === 'analyst' ? 'bg-blue-600/20 text-blue-500' : 'bg-amber-600/20 text-amber-500'}`}>
                {mode === 'analyst' ? <BarChart2 size={24} /> : <Code size={24} />}
            </div>
            <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    FXBROS AI <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest">Beta</span>
                </h2>
                <p className="text-slate-500 text-xs">Inteligência Artificial Especializada</p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            {/* Clear History Button */}
            <button 
                onClick={handleClearHistory}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded-lg transition-colors"
                title="Limpar Histórico"
            >
                <Trash2 size={18} />
            </button>
            
            <div className="w-px h-6 bg-slate-800"></div>

            {/* Mode Selector UI */}
            <div className="flex bg-black p-1 rounded-xl border border-slate-800 relative">
                <button
                    onClick={() => handleModeSwitch('analyst')}
                    className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                        mode === 'analyst' 
                        ? 'bg-slate-800 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-slate-700' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                >
                    <Sparkles size={14} className={mode === 'analyst' ? "text-blue-400" : ""} /> 
                    Analista
                </button>
                
                <div className="relative group/coder">
                    <button
                        onClick={() => handleModeSwitch('coder')}
                        disabled={!hasCoderAccess}
                        className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                            mode === 'coder' 
                                ? 'bg-slate-800 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-slate-700' 
                                : !hasCoderAccess 
                                    ? 'opacity-50 cursor-not-allowed text-slate-600 grayscale' 
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        {hasCoderAccess ? (
                            <Code size={14} className={mode === 'coder' ? "text-amber-400" : ""} />
                        ) : (
                            <Lock size={12} className="text-slate-600" />
                        )} 
                        Dev Quant
                    </button>
                    
                    {/* Tooltip for locked state */}
                    {!hasCoderAccess && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-700 text-slate-300 text-[10px] p-3 rounded-xl opacity-0 group-hover/coder:opacity-100 transition-opacity pointer-events-none text-center shadow-2xl z-50">
                            <div className="flex flex-col items-center gap-1">
                                <Lock size={16} className="text-amber-500 mb-1" />
                                <span className="text-amber-500 font-bold uppercase tracking-wider">Recurso Bloqueado</span>
                                <span className="leading-relaxed">Disponível exclusivamente para membros {dashboardContent.devQuantForPro ? 'Pro e ' : ''}<strong>Elite</strong>.</span>
                            </div>
                            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-black/40">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${msg.role === 'user' ? 'bg-slate-800 border-2 border-slate-700' : 'bg-red-900/10 border border-red-900/30'}`}>
                    {msg.role === 'user' ? (
                         <img src={user?.avatar} alt="Me" className="w-full h-full object-cover" />
                    ) : (
                         <img src={ROBOT_ICON_URL} alt="FX AI" className="w-7 h-7 object-contain" />
                    )}
                </div>
                
                <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                        msg.role === 'user' 
                            ? 'bg-slate-800 text-white rounded-tr-none' 
                            : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                    }`}>
                        {msg.role === 'model' ? (
                            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
                                <ReactMarkdown
                                    components={{
                                        code: CodeBlock
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            msg.text
                        )}
                    </div>
                    <span className="text-[10px] text-slate-600 mt-2 px-1">
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
            </div>
        ))}
        {isLoading && (
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-red-900/10 border border-red-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src={ROBOT_ICON_URL} alt="FX AI" className="w-7 h-7 object-contain animate-pulse" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <Loader2 size={18} className="animate-spin text-red-500" />
                    <span className="text-xs text-slate-400 font-medium">Processando análise...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/80 backdrop-blur border-t border-slate-800">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'analyst' ? "Pergunte sobre NFP, FOMC ou análise de pares..." : "Descreva o robô ou indicador que deseja criar (ex: EA de média móvel)..."}
                className="w-full bg-black border border-slate-800 rounded-xl py-3.5 pl-4 pr-12 text-white placeholder-slate-600 focus:outline-none focus:border-red-600 transition-colors"
                disabled={isLoading}
            />
            <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-800 transition-all"
            >
                <Send size={18} />
            </button>
        </form>
        <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
                A IA pode cometer erros. Verifique informações críticas e teste códigos em conta DEMO.
                {mode === 'coder' && !hasCoderAccess && (
                    <span className="text-amber-500 ml-2 font-bold flex items-center gap-1">
                        <Lock size={8} /> Acesso Restrito ao Modo Quant
                    </span>
                )}
            </p>
        </div>
      </div>

    </div>
  );
};

export default AIAssistant;