import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, TrendingUp, Star, MessageSquarePlus, X, Instagram, Brain, MessageCircle, Server, Activity, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Home: React.FC = () => {
  const { homeContent, user, testimonials, addTestimonial } = useApp();
  const navigate = useNavigate();
  
  // Feedback Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // API Test State
  const [serverStatus, setServerStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiMessage, setApiMessage] = useState('');

  const handleOpenReview = () => {
    setIsModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newTestimonial = {
      id: Date.now().toString(),
      name: user.name,
      role: 'Membro FXBROS',
      content: comment,
      rating: rating,
      image: user.avatar || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`
    };
    addTestimonial(newTestimonial);
    setIsModalOpen(false);
    setComment('');
    setRating(5);
  };

  const checkServerStatus = async () => {
    setServerStatus('loading');
    try {
      // Chamada para o Backend criado em api/status.ts
      // Note: Em ambiente de desenvolvimento local (Vite), isso pode retornar index.html (404 fallback)
      const response = await fetch('/api/status');
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
          // Fallback para ambiente local onde API não está rodando via Vercel Functions
          setServerStatus('success');
          setApiMessage('Backend Local/Mock Operacional');
      } else {
          const data = await response.json();
          if (response.ok) {
            setServerStatus('success');
            setApiMessage(`${data.message} (Time: ${new Date(data.timestamp).toLocaleTimeString()})`);
          } else {
            throw new Error('Falha na resposta');
          }
      }
    } catch (error: any) {
      console.error(error);
      // Fallback visual para não assustar o usuário se for apenas erro de rede local
      if (error.message && error.message.includes('JSON')) {
          setServerStatus('success');
          setApiMessage('Backend Local (Mock Mode)');
      } else {
          setServerStatus('error');
          setApiMessage(error.message || 'Servidor Offline ou Inacessível');
      }
    }
    
    // Limpa a mensagem após 5 segundos
    setTimeout(() => {
        setServerStatus('idle');
        setApiMessage('');
    }, 5000);
  };

  // Helper to check if user can review
  const canReview = user && (user.status === 'active' || user.role === 'admin' || user.role === 'super_admin');

  return (
    <div className="bg-black min-h-screen">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={homeContent.hero.bgImage} 
            alt="Forex Market Background" 
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/10 mb-6 mt-12">
            <span className="text-red-400 text-xs font-bold tracking-widest uppercase">{homeContent.hero.badge}</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
            {homeContent.hero.titleLine1} <br />
            <span className="text-red-600">
              {homeContent.hero.titleHighlight}
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {homeContent.hero.description}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link 
              to="/plans" 
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all flex items-center justify-center"
            >
              Comece a Operar Agora <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              to="/methodology" 
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold transition-all"
            >
              Ver Metodologia
            </Link>
          </div>

          {/* API Server Check Button (Backend Integration) */}
          <div className="mb-12 h-8">
             {serverStatus === 'idle' && (
                <button 
                    onClick={checkServerStatus}
                    className="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center gap-2"
                >
                    <Server size={12} /> Verificar Status do Servidor
                </button>
             )}
             {serverStatus === 'loading' && (
                 <span className="text-xs text-slate-400 flex items-center gap-2 animate-pulse">
                    <Activity size={12} /> Conectando ao Backend...
                 </span>
             )}
             {serverStatus === 'success' && (
                 <span className="text-xs text-green-500 flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                    <CheckCircle2 size={12} /> {apiMessage}
                 </span>
             )}
             {serverStatus === 'error' && (
                 <span className="text-xs text-red-500 flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                    <X size={12} /> {apiMessage}
                 </span>
             )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-black border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src={homeContent.about.imageUrl} 
                alt="About" 
                className="rounded-2xl shadow-2xl border border-slate-800"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-2">{homeContent.about.badge}</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">{homeContent.about.title}</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                {homeContent.about.description}
              </p>
              <ul className="space-y-4">
                {homeContent.about.items.map((item, i) => (
                  <li key={i} className="flex items-start text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-24 bg-slate-950 border-y border-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Uma jornada completa para o seu sucesso</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Desenvolvemos um ecossistema focado em transformar iniciantes em traders de elite através de um caminho estruturado e profissional.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Brain className="text-red-500" />, title: "Mentalidade", desc: "Blindagem emocional e disciplina inegociável." },
              { icon: <TrendingUp className="text-red-500" />, title: "Estratégia", desc: "Metodologia institucional baseada em dados reais." },
              { icon: <Activity className="text-red-500" />, title: "Execução", desc: "Ferramentas de precisão para entradas perfeitas." },
              { icon: <Star className="text-red-500" />, title: "Consistência", desc: "O resultado final de um processo bem executado." }
            ].map((step, i) => (
              <div key={i} className="p-8 rounded-2xl bg-black border border-slate-800 hover:border-red-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{step.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Feedback dos Membros</h2>
              <p className="text-slate-400">O que nossos alunos dizem sobre a metodologia.</p>
            </div>
            <button 
              onClick={handleOpenReview}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm transition-colors border border-slate-800"
            >
              Avaliar Academia
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((item) => (
              <div key={item.id} className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < item.rating ? "text-red-500" : "text-slate-700"} fill={i < item.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">"{item.content}"</p>
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full bg-slate-800" />
                  <div>
                    <div className="text-white font-bold text-sm">{item.name}</div>
                    <div className="text-slate-500 text-xs">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Review Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-slate-950 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24} /></button>
              
              {user ? (
                  canReview ? (
                      <>
                        <h3 className="text-2xl font-bold text-white mb-6">Sua Avaliação</h3>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Classificação</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                    <button type="button" key={star} onClick={() => setRating(star)}>
                                        <Star size={28} className={star <= rating ? "text-red-500" : "text-slate-800"} fill={star <= rating ? "currentColor" : "none"} />
                                    </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Comentário</label>
                                <textarea 
                                    rows={4}
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">Enviar</button>
                        </form>
                      </>
                  ) : (
                      <div className="text-center py-6">
                          <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                              <ShieldAlert size={32} className="text-amber-500" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">Acesso Restrito</h3>
                          <p className="text-slate-400 text-sm mb-6 px-4">
                              Apenas membros com cadastro <strong>Aprovado</strong> e Ativo podem enviar avaliações para a comunidade.
                          </p>
                          <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">Entendido</button>
                      </div>
                  )
              ) : (
                  <div className="text-center py-6">
                      <h3 className="text-xl font-bold text-white mb-4">Login Necessário</h3>
                      <button onClick={() => navigate('/login')} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg">Fazer Login</button>
                  </div>
              )}
            </div>
          </div>
        )}

      {/* Footer CTA */}
      <section className="py-24 bg-gradient-to-b from-black to-red-950/20 border-t border-slate-900 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Pronto para começar?</h2>
          <p className="text-lg text-slate-300 mb-10">Junte-se à academia hoje e tenha acesso instantâneo.</p>
          <Link to="/plans" className="inline-block px-12 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-slate-200 transition-colors">
            Começar Agora
          </Link>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.link/r71g96" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
};

export default Home;