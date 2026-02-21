import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipBack, SkipForward, AlertCircle, Download } from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
  useNativeControls?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ 
  src, 
  poster, 
  title, 
  onEnded, 
  autoPlay = false,
  useNativeControls = false,
  className = '',
  style = {}
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [errorState, setErrorState] = useState<{ hasError: boolean, message: string }>({ hasError: false, message: '' });

  // Helper to normalize video URLs
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube
    if (url.includes('youtube.com/watch')) {
      const videoId = new URLSearchParams(new URL(url).search).get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes('youtube.com/embed/')) {
        return url;
    }

    // Vimeo
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    if (url.includes('player.vimeo.com/video/')) {
        return url;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(src);
  const isEmbed = !!embedUrl;
  const finalSrc = isEmbed ? embedUrl : src;

  // Reset states when src changes
  useEffect(() => {
    console.log(`[CustomVideoPlayer] Source changed:`, { src, finalSrc, isEmbed });
    setErrorState({ hasError: false, message: '' });
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsBuffering(false);
  }, [src, finalSrc, isEmbed]);

  useEffect(() => {
    if (autoPlay && videoRef.current && !isEmbed && !errorState.hasError && finalSrc) {
        console.log(`[CustomVideoPlayer] Attempting autoplay for:`, finalSrc);
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log(`[CustomVideoPlayer] Autoplay started successfully`);
                    setIsPlaying(true);
                })
                .catch((error) => {
                    console.warn(`[CustomVideoPlayer] Autoplay prevented:`, error);
                    // Autoplay was prevented. This is expected in some browsers.
                    // We don't want to log this as an error.
                    setIsPlaying(false);
                });
        }
    }
  }, [finalSrc, autoPlay, isEmbed, errorState.hasError]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // --- VALIDATION ---
  if (!src) {
      return (
          <div className={`relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-800/50 flex flex-col items-center justify-center p-6 text-center ${className}`} style={style}>
              <AlertCircle size={48} className="text-slate-500 mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Vídeo indisponível</h3>
              <p className="text-slate-400 text-sm">A fonte do vídeo não foi fornecida.</p>
          </div>
      );
  }

  // --- IFRAME RENDER FOR EMBEDS ---
  if (isEmbed && finalSrc) {
      return (
          <div 
            className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-800/50 group ${className}`} 
            style={style}
            onContextMenu={(e) => e.preventDefault()}
          >
              <iframe 
                  src={`${finalSrc}${finalSrc.includes('?') ? '&' : '?'}autoplay=${autoPlay ? 1 : 0}&modestbranding=1&rel=0&showinfo=0`} 
                  className="w-full h-full border-0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  title={title || 'Video Player'}
              />
          </div>
      );
  }

  // --- ERROR STATE ---
  if (errorState.hasError) {
      return (
          <div className={`relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-800/50 flex flex-col items-center justify-center p-6 text-center ${className}`} style={style}>
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Erro ao reproduzir vídeo</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-md">
                  {errorState.message || "O formato do arquivo não é suportado ou o link expirou."}
              </p>
              <a 
                  href={src} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
              >
                  <Download size={16} /> Tentar Baixar Arquivo
              </a>
          </div>
      );
  }

  // --- CUSTOM PLAYER LOGIC ---

  const formatTime = (time: number) => {
    if (!Number.isFinite(time) || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      
      setCurrentTime(current);
      
      if (Number.isFinite(total) && total > 0) {
          setDuration(total);
          setProgress((current / total) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
      if (videoRef.current) {
          const total = videoRef.current.duration;
          if (Number.isFinite(total)) {
              setDuration(total);
          }
      }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const total = videoRef.current.duration;
      
      if (Number.isFinite(total) && total > 0) {
          const newTime = pos * total;
          if (Number.isFinite(newTime)) {
             videoRef.current.currentTime = newTime;
          }
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      videoRef.current.muted = newMutedState;
      if (!newMutedState && volume === 0) {
          setVolume(0.5);
          videoRef.current.volume = 0.5;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    if (useNativeControls) return;
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const skipTime = (seconds: number) => {
      if (videoRef.current && Number.isFinite(videoRef.current.duration)) {
          const newTime = videoRef.current.currentTime + seconds;
          // Clamp time between 0 and duration
          videoRef.current.currentTime = Math.min(Math.max(newTime, 0), videoRef.current.duration);
      }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden group select-none shadow-2xl ring-1 ring-slate-800/50 ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !useNativeControls && isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={finalSrc || ''}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={useNativeControls ? undefined : togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => { setIsPlaying(false); if(onEnded) onEnded(); }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onError={(e) => {
            const error = e.currentTarget.error;
            console.error(`[CustomVideoPlayer] Video Error:`, error);
            console.error(`[CustomVideoPlayer] Network State:`, e.currentTarget.networkState);
            
            let message = "Erro desconhecido ao reproduzir vídeo.";
            if (error) {
                switch (error.code) {
                    case 1: // MEDIA_ERR_ABORTED
                        message = "O carregamento do vídeo foi abortado.";
                        break;
                    case 2: // MEDIA_ERR_NETWORK
                        message = "Erro de rede. Verifique sua conexão.";
                        break;
                    case 3: // MEDIA_ERR_DECODE
                        message = "Erro ao decodificar o vídeo. O formato pode estar corrompido.";
                        break;
                    case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
                        message = "Formato não suportado ou arquivo não encontrado (404/403).";
                        break;
                }
            }
            setErrorState({ hasError: true, message });
        }}
        playsInline
        preload="metadata"
        controls={useNativeControls}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Custom UI Elements - Only show if NOT using native controls */}
      {!useNativeControls && (
        <>
          {/* Buffering Spinner (Discreet & Premium) */}
          {isBuffering && !errorState.hasError && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-black/10 backdrop-blur-[2px]">
                  <div className="relative w-10 h-10">
                      <div className="absolute inset-0 border-2 border-slate-700/50 rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
              </div>
          )}

          {/* Center Play Button Overlay */}
          {!isPlaying && !isBuffering && !errorState.hasError && (
            <div 
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-opacity duration-300 z-10"
                onClick={togglePlay}
            >
              <div className="w-20 h-20 bg-red-600/90 rounded-full flex items-center justify-center pl-2 shadow-[0_0_30px_rgba(220,38,38,0.4)] transform group-hover:scale-110 transition-transform duration-300">
                <Play size={32} fill="white" className="text-white" />
              </div>
            </div>
          )}

          {/* Title Overlay (Top) */}
          <div className={`absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              <h3 className="text-white font-bold text-lg drop-shadow-md">{title || 'Video Player'}</h3>
          </div>

          {/* Controls Bar (Bottom) */}
          <div className={`absolute bottom-0 left-0 w-full px-4 pb-4 pt-12 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* Progress Bar */}
            <div 
                className="relative w-full h-1.5 bg-slate-700/50 rounded-full cursor-pointer mb-4 group/progress hover:h-2.5 transition-all"
                ref={progressRef}
                onClick={handleProgressClick}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-red-600 rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="text-white hover:text-red-500 transition-colors">
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                
                <div className="flex items-center gap-2 text-slate-400">
                    <button onClick={() => skipTime(-10)} className="hover:text-white transition-colors"><SkipBack size={20} /></button>
                    <button onClick={() => skipTime(10)} className="hover:text-white transition-colors"><SkipForward size={20} /></button>
                </div>

                <div className="group/volume flex items-center gap-2">
                  <button onClick={toggleMute} className="text-white hover:text-red-500 transition-colors">
                    {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
                  </button>
                  <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                  </div>
                </div>

                <span className="text-xs font-mono font-medium text-slate-300">
                  {formatTime(currentTime)} <span className="text-slate-600 mx-1">/</span> {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-4">            
                <button className="text-slate-400 hover:text-white transition-colors">
                    <Settings size={20} />
                </button>
                <button onClick={toggleFullscreen} className="text-white hover:text-red-500 transition-colors">
                  {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomVideoPlayer;