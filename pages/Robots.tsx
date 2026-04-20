import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Lock,
  LineChart,
  Target,
  Rocket,
  Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Robots: React.FC = () => {
  const { robots, robotsPageContent, user } = useApp();
  const navigate = useNavigate();
  
  const statIcons = [
    <BarChart3 className="w-6 h-6" />,
    <Target className="w-6 h-6" />,
    <Globe className="w-6 h-6" />,
    <Zap className="w-6 h-6" />
  ];

  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden">
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <button 
            onClick={() => navigate('/admin-portal', { state: { targetSection: 'robots' } })}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-red-900/40 transition-all border border-red-500/20"
          >
            <Edit3 size={18} /> Editar Catálogo
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-red-600/10 blur-[120px] rounded-full -z-10"></div>
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-8"
          >
            <Bot className="w-4 h-4 text-red-500" />
            <span className="text-red-400 text-xs font-bold tracking-widest uppercase">{robotsPageContent.hero.badge}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tighter"
          >
            <span className="uppercase">{robotsPageContent.hero.title}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            {robotsPageContent.hero.description}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all flex items-center gap-2 group">
              Ver Catálogo <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold transition-all">
              Falar com Especialista
            </button>
          </motion.div>
        </div>
      </section>

      {/* Modern Animated Stats Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {robotsPageContent.stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl"></div>
                <div className="relative p-8 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    {statIcons[index % statIcons.length]}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
                      {stat.label}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <motion.span 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white"
                      >
                        {stat.value}
                      </motion.span>
                      <span className="text-red-600 text-2xl font-bold">{stat.suffix}</span>
                    </div>
                  </div>

                  {/* Decorative element */}
                  <div className="mt-6 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.8 + index * 0.1, ease: "easeOut" }}
                      className="h-full bg-red-600"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Robots Catalog */}
      <section className="py-16 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Escolha sua <span className="text-red-600">Arma</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Sistemas desenvolvidos para diferentes perfis de risco e objetivos financeiros.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {robots.map((robot, index) => (
              <motion.div
                key={robot.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group relative flex flex-col bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden hover:border-red-600/50 transition-colors"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={robot.image} 
                    alt={robot.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-600 text-[10px] font-bold uppercase tracking-widest">
                    {robot.type}
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-red-500 transition-colors">{robot.name}</h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                    {robot.description}
                  </p>

                  <div className="space-y-3 mb-8">
                    {robot.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-red-600" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-bold block">Investimento</span>
                      <span className="text-xl font-black text-white">{robot.price}</span>
                    </div>
                    <button className="p-3 bg-red-600 hover:bg-red-700 rounded-xl transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="text-xl font-bold">Segurança Institucional</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Algoritmos testados em ambientes de alta volatilidade com protocolos de segurança de nível bancário.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-500/20">
                <Cpu className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="text-xl font-bold">Latência Ultra-Baixa</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Hospedagem em servidores Equinix NY4 para garantir a execução mais rápida do mercado.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center border border-purple-500/20">
                <LineChart className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="text-xl font-bold">Análise em Tempo Real</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Monitoramento constante de múltiplos ativos e correlações para identificar as melhores oportunidades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600/5 -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-[40px] bg-gradient-to-b from-slate-900 to-black border border-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
            
            <Rocket className="w-12 h-12 text-red-600 mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase">Pronto para o próximo nível?</h2>
            <p className="text-slate-400 mb-10 text-lg">
              Não deixe suas decisões financeiras ao acaso. Automatize seu sucesso com a FXBROS.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-10 py-4 bg-white text-black font-black rounded-full hover:bg-slate-200 transition-colors uppercase tracking-wider">
                Adquirir Agora
              </button>
              <button className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-colors">
                Ver Documentação
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Robots;
