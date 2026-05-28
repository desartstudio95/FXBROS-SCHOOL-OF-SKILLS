import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, BookOpen, Search, Bell, BellOff, ChevronRight, CheckCircle2, CheckCircle, Heart, Settings, X, User as UserIcon, Camera, LayoutGrid, ArrowLeft, ArrowRight, Play, FileText, Download, Check, Upload, ListMusic, ChevronDown, LogOut, Bot, Sparkles, Menu, Loader2, Save, Trash2, AlertTriangle, Mail, GraduationCap, Trophy, Target, RefreshCw, Eye, SkipForward, MessageSquarePlus, Star, Layers, Calculator, DollarSign, Percent, Calendar, TrendingUp, Activity, BarChart2, Edit2, Info, Maximize2, Minimize2, Lock, Sun, Moon, Video } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { VideoLesson, ModuleResource, ModuleMetadata, DashboardContent } from '../types';
import AIAssistant from '../components/AIAssistant';
import PdfViewer from '../components/PdfViewer';
import CustomVideoPlayer from '../components/CustomVideoPlayer';
import ChartComments from '../components/ChartComments';
import VIPChat from '../components/VIPChat';
import GoogleDriveVideos from '../components/GoogleDriveVideos';
import GoogleMeetSessions from '../components/GoogleMeetSessions';

interface ModuleData {
  name: string;
  videos: VideoLesson[];
  count: number;
}

// --- QUIZ DATA ---
const QUIZ_QUESTIONS = [
    {
        question: "Qual é o principal objetivo da Gestão de Risco Profissional?",
        options: [
            "Ficar rico o mais rápido possível",
            "Preservar o capital a longo prazo e sobreviver aos drawdowns",
            "Evitar Stop Loss a todo custo (Preço Médio)",
            "Operar com o maior lote que a corretora permitir"
        ],
        answer: 1 // Index
    },
    {
        question: "O que caracteriza uma 'Quebra de Estrutura' (BOS) válida?",
        options: [
            "Quando o preço fecha com corpo de vela acima/abaixo de um topo/fundo anterior",
            "Quando o RSI cruza o nível 70 ou 30",
            "Quando sai uma notícia de alto impacto (Red Folder)",
            "Apenas quando o mercado abre em Londres"
        ],
        answer: 0
    },
    {
        question: "Qual sessão geralmente apresenta maior volume de liquidez e volatilidade?",
        options: [
            "Sessão Asiática (Tokyo)",
            "Sessão de Sydney",
            "Sessão de Nova York & Londres (Overlap)",
            "Domingo à noite (Abertura)"
        ],
        answer: 2
    },
    {
        question: "O que é um 'Fair Value Gap' (FVG) ou Imbalance?",
        options: [
            "Um indicador de volume atrasado",
            "Um desequilíbrio de preço ineficiente onde o mercado tende a retornar para rebalancear",
            "Um erro na plataforma da corretora",
            "Uma estratégia de scalping de 1 minuto apenas"
        ],
        answer: 1
    },
    {
        question: "Psicologia: O que fazer após atingir seu Stop Loss diário máximo?",
        options: [
            "Tentar recuperar imediatamente aumentando a mão (Revenge Trading)",
            "Dobrar o lote na próxima operação (Martingale)",
            "Fechar a plataforma, aceitar a perda e analisar o mercado apenas no dia seguinte",
            "Procurar sinais em grupos de terceiros para recuperar"
        ],
        answer: 2
    }
];

const Dashboard: React.FC = () => {
  const { 
    user, 
    loadingAuth, 
    videos, 
    resources, 
    completedVideoIds, 
    toggleVideoCompletion, 
    favoriteVideoIds, 
    toggleVideoFavorite, 
    modulesMetadata, 
    logout, 
    dashboardContent, 
    updateDashboardContent,
    markNotificationAsRead,
    sendGlobalAnnouncement,
    updateUserProfile, 
    deleteAccount, 
    addTestimonial, 
    refreshUserProfile, 
    uploadImage, 
    updateModuleMetadata,
    workspaceSettings,
    updateWorkspaceSettings
  } = useApp();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<'home' | 'modules' | 'ai' | 'calculator' | 'resources' | 'favorites' | 'settings' | 'quiz' | 'calendar' | 'chart' | 'chat' | 'drive' | 'meet'>('home');
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [viewingResource, setViewingResource] = useState<ModuleResource | null>(null); // For PDF/Video Viewer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Module Editing State
  const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleMetadata | null>(null);
  const [moduleThumbnailFile, setModuleThumbnailFile] = useState<File | null>(null);
  const [moduleThumbnailPreview, setModuleThumbnailPreview] = useState<string | null>(null);
  const [isSavingModule, setIsSavingModule] = useState(false);

  // Dashboard CMS State
  const [isEditDashboardModalOpen, setIsEditDashboardModalOpen] = useState(false);
  const [editDashboardContent, setEditDashboardContent] = useState<DashboardContent>(dashboardContent);
  const [isSavingDashboard, setIsSavingDashboard] = useState(false);

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Settings State
  const [editName, setEditName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Profile Photo State
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoAction, setPhotoAction] = useState<'keep' | 'change' | 'remove'>('keep'); // keep, change, remove
  
  // Calculator State
  const [calcPair, setCalcPair] = useState('EURUSD');
  const [calcLots, setCalcLots] = useState<number>(1.0);
  const [calcPips, setCalcPips] = useState<number>(20);
  const [calcBalance, setCalcBalance] = useState<number>(1000);
  const [calcRiskPercent, setCalcRiskPercent] = useState<number>(1);
  const [calcStopLoss, setCalcStopLoss] = useState<number>(10);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Quiz State
  const [quizState, setQuizState] = useState<'intro' | 'playing' | 'result'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Initialize Edit Form with User Data from Context (synced with Firestore)
  useEffect(() => {
      if (user) {
          setEditName(user.name);
          // Reset photo state when user changes or initially loads
          setNewPhotoFile(null);
          setPhotoPreview(null);
          setPhotoAction('keep');
          
          // Count unread notifications
          const unread = user.notifications?.filter(n => !n.read).length || 0;
          setUnreadCount(unread);
      }
  }, [user]);

  useEffect(() => {
    setEditDashboardContent(dashboardContent);
  }, [dashboardContent]);

  // Derived Data
  const modules = useMemo(() => {
    const mods: Record<string, VideoLesson[]> = {};
    const sortedVideos = [...videos].sort((a, b) => a.title.localeCompare(b.title));

    sortedVideos.forEach(v => {
        if(!mods[v.module]) mods[v.module] = [];
        mods[v.module].push(v);
    });

    return Object.entries(mods).map(([name, vids]) => ({
        name,
        videos: vids,
        count: vids.length
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [videos]);

  const filteredModules = useMemo(() => {
    if (!searchQuery) return modules;
    const lowerQ = searchQuery.toLowerCase();
    
    return modules.map(m => ({
        ...m,
        videos: m.videos.filter(v => v.title.toLowerCase().includes(lowerQ))
    })).filter(m => m.videos.length > 0);
  }, [modules, searchQuery]);

  const nextVideo = useMemo(() => {
      if(!selectedVideo) return null;
      const allVideos = modules.flatMap(m => m.videos);
      const idx = allVideos.findIndex(v => v.id === selectedVideo.id);
      return idx >= 0 && idx < allVideos.length - 1 ? allVideos[idx + 1] : null;
  }, [selectedVideo, modules]);

  const nextVideoInModule = useMemo(() => {
      if(!selectedVideo) return null;
      const currentModule = modules.find(m => m.name === selectedVideo.module);
      if (!currentModule) return null;
      
      const idx = currentModule.videos.findIndex(v => v.id === selectedVideo.id);
      return idx >= 0 && idx < currentModule.videos.length - 1 ? currentModule.videos[idx + 1] : null;
  }, [selectedVideo, modules]);

  const toggleModule = (moduleName: string) => {
      setExpandedModules(prev => 
        prev.includes(moduleName) ? prev.filter(m => m !== moduleName) : [...prev, moduleName]
      );
  };

  const handleVideoSelect = (video: VideoLesson) => {
      setSelectedVideo(video);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSidebarOpen(false);
  };

  const handleResourceView = (resource: ModuleResource) => {
      setViewingResource(resource);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setNewPhotoFile(file);
          setPhotoAction('change');
          
          const reader = new FileReader();
          reader.onloadend = () => {
              setPhotoPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleRemovePhoto = () => {
      setPhotoAction('remove');
      setPhotoPreview(null);
      setNewPhotoFile(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSavingProfile(true);
      setProfileMsg(null);
      
      try {
          // Logic for photo argument:
          // if 'change', pass file.
          // if 'remove', pass null.
          // if 'keep', pass undefined.
          let photoArg: File | null | undefined = undefined;
          if (photoAction === 'change') photoArg = newPhotoFile;
          else if (photoAction === 'remove') photoArg = null;

          const error = await updateUserProfile(editName, photoArg);
          
          if (error) {
              setProfileMsg({ type: 'error', text: error });
          } else {
              setProfileMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
              // Reset local photo state after save
              setNewPhotoFile(null);
              setPhotoPreview(null);
              setPhotoAction('keep');
          }
      } catch (err: any) {
          setProfileMsg({ type: 'error', text: err.message || 'Erro ao atualizar.' });
      } finally {
          setIsSavingProfile(false);
      }
  };

  const handleSaveModule = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingModule) return;
      
      setIsSavingModule(true);
      try {
          let thumbUrl = editingModule.thumbnail;
          if (moduleThumbnailFile) {
              // Upload to 'modules' folder using module ID + extension as filename
              const fileExt = moduleThumbnailFile.name.split('.').pop() || 'jpg';
              const fileName = `${editingModule.id}.${fileExt}`;
              thumbUrl = await uploadImage(moduleThumbnailFile, 'modules', fileName);
          }
          
          await updateModuleMetadata({
              ...editingModule,
              thumbnail: thumbUrl
          });
          
          setIsEditModuleModalOpen(false);
          setEditingModule(null);
          setModuleThumbnailFile(null);
          setModuleThumbnailPreview(null);
      } catch (error) {
          console.error("Error saving module", error);
      } finally {
          setIsSavingModule(false);
      }
  };

  const handleSaveDashboardCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDashboard(true);
    try {
      await updateDashboardContent(editDashboardContent);
      setIsEditDashboardModalOpen(false);
    } catch (error) {
      console.error("Error saving dashboard CMS", error);
    } finally {
      setIsSavingDashboard(false);
    }
  };

  const handleMarkAsRead = (id: string) => {
    if (user) {
      markNotificationAsRead(user.id, id);
    }
  };

  const handleManualRefresh = async () => {
      setIsRefreshing(true);
      setProfileMsg(null);
      await refreshUserProfile();
      setTimeout(() => setIsRefreshing(false), 800);
      setProfileMsg({ type: 'success', text: 'Dados da conta e permissões sincronizados.' });
  };

  const handleDeleteAccount = async () => {
      if (window.confirm("ATENÇÃO: Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.")) {
          setIsSavingProfile(true);
          const error = await deleteAccount();
          if (error) {
              alert(error);
              setIsSavingProfile(false);
          } else {
              navigate('/');
          }
      }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      
      addTestimonial({
          id: Date.now().toString(),
          name: user.name,
          role: 'Membro Verificado',
          content: reviewComment,
          rating: reviewRating,
          image: user.avatar || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}`
      });
      
      setIsReviewModalOpen(false);
      setReviewComment('');
      setReviewRating(5);
      alert('Obrigado! Sua avaliação foi enviada com sucesso.');
  };

  // --- QUIZ HANDLERS ---
  const startQuiz = () => {
      setQuizState('playing');
      setCurrentQuestionIdx(0);
      setQuizScore(0);
      setSelectedOption(null);
  };

  const handleOptionSelect = (idx: number) => {
      if (selectedOption !== null) return; // Prevent change after selection
      setSelectedOption(idx);
  };

  const handleNextQuestion = () => {
      // Calculate score
      if (selectedOption === QUIZ_QUESTIONS[currentQuestionIdx].answer) {
          setQuizScore(prev => prev + 1);
      }

      const nextIdx = currentQuestionIdx + 1;
      if (nextIdx < QUIZ_QUESTIONS.length) {
          setCurrentQuestionIdx(nextIdx);
          setSelectedOption(null);
      } else {
          setQuizState('result');
      }
  };

  // --- CALCULATOR LOGIC ---
  const calculatePipValue = () => {
      // Basic Standard: 1 Lot = $10 per pip (XXXUSD pairs)
      // Basic JPY: 1 Lot ~= $9 per pip (approx, varies with rate)
      const baseValue = calcPair.includes('JPY') ? 9.00 : 10.00;
      return (calcPips * calcLots * baseValue).toFixed(2);
  };

  const calculateRiskLotSize = () => {
      // Risk Amount = Balance * (Risk% / 100)
      // Lot Size = Risk Amount / (Stop Loss * Pip Value per Standard Lot)
      const riskAmount = calcBalance * (calcRiskPercent / 100);
      const pipValuePerStandardLot = calcPair.includes('JPY') ? 9.00 : 10.00;
      
      if (calcStopLoss <= 0) return "0.00";
      
      const lots = riskAmount / (calcStopLoss * pipValuePerStandardLot);
      return lots.toFixed(2);
  };

  // --- ACCESS CONTROL ---

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (user.status === 'pending') {
      return <Navigate to="/welcome" replace />;
  }

  if (user.status === 'blocked') {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center text-center p-4">
              <div className="max-w-md bg-slate-900 border border-red-900/50 p-8 rounded-2xl">
                  <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-white mb-2">Acesso Suspenso</h1>
                  <p className="text-slate-400 mb-6">Sua conta foi suspensa temporariamente. Entre em contato com o suporte para regularizar sua situação.</p>
                  <button onClick={logout} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg">Sair</button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 w-full bg-slate-950/95 border-b border-slate-900 z-50 px-6 py-5 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1 hover:bg-slate-900 rounded-lg transition-colors"><Menu size={24} className="text-slate-300"/></button>
                <span className="font-bold text-xl tracking-tight">FXBROS<span className="text-red-600">.</span></span>
            </div>
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 rounded-full"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden ring-2 ring-red-900/50">
                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                </div>
            </div>
        </div>

        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
                onClick={() => setIsSidebarOpen(false)}
            />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 left-0 h-screen w-80 bg-slate-950/95 backdrop-blur-xl border-r border-slate-900 z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto custom-scrollbar flex flex-col`}>
            <div className="p-6 pt-14 flex-1">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-2">
                         <img src="https://i.ibb.co/G4bmxpLm/5.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                         <span className="font-bold text-xl tracking-tight">FXBROS<span className="text-red-600">.</span></span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-900 rounded-full transition-colors"><X size={24} className="text-slate-500"/></button>
                </div>

                <div className="mb-8">
                    <div className="relative group">
                        <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-red-500 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar aulas..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-900/50 transition-all"
                        />
                    </div>
                </div>

                <nav className="space-y-1 mb-8">
                    <button 
                        onClick={() => { setActiveTab('home'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'home' && !selectedVideo ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <LayoutGrid size={18} /> Dashboard
                    </button>
                    <button 
                        onClick={() => { setActiveTab('modules'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'modules' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <Layers size={18} /> Meus Módulos
                    </button>
                    <button 
                         onClick={() => { setActiveTab('ai'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'ai' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <Bot size={18} /> FX AI Assistant
                    </button>
                    <button 
                         onClick={() => { setActiveTab('calculator'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'calculator' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <Calculator size={18} /> Calculadoras
                    </button>
                    <button 
                         onClick={() => { setActiveTab('calendar'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'calendar' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <Calendar size={18} /> Calendário
                    </button>
                    <button 
                         onClick={() => { setActiveTab('chart'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'chart' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <BarChart2 size={18} /> My Chart
                    </button>
                    <button 
                         onClick={() => { setActiveTab('chat'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'chat' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <MessageSquarePlus size={18} /> Grupo VIP
                    </button>
                    <button 
                         onClick={() => { setActiveTab('drive'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'drive' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <Play size={18} /> Google Drive
                    </button>
                    <button 
                         onClick={() => { setActiveTab('meet'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'meet' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <Video size={18} /> Google Meet
                    </button>
                    <button 
                         onClick={() => { setActiveTab('quiz'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'quiz' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <GraduationCap size={18} /> Certificação
                    </button>
                    <button 
                         onClick={() => { setActiveTab('favorites'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'favorites' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <Heart size={18} /> Favoritos
                    </button>
                     <button 
                         onClick={() => { setActiveTab('resources'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'resources' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <FileText size={18} /> Materiais
                    </button>
                    <button 
                         onClick={() => { setActiveTab('settings'); setSelectedVideo(null); setIsSidebarOpen(false); }}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'settings' ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                    >
                        <Settings size={18} /> Configurações
                    </button>
                </nav>

                <div className="border-t border-slate-900 pt-6 mt-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">{dashboardContent.sections.modulesTitle}</h3>
                    <div className="space-y-2">
                        {filteredModules.map((module) => {
                            const moduleMeta = modulesMetadata.find(m => m.name === module.name);
                            let isLocked = moduleMeta?.isLocked && user.role !== 'admin' && user.role !== 'super_admin';
                            
                            // Override: If user has explicit permission for this module
                            if (user.allowedModules?.includes(module.name)) {
                                isLocked = false;
                            }
                            
                            // Admin override for DEV.QUANT module for Pro members
                            if (isLocked && module.name === 'DEV.QUANT' && dashboardContent.devQuantForPro && user.planId === 'pro') {
                                isLocked = false;
                            }

                            return (
                                <div key={`sidebar-mod-${module.name}`} className={`space-y-1 ${isLocked ? 'opacity-50' : ''}`}>
                                    <button 
                                        disabled={isLocked}
                                        onClick={() => toggleModule(module.name)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm group transition-colors ${isLocked ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'}`}
                                    >
                                        <span className="font-medium truncate flex items-center gap-2">
                                            {isLocked && <Lock size={12} />}
                                            {module.name}
                                        </span>
                                        {!isLocked && (expandedModules.includes(module.name) ? <ChevronDown size={14} className="text-red-500" /> : <ChevronRight size={14} className="opacity-50 group-hover:opacity-100"/>)}
                                    </button>
                                    
                                    {!isLocked && expandedModules.includes(module.name) && (
                                        <div className="pl-4 space-y-1 border-l border-slate-800 ml-3 animate-fadeIn">
                                            {module.videos.map(video => (
                                                <div 
                                                    key={video.id}
                                                    className={`flex items-center justify-between pr-2 text-xs rounded-md group/item transition-colors ${selectedVideo?.id === video.id ? 'bg-red-900/10 border-l-2 border-red-500' : 'hover:bg-slate-900/50 border-l-2 border-transparent'}`}
                                                >
                                                    <button 
                                                        onClick={() => handleVideoSelect(video)}
                                                        className={`flex-1 text-left px-3 py-2 truncate flex items-center gap-2 ${selectedVideo?.id === video.id ? 'text-red-500 font-bold' : 'text-slate-500 group-hover/item:text-slate-300'}`}
                                                    >
                                                        {completedVideoIds.includes(video.id) && <CheckCircle2 size={10} className="text-green-500 flex-shrink-0" />}
                                                        <span className="truncate">{video.title}</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleVideoFavorite(video.id); }}
                                                        className={`p-1 flex-shrink-0 transition-opacity ${favoriteVideoIds.includes(video.id) ? 'text-red-500 opacity-100' : 'text-slate-600 opacity-0 group-hover/item:opacity-100 hover:text-white'}`}
                                                        title={favoriteVideoIds.includes(video.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                                    >
                                                        <Heart size={12} fill={favoriteVideoIds.includes(video.id) ? "currentColor" : "none"} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-900 bg-black/20">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700 ring-1 ring-slate-800">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{user.name}</div>
                        <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-900 hover:bg-blue-900/20 text-slate-400 hover:text-blue-500 transition-colors text-[10px] font-bold uppercase border border-slate-800"
                        title="Avaliar Academia"
                    >
                        <MessageSquarePlus size={14} /> Avaliar
                    </button>
                    <button 
                        onClick={logout}
                        className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-900 hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors text-[10px] font-bold uppercase border border-slate-800"
                    >
                        <LogOut size={14} /> Sair
                    </button>
                </div>
            </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 lg:pl-0 pt-16 lg:pt-0 relative overflow-hidden ${activeTab === 'chart' ? 'h-screen' : 'min-h-screen'}`}>
            
            {/* DOCUMENT VIEWER MODAL */}
            {viewingResource && (
                <PdfViewer resource={viewingResource} onClose={() => setViewingResource(null)} />
            )}

            {/* VIDEO PLAYER VIEW */}
            {selectedVideo ? (
                <div className="max-w-6xl mx-auto p-4 lg:p-8 animate-fadeIn">
                     <button onClick={() => setSelectedVideo(null)} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors text-sm font-medium">
                         <ArrowLeft size={16} /> Voltar ao Dashboard
                     </button>
                     
                     <div className="grid lg:grid-cols-3 gap-8">
                         <div className="lg:col-span-2 space-y-6">
                             {/* Custom Premium Video Player */}
                             <CustomVideoPlayer 
                                key={selectedVideo.id}
                                src={selectedVideo.videoUrl}
                                title={selectedVideo.title}
                                poster={selectedVideo.thumbnail}
                                autoPlay
                                useNativeControls={true}
                                className=""
                                style={{ objectFit: 'contain' }}
                                onEnded={() => {
                                    if (!completedVideoIds.includes(selectedVideo.id)) {
                                        toggleVideoCompletion(selectedVideo.id);
                                    }
                                }}
                             />
                             
                             {/* Video Info */}
                             <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
                                 <div className="flex items-start justify-between gap-4 mb-4">
                                     <div>
                                         <h1 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h1>
                                         <div className="flex items-center gap-3 text-sm text-slate-500">
                                             <span className="flex items-center gap-1"><Clock size={14}/> {selectedVideo.duration}</span>
                                             <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs font-bold uppercase">{selectedVideo.module}</span>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                         {nextVideoInModule && (
                                             <button 
                                                 onClick={() => handleVideoSelect(nextVideoInModule)}
                                                 className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors text-xs font-bold uppercase border border-slate-700 mr-2"
                                                 title="Ir para a próxima aula deste módulo"
                                             >
                                                 Próxima Aula <SkipForward size={14} />
                                             </button>
                                         )}
                                         <button 
                                            onClick={() => toggleVideoFavorite(selectedVideo.id)}
                                            className={`p-3 rounded-full border transition-colors ${favoriteVideoIds.includes(selectedVideo.id) ? 'bg-red-900/20 border-red-600/50 text-red-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                                            title="Favoritar"
                                         >
                                             <Heart size={20} fill={favoriteVideoIds.includes(selectedVideo.id) ? "currentColor" : "none"} />
                                         </button>
                                         <button 
                                            onClick={() => toggleVideoCompletion(selectedVideo.id)}
                                            className={`p-3 rounded-full border transition-colors ${completedVideoIds.includes(selectedVideo.id) ? 'bg-green-900/20 border-green-600/50 text-green-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                                            title="Marcar como Concluída"
                                         >
                                             <CheckCircle2 size={20} />
                                         </button>
                                     </div>
                                 </div>
                                 <div className="prose prose-invert max-w-none text-slate-400 text-sm leading-relaxed">
                                     <p>{selectedVideo.description}</p>
                                 </div>
                             </div>
                         </div>

                         {/* Sidebar / Next Videos */}
                         <div className="space-y-6">
                            {nextVideo && (
                                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">A Seguir</h3>
                                    <div 
                                        onClick={() => handleVideoSelect(nextVideo)}
                                        className="group cursor-pointer"
                                    >
                                        <div className="relative aspect-video rounded-lg overflow-hidden mb-3 ring-1 ring-slate-800 group-hover:ring-red-500/50 transition-all">
                                            <img src={nextVideo.thumbnail} alt={nextVideo.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
                                                    <Play size={16} fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-red-500 transition-colors">{nextVideo.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{nextVideo.duration}</p>
                                    </div>
                                </div>
                            )}

                            {/* Resources for this module */}
                            <div className="bg-black border border-slate-800 p-6 rounded-2xl">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Materiais Complementares</h3>
                                <div className="space-y-2">
                                    {resources.filter(r => r.module === selectedVideo.module).length > 0 ? (
                                        resources.filter(r => r.module === selectedVideo.module).map(res => (
                                            <button 
                                                key={res.id} 
                                                onClick={() => handleResourceView(res)}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors group text-left"
                                            >
                                                <FileText size={18} className="text-red-500 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-bold text-white truncate">{res.title}</div>
                                                    <div className="text-[10px] text-slate-500">Toque para ler</div>
                                                </div>
                                                <Eye size={14} className="text-slate-500 group-hover:text-white" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-xs text-slate-600 italic text-center py-2">Nenhum material anexado.</div>
                                    )}
                                </div>
                            </div>
                         </div>
                     </div>
                </div>
            ) : activeTab === 'settings' ? (
                // SETTINGS VIEW (PROFILE EDIT)
                <div className="p-4 lg:p-8 max-w-3xl mx-auto animate-fadeIn">
                    <h1 className="text-2xl font-bold text-white mb-2">Configurações da Conta</h1>
                    <p className="text-slate-400 text-sm mb-8">Gerencie seus dados pessoais e preferências.</p>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <UserIcon size={20} className="text-red-500" /> Perfil Público
                            </h2>
                            <button 
                                type="button" 
                                onClick={handleManualRefresh}
                                disabled={isRefreshing}
                                className="text-xs flex items-center gap-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                                title="Sincronizar permissões e plano"
                            >
                                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                                {isRefreshing ? 'Sincronizando...' : 'Sincronizar Dados'}
                            </button>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            {/* Photo Upload Section */}
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-full bg-black border-2 border-slate-800 overflow-hidden relative">
                                        <img 
                                            src={photoPreview || (photoAction === 'remove' ? `https://ui-avatars.com/api/?name=${editName.replace(' ', '+')}&background=random` : user.avatar)} 
                                            alt="Avatar" 
                                            className={`w-full h-full object-cover transition-opacity ${photoAction === 'remove' ? 'opacity-50 grayscale' : ''}`} 
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    </div>
                                    {/* Upload Trigger */}
                                    <label htmlFor="photo-upload" className="absolute bottom-0 right-0 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110">
                                        <Edit2 size={14} />
                                        <input 
                                            id="photo-upload" 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handlePhotoSelect}
                                        />
                                    </label>
                                </div>
                                
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-white font-bold mb-1">Foto de Perfil</h3>
                                    <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto md:mx-0">
                                        JPG, PNG ou GIF. Tamanho máximo de 2MB.
                                    </p>
                                    
                                    <div className="flex gap-3 justify-center md:justify-start">
                                        {(user.photoFileName || photoAction === 'change') && photoAction !== 'remove' && (
                                            <button 
                                                type="button" 
                                                onClick={handleRemovePhoto}
                                                className="px-3 py-1.5 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 border border-slate-700"
                                            >
                                                <Trash2 size={12} /> Remover Foto
                                            </button>
                                        )}
                                        {photoAction === 'change' && (
                                            <span className="text-xs text-green-500 font-bold flex items-center gap-1 bg-green-900/20 px-2 rounded">
                                                <CheckCircle2 size={12} /> Nova foto selecionada
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2">Nome Completo</label>
                                    <input 
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2">Endereço de E-mail</label>
                                    <div className="relative">
                                        <input 
                                            type="email" 
                                            value={user.email}
                                            disabled
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-500 cursor-not-allowed pl-10"
                                        />
                                        <Mail size={16} className="absolute left-3 top-3.5 text-slate-600" />
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-1">O e-mail não pode ser alterado por segurança.</p>
                                </div>
                            </div>

                            {profileMsg && (
                                <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${profileMsg.type === 'success' ? 'bg-green-900/20 text-green-500 border border-green-900/30' : 'bg-red-900/20 text-red-500 border border-red-900/30'}`}>
                                    {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                    {profileMsg.text}
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-slate-800">
                                <button 
                                    type="submit" 
                                    disabled={isSavingProfile}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-900/20"
                                >
                                    {isSavingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-red-950/10 border border-red-900/30 rounded-2xl p-8">
                        <h2 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2">
                             <AlertTriangle size={20} /> Zona de Perigo
                        </h2>
                        <p className="text-slate-400 text-sm mb-6">
                            A exclusão da sua conta é permanente. Todos os seus dados, progresso nas aulas e acesso aos cursos serão removidos imediatamente.
                        </p>
                        <button 
                            onClick={handleDeleteAccount}
                            disabled={isSavingProfile}
                            className="px-6 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded-lg font-bold transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={18} /> Excluir Minha Conta
                        </button>
                    </div>


                </div>
            ) : null}
            
            {activeTab === 'ai' && (
                <div className="p-4 lg:p-8 h-full animate-fadeIn pt-16">
                    <AIAssistant />
                </div>
            )}

            {/* ... (rest of the dashboard content - quiz, calculator, etc. remains unchanged) ... */}
            {activeTab === 'calendar' && (
                <div className="p-4 h-full animate-fadeIn flex flex-col">
                    <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar className="text-red-500" size={24} /> Calendário Econômico
                    </h1>
                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
                        <iframe 
                            src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone&countries=25,32,6,37,72,22,17,39,14,10,35,43,56,36,110,11,26,12,4,5&calType=week&timeZone=8&lang=1" 
                            className="w-full h-full border-0"
                            title="Investing.com Calendar"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'chart' && (
                <div className="h-full animate-fadeIn flex flex-col lg:flex-row overflow-hidden relative">
                    {/* Chart Container */}
                    <div className={`flex flex-col transition-all duration-300 ease-in-out ${isChartExpanded ? 'absolute inset-0 z-50 bg-slate-950' : 'flex-1 min-h-0 overflow-y-auto lg:overflow-hidden p-0 lg:p-1'}`}>
                         {!isChartExpanded && (
                             <div className="flex items-center justify-between px-2 py-1 flex-shrink-0 bg-slate-950/50 backdrop-blur-sm z-10 border-b border-slate-800 lg:border-none">
                                 <h1 className="text-xs font-bold text-white flex items-center gap-2">
                                    <BarChart2 className="text-red-500" size={14} /> My Chart
                                </h1>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => setIsDarkTheme(!isDarkTheme)}
                                        className="p-1 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-lg"
                                        title={isDarkTheme ? "Tema Claro" : "Tema Escuro"}
                                    >
                                        {isDarkTheme ? <Sun size={14} /> : <Moon size={14} />}
                                    </button>
                                    <button 
                                        onClick={() => setIsChartExpanded(!isChartExpanded)}
                                        className="p-1 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-lg"
                                        title="Expandir Gráfico"
                                    >
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                             </div>
                         )}
                         
                         {isChartExpanded && (
                            <button 
                                onClick={() => setIsChartExpanded(false)}
                                className="absolute top-2 right-2 z-50 p-2 bg-slate-900/80 text-white rounded-lg hover:bg-red-600 transition-colors backdrop-blur-md border border-slate-700 shadow-xl"
                                title="Minimizar Gráfico"
                            >
                                <Minimize2 size={20} />
                            </button>
                         )}
                        
                        <div className={`flex-1 bg-slate-900 border-t lg:border border-slate-800 overflow-hidden shadow-2xl relative ${isChartExpanded ? '' : 'lg:rounded-xl'}`}>
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-black/60 px-2 py-1 rounded-full backdrop-blur-md border border-slate-700 pointer-events-none">
                                <span className="flex h-1.5 w-1.5 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                </span>
                                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Ao Vivo</span>
                             </div>
                            <iframe 
                                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=FX%3AEURUSD&interval=D&hidesidetoolbar=0&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&hideideas=1&theme=${isDarkTheme ? 'Dark' : 'Light'}&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=["use_localstorage_for_settings"]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=FX%3AEURUSD`}
                                className="w-full h-full border-0"
                                title="TradingView Chart"
                                allowFullScreen
                            />
                        </div>
                    </div>

                    {/* Comments Section - Bottom (Mobile) / Right (Desktop) */}
                    {!isChartExpanded && (
                        <div className={`flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950 transition-all duration-300 ease-in-out ${isChatExpanded ? 'absolute inset-0 z-50 h-full w-full' : 'h-[25vh] lg:h-full lg:w-80 relative'}`}>
                            <ChartComments isExpanded={isChatExpanded} onToggleExpand={() => setIsChatExpanded(!isChatExpanded)} />
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'quiz' && (
                <div className="p-4 lg:p-6 max-w-4xl mx-auto animate-fadeIn">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Certificação Trader</h1>
                        <p className="text-slate-400 text-sm">Teste seus conhecimentos e ganhe badges exclusivos.</p>
                    </div>

                    {quizState === 'intro' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                            <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-900/40 animate-pulse">
                                <Trophy size={40} className="text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-3">Desafio Smart Money</h2>
                            <p className="text-slate-400 text-sm max-w-lg mx-auto mb-6">
                                5 perguntas de nível institucional sobre gestão de risco, estrutura de mercado e psicologia. Você precisa de 80% de acerto para passar.
                            </p>
                            <button onClick={startQuiz} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/30 text-sm">
                                Iniciar Prova
                            </button>
                        </div>
                    )}

                    {quizState === 'playing' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Questão {currentQuestionIdx + 1}/{QUIZ_QUESTIONS.length}</span>
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Nível: Pro</span>
                            </div>
                            
                            <h2 className="text-lg md:text-xl font-bold text-white mb-6 leading-relaxed">{QUIZ_QUESTIONS[currentQuestionIdx].question}</h2>
                            
                            <div className="space-y-3 mb-6">
                                {QUIZ_QUESTIONS[currentQuestionIdx].options.map((opt, idx) => (
                                    <button
                                        key={`quiz-opt-${currentQuestionIdx}-${idx}`}
                                        onClick={() => handleOptionSelect(idx)}
                                        disabled={selectedOption !== null}
                                        className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${
                                            selectedOption === idx 
                                                ? idx === QUIZ_QUESTIONS[currentQuestionIdx].answer 
                                                    ? 'bg-green-900/30 border-green-500 text-white' 
                                                    : 'bg-red-900/30 border-red-500 text-white'
                                                : selectedOption !== null && idx === QUIZ_QUESTIONS[currentQuestionIdx].answer
                                                    ? 'bg-green-900/30 border-green-500 text-white'
                                                    : 'bg-black border-slate-800 text-slate-300 hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                                                 selectedOption === idx || (selectedOption !== null && idx === QUIZ_QUESTIONS[currentQuestionIdx].answer) ? 'border-current' : 'border-slate-600 text-slate-600'
                                            }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            {opt}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {selectedOption !== null && (
                                <div className="flex justify-end animate-fadeIn">
                                    <button onClick={handleNextQuestion} className="px-5 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm">
                                        {currentQuestionIdx < QUIZ_QUESTIONS.length - 1 ? 'Próxima Questão' : 'Ver Resultado'} <ArrowRight size={16}/>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {quizState === 'result' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                            <div className="mb-6">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border-4 ${quizScore >= 4 ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                                    <span className="text-2xl font-bold">{Math.round((quizScore / QUIZ_QUESTIONS.length) * 100)}%</span>
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">{quizScore >= 4 ? 'Aprovado com Excelência!' : 'Estude Mais um Pouco'}</h2>
                            <p className="text-slate-400 text-sm mb-6">
                                Você acertou {quizScore} de {QUIZ_QUESTIONS.length} questões. 
                                {quizScore >= 4 ? ' Você está pronto para operar o capital real.' : ' Revise os módulos de Gestão de Risco e Psicologia.'}
                            </p>
                            <button onClick={startQuiz} className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors text-sm">
                                Tentar Novamente
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'calculator' && (
                <div className="p-4 lg:p-6 max-w-4xl mx-auto animate-fadeIn">
                    <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Calculator className="text-red-500" size={24} /> Calculadora de Posição
                    </h1>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Risk Calculator */}
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                <Target size={16} className="text-blue-500" /> Gestão de Risco
                            </h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Par de Moedas</label>
                                    <select value={calcPair} onChange={(e) => setCalcPair(e.target.value)} className="w-full bg-black border border-slate-800 rounded-lg p-2.5 text-white text-sm mt-1">
                                        <option value="EURUSD">EUR/USD</option>
                                        <option value="GBPUSD">GBP/USD</option>
                                        <option value="USDJPY">USD/JPY</option>
                                        <option value="XAUUSD">XAU/USD (Gold)</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Banca ($)</label>
                                        <input type="number" value={calcBalance} onChange={(e) => setCalcBalance(Number(e.target.value))} className="w-full bg-black border border-slate-800 rounded-lg p-2.5 text-white text-sm mt-1" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Risco (%)</label>
                                        <input type="number" value={calcRiskPercent} onChange={(e) => setCalcRiskPercent(Number(e.target.value))} className="w-full bg-black border border-slate-800 rounded-lg p-2.5 text-white text-sm mt-1" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Stop Loss (Pips)</label>
                                    <input type="number" value={calcStopLoss} onChange={(e) => setCalcStopLoss(Number(e.target.value))} className="w-full bg-black border border-slate-800 rounded-lg p-2.5 text-white text-sm mt-1" />
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-900/10 border border-blue-900/30 rounded-xl">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-slate-400">Tamanho do Lote Ideal</span>
                                    <span className="text-xl font-bold text-white">{calculateRiskLotSize()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-slate-500">
                                    <span>Risco Monetário</span>
                                    <span>${(calcBalance * (calcRiskPercent/100)).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Pip Calculator */}
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                <DollarSign size={16} className="text-green-500" /> Valor do Pip
                            </h3>
                             <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Lotes</label>
                                    <input type="number" step="0.01" value={calcLots} onChange={(e) => setCalcLots(Number(e.target.value))} className="w-full bg-black border border-slate-800 rounded-lg p-2.5 text-white text-sm mt-1" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Pips</label>
                                    <input type="number" value={calcPips} onChange={(e) => setCalcPips(Number(e.target.value))} className="w-full bg-black border border-slate-800 rounded-lg p-2.5 text-white text-sm mt-1" />
                                </div>
                             </div>

                             <div className="mt-6 p-4 bg-green-900/10 border border-green-900/30 rounded-xl">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-slate-400">Resultado Estimado</span>
                                    <span className="text-xl font-bold text-green-500">+${calculatePipValue()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIP CHAT VIEW */}
            {activeTab === 'chat' && (
                <div className="p-4 lg:p-8 max-w-4xl mx-auto animate-fadeIn">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Grupo VIP de Conversas</h1>
                        <p className="text-slate-400 text-sm">Conecte-se com outros membros e compartilhe insights em tempo real.</p>
                    </div>
                    <VIPChat />
                </div>
            )}

            {/* DRIVE VIDEOS VIEW */}
            {activeTab === 'drive' && (
                <div className="max-w-6xl mx-auto animate-fadeIn">
                    <GoogleDriveVideos />
                </div>
            )}

            {/* MEET SESSIONS VIEW */}
            {activeTab === 'meet' && (
                <div className="max-w-6xl mx-auto animate-fadeIn">
                    <GoogleMeetSessions />
                </div>
            )}

            {/* ... (rest of content tabs) ... */}
            {(activeTab === 'modules' || activeTab === 'resources' || activeTab === 'favorites') && (
                 <div className="p-4 lg:p-6 max-w-6xl mx-auto animate-fadeIn">
                     <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                        {activeTab === 'modules' && <><Layers className="text-red-500" size={24}/> Meus Módulos</>}
                        {activeTab === 'resources' && <><FileText className="text-blue-500" size={24}/> Biblioteca de Materiais</>}
                        {activeTab === 'favorites' && <><Heart className="text-pink-500" size={24}/> Aulas Favoritas</>}
                     </h1>
                     <p className="text-slate-400 text-sm mb-6">
                        {activeTab === 'modules' && 'Acesso rápido a todo o conteúdo do curso.'}
                        {activeTab === 'resources' && 'PDFs, planilhas e resumos para download.'}
                        {activeTab === 'favorites' && 'Sua coleção pessoal de aulas importantes.'}
                     </p>
                    
                    {activeTab === 'favorites' && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {videos.filter(v => favoriteVideoIds.includes(v.id)).map(video => (
                                <div key={video.id} onClick={() => handleVideoSelect(video)} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden cursor-pointer group hover:border-red-500/50 transition-all">
                                    <div className="aspect-video relative">
                                        <img src={video.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <PlayCircle className="text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110" size={40} />
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{video.title}</h3>
                                        <p className="text-xs text-slate-500">{video.module}</p>
                                    </div>
                                </div>
                            ))}
                            {videos.filter(v => favoriteVideoIds.includes(v.id)).length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                                    Nenhum favorito ainda.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="grid md:grid-cols-2 gap-4">
                            {resources.map(res => (
                                <div key={res.id} onClick={() => handleResourceView(res)} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4 hover:bg-slate-800 cursor-pointer transition-colors group">
                                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-blue-500 group-hover:text-white transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white text-sm">{res.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <span className="bg-slate-950 px-2 py-0.5 rounded">{res.module}</span>
                                            {res.aiSummary && <span className="text-blue-400">★ AI Summary</span>}
                                        </div>
                                    </div>
                                    <Download size={16} className="text-slate-600 group-hover:text-white" />
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {activeTab === 'modules' && (
                         <div className="grid md:grid-cols-2 gap-4">
                            {modules.map(mod => {
                                const moduleMeta = modulesMetadata.find(m => m.name === mod.name);
                                let isLocked = moduleMeta?.isLocked && user.role !== 'admin' && user.role !== 'super_admin';

                                // Override: If user has explicit permission for this module
                                if (user.allowedModules?.includes(mod.name)) {
                                    isLocked = false;
                                }

                                // Admin override for DEV.QUANT module for Pro members
                                if (isLocked && mod.name === 'DEV.QUANT' && dashboardContent.devQuantForPro && user.planId === 'pro') {
                                    isLocked = false;
                                }

                                return (
                                    <div key={`tab-mod-${mod.name}`} className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors ${isLocked ? 'opacity-60 grayscale' : ''}`}>
                                        <div className="aspect-video relative overflow-hidden">
                                            <img 
                                                src={moduleMeta?.thumbnail || `https://picsum.photos/seed/${mod.name}/600/400`} 
                                                alt={mod.name} 
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                            {isLocked && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                                    <Lock size={32} className="text-white/50" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="w-10 h-10 bg-red-900/20 rounded-lg flex items-center justify-center text-red-500">
                                                    {isLocked ? <Lock size={20} /> : <Layers size={20} />}
                                                </div>
                                                <span className="text-[10px] font-bold bg-black px-2 py-1 rounded text-slate-400">{mod.count} Aulas</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2">{mod.name}</h3>
                                            
                                            {isLocked ? (
                                                <button disabled className="w-full py-2 mt-2 bg-slate-950 text-slate-500 rounded-lg text-xs font-bold border border-slate-800 cursor-not-allowed flex items-center justify-center gap-2">
                                                    <Lock size={12} /> Conteúdo Bloqueado
                                                </button>
                                            ) : (
                                                <button onClick={() => toggleModule(mod.name)} className="w-full py-2 mt-2 bg-slate-950 hover:bg-black text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-colors border border-slate-800">
                                                    {expandedModules.includes(mod.name) ? 'Ocultar Aulas' : 'Ver Conteúdo'}
                                                </button>
                                            )}
                                            
                                            {!isLocked && expandedModules.includes(mod.name) && (
                                                <div className="mt-4 space-y-1">
                                                    {mod.videos.map(v => (
                                                        <div key={v.id} onClick={() => handleVideoSelect(v)} className="flex items-center justify-between p-2 hover:bg-slate-800 rounded cursor-pointer group">
                                                            <span className={`text-xs ${completedVideoIds.includes(v.id) ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white'}`}>{v.title}</span>
                                                            {completedVideoIds.includes(v.id) && <CheckCircle2 size={12} className="text-green-500" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                         </div>
                    )}
                 </div>
            )}
            
            {activeTab === 'home' && !selectedVideo && (
                // HOME DASHBOARD VIEW
                <div className="p-4 lg:p-6 max-w-6xl mx-auto animate-fadeIn pb-20">
                    {/* Welcome Banner */}
                    <div className="relative rounded-2xl overflow-hidden mb-6 border border-slate-800 bg-slate-900 shadow-2xl group">
                        <div className="absolute inset-0 z-10"></div>
                        <img 
                            src={dashboardContent.banner.bgImage} 
                            alt="Banner" 
                            className="w-full h-40 md:h-56 object-cover opacity-50 absolute inset-0 transform group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
                        <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-10">
                            <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">{dashboardContent.banner.titlePrefix} {user.name.split(' ')[0]} 👋</h1>
                            <p className="text-slate-300 max-w-xl mb-6 text-base font-light">{dashboardContent.banner.subtitle}</p>
                            
                            <div className="flex items-center gap-6">
                                <div>
                                    <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Progresso Total</div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-bold text-white leading-none">{Math.round((completedVideoIds.length / (videos.length || 1)) * 100)}%</span>
                                        <div className="h-1.5 w-24 bg-slate-800 rounded-full mb-2 ml-2 overflow-hidden">
                                            <div className="h-full bg-red-600 rounded-full" style={{ width: `${Math.round((completedVideoIds.length / (videos.length || 1)) * 100)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Continue Watching */}
                    <div className="mb-8">
                         <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><PlayCircle className="text-red-500" size={20} /> {dashboardContent.sections.continueWatchingTitle}</h2>
                         </div>
                         
                         {(() => {
                             const firstUnwatched = videos.find(v => !completedVideoIds.includes(v.id));
                             if (firstUnwatched) {
                                 return (
                                     <div onClick={() => handleVideoSelect(firstUnwatched)} className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 cursor-pointer hover:bg-slate-900 hover:border-slate-700 transition-all group shadow-lg">
                                         <div className="relative w-full md:w-64 aspect-video bg-black rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-slate-800 group-hover:ring-red-500/30 transition-all">
                                             <img src={firstUnwatched.thumbnail} alt={firstUnwatched.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                             <div className="absolute inset-0 flex items-center justify-center">
                                                 <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                                     <Play size={20} fill="currentColor" />
                                                 </div>
                                             </div>
                                         </div>
                                         <div className="flex flex-col justify-center py-1">
                                             <div className="inline-block px-2 py-0.5 rounded bg-slate-950 text-[10px] text-red-400 font-bold uppercase tracking-wider mb-2 self-start border border-slate-800">{firstUnwatched.module}</div>
                                             <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">{firstUnwatched.title}</h3>
                                             <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{firstUnwatched.description}</p>
                                             <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                                                 <span className="flex items-center gap-1"><Clock size={10}/> {firstUnwatched.duration}</span>
                                             </div>
                                         </div>
                                     </div>
                                 )
                             }
                             return (
                                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 text-center">
                                    <Trophy size={32} className="mx-auto text-yellow-500 mb-3" />
                                    <h3 className="text-lg font-bold text-white mb-1">Parabéns!</h3>
                                    <p className="text-slate-400 text-sm">Você completou todas as aulas disponíveis.</p>
                                </div>
                             );
                         })()}
                    </div>

                    {/* All Modules - Netflix Style */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <LayoutGrid className="text-red-600" size={20} /> {dashboardContent.sections.modulesTitle}
                            </h2>
                            {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                <button 
                                    onClick={() => setIsEditDashboardModalOpen(true)}
                                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-all"
                                    title="Editar Seção"
                                >
                                    <Edit2 size={16} />
                                </button>
                            )}
                        </div>
                        
                        {/* Featured Hero Module (First Module) */}
                        {filteredModules.length > 0 && (() => {
                            const featuredModule = filteredModules[0];
                            const moduleMeta = modulesMetadata.find(m => m.name === featuredModule.name);
                            const thumb = moduleMeta?.thumbnail || `https://picsum.photos/seed/${featuredModule.name}/1200/600`;
                            let isLocked = moduleMeta?.isLocked && user.role !== 'admin' && user.role !== 'super_admin';
                            
                            // Override: If user has explicit permission for this module
                            if (user.allowedModules?.includes(featuredModule.name)) {
                                isLocked = false;
                            }
                            
                            return (
                                <div className="relative w-full h-[40vh] min-h-[350px] mb-8 group overflow-hidden rounded-2xl mx-2 shadow-2xl ring-1 ring-slate-800">
                                    {/* Admin Edit Button */}
                                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingModule(moduleMeta || { id: featuredModule.name, name: featuredModule.name, description: '', thumbnail: '' });
                                                setModuleThumbnailPreview(moduleMeta?.thumbnail || null);
                                                setIsEditModuleModalOpen(true);
                                            }}
                                            className="absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors"
                                            title="Editar Thumbnail"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}

                                    <div className="absolute inset-0">
                                        <img src={thumb} alt={featuredModule.name} className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${isLocked ? 'grayscale opacity-30' : ''}`} />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                    </div>
                                    
                                    <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-xl">
                                        <div className="flex items-center gap-3 mb-3 animate-fadeIn">
                                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest rounded">Destaque</span>
                                            <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">{featuredModule.count} Aulas</span>
                                            {isLocked && <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest rounded flex items-center gap-1"><Lock size={10} /> Bloqueado</span>}
                                        </div>
                                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight shadow-black drop-shadow-lg animate-slideUp">{featuredModule.name}</h1>
                                        <p className="text-slate-300 text-sm mb-6 line-clamp-3 leading-relaxed animate-slideUp delay-100">
                                            {moduleMeta?.description || "Domine este conteúdo exclusivo e eleve seu nível de trading."}
                                        </p>
                                        
                                        <div className="flex items-center gap-3 animate-slideUp delay-200">
                                            {isLocked ? (
                                                <button 
                                                    disabled
                                                    className="px-6 py-2.5 bg-slate-800 text-slate-500 font-bold rounded-lg flex items-center gap-2 cursor-not-allowed text-sm"
                                                >
                                                    <Lock size={16} /> Conteúdo Bloqueado
                                                </button>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => {
                                                            const firstVideo = featuredModule.videos[0];
                                                            if (firstVideo) handleVideoSelect(firstVideo);
                                                        }}
                                                        className="px-6 py-2.5 bg-white text-black hover:bg-slate-200 font-bold rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 text-sm"
                                                    >
                                                        <Play fill="black" size={16} /> Assistir Agora
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setActiveTab('modules');
                                                            if (!expandedModules.includes(featuredModule.name)) {
                                                                toggleModule(featuredModule.name);
                                                            }
                                                        }}
                                                        className="px-6 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur text-white font-bold rounded-lg flex items-center gap-2 transition-all border border-slate-700 text-sm"
                                                    >
                                                        <Info size={16} /> Mais Informações
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Horizontal Rows for Other Modules */}
                        <div className="space-y-8 px-2 pb-12">
                            {filteredModules.slice(1).map((module, i) => {
                                const moduleMeta = modulesMetadata.find(m => m.name === module.name);
                                const thumb = moduleMeta?.thumbnail || `https://picsum.photos/seed/${module.name}/400/250`;
                                let isLocked = moduleMeta?.isLocked && user.role !== 'admin' && user.role !== 'super_admin';
                                
                                // Override: If user has explicit permission for this module
                                if (user.allowedModules?.includes(module.name)) {
                                    isLocked = false;
                                }
                                
                                // Admin override for DEV.QUANT module for Pro members
                                if (isLocked && module.name === 'DEV.QUANT' && dashboardContent.devQuantForPro && user.planId === 'pro') {
                                    isLocked = false;
                                }
                                
                                return (
                                    <div key={`row-mod-${module.name}`} className={`space-y-3 ${isLocked ? 'opacity-60 pointer-events-none grayscale' : ''}`}>
                                        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 hover:text-white transition-colors cursor-pointer group/title">
                                            {module.name} 
                                            {isLocked ? <Lock size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-red-600 opacity-0 group-hover/title:opacity-100 transition-opacity -translate-x-2 group-hover/title:translate-x-0" />}
                                        </h3>
                                        
                                        <div className="relative group/row">
                                            <div className="flex gap-3 overflow-x-auto pb-4 pt-2 custom-scrollbar snap-x snap-mandatory scroll-pl-4">
                                                {/* Module Info Card */}
                                                <div 
                                                    key={`module-info-${module.name}`}
                                                    onClick={() => !isLocked && toggleModule(module.name)}
                                                    className="min-w-[260px] md:min-w-[320px] h-[180px] relative rounded-lg overflow-hidden cursor-pointer flex-shrink-0 snap-start ring-1 ring-slate-800 hover:ring-red-600 transition-all transform hover:scale-105 hover:z-10 shadow-lg group/card"
                                                >
                                                    {/* Admin Edit Button */}
                                                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingModule(moduleMeta || { id: module.name, name: module.name, description: '', thumbnail: '' });
                                                                setModuleThumbnailPreview(moduleMeta?.thumbnail || null);
                                                                setIsEditModuleModalOpen(true);
                                                            }}
                                                            className="absolute top-2 right-2 z-30 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover/card:opacity-100"
                                                            title="Editar Thumbnail"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                    )}

                                                    <img src={thumb} alt={module.name} className="w-full h-full object-cover opacity-60 group-hover/card:opacity-40 transition-opacity" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                                                    
                                                    {isLocked && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                                                            <Lock size={32} className="text-slate-400" />
                                                        </div>
                                                    )}

                                                    <div className="absolute bottom-0 left-0 p-4 w-full">
                                                        <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-1">Módulo {i + 2}</div>
                                                        <h4 className="text-xl font-bold text-white mb-1">{module.name}</h4>
                                                        <p className="text-[10px] text-slate-400 line-clamp-2 mb-3">{moduleMeta?.description || "Conteúdo avançado."}</p>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white">
                                                            <PlayCircle size={14} className="text-red-500" /> {module.count} Aulas
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Video Cards in this Module */}
                                                {module.videos.map((video) => (
                                                    <div 
                                                        key={video.id}
                                                        onClick={() => !isLocked && handleVideoSelect(video)}
                                                        className="min-w-[220px] md:min-w-[260px] h-[145px] mt-auto mb-auto relative rounded-lg overflow-hidden cursor-pointer flex-shrink-0 snap-start bg-slate-900 ring-1 ring-slate-800 hover:ring-slate-600 transition-all transform hover:scale-105 hover:z-10 shadow-lg group/video"
                                                    >
                                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover/video:opacity-100 transition-opacity" />
                                                        
                                                        {isLocked && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                                                                <Lock size={24} className="text-slate-500" />
                                                            </div>
                                                        )}

                                                        {/* Progress Bar Overlay */}
                                                        {completedVideoIds.includes(video.id) && !isLocked && (
                                                            <div className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                                                                <CheckCircle2 size={8} /> Visto
                                                            </div>
                                                        )}

                                                        {!isLocked && (
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/video:opacity-100 transition-opacity flex items-center justify-center">
                                                                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-xl transform scale-0 group-hover/video:scale-100 transition-transform duration-300">
                                                                    <Play size={14} fill="black" className="text-black ml-0.5" />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black via-black/80 to-transparent">
                                                            <h5 className="text-xs font-bold text-white truncate">{video.title}</h5>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={8}/> {video.duration}</span>
                                                                {favoriteVideoIds.includes(video.id) && <Heart size={8} className="text-red-500 fill-current" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </main>

        {/* MODALS */}
        
        {/* Edit Dashboard CMS Modal */}
        {isEditDashboardModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-slate-900 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Editar Dashboard</h2>
                        <button onClick={() => setIsEditDashboardModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
                    </div>
                    
                    <form onSubmit={handleSaveDashboardCMS} className="p-6 space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Título do Banner</label>
                            <input 
                                type="text" 
                                value={editDashboardContent.banner.titlePrefix}
                                onChange={(e) => setEditDashboardContent({...editDashboardContent, banner: {...editDashboardContent.banner, titlePrefix: e.target.value}})}
                                className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-600 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Subtítulo do Banner</label>
                            <textarea 
                                value={editDashboardContent.banner.subtitle}
                                onChange={(e) => setEditDashboardContent({...editDashboardContent, banner: {...editDashboardContent.banner, subtitle: e.target.value}})}
                                className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-600 focus:outline-none"
                                rows={2}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Título da Seção de Módulos</label>
                            <input 
                                type="text" 
                                value={editDashboardContent.sections.modulesTitle}
                                onChange={(e) => setEditDashboardContent({...editDashboardContent, sections: {...editDashboardContent.sections, modulesTitle: e.target.value}})}
                                className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-600 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                            <div className="w-10 h-10 bg-amber-900/20 rounded-lg flex items-center justify-center text-amber-500">
                                <Bot size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-white">Desbloquear DEV.QUANT</h4>
                                <p className="text-[10px] text-slate-500">Permitir acesso ao Modo Quant para membros Pro.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setEditDashboardContent({...editDashboardContent, devQuantForPro: !editDashboardContent.devQuantForPro})}
                                className={`w-12 h-6 rounded-full transition-colors relative ${editDashboardContent.devQuantForPro ? 'bg-red-600' : 'bg-slate-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editDashboardContent.devQuantForPro ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                        
                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsEditDashboardModalOpen(false)}
                                className="flex-1 px-4 py-3 bg-slate-900 text-slate-400 font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                disabled={isSavingDashboard}
                                className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                            >
                                {isSavingDashboard ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Salvar
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}

        {/* Notifications Panel */}
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-[110] lg:absolute lg:inset-auto lg:top-16 lg:right-6 lg:w-80 lg:h-auto lg:max-h-[500px] flex flex-col bg-slate-950 border border-slate-800 lg:rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-slate-900 flex items-center justify-between bg-slate-900/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Bell size={16} className="text-red-500" /> Notificações
              </h3>
              <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar max-h-[400px]">
              {!user.notifications || user.notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <BellOff size={32} className="mx-auto text-slate-800 mb-2" />
                  <p className="text-slate-600 text-xs">Nenhuma notificação</p>
                </div>
              ) : (
                user.notifications.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-xl border transition-all ${notif.read ? 'bg-slate-900/20 border-slate-900 opacity-60' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                    onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-xs font-bold ${notif.read ? 'text-slate-400' : 'text-white'}`}>{notif.title}</h4>
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 mt-1"></div>}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed mb-2">{notif.message}</p>
                    <div className="flex items-center justify-between text-[8px] text-slate-600 uppercase font-bold tracking-widest">
                      <span>{notif.type}</span>
                      <span>{new Date(notif.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {user.role === 'admin' || user.role === 'super_admin' ? (
              <div className="p-3 bg-slate-900/50 border-t border-slate-900">
                <button 
                  onClick={() => {
                    const title = window.prompt("Título do Anúncio:");
                    const msg = window.prompt("Mensagem:");
                    if (title && msg) sendGlobalAnnouncement(title, msg);
                  }}
                  className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-[10px] font-bold rounded-lg border border-red-900/30 transition-all uppercase tracking-widest"
                >
                  Enviar Anúncio Global
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* REVIEW MODAL */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)}></div>
            <div className="relative bg-slate-950 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl animate-[slideIn_0.3s_ease-out]">
              <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24} /></button>
              
              <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                      <MessageSquarePlus className="text-blue-500" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Avalie sua Experiência</h3>
                  <p className="text-slate-400 text-sm">Seu feedback ajuda a melhorar a academia.</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Classificação</label>
                      <div className="flex justify-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                          <button type="button" key={star} onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                              <Star size={32} className={star <= reviewRating ? "text-yellow-500 fill-yellow-500" : "text-slate-800"} />
                          </button>
                          ))}
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Comentário</label>
                      <textarea 
                          rows={4}
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="O que você está achando das aulas?"
                          className="w-full bg-black border border-slate-800 rounded-xl p-3 text-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600/20 transition-all placeholder-slate-700"
                      />
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/20">Enviar Avaliação</button>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MODULE MODAL */}
        {isEditModuleModalOpen && editingModule && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditModuleModalOpen(false)}></div>
                <div className="relative bg-slate-950 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl animate-[slideIn_0.3s_ease-out]">
                    <button onClick={() => setIsEditModuleModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24} /></button>
                    
                    <h3 className="text-2xl font-bold text-white mb-6">Editar Módulo</h3>
                    
                    <form onSubmit={handleSaveModule} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome do Módulo</label>
                            <input 
                                type="text" 
                                value={editingModule.name}
                                disabled
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-400 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Descrição</label>
                            <textarea 
                                rows={3}
                                value={editingModule.description}
                                onChange={(e) => setEditingModule({...editingModule, description: e.target.value})}
                                className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                                placeholder="Descrição do módulo..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Thumbnail (Capa)</label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-16 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0">
                                    {moduleThumbnailPreview ? (
                                        <img src={moduleThumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                                            <Camera size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setModuleThumbnailFile(file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setModuleThumbnailPreview(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="hidden"
                                        id="module-thumb-upload"
                                    />
                                    <label 
                                        htmlFor="module-thumb-upload"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer text-xs font-bold transition-colors border border-slate-700"
                                    >
                                        <Upload size={14} /> Escolher Imagem
                                    </label>
                                    <p className="text-[10px] text-slate-500 mt-2">Recomendado: 1200x600px (JPG/PNG)</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="isLocked"
                                checked={editingModule.isLocked || false}
                                onChange={(e) => setEditingModule({...editingModule, isLocked: e.target.checked})}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-600"
                            />
                            <label htmlFor="isLocked" className="text-sm text-slate-300 cursor-pointer select-none">
                                Bloquear Módulo (Apenas Admin)
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSavingModule}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {isSavingModule ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Salvar Alterações
                        </button>
                    </form>
                </div>
            </div>
        )}

    </div>
  );
};

export default Dashboard;