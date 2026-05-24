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
  Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Robots: React.FC = () => {
  const stats = [
    { label: "Volume Negociado", value: "500M+", suffix: "MT", icon: <BarChart3 className="w-6 h-6" /> },
    { label: "Precisão Média", value: "94", suffix: "%", icon: <Target className="w-6 h-6" /> },
    { label: "Usuários Ativos", value: "2.5", suffix: "k", icon: <Globe className="w-6 h-6" /> },
    { label: "Tempo de Resposta", value: "0.1", suffix: "ms", icon: <Zap className="w-6 h-6" /> }
  ];

  const robots = [
    {
      id: 'alpha-v1',
      name: 'Alpha Sentinel V1',
      type: 'Scalping HFT',
      description: 'Especializado em capturar micro-movimentos com execução em milissegundos.',
      price: '12.500 MT',
      features: ['Execução HFT', 'Trailing Stop Inteligente', 'Filtro de Notícias'],
      image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80&w=800',
      accent: 'blue'
    },
    {
      id: 'omega-trend',
      name: 'Omega Trend Hunter',
      type: 'Trend Following',
      description: 'Identifica e surfa grandes tendências institucionais com baixo drawdown.',
      price: '18.900 MT',
      features: ['Análise Multi-Timeframe', 'Gestão de Risco Dinâmica', 'Alertas Mobile'],
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
      accent: 'red'
    },
    {
      id: 'neural-grid',
      name: 'Neural Grid Master',
      type: 'Neural Network',
      description: 'Utiliza redes neurais para adaptar estratégias de grid em mercados laterais.',
      price: '25.000 MT',
      features: ['IA Adaptativa', 'Grid Não-Linear', 'Proteção de Capital'],
      image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd05a?auto=format&fit=crop&q=80&w=800',
      accent: 'purple'
    }
  ];

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-red-600/10 blur-[120px] rounded-full -z-10"></div>
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-8"
          >
            <Bot className="w-4 h-4 text-red-500" />
            <span className="text-red-400 text-xs font-bold tracking-widest uppercase">Tecnologia de Ponta</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tighter"
          >
            AUTOMAÇÃO <span className="text-red-600">INTELIGENTE</span><br />
            PARA O MERCADO FINANCEIRO
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Nossos robôs utilizam algoritmos avançados e inteligência artificial para executar operações com precisão cirúrgica, eliminando o fator emocional.
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
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
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
                    {stat.icon}
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
      <section className="py-24 bg-slate-950/50">
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
      <section className="py-24 px-4">
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
      <section className="py-24 relative overflow-hidden">
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
            <h2 className="text-3xl md:text-5xl font-black mb-6">PRONTO PARA O PRÓXIMO NÍVEL?</h2>
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
