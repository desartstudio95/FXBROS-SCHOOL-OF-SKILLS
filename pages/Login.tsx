import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, Mail, ArrowRight, AlertTriangle, User, CheckCircle2, Loader2, ArrowLeft, Eye, EyeOff, ChevronRight, ShieldCheck, MailCheck, Key } from 'lucide-react';

const Login: React.FC = () => {
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Views: login, register, verification_sent, forgot_password, reset_sent
  const [view, setView] = useState<'login' | 'register' | 'verification_sent' | 'forgot_password' | 'reset_sent'>('login');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Processando...');
  const [shakeError, setShakeError] = useState(false);
  
  const { login, register, resetPassword, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect logic
  useEffect(() => {
    if (user) {
      let target = '/welcome';
      if (user.role === 'admin' || user.role === 'super_admin') {
          target = '/admin';
      } 
      navigate(target);
    }
  }, [user, navigate]);

  // Payment Redirect Check
  useEffect(() => {
    if (location.state && location.state.paymentSuccess) {
      setView('register');
      setSuccessMsg(`Pagamento confirmado! Crie sua conta para finalizar.`);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle Error Animation
  const triggerError = (msg: string) => {
      setErrorMsg(msg);
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500); // Duration of shake animation
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
        if (view === 'register') {
            if (!name || !email || !password || !confirmPassword) {
                triggerError('Por favor, preencha todos os campos obrigatórios.');
                setIsLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                triggerError('As senhas não coincidem.');
                setIsLoading(false);
                return;
            }
            if (password.length < 6) {
                triggerError('A senha deve ter no mínimo 6 caracteres.');
                setIsLoading(false);
                return;
            }

            setLoadingText('Criando credenciais...');
            
            const error = await register(email, password, name);
            
            if (!error) {
                // Success - Verification sent
                setView('verification_sent');
            } else {
                if (error === "Usuário já existe. Deseja fazer login?") {
                    setView('login');
                    setPassword('');
                    triggerError("Usuário já existe. Deseja fazer login?");
                } else {
                    triggerError(error);
                }
            }
            setIsLoading(false);
            return;
        }
        
        if (view === 'login') {
            setLoadingText('Autenticando...');
            const error = await login(email, password);
            if (error) {
                if (error === 'unverified') {
                    // Specific status indicating user is valid but email is not verified
                    setView('verification_sent');
                } else {
                    triggerError(error);
                }
                setIsLoading(false);
            }
        }

        if (view === 'forgot_password') {
            if (!email) {
                triggerError('Insira seu e-mail para recuperar a senha.');
                setIsLoading(false);
                return;
            }

            setLoadingText('Enviando solicitação...');
            // Trigger Firebase Password Reset
            await resetPassword(email);
            // Always show sent screen for security (prevents email enumeration) or if successful
            setView('reset_sent');
            setIsLoading(false);
        }

    } catch (error) {
        triggerError('Erro inesperado. Tente novamente.');
        console.error(error);
        setIsLoading(false);
    }
  };

  const toggleView = (newView: 'login' | 'register') => {
      setView(newView);
      setErrorMsg('');
      setSuccessMsg('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
  };

  // --- Styles ---
  const inputBaseStyle = "w-full bg-slate-900/50 border rounded-xl py-4 pl-12 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 transition-all font-medium backdrop-blur-sm";
  const inputNormalStyle = "border-slate-800 focus:border-red-500 focus:ring-red-500/20";
  const inputErrorStyle = "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-900/10";

  // --- RENDER RESET SENT SCREEN ---
  if (view === 'reset_sent') {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
             {/* Background Ambience */}
             <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-80"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
            </div>
            
            <div className="w-full max-w-md bg-slate-950/60 backdrop-blur-2xl border border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl relative z-10 animate-fadeIn text-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                    <Key className="text-blue-500" size={36} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verifique seu E-mail</h2>
                <p className="text-slate-400 mb-8 leading-relaxed text-sm">
                    Enviamos um link de alteração de senha para<br/>
                    <strong className="text-white">{email}</strong>
                </p>
                <button
                    onClick={() => { setView('login'); setPassword(''); setErrorMsg(''); }}
                    className="w-full font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-800 hover:to-red-700 text-white shadow-red-900/30"
                >
                    Fazer Login <ArrowRight size={18} />
                </button>
            </div>
        </div>
      );
  }

  // --- RENDER VERIFICATION SCREEN ---
  if (view === 'verification_sent') {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
             {/* Background Ambience */}
             <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-80"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]"></div>
            </div>
            
            <div className="w-full max-w-md bg-slate-950/60 backdrop-blur-2xl border border-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl relative z-10 animate-fadeIn text-center">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    <MailCheck className="text-amber-500" size={36} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verifique seu E-mail</h2>
                <p className="text-slate-400 mb-8 leading-relaxed text-sm">
                    Enviamos um link de verificação para:<br/>
                    <strong className="text-white">{email}</strong>
                    <br/><br/>
                    Por favor, verifique sua caixa de entrada (e spam), clique no link e depois faça login.
                </p>
                <button
                    onClick={() => { setView('login'); setPassword(''); setErrorMsg(''); }}
                    className="w-full font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-800 hover:to-red-700 text-white shadow-red-900/30"
                >
                    Fazer Login <ArrowRight size={18} />
                </button>
            </div>
        </div>
      );
  }

  // --- RENDER MAIN FORM ---
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-red-500/30 selection:text-white">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
         {/* Red Spotlight */}
         <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[150px] animate-pulse"></div>
         {/* Blue/Slate Spotlight */}
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-slate-800/10 rounded-full blur-[120px]"></div>
      </div>

      <div className={`w-full max-w-[420px] relative z-10 transition-transform duration-300 ${shakeError ? 'animate-shake' : ''}`}>
        
        {/* Brand Header */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
                <img src="https://i.ibb.co/G4bmxpLm/5.png" alt="FXBROS" className="w-8 h-8 object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                <span className="text-2xl font-bold text-white tracking-tight">FXBROS<span className="text-red-600">.</span></span>
            </div>
        </div>

        {/* Glass Card */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
            
            {/* Top Gloss Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <h2 className="text-2xl font-bold text-white mb-1">
                {view === 'login' ? 'Bem-vindo de volta' : view === 'register' ? 'Criar nova conta' : 'Recuperar senha'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
                {view === 'login' ? 'Insira suas credenciais para acessar.' : view === 'register' ? 'Preencha os dados abaixo para começar.' : 'Enviaremos um link para seu e-mail.'}
            </p>

            {/* Notifications */}
            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-3 mb-6 animate-fadeIn">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-red-200 text-xs font-medium leading-relaxed">{errorMsg}</p>
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-start gap-3 mb-6 animate-fadeIn">
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-emerald-200 text-xs font-medium leading-relaxed">{successMsg}</p>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
            
            {view === 'register' && (
                <div className="animate-fadeIn space-y-4">
                    <div className="relative group">
                        <User className={`absolute left-4 top-4 transition-colors ${errorMsg && !name ? 'text-red-500' : 'text-slate-500 group-focus-within:text-white'}`} size={18} />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome Completo"
                            className={`${inputBaseStyle} ${errorMsg && !name ? inputErrorStyle : inputNormalStyle}`}
                        />
                    </div>
                </div>
            )}
            
            <div className="relative group">
                <Mail className={`absolute left-4 top-4 transition-colors ${errorMsg && !email ? 'text-red-500' : 'text-slate-500 group-focus-within:text-white'}`} size={18} />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Endereço de E-mail"
                    className={`${inputBaseStyle} ${errorMsg && !email ? inputErrorStyle : inputNormalStyle}`}
                />
            </div>
            
            {(view === 'login' || view === 'register') && (
                <div className="relative group animate-fadeIn">
                    <Lock className={`absolute left-4 top-4 transition-colors ${errorMsg && !password ? 'text-red-500' : 'text-slate-500 group-focus-within:text-white'}`} size={18} />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua Senha"
                        className={`${inputBaseStyle} pr-12 ${errorMsg && !password ? inputErrorStyle : inputNormalStyle}`}
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            )}

            {view === 'register' && (
                <div className="relative group animate-fadeIn">
                    <ShieldCheck className={`absolute left-4 top-4 transition-colors ${errorMsg && !confirmPassword ? 'text-red-500' : 'text-slate-500 group-focus-within:text-white'}`} size={18} />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar Senha"
                        className={`${inputBaseStyle} ${errorMsg && !confirmPassword ? inputErrorStyle : inputNormalStyle}`}
                    />
                </div>
            )}

            {view === 'login' && (
                <div className="flex justify-end">
                    <button 
                        type="button" 
                        onClick={() => { setView('forgot_password'); setErrorMsg(''); setSuccessMsg(''); }}
                        className="text-xs text-slate-400 hover:text-white transition-colors font-medium"
                    >
                        Esqueceu a senha?
                    </button>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 group mt-2 text-sm uppercase tracking-wide
                    ${view === 'forgot_password' 
                        ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-red-600 to-red-800 hover:to-red-700 text-white shadow-red-900/30 hover:shadow-red-900/50'
                    } disabled:opacity-70 disabled:cursor-not-allowed
                `}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>{loadingText}</span>
                    </>
                ) : (
                    <>
                        {view === 'register' ? 'Criar Conta' : view === 'forgot_password' ? 'Obter link de redefinição' : 'Entrar na Plataforma'}
                        {view !== 'forgot_password' && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </>
                )}
            </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center justify-center gap-3">
                {view !== 'forgot_password' ? (
                    <p className="text-slate-400 text-xs">
                        {view === 'login' ? 'Não tem uma conta?' : 'Já possui cadastro?'}
                        <button 
                            type="button"
                            onClick={() => toggleView(view === 'login' ? 'register' : 'login')}
                            className="ml-2 text-white font-bold hover:text-red-500 transition-colors inline-flex items-center gap-1 group"
                        >
                            {view === 'login' ? 'Cadastre-se' : 'Fazer Login'}
                            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </p>
                ) : (
                    <button 
                        type="button"
                        onClick={() => toggleView('login')}
                        className="text-slate-400 font-medium hover:text-white transition-colors flex items-center gap-2 text-xs"
                    >
                        <ArrowLeft size={14} /> Voltar para Login
                    </button>
                )}
            </div>
        </div>
        
        {/* Footer System Status */}
        <div className="mt-8 text-center opacity-60">
            <div className="flex items-center gap-2 justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]"></div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Firebase Auth Mode</span>
            </div>
        </div>
      </div>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
            animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default Login;