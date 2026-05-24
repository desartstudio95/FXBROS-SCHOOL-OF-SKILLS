import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, BookOpen, ChevronRight, PlayCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VideoLesson } from '../types';

const Methodology: React.FC = () => {
  const { videos } = useApp();

  // Group videos by module
  const videosByModule = useMemo(() => {
    const groups: Record<string, VideoLesson[]> = {};
    videos.forEach(video => {
      if (!groups[video.module]) {
        groups[video.module] = [];
      }
      groups[video.module].push(video);
    });
    return groups;
  }, [videos]);

  return (
    <div className="min-h-screen bg-black pt-20 pb-20">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-red-600/30 bg-red-600/10">
                <span className="text-red-500 text-xs font-bold tracking-wider uppercase">Currículo Oficial</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Nossa Metodologia <span className="text-slate-600">Blindada</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                Explore a estrutura completa do treinamento que formou mais de 4.000 traders consistentes. 
                O acesso ao conteúdo detalhado é exclusivo para membros aprovados.
            </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid gap-8">
            {(Object.entries(videosByModule) as [string, VideoLesson[]][]).map(([moduleName, moduleVideos], index) => (
                <div key={moduleName} className="bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative group">
                    {/* Header do Módulo */}
                    <div className="p-6 md:p-8 border-b border-slate-800 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="text-red-600 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                                Módulo {index + 1}
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-white">{moduleName}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
                             <BookOpen size={16} /> {moduleVideos.length} Aulas
                        </div>
                    </div>

                    {/* Lista de Aulas (Bloqueadas) */}
                    <div className="divide-y divide-slate-800/50">
                        {moduleVideos.map((video) => (
                            <div key={video.id} className="p-4 md:p-6 flex items-center gap-4 md:gap-6 hover:bg-slate-900/30 transition-colors opacity-70 hover:opacity-100 group-hover:opacity-100">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-800 relative overflow-hidden">
                                     <div className="absolute inset-0 bg-red-900/10 z-0"></div>
                                     <Lock size={20} className="text-red-500 relative z-10" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-medium truncate pr-4">{video.title}</h3>
                                    <p className="text-slate-500 text-xs md:text-sm truncate">{video.description}</p>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-slate-600 text-xs uppercase font-bold tracking-wider">
                                    <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">Premium</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Overlay de Bloqueio (Visual Effect) */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            ))}
        </div>

        {/* CTA Final */}
        <div className="mt-16 bg-gradient-to-r from-red-900/20 to-black border border-red-900/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full"></div>
             <div className="relative z-10">
                <Star size={40} className="text-red-500 mx-auto mb-6 fill-red-500 animate-pulse" />
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Desbloqueie o Potencial Máximo</h2>
                <p className="text-slate-400 max-w-2xl mx-auto mb-8">
                    Tenha acesso imediato a todas as aulas, análises diárias e ao grupo de elite. 
                    Sua jornada para a consistência começa com a decisão certa.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/plans" className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2">
                        Ver Planos de Acesso <ChevronRight size={18} />
                    </Link>
                    <Link to="/login" className="px-8 py-4 bg-black border border-slate-700 hover:border-white text-white font-bold rounded-full transition-all">
                        Já sou Membro
                    </Link>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Methodology;