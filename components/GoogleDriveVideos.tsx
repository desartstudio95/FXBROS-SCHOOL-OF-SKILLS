import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, FileVideo, Loader2, AlertCircle, X } from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
}

const GoogleDriveVideos: React.FC = () => {
  const { workspaceSettings } = useApp();
  const [videos, setVideos] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<DriveFile | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { googleApiKey, googleDriveFolderId } = workspaceSettings;
      
      if (!googleApiKey || !googleDriveFolderId) {
         setError('Configurações não encontradas. O Administrador precisa configurar a Chave de API e o ID da pasta do Drive.');
         return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${googleDriveFolderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webViewLink,thumbnailLink)&key=${googleApiKey}`
        );
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          console.error("Drive API Error:", errorData);
          if (res.status === 403) {
             throw new Error('Falha de permissão. Verifique se a pasta do Google Drive está definida como "Qualquer pessoa com o link" e se a API Key tem as permissões corretas do Google Drive API.');
          } else if (res.status === 400) {
             throw new Error('Requisição inválida. Verifique se a API Key e o ID da pasta estão corretos.');
          }
          throw new Error('Falha ao carregar vídeos do banco de dados (verifique a permissão da pasta ou formato da Chave de API).');
        }
        const data = await res.json();
        
        // Formatos de video suportados
        const videoFiles = (data.files || []).filter((f: DriveFile) => f.mimeType.startsWith('video/'));
        setVideos(videoFiles);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Erro desconhecido ao carregar os vídeos.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [workspaceSettings]);

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 animate-fadeIn">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Vídeos Temporariamente Indisponíveis</h2>
        <p className="text-slate-400 mb-6 text-center max-w-sm">
          {error}
        </p>
      </div>
    );
  }

  if (selectedVideo) {
    return (
      <div className="animate-fadeIn p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <FileVideo className="text-blue-500" />
            {selectedVideo.name}
          </h2>
          <button 
            onClick={() => setSelectedVideo(null)}
            className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
            <span className="hidden sm:inline">Voltar para vídeos</span>
          </button>
        </div>
        
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative min-h-[50vh]">
          <iframe 
            src={`https://drive.google.com/file/d/${selectedVideo.id}/preview`} 
            className="w-full h-full absolute inset-0 border-0"
            allow="autoplay"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn p-4 flex flex-col h-full">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <FileVideo className="text-blue-500" />
        Conteúdo Exclusivo (Drive)
      </h2>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors group">
              <div 
                className="aspect-video bg-slate-800 relative cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {video.thumbnailLink ? (
                  <img src={video.thumbnailLink} alt={video.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileVideo size={32} className="text-slate-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Play size={20} className="text-black ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white text-sm line-clamp-2" title={video.name}>{video.name}</h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500 border border-slate-800 rounded-xl bg-slate-900/50">
          Nenhum vídeo disponível no momento.
        </div>
      )}
    </div>
  );
};

export default GoogleDriveVideos;
