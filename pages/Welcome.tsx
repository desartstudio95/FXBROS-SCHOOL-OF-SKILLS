import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, MessageCircle, AlertTriangle, Target, Server, RefreshCcw, Loader2, UserCheck, FileCheck, Clock, ShieldCheck, Zap, Lock, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { user, welcomeContent, refreshUserProfile } = useApp();
  const [isChecking, setIsChecking] = useState(false);

  // Redirect instantly if user is not logged in
  useEffect(() => {
    if (!user) {
        navigate('/login');
    }
  }, [user, navigate]);

  // Redirect blocked users to dashboard immediately (Dashboard handles blocked UI)
  useEffect(() => {
    if (user?.status === 'blocked') {
        navigate('/dashboard');
    }
  }, [user, navigate]);

  const isPending = user?.status === 'pending';
  const isActive = user?.status === 'active' || user?.role === 'admin' || user?.role === 'super_admin';
  const content = welcomeContent;

  const handleCheckStatus = async () => {
      setIsChecking(true);
      await refreshUserProfile();
      setTimeout(() => setIsChecking(false), 800); // Visual feedback delay
  };

  const handleAccessMemberArea = () => {
      navigate('/dashboard');
  };

  if (!user || user.status === 'blocked') return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600"/></div>;

  // --- COMPONENT: STATUS TIMELINE ---
  const StatusTimeline = () => (
      <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-red-600 before:via-slate-800 before:to-slate-800/0">
          
          {/* Step 1: Registration */}
          <div className="relative group">
              <div className="absolute -left-[2.15rem] top-1 w-6 h-6 rounded-full bg-black border-2 border-red-600 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                  <UserCheck size={12} className="text-red-500" />
              </div>
              <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl backdrop-blur-sm hover:bg-slate-900/60 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white text-sm tracking-wide">Cadastro Inicial</h3>
                      <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 font-bold tracking-wider">CONCLUÍDO</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">Seus dados foram criptografados e armazenados em nosso servidor seguro.</p>
              </div>
          </div>

          {/* Step 2: Verification */}
          <div className="relative group">
              <div className="absolute -left-[2.15rem] top-1 w-6 h-6 rounded-full bg-black border-2 border-red-600 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                  <FileCheck size={12} className="text-red-500" />
              </div>
              <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl backdrop-blur-sm hover:bg-slate-900/60 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white text-sm tracking-wide">Validação de Segurança</h3>
                      <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 font-bold tracking-wider">CONCLUÍDO</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">Email verificado e autenticação de dois fatores configurada.</p>
              </div>
          </div>

          {/* Step 3: Admin Approval */}
          <div className="relative group">
              <div className={`absolute -left-[2.15rem] top-1 w-6 h-6 rounded-full bg-black border-2 flex items-center justify-center z-10 transition-all ${isActive ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'border-amber-500 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.4)]'}`}>
                  {isActive ? <CheckCircle2 size={12} className="text-green-500" /> : <Clock size={12} className="text-amber-500" />}
              </div>
              <div className={`p-5 rounded-2xl border backdrop-blur-sm transition-all ${isActive ? 'bg-green-950/10 border-green-500/30' : 'bg-amber-950/10 border-amber-500/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-bold text-sm tracking-wide ${isActive ? 'text-green-400' : 'text-white'}`}>Análise Institucional</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold tracking-wider ${isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {isActive ? 'APROVADO' : 'EM ANÁLISE'}
                      </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                      {isActive 
                        ? 'Sua conta foi aprovada pela equipe de compliance. Bem-vindo à elite.' 
                        : 'Nossa equipe está validando seu perfil. Este processo garante a exclusividade da comunidade.'}
                  </p>
              </div>
          </div>

      </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden custom-scrollbar selection:bg-red-900 selection:text-white">
      {/* Premium Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.15),transparent_50%)]"></div>
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
         <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-16 animate-fadeIn">
            <div className="relative mb-6 group cursor-default">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-20 h-20 bg-black rounded-2xl border border-slate-800 flex items-center justify-center shadow-2xl">
                    <img src="https://i.ibb.co/G4bmxpLm/5.png" alt="Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
               FXBROS<span className="text-red-600">.</span>
            </h1>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">
                <span>System Status</span>
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <span>{user.id.substring(0, 8).toUpperCase()}</span>
            </div>
        </div>

        {/* PENDING / VERIFICATION VIEW */}
        {isPending ? (
            <div className="grid lg:grid-cols-12 gap-8 items-start animate-slideUp">
                
                {/* Main Status Card */}
                <div className="lg:col-span-7 bg-slate-950/50 border border-slate-800/50 p-8 md:p-10 rounded-[2rem] backdrop-blur-xl relative overflow-hidden shadow-2xl">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-6 mb-10">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-800 overflow-hidden shrink-0 shadow-xl">
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover grayscale opacity-80" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-1.5 rounded-full border-4 border-slate-950">
                                    <Clock size={14} strokeWidth={3} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                    </span>
                                    <span className="text-xs text-amber-500 font-bold uppercase tracking-widest">Verificação em Andamento</span>
                                </div>
                            </div>
                        </div>

                        <StatusTimeline />

                        <div className="mt-10 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleCheckStatus}
                                disabled={isChecking}
                                className="flex-1 px-6 py-4 bg-white hover:bg-slate-200 text-black rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
                            >
                                <RefreshCcw size={18} className={`transition-transform ${isChecking ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                                {isChecking ? 'Sincronizando...' : 'Atualizar Status'}
                            </button>
                            <button 
                                onClick={() => navigate('/')} 
                                className="px-6 py-4 bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl font-bold transition-colors border border-slate-800 hover:border-slate-700"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-5 space-y-6">
                    {/* System Log Simulation */}
                    <div className="bg-black border border-slate-800 rounded-2xl p-6 font-mono text-[10px] text-slate-400 h-64 overflow-hidden relative shadow-xl group hover:border-slate-700 transition-colors">
                        <div className="absolute top-4 right-4 flex gap-1.5 opacity-50">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                        <div className="space-y-2 mt-2 opacity-80">
                            <p className="text-slate-500"># SYSTEM INITIALIZATION SEQUENCE</p>
                            <p>&gt; Establishing secure connection...</p>
                            <p className="text-green-500">&gt; Connection Established (TLS 1.3)</p>
                            <p>&gt; Verifying User Hash: <span className="text-blue-400">{user.id.substring(0,12)}...</span></p>
                            <p>&gt; Fetching Membership Data... [STARTER_PLAN]</p>
                            <p>&gt; Validating Payment Gateway... <span className="text-green-500">OK</span></p>
                            <p>&gt; Checking Blacklist Databases... <span className="text-green-500">CLEAN</span></p>
                            <p>&gt; Awaiting ADMIN_APPROVAL_TOKEN...</p>
                            <p className="animate-pulse text-red-500">&gt; _</p>
                        </div>
                        
                        {/* Scanline Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10px] w-full animate-scan pointer-events-none"></div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-black border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px]"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <ShieldCheck className="text-slate-300" size={18} />
                                </div>
                                <h3 className="font-bold text-white text-sm tracking-wide">Protocolo de Segurança</h3>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                Para manter a integridade do nosso ecossistema, cada novo membro passa por uma verificação manual rigorosa. Isso garante que apenas traders comprometidos tenham acesso às nossas ferramentas proprietárias.
                            </p>
                            <div className="flex items-center justify-between text-xs bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                                <span className="text-slate-500">Tempo estimado:</span>
                                <span className="text-white font-bold font-mono">~45 min</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            // APPROVED / ACTIVE VIEW
            <div className="animate-slideUp max-w-5xl mx-auto">
                 {/* Hero Card */}
                 <div className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl transition-all hover:shadow-red-900/10 hover:border-slate-700">
                    {/* Dynamic Background */}
                    <div className="absolute inset-0">
                        <img 
                            src="https://images.unsplash.com/photo-1611974765215-0dd5963263c4?q=80&w=2000&auto=format&fit=crop" 
                            alt="Background" 
                            className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-[2s]" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    </div>
                    
                    <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                                <CheckCircle2 size={14} /> Acesso Liberado
                            </div>
                            
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                                Bem-vindo à <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Elite, {user.name.split(' ')[0]}.</span>
                            </h1>
                            <p className="text-lg text-slate-400 max-w-xl leading-relaxed mb-8">
                                Sua conta foi aprovada. Você agora tem acesso irrestrito ao nosso ecossistema de trading institucional, ferramentas de IA e comunidade exclusiva.
                            </p>

                            <button 
                                onClick={handleAccessMemberArea}
                                className="px-10 py-4 bg-white text-black hover:bg-slate-200 rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] flex items-center justify-center gap-3 md:inline-flex group/btn"
                            >
                                Acessar Dashboard <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Stats / Badges */}
                        <div className="flex gap-4 md:flex-col">
                            <div className="w-24 h-24 rounded-2xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-md flex flex-col items-center justify-center p-2 text-center">
                                <Zap size={24} className="text-yellow-500 mb-2" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase">Acesso Total</span>
                            </div>
                            <div className="w-24 h-24 rounded-2xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-md flex flex-col items-center justify-center p-2 text-center">
                                <ShieldCheck size={24} className="text-green-500 mb-2" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase">Verificado</span>
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                     {/* Next Steps Card */}
                     <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl hover:border-slate-700 transition-colors group">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <div className="p-2 bg-red-900/20 rounded-lg text-red-500 group-hover:text-red-400 transition-colors">
                                <Target size={20} />
                            </div>
                            Próximos Passos
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "Acesse o Módulo 'Fundamentos' no Dashboard.",
                                "Configure seu perfil e preferências de notificação.",
                                "Entre no Grupo VIP do WhatsApp para networking."
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-4 text-slate-400 text-sm group/item">
                                    <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 group-hover/item:text-white group-hover/item:border-slate-600 transition-all shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="group-hover/item:text-slate-300 transition-colors">{step}</span>
                                </li>
                            ))}
                        </ul>
                     </div>

                     {/* Community Card */}
                     <div className="bg-gradient-to-br from-slate-900 to-black border border-slate-800 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-green-900/10 rounded-full blur-[60px] group-hover:bg-green-900/20 transition-colors"></div>
                        
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                            <div className="p-2 bg-green-900/20 rounded-lg text-green-500">
                                <MessageCircle size={20} />
                            </div>
                            Comunidade VIP
                        </h3>
                        
                        <div className="relative z-10">
                            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 mb-6">
                                <div className="flex items-center gap-2 mb-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
                                    <AlertTriangle size={12} /> Regras da Casa
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {content.terms.text}
                                </p>
                            </div>

                            <a 
                                href={content.whatsappLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-green-900/20 hover:shadow-green-900/40 group/link"
                            >
                                <MessageCircle size={18} /> Entrar no Grupo
                                <ChevronRight size={16} className="opacity-70 group-hover/link:translate-x-1 transition-transform" />
                            </a>
                        </div>
                     </div>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Welcome;