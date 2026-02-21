import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, Lock, Server, AlertTriangle, Loader2, ArrowRight, UserPlus, Eye, EyeOff, Key, Database, CheckCircle2, ArrowLeft, Mail, Activity } from 'lucide-react';

const AdminSetup: React.FC = () => {
  const { user, login, logout, checkSystemInitialized, registerSystemAdmin, resetPassword } = useApp();
  const navigate = useNavigate();

  // System State
  const [isAdminExists, setIsAdminExists] = useState<boolean | null>(null); // null = checking
  const [view, setView] = useState<'login' | 'setup' | 'forgot_password'>('login');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  // Check if system is initialized (Admin exists) with Timeout Fallback
  useEffect(() => {
    let mounted = true;
    
    const checkStatus = async () => {
      addLog('Iniciando handshake com storage local...');
      try {
        const exists = await checkSystemInitialized();

        if (mounted) {
            setIsAdminExists(exists);
            if (exists) {
                addLog('>> SISTEMA DETECTADO. MODO LOGIN ATIVADO.');
                setView('login');
            } else {
                addLog('>> NENHUM ADMINISTRADOR DETECTADO.');
                addLog('>> MODO DE CONFIGURAÇÃO (GENESIS) HABILITADO.');
                setView('setup');
            }
        }
      } catch (error) {
        console.error("Falha ao verificar status do sistema", error);
        if (mounted) {
            addLog('!! ERRO DE CONEXÃO. ASSUMINDO MODO LOGIN.');
            setIsAdminExists(true); 
            setView('login');
        } 
      }
    };
    checkStatus();
    return () => { mounted = false; };
  }, [checkSystemInitialized]);

  // Handle Redirects and Role Checks
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        addLog('>> CREDENCIAIS DE ADMIN VALIDADAS.');
        addLog('>> REDIRECIONANDO...');
        setTimeout(() => navigate('/admin'), 800);
      } else {
        // If a regular member tries to login here
        addLog('!! ACESSO NEGADO: PERFIL SEM PRIVILÉGIOS.');
        setErrorMsg('Esta conta não tem permissão de administrador.');
        logout(); // Force logout so they can try again or go to member area
      }
    }
  }, [user, navigate, logout]);

  const addLog = (msg: string) => {
      const timestamp = new Date().toLocaleTimeString('pt-BR', { hour12: false });
      setConsoleLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const toggleMode = (mode: 'login' | 'setup') => {
      setView(mode);
      setErrorMsg('');
      setSuccessMsg('');
      addLog(`>> COMANDO MANUAL: ALTERAR MODO PARA ${mode.toUpperCase()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (view === 'login') {
        // --- LOGIN FLOW ---
        addLog('Autenticando credenciais...');
        const error = await login(email, password);
        if (error) {
          if (error === 'unverified') {
            addLog(`!! CONTA NÃO VERIFICADA.`);
            setErrorMsg("Email não verificado. Verifique sua caixa de entrada.");
          } else {
            addLog(`!! FALHA DE AUTENTICAÇÃO: ${error}`);
            setErrorMsg(error);
          }
          setIsLoading(false);
        } else {
            addLog('>> TOKEN RECEBIDO. VERIFICANDO PERMISSÕES...');
            // Redirect happens in useEffect
        }
      } 
      else if (view === 'forgot_password') {
          // --- RECOVERY FLOW ---
          addLog('Solicitando token de redefinição...');
          const error = await resetPassword(email);
          if (error) {
              setErrorMsg(error);
              addLog(`!! ERRO NO ENVIO: ${error}`);
          } else {
              setSuccessMsg(`Link enviado para ${email}.`);
              addLog(`>> EMAIL DE RECUPERAÇÃO ENVIADO PARA ${email.toUpperCase()}`);
              setTimeout(() => setView('login'), 3000);
          }
          setIsLoading(false);
      }
      else if (view === 'setup') {
        // --- SETUP FLOW (CREATE FIRST ADMIN) ---
        
        // 1. Pre-Validation
        if (!name || !email || !password) {
            setErrorMsg("Preencha todos os campos obrigatórios.");
            setIsLoading(false);
            return;
        }

        // 2. Visual Connection Sequence
        addLog('Iniciando protocolo de criação de Super Admin...');
        await new Promise(r => setTimeout(r, 600));
        
        addLog('Criando registros locais...');
        
        // 3. Register Action
        const error = await registerSystemAdmin(email, password, name);
        
        if (error) {
            addLog(`!! ERRO NO REGISTRO: ${error}`);
            setErrorMsg(error);
            setIsLoading(false);
        } else {
            addLog('>> USUÁRIO ROOT CRIADO COM SUCESSO.');
            addLog('>> VERIFIQUE SEU EMAIL PARA ATIVAR A CONTA.');
            setSuccessMsg("Conta criada! Verifique seu email antes de fazer login.");
            setTimeout(() => setView('login'), 3000);
            setIsLoading(false);
        }
      }
    } catch (err: any) {
        setErrorMsg("Erro crítico do sistema: " + err.message);
        addLog(`!! EXCEPTION: ${err.message}`);
        setIsLoading(false);
    }
  };

  // Fallback for loading state that takes too long
  if (isAdminExists === null) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center font-mono">
              <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                      <div className="w-16 h-16 rounded-full border-2 border-slate-800 border-t-red-600 animate-spin"></div>
                      <Server size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                  <div className="text-center">
                      <p className="text-white font-bold tracking-widest text-sm mb-1">FXBROS SYSTEM</p>
                      <p className="text-slate-500 text-xs animate-pulse">Estabelecendo conexão segura...</p>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-red-900 selection:text-white">
       {/* High-Tech Background */}
       <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
            style={{ 
                backgroundImage: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(to right, #1f2937 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }}>
       </div>
       
       {/* Ambient Glow */}
       <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 transition-colors duration-1000 ${view === 'login' ? 'bg-red-900' : 'bg-blue-900'}`}></div>

       <div className="w-full max-w-[900px] grid md:grid-cols-2 gap-0 bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl relative z-10 overflow-hidden ring-1 ring-white/5">
            
            {/* LEFT SIDE: FORM */}
            <div className="p-8 md:p-10 flex flex-col justify-center relative border-r border-slate-800">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${view === 'setup' ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Secure Access Terminal</span>
                        </div>
                        {/* Manual Toggle Switch */}
                        <button 
                            onClick={() => toggleMode(view === 'login' ? 'setup' : 'login')}
                            className="text-[10px] text-slate-500 hover:text-white underline decoration-slate-700 hover:decoration-white transition-all cursor-pointer"
                        >
                            {view === 'login' ? 'Mudar para Setup' : 'Mudar para Login'}
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {view === 'setup' ? 'Configuração Inicial' : view === 'forgot_password' ? 'Recuperação' : 'Portal Admin'}
                    </h1>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        {view === 'setup' 
                            ? 'Crie a credencial "Super Admin" para obter controle total do sistema.'
                            : 'Autenticação requerida para acesso ao painel de controle.'}
                    </p>
                </div>

                {/* Feedback Messages */}
                {errorMsg && (
                    <div className="bg-red-950/30 border-l-2 border-red-500 p-3 mb-6 flex items-center gap-3 animate-fadeIn">
                        <AlertTriangle className="text-red-500 shrink-0" size={16} />
                        <p className="text-red-200 text-xs font-bold">{errorMsg}</p>
                    </div>
                )}

                {successMsg && (
                    <div className="bg-green-950/30 border-l-2 border-green-500 p-3 mb-6 flex items-center gap-3 animate-fadeIn">
                        <CheckCircle2 className="text-green-500 shrink-0" size={16} />
                        <p className="text-green-200 text-xs font-bold">{successMsg}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* --- SETUP MODE: EXTRA FIELDS --- */}
                    {view === 'setup' && (
                        <div className="space-y-5 animate-fadeIn">
                            <div className="relative group">
                                <UserPlus className="absolute left-3 top-3 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <input 
                                    type="text" 
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors placeholder-slate-700"
                                    placeholder="Nome do Super Admin"
                                />
                            </div>
                        </div>
                    )}

                    {/* --- COMMON INPUTS --- */}
                    <div className="relative group">
                        <Mail className={`absolute left-3 top-3 transition-colors ${view === 'setup' ? 'text-slate-600 group-focus-within:text-blue-500' : 'text-slate-600 group-focus-within:text-red-500'}`} size={16} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full bg-black border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none transition-colors placeholder-slate-700 ${view === 'setup' ? 'focus:border-blue-500' : 'focus:border-red-500'}`}
                            placeholder="admin@fxbros.com"
                        />
                    </div>

                    {view !== 'forgot_password' && (
                        <div className="relative group">
                            <Key className={`absolute left-3 top-3 transition-colors ${view === 'setup' ? 'text-slate-600 group-focus-within:text-blue-500' : 'text-slate-600 group-focus-within:text-red-500'}`} size={16} />
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full bg-black border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none transition-colors placeholder-slate-700 ${view === 'setup' ? 'focus:border-blue-500' : 'focus:border-red-500'}`}
                                placeholder="Senha Mestra"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-600 hover:text-white transition-colors">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    )}

                    {/* --- ACTION BUTTON --- */}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full py-3.5 mt-2 font-bold uppercase tracking-widest text-[10px] transition-all rounded-lg flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed
                            ${view === 'setup'
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)]'
                            }
                        `}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" /> 
                                <span>Processando...</span>
                            </>
                        ) : (
                            <>
                                {view === 'setup' ? <Database size={14} /> : view === 'forgot_password' ? <Mail size={14} /> : <Shield size={14} />}
                                <span>
                                    {view === 'setup' ? 'Inicializar Sistema' : view === 'forgot_password' ? 'Enviar Link' : 'Autenticar'}
                                </span>
                                {view !== 'forgot_password' && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                            </>
                        )}
                    </button>

                    {/* --- FOOTER ACTIONS --- */}
                    <div className="flex justify-between items-center pt-2">
                        {view === 'login' && (
                            <button 
                                type="button"
                                onClick={() => { setView('forgot_password'); setErrorMsg(''); setSuccessMsg(''); }}
                                className="text-[10px] text-slate-500 hover:text-white transition-colors ml-auto"
                            >
                                Perdeu o acesso?
                            </button>
                        )}
                        {view === 'forgot_password' && (
                            <button 
                                type="button"
                                onClick={() => { setView('login'); setErrorMsg(''); setSuccessMsg(''); }}
                                className="text-[10px] text-slate-500 hover:text-white transition-colors flex items-center gap-1 mx-auto"
                            >
                                <ArrowLeft size={10} /> Voltar para Login
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* RIGHT SIDE: TERMINAL / STATUS */}
            <div className="hidden md:flex flex-col bg-black p-8 relative overflow-hidden">
                {/* Scanlines Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-6 border-b border-slate-900 pb-4 relative z-30">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600/20 border border-red-600/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-600/20 border border-yellow-600/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-600/20 border border-green-600/50"></div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">System Logs</span>
                </div>

                {/* Console Output */}
                <div className="flex-1 font-mono text-[10px] space-y-2 text-slate-400 overflow-y-auto custom-scrollbar relative z-30 h-full">
                    <div className="text-green-500">root@fxbros:~$ initiate_admin_protocol</div>
                    {consoleLogs.map((log, index) => (
                        <div key={index} className="break-words border-l-2 border-slate-800 pl-2">
                            {log}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="animate-pulse text-blue-500">_</div>
                    )}
                    <div ref={logsEndRef} />
                </div>

                {/* Status Footer */}
                <div className="mt-6 pt-4 border-t border-slate-900 grid grid-cols-3 gap-2 relative z-30">
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                        <Database size={14} className="mx-auto text-slate-500 mb-1" />
                        <span className="block text-[9px] text-slate-600 uppercase">Storage</span>
                        <span className="block text-[9px] text-green-500 font-bold">Local</span>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                        <Shield size={14} className="mx-auto text-slate-500 mb-1" />
                        <span className="block text-[9px] text-slate-600 uppercase">Auth</span>
                        <span className="block text-[9px] text-green-500 font-bold">Simulated</span>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-800 text-center">
                        <Activity size={14} className="mx-auto text-slate-500 mb-1" />
                        <span className="block text-[9px] text-slate-600 uppercase">Latency</span>
                        <span className="block text-[9px] text-blue-500 font-bold">0ms</span>
                    </div>
                </div>
            </div>
       </div>
    </div>
  );
};

export default AdminSetup;