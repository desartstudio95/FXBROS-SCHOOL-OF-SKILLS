import React, { useState } from 'react';
import { FileText, Download, X, ExternalLink, Loader2 } from 'lucide-react';
import { ModuleResource } from '../types';

interface PdfViewerProps {
  resource: ModuleResource;
  onClose: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ resource, onClose }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fadeIn">
        {/* Overlay click to close */}
        <div className="absolute inset-0" onClick={onClose}></div>

        <div className="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-2xl border border-slate-800 flex flex-col shadow-2xl overflow-hidden relative z-10">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-black/50 backdrop-blur">
                <div className="flex items-center gap-4">
                    <div className="bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                        <FileText size={20} className="text-red-500"/>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base leading-tight">{resource.title}</h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">{resource.module}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all text-xs font-bold uppercase tracking-wide border border-transparent hover:border-slate-700" 
                        title="Abrir Externamente"
                    >
                        <ExternalLink size={16} /> <span className="hidden sm:inline">Abrir</span>
                    </a>
                    
                    <div className="w-px h-6 bg-slate-800 mx-2"></div>
                    
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-red-500 hover:text-white text-slate-400 rounded-lg transition-colors"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-slate-950 relative flex flex-col">
                 {loading && (
                     <div className="absolute inset-0 flex items-center justify-center z-0">
                         <div className="flex flex-col items-center gap-3">
                            <Loader2 size={32} className="text-red-600 animate-spin" />
                            <p className="text-slate-500 text-sm font-mono animate-pulse">Carregando Documento...</p>
                         </div>
                     </div>
                 )}
                 
                 <iframe 
                    src={resource.url} 
                    className="w-full h-full border-0 relative z-10"
                    title={resource.title}
                    onLoad={() => setLoading(false)}
                 >
                 </iframe>
                 
                 {/* Fallback if iframe fails or is empty (browser handles PDF usually, but if not supported) */}
                 <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <div className="text-center p-8">
                        <FileText size={64} className="mx-auto text-slate-800 mb-4" />
                        <p className="text-slate-500 mb-4">Se o documento não carregar automaticamente...</p>
                        <a href={resource.url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-red-600 transition-colors inline-flex items-center gap-2">
                            <Download size={18} /> Baixar PDF
                        </a>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default PdfViewer;