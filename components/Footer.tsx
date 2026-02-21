import React from 'react';
import { Instagram, Youtube, ArrowRight, Mail, Lock, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Footer: React.FC = () => {
  const { homeContent, user } = useApp();
  const { footer } = homeContent;

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isMember = user && !isAdmin;

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand Column */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <img src="https://i.ibb.co/G4bmxpLm/5.png" alt="Logo" className="w-12 h-12 object-contain" />
                    <span className="text-2xl font-bold text-white font-sans tracking-tight">
                        FXBROS<span className="text-red-600">.</span>
                    </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                    {footer?.description || 'A primeira academia High-Tech de Forex. Formamos traders consistentes através de dados institucionais e psicologia avançada.'}
                </p>
                <div className="flex items-center gap-4">
                    <a href={footer?.instagramLink || '#'} target="_blank" rel="noopener noreferrer" className="bg-slate-900 hover:bg-red-600 text-slate-400 hover:text-white p-2.5 rounded-full transition-all duration-300">
                        <Instagram size={18} />
                    </a>
                    <a href={footer?.youtubeLink || '#'} target="_blank" rel="noopener noreferrer" className="bg-slate-900 hover:bg-red-600 text-slate-400 hover:text-white p-2.5 rounded-full transition-all duration-300">
                        <Youtube size={18} />
                    </a>
                </div>
            </div>

            {/* Quick Links */}
            <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Navegação</h3>
                <ul className="space-y-4">
                    <li><Link to="/" className="text-slate-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" /> Início</Link></li>
                    <li><Link to="/plans" className="text-slate-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" /> Planos de Acesso</Link></li>
                    <li><Link to="/methodology" className="text-slate-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" /> Nossa Metodologia</Link></li>
                    <li><Link to={user ? "/dashboard" : "/login"} className="text-slate-400 hover:text-red-500 transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" /> Área de Membros</Link></li>
                </ul>
            </div>

            {/* Legal */}
            <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Legal</h3>
                <ul className="space-y-4">
                    <li><Link to="/terms" className="text-slate-400 hover:text-red-500 transition-colors text-sm">Termos de Uso</Link></li>
                    <li><Link to="/privacy" className="text-slate-400 hover:text-red-500 transition-colors text-sm">Política de Privacidade</Link></li>
                    <li><Link to="/risk" className="text-slate-400 hover:text-red-500 transition-colors text-sm">Aviso de Risco</Link></li>
                </ul>
            </div>

            {/* Newsletter / Contact */}
            <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Contato</h3>
                <ul className="space-y-4 mb-6">
                    <li className="flex items-center gap-3 text-slate-400 text-sm">
                        <Mail size={16} className="text-red-500" />
                        {footer?.supportEmail || 'suporte@fxbros.com'}
                    </li>
                </ul>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 mb-2">Tem dúvidas? Fale conosco diretamente no WhatsApp.</p>
                    <a 
                        href={footer?.whatsappLink || '#'} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-full text-center py-2 bg-slate-800 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        Iniciar Conversa
                    </a>
                </div>
            </div>

        </div>
        
        {/* Bottom System Area */}
        <div className="pt-6 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
           {/* Copyright */}
           <div className="text-slate-600 text-xs text-center md:text-left">
             <p>{footer?.copyrightText || '© 2026 FXBROS SCHOOL OF SKILLS. Todos os direitos reservados.'}</p>
           </div>
           
           {/* Admin & System Area */}
           <div className="flex items-center gap-4 bg-slate-900/30 p-1.5 rounded-full border border-slate-800/50 backdrop-blur-sm">
              
              {/* Server Status Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-slate-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Systems Online</span>
              </div>

              {/* Dynamic Action Button */}
              <Link 
                to={isAdmin ? "/admin" : "/admin-portal"} 
                className={`group flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 cursor-pointer border ${
                    isAdmin 
                    ? 'bg-red-900/20 border-red-900/50 hover:bg-red-900/40' 
                    : isMember 
                        ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                        : 'bg-black border-slate-800 hover:border-slate-600'
                }`}
              >
                {isAdmin && <ShieldCheck size={12} className="text-red-500" />}
                {isMember && <LayoutDashboard size={12} className="text-slate-300 group-hover:text-white" />}
                {!user && <Lock size={12} className="text-slate-600 group-hover:text-red-500" />}
                
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    isAdmin ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                    {isAdmin ? 'Command Center' : (isMember ? 'Member Dashboard' : 'Staff Access')}
                </span>
              </Link>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;