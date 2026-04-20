import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  ShieldCheck, 
  Award, 
  Globe, 
  TrendingUp,
  MessageSquare,
  Heart,
  Zap,
  ArrowRight,
  Instagram,
  Edit3
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const About: React.FC = () => {
  const { aboutPageContent, homeContent, user } = useApp();
  const navigate = useNavigate();

  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

  const values = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-red-500" />,
      title: "Transparência Total",
      description: "Acreditamos que a confiança é a base de qualquer relação no mercado financeiro. Nossos resultados são auditados e reais."
    },
    {
      icon: <Target className="w-8 h-8 text-red-500" />,
      title: "Foco em Resultados",
      description: "Não vendemos sonhos, vendemos metodologia. Nosso objetivo é transformar iniciantes em traders consistentes."
    },
    {
      icon: <Zap className="w-8 h-8 text-red-500" />,
      title: "Inovação Constante",
      description: "O mercado evolui e nós também. Utilizamos as tecnologias mais avançadas de IA e automação para estar à frente."
    }
  ];

  const stats = [
    { label: "Anos de Experiência", value: "8+" },
    { label: "Alunos Formados", value: "5.000+" },
    { label: "Países Alcançados", value: "15+" },
    { label: "Suporte 24/7", value: "100%" }
  ];

  return (
    <div className="bg-black min-h-screen text-white">
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <button 
            onClick={() => navigate('/admin-portal', { state: { targetSection: 'cms' } })}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-red-900/40 transition-all border border-red-500/20"
          >
            <Edit3 size={18} /> Editar Página
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[400px] bg-red-600/5 blur-[100px] rounded-full -z-10"></div>
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 mb-8"
          >
            <Users className="w-4 h-4 text-red-500" />
            <span className="text-red-400 text-xs font-bold tracking-widest uppercase">Nossa História</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tighter uppercase"
          >
            {aboutPageContent.hero.title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            {aboutPageContent.hero.description}
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase">{aboutPageContent.mission.title}</h2>
              <div className="w-20 h-1 bg-red-600 mb-8"></div>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                {aboutPageContent.mission.description}
              </p>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="text-3xl font-black text-white mb-1 group-hover:text-red-500 transition-colors">{stat.value}</div>
                      <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{stat.label}</div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-red-600 w-0 group-hover:w-full transition-all duration-500"></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                <img 
                  src={aboutPageContent.mission.image} 
                  alt="Nossa Missão" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 p-6 bg-red-600 rounded-2xl shadow-xl hidden md:block">
                <Award className="w-8 h-8 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase">Nossos Valores</h2>
            <p className="text-slate-400">Os pilares que sustentam cada decisão na FXBROS.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800 hover:border-red-600/30 transition-colors"
              >
                <div className="mb-6">{value.icon}</div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 bg-slate-950 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="order-2 lg:order-1"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 uppercase">A Mente por Trás do Método</h2>
                    <div className="prose prose-invert mb-8">
                        <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">
                            {homeContent.founder.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="text-white font-bold text-lg">{homeContent.founder.name}</div>
                            <div className="text-red-500 text-sm font-bold uppercase">{homeContent.founder.role}</div>
                        </div>
                        <a href="https://www.instagram.com/its_forever_in_profit/" target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <Instagram size={20} /> Instagram
                        </a>
                    </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="order-1 lg:order-2"
                >
                    <img 
                      src={homeContent.founder.imageUrl} 
                      alt="Founder" 
                      className="rounded-2xl shadow-2xl border border-slate-800 w-full aspect-[4/5] object-cover"
                      referrerPolicy="no-referrer"
                    />
                </motion.div>
            </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-black mb-8 uppercase">Faça parte da nossa história</h2>
          <p className="text-slate-400 text-lg mb-12">
            O próximo capítulo da sua jornada financeira começa aqui. Junte-se a milhares de traders que já mudaram de vida.
          </p>
          <Link 
            to="/plans" 
            className="inline-flex items-center gap-3 px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-full transition-all shadow-xl shadow-red-900/20 uppercase tracking-widest"
          >
            Quero começar agora <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
