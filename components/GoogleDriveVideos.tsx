import React, { useState, useEffect } from 'react';
import { googleSignIn, getAccessToken } from '../googleAuth';
import { Play, FileVideo, Loader2 } from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
}

const GoogleDriveVideos: React.FC = () => {
  const [videos, setVideos] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(true);

  const fetchVideos = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=mimeType contains 'video/' and trashed = false&fields=files(id,name,mimeType,webViewLink,thumbnailLink)",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        if (res.status === 401) setNeedsAuth(true);
        throw new Error('Failed to fetch videos');
      }
      const data = await res.json();
      setVideos(data.files || []);
      setNeedsAuth(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAccessToken().then((token) => {
      if (token) {
         fetchVideos(token);
      } else {
         setNeedsAuth(true);
      }
    });
  }, []);

  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        await fetchVideos(result.accessToken);
      }
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  if (needsAuth) {
    return (
      <div className="flex flex-col items-center py-20 animate-fadeIn">
        <FileVideo size={48} className="text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Conectar Google Drive</h2>
        <p className="text-slate-400 mb-6 text-center max-w-sm">
          Conecte sua conta do Google Drive para visualizar seus vídeos diretamente na plataforma.
        </p>
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-200 transition-colors"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5" />
          Conectar com Google
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn p-4">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <FileVideo className="text-blue-500" />
        Meus Vídeos do Drive
      </h2>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors group">
              <div className="aspect-video bg-slate-800 relative">
                {video.thumbnailLink ? (
                  <img src={video.thumbnailLink} alt={video.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileVideo size={32} className="text-slate-600" />
                  </div>
                )}
                <a
                  href={video.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Play size={20} className="text-black ml-1" />
                  </div>
                </a>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white text-sm line-clamp-2" title={video.name}>{video.name}</h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500 border border-slate-800 rounded-xl bg-slate-900/50">
          Nenhum vídeo encontrado no seu Google Drive.
        </div>
      )}
    </div>
  );
};

export default GoogleDriveVideos;
