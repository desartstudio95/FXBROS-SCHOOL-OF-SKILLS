import React from 'react';
import { useApp } from '../context/AppContext';
import { Hammer, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Maintenance: React.FC = () => {
  const { globalSettings, homeContent } = useApp();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[120px] rounded-full -z-10"></div>
      
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-24 h-24 bg-red-600/10 border border-red-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Hammer className="text-red-600" size={48} />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
            Estamos em <span className="text-red-600">Manutenção</span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed max-w-lg mx-auto font-medium">
            {globalSettings.maintenanceMessage || 'Estamos trabalhando para trazer novidades e melhorar sua experiência. Voltamos em breve!'}
          </p>

          <div className="inline-flex items-center gap-6 px-8 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Siga-nos</span>
              <div className="flex items-center gap-4">
                <a 
                  href={homeContent.footer.instagramLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href={homeContent.footer.youtubeLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Youtube size={20} />
                </a>
                <a 
                  href={homeContent.footer.whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-800"></div>
            <div className="text-left">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Suporte</span>
              <a href={`mailto:${homeContent.footer.supportEmail}`} className="text-sm font-bold text-white hover:text-red-600 transition-colors">
                {homeContent.footer.supportEmail}
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">&copy; 2026 FXBROS SCHOOL OF SKILLS</p>
      </div>
    </div>
  );
};

export default Maintenance;
