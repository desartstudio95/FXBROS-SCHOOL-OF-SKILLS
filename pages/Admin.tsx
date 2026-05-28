import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Navigate, useLocation } from 'react-router-dom';
import { UploadCloud, Link as LinkIcon, Plus, Video, Trash2, Check, Edit3, X, CreditCard, LayoutList, Star, Globe, Save, ShieldCheck, Palette, Type, Users, UserCheck, UserX, AlertCircle, Layers, CheckCircle2, FileText, Download, Loader2, Megaphone, Send, User, AlignLeft, Image as ImageIcon, Box, Film, Clock, LayoutGrid, Sparkles, FileType, MessageSquare, Play, Calendar, Eye, Lock, Unlock } from 'lucide-react';
import { VideoLesson, PricingPlan, HomeContent, User as UserType, ModuleResource, PlansPageContent, ModuleMetadata, WelcomeContent, DashboardContent } from '../types';
import { doc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Helper to generate thumbnail from video file (Client-side)
const generateVideoThumbnail = (file: File): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    // Ensure we can capture the image
    video.preload = "metadata";
    video.playsInline = true;
    video.muted = true;
    
    // Set source
    const url = URL.createObjectURL(file);
    video.src = url;

    // Wait for metadata to load, then seek to 1s
    video.onloadedmetadata = () => {
        video.currentTime = 1;
    };

    // When seek completes, capture the frame
    video.onseeked = () => {
        try {
            const canvas = document.createElement("canvas");
            // Standard aspect ratio 16:9
            canvas.width = 640;
            canvas.height = 360;
            
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
                resolve(blob);
                // Cleanup
                URL.revokeObjectURL(url);
            }, "image/jpeg", 0.75);
        } catch (e) {
            console.error("Thumbnail capture error", e);
            resolve(null);
            URL.revokeObjectURL(url);
        }
    };

    // Handle errors
    video.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(url);
    };
  });
};

const Admin: React.FC = () => {
  const { user, videos, addVideo, deleteVideo, updateVideo, uploadVideo, uploadImage, resources, uploadResource, deleteResource, plans, addPlan, deletePlan, updatePlan, homeContent, updateHomeContent, themeSettings, updateThemeSettings, allUsers, updateUserStatus, updateUserModules, updateUserPlan, deleteUser, sendGlobalAnnouncement, plansPageContent, updatePlansPageContent, updateModuleMetadata, deleteModuleMetadata, modulesMetadata, welcomeContent, updateWelcomeContent, dashboardContent, updateDashboardContent, testimonials, deleteTestimonial, workspaceSettings, updateWorkspaceSettings } = useApp();
  const location = useLocation();
  
  const initialSection = user?.role === 'super_admin' ? 'cms' : 'members';

  const [activeSection, setActiveSection] = useState<'videos' | 'plans' | 'cms' | 'appearance' | 'integrations' | 'members' | 'announcements' | 'reviews'>(initialSection);
  const [activeContentTab, setActiveContentTab] = useState<'videos' | 'resources' | 'modules'>('modules');
  const [activePlanTab, setActivePlanTab] = useState<'cards' | 'page_settings'>('cards');
  const [activeCmsTab, setActiveCmsTab] = useState<'home' | 'plans' | 'welcome' | 'dashboard'>('home');

  // --- UPLOAD STATE ---
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'error'>('idle');

  // --- VIDEO STATE ---
  const [videoSourceType, setVideoSourceType] = useState<'link' | 'upload'>('link');
  const [isVideoEditing, setIsVideoEditing] = useState(false);
  const [editVideoId, setEditVideoId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  
  // New Video Thumbnail State
  const [videoThumbnailFile, setVideoThumbnailFile] = useState<File | null>(null);
  const [videoThumbnailPreview, setVideoThumbnailPreview] = useState<string | null>(null);

  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    url: '',
    module: '',
    thumbnail: ''
  });

  // --- RESOURCE STATE ---
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceSourceType, setResourceSourceType] = useState<'upload' | 'link'>('upload');
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    module: '',
    url: '',
    notes: '',
    aiSummary: ''
  });

  // --- MODULE METADATA STATE ---
  const [moduleImageFile, setModuleImageFile] = useState<File | null>(null);
  const [moduleImagePreview, setModuleImagePreview] = useState<string | null>(null);
  const [moduleMetaFormData, setModuleMetaFormData] = useState({
      id: '',
      name: '',
      description: '',
      thumbnail: '',
      isHighlight: false,
      isLocked: false
  });
  const [isEditingModule, setIsEditingModule] = useState(false);

  // --- PLAN STATE ---
  const [isPlanEditing, setIsPlanEditing] = useState(false);
  const [editPlanId, setEditPlanId] = useState<string | null>(null);
  const [planFormData, setPlanFormData] = useState({
    name: '',
    price: '',
    features: '', 
    isPopular: false,
    isElite: false,
    allowedModules: [] as string[],
    paymentLink: ''
  });

  // --- ANNOUNCEMENT STATE ---
  const [announcementData, setAnnouncementData] = useState({
      title: '',
      message: ''
  });

  // --- MEMBER MODULES STATE ---
  const [isManageMemberOpen, setIsManageMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<UserType | null>(null);
  const [tempAllowedModules, setTempAllowedModules] = useState<string[]>([]);
  const [tempSelectedPlan, setTempSelectedPlan] = useState<string>('starter');

  // --- CMS STATE ---
  const [cmsData, setCmsData] = useState<HomeContent>(homeContent);
  const [plansCmsData, setPlansCmsData] = useState<PlansPageContent>(plansPageContent);
  const [welcomeCmsData, setWelcomeCmsData] = useState<WelcomeContent>(welcomeContent);
  const [dashboardCmsData, setDashboardCmsData] = useState<DashboardContent>(dashboardContent);

  const [localThemeSettings, setLocalThemeSettings] = useState(themeSettings);
  const [successMsg, setSuccessMsg] = useState('');

  // Extract all unique modules available in the system
  const allSystemModules = useMemo(() => {
    // Combine modules from metadata and existing videos to ensure none are lost, but prioritize metadata
    const modules = new Set(modulesMetadata.map(m => m.name));
    return Array.from(modules);
  }, [modulesMetadata]);

  // Sort users so PENDING are at the top, followed by ACTIVE, then BLOCKED
  const sortedUsers = useMemo(() => {
      return [...allUsers].sort((a, b) => {
          const statusOrder = { pending: 1, active: 2, blocked: 3 };
          return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      });
  }, [allUsers]);

  // --- Handle Navigation from External Pages (e.g., Edit Plan from Plans page) ---
  useEffect(() => {
    if (location.state) {
      const state = location.state as { targetSection?: string; editPlanId?: string };
      
      if (state.targetSection === 'plans') {
        setActiveSection('plans');
        
        if (state.editPlanId) {
          const planToEdit = plans.find(p => p.id === state.editPlanId);
          if (planToEdit) {
            // Replicate handleEditPlan logic here to ensure it runs correctly on mount
            setIsPlanEditing(true);
            setEditPlanId(planToEdit.id);
            setPlanFormData({ 
                name: planToEdit.name, 
                price: planToEdit.price, 
                features: planToEdit.features.join('\n'), 
                isPopular: planToEdit.isPopular || false, 
                isElite: planToEdit.isElite || false, 
                allowedModules: planToEdit.allowedModules || [],
                paymentLink: planToEdit.paymentLink || ''
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }

      // Clear state to avoid reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location, plans]);

  useEffect(() => {
    setCmsData(homeContent);
    setPlansCmsData(plansPageContent);
    setWelcomeCmsData(welcomeContent);
    setDashboardCmsData(dashboardContent);
  }, [homeContent, plansPageContent, welcomeContent, dashboardContent]);

  useEffect(() => {
    setLocalThemeSettings(themeSettings);
  }, [themeSettings]);

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return <Navigate to="/login" replace />;

  const isSuperAdmin = user.role === 'super_admin';
  const isAdmin = user.role === 'admin';
  const hasMemberControl = isAdmin || isSuperAdmin;

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // --- VIDEO HELPERS ---
  const getCleanVideoUrl = (url: string) => {
    // Normalize YouTube URL to Embed format
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]*)/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    
    // Normalize Vimeo URL
    if (url.includes('vimeo.com') && !url.includes('player.vimeo.com')) {
         const vimeoId = url.split('vimeo.com/')[1].split('/')[0];
         return `https://player.vimeo.com/video/${vimeoId}`;
    }
    
    return url;
  };

  // --- MODULE HANDLERS ---
  const handleModuleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setModuleImageFile(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onloadend = () => {
              setModuleImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const resetModuleForm = () => {
      setModuleMetaFormData({ id: '', name: '', description: '', thumbnail: '', isHighlight: false, isLocked: false });
      setModuleImageFile(null);
      setModuleImagePreview(null);
      setIsEditingModule(false);
      setUploadStatus('idle');
  };

  const handleEditModule = (module: ModuleMetadata) => {
      setIsEditingModule(true);
      setModuleMetaFormData({
          id: module.id,
          name: module.name,
          description: module.description,
          thumbnail: module.thumbnail,
          isHighlight: module.isHighlight || false,
          isLocked: module.isLocked || false
      });
      setModuleImagePreview(module.thumbnail);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteModule = (id: string) => {
      if (window.confirm('Tem certeza? Isso removerá o módulo da lista de gerenciamento.')) {
          deleteModuleMetadata(id);
          showToast('Módulo removido.');
      }
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!moduleMetaFormData.id || !moduleMetaFormData.name) {
          showToast('ID e Nome são obrigatórios.');
          return;
      }
      
      setIsUploading(true);
      setUploadStatus('uploading');

      // Use existing URL by default
      let thumb = moduleMetaFormData.thumbnail;
      
      // If a new file is selected, upload it
      if (moduleImageFile) {
          try {
             // Use 'modules' folder and module ID + extension as filename for consistency
             const fileExt = moduleImageFile.name.split('.').pop() || 'jpg';
             const fileName = `${moduleMetaFormData.id}.${fileExt}`;
             thumb = await uploadImage(moduleImageFile, 'modules', fileName);
          } catch (e: any) {
             showToast('Erro ao fazer upload da imagem: ' + e.message);
             setIsUploading(false);
             setUploadStatus('error');
             return;
          }
      }

      const moduleData: ModuleMetadata = {
          id: moduleMetaFormData.id,
          name: moduleMetaFormData.name,
          description: moduleMetaFormData.description,
          thumbnail: thumb || 'https://via.placeholder.com/300x200?text=No+Image',
          isHighlight: moduleMetaFormData.isHighlight,
          isLocked: moduleMetaFormData.isLocked
      };

      try {
          await updateModuleMetadata(moduleData);
          showToast(`Módulo ${isEditingModule ? 'atualizado' : 'criado'} com sucesso.`);
          resetModuleForm();
          setUploadStatus('completed');
      } catch (e: any) {
          showToast('Erro ao salvar módulo: ' + e.message);
          setUploadStatus('error');
      } finally {
          setIsUploading(false);
      }
  };

  const [previewResource, setPreviewResource] = useState<ModuleResource | null>(null);

  // --- VIDEO HANDLERS ---
  const handleVideoThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setVideoThumbnailFile(file);
          
          const reader = new FileReader();
          reader.onloadend = () => {
              setVideoThumbnailPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFormData.title || !videoFormData.module) return;

    setIsUploading(true);
    setUploadStatus('uploading');

    let videoUrl = getCleanVideoUrl(videoFormData.url);
    let thumbnailUrl = videoFormData.thumbnail || `https://ui-avatars.com/api/?name=${videoFormData.title}&background=random&size=200`;
    
    try {
        // Generate ID using Firestore doc ref if creating new OR use existing ID for update
        let videoId = editVideoId;
        if (!videoId) {
            const videoDocRef = doc(collection(db, "videos"));
            videoId = videoDocRef.id;
        }

        if (videoSourceType === 'upload' && videoFile) {
            // Upload Real usando a função do Context com o ID
            videoUrl = await uploadVideo(videoFile, videoId);
            
            // --- AUTO GENERATE THUMBNAIL LOGIC ---
            if (!videoThumbnailFile && !videoFormData.thumbnail) {
                try {
                    showToast('Gerando thumbnail automática...');
                    const thumbBlob = await generateVideoThumbnail(videoFile);
                    if (thumbBlob) {
                        const thumbFile = new File([thumbBlob], `thumb_${videoFile.name.split('.')[0]}.jpg`, { type: 'image/jpeg' });
                        // Using explicit path for video thumbnails
                        thumbnailUrl = await uploadImage(thumbFile, `videos/${videoId}`, 'thumbnail.jpg');
                    }
                } catch (e) {
                    console.warn("Auto-thumbnail failed, defaulting to avatar", e);
                }
            }
        }

        // Handle Manual Thumbnail Upload
        if (videoThumbnailFile) {
             // Using explicit path for video thumbnails
             thumbnailUrl = await uploadImage(videoThumbnailFile, `videos/${videoId}`, 'thumbnail.jpg');
        }

        const video: VideoLesson = {
          id: videoId,
          title: videoFormData.title,
          description: videoFormData.description,
          thumbnail: thumbnailUrl,
          videoUrl: videoUrl,
          duration: '10:00', // Mock duration or extract metadata later
          module: videoFormData.module,
          dateAdded: new Date().toISOString()
        };
        
        if (editVideoId) {
            await updateVideo(video); // Await firestore op
            showToast('Vídeo atualizado.');
        } else {
            await addVideo(video); // Await firestore op
            showToast('Vídeo adicionado.');
        }
        
        // Reset
        setVideoFormData({ title: '', description: '', url: '', module: '', thumbnail: '' });
        setVideoFile(null);
        setVideoThumbnailFile(null);
        setVideoThumbnailPreview(null);
        setIsVideoEditing(false);
        setEditVideoId(null);
        setUploadStatus('completed');
    } catch (error: any) {
        console.error("Upload error", error);
        setUploadStatus('error');
        showToast("Erro ao carregar vídeo: " + error.message);
    } finally {
        setIsUploading(false);
    }
  };

  // --- RESOURCE HANDLERS ---
  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceFormData.title || !resourceFormData.module) return;
    
    if (resourceSourceType === 'upload' && !resourceFile) {
        showToast('Selecione um arquivo para upload.');
        return;
    }
    if (resourceSourceType === 'link' && !resourceFormData.url) {
        showToast('Insira a URL do arquivo.');
        return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');

    const error = await uploadResource(
        resourceSourceType === 'upload' ? resourceFile : null,
        {
            title: resourceFormData.title,
            module: resourceFormData.module,
            notes: resourceFormData.notes,
            aiSummary: resourceFormData.aiSummary,
            url: resourceSourceType === 'link' ? resourceFormData.url : undefined
        }
    );

    setIsUploading(false);
    setUploadStatus(error ? 'error' : 'completed');

    if (error) {
        showToast(error);
    } else {
        showToast('Recurso adicionado e sincronizado com sucesso.');
        setResourceFormData({ title: '', module: '', url: '', notes: '', aiSummary: '' });
        setResourceFile(null);
    }
  };

  // --- PLAN HANDLERS ---
  const handlePlanSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newPlan: PricingPlan = {
          id: editPlanId || Date.now().toString(),
          name: planFormData.name,
          price: planFormData.price,
          features: planFormData.features.split('\n').filter(f => f.trim() !== ''),
          isPopular: planFormData.isPopular,
          isElite: planFormData.isElite,
          allowedModules: planFormData.allowedModules,
          paymentLink: planFormData.paymentLink
      };

      if (isPlanEditing && editPlanId) {
          updatePlan(newPlan);
          showToast('Plano atualizado.');
      } else {
          addPlan(newPlan);
          showToast('Plano criado.');
      }
      
      setIsPlanEditing(false);
      setEditPlanId(null);
      setPlanFormData({ name: '', price: '', features: '', isPopular: false, isElite: false, allowedModules: [], paymentLink: '' });
  };

  const handleEditPlan = (plan: PricingPlan) => {
      setIsPlanEditing(true);
      setEditPlanId(plan.id);
      setPlanFormData({
          name: plan.name,
          price: plan.price,
          features: plan.features.join('\n'),
          isPopular: plan.isPopular || false,
          isElite: plan.isElite || false,
          allowedModules: plan.allowedModules || [],
          paymentLink: plan.paymentLink || ''
      });
  };

  // --- CMS HANDLERS ---
  const handleCmsSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateHomeContent(cmsData);
      showToast('Conteúdo da Home atualizado.');
  };

  const handlePlansContentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updatePlansPageContent(plansCmsData);
      showToast('Conteúdo da Página de Planos atualizado.');
  };

  const handleWelcomeContentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateWelcomeContent(welcomeCmsData);
      showToast('Conteúdo da Página de Boas-vindas atualizado.');
  };

  const handleDashboardContentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateDashboardContent(dashboardCmsData);
      showToast('Conteúdo do Dashboard atualizado.');
  };

  const handleThemeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateThemeSettings(localThemeSettings);
      showToast('Configurações de tema aplicadas.');
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      sendGlobalAnnouncement(announcementData.title, announcementData.message);
      showToast('Anúncio enviado para todos os membros.');
      setAnnouncementData({ title: '', message: '' });
  };

  // --- MEMBERS HANDLERS ---
  const handleManageMember = (member: UserType) => {
      setSelectedMember(member);
      setTempAllowedModules(member.allowedModules || []);
      setTempSelectedPlan(member.planId || 'starter');
      setIsManageMemberOpen(true);
  };

  const handleDeleteMember = (userId: string) => {
      if (window.confirm('Tem certeza que deseja excluir este membro? Essa ação não pode ser desfeita.')) {
          deleteUser(userId);
          showToast('Membro excluído com sucesso.');
      }
  };

  const handleSaveMember = () => {
      if (selectedMember) {
          updateUserModules(selectedMember.id, tempAllowedModules);
          updateUserPlan(selectedMember.id, tempSelectedPlan); // Ensure plan is updated
          showToast('Permissões e plano do membro atualizados.');
          setIsManageMemberOpen(false);
      }
  };

  // --- REVIEW HANDLERS ---
  const handleDeleteReview = (id: string) => {
      if (window.confirm('Tem certeza que deseja remover esta avaliação?')) {
          deleteTestimonial(id);
          showToast('Avaliação removida.');
      }
  };


  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-900 flex-shrink-0">
        <div className="p-6 border-b border-slate-900">
           <h1 className="text-xl font-bold flex items-center gap-2">
             <LayoutGrid className="text-red-600" /> Admin Panel
           </h1>
           <p className="text-xs text-slate-500 mt-1">Gestão da Plataforma</p>
        </div>
        <nav className="p-4 space-y-1">
          {hasMemberControl && (
             <button onClick={() => setActiveSection('members')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === 'members' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
               <Users size={18} /> Membros
             </button>
          )}
          <button onClick={() => setActiveSection('videos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === 'videos' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <Video size={18} /> Conteúdo & Aulas
          </button>
          <button onClick={() => setActiveSection('plans')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === 'plans' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <CreditCard size={18} /> Planos & Pagamentos
          </button>
          <button onClick={() => setActiveSection('cms')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === 'cms' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <LayoutList size={18} /> CMS (Site)
          </button>
          <button onClick={() => setActiveSection('announcements')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === 'announcements' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <Megaphone size={18} /> Comunicados
          </button>
          <button onClick={() => setActiveSection('reviews')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === 'reviews' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <MessageSquare size={18} /> Avaliações
          </button>
          <button onClick={() => setActiveSection('appearance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === 'appearance' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <Palette size={18} /> Aparência
          </button>
          <button onClick={() => setActiveSection('integrations')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === 'integrations' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
            <Globe size={18} /> Integrações
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        
        {/* SUCCESS TOAST */}
        {successMsg && (
            <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn flex items-center gap-2">
                <CheckCircle2 size={18} /> {successMsg}
            </div>
        )}

        {/* VIDEOS & CONTENT SECTION */}
        {activeSection === 'videos' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Gestão de Conteúdo</h2>
            
            <div className="flex gap-4 mb-6">
                <button onClick={() => setActiveContentTab('modules')} className={`px-4 py-2 rounded-full text-sm font-bold ${activeContentTab === 'modules' ? 'bg-white text-black' : 'bg-slate-900 text-slate-400'}`}>Módulos</button>
                <button onClick={() => setActiveContentTab('videos')} className={`px-4 py-2 rounded-full text-sm font-bold ${activeContentTab === 'videos' ? 'bg-white text-black' : 'bg-slate-900 text-slate-400'}`}>Videoaulas</button>
                <button onClick={() => setActiveContentTab('resources')} className={`px-4 py-2 rounded-full text-sm font-bold ${activeContentTab === 'resources' ? 'bg-white text-black' : 'bg-slate-900 text-slate-400'}`}>Materiais (PDF)</button>
            </div>

            {/* MODULES SUB-TAB */}
            {activeContentTab === 'modules' && (
                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <h3 className="text-lg font-bold mb-4">{isEditingModule ? 'Editar Módulo' : 'Novo Módulo'}</h3>
                        <form onSubmit={handleModuleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Módulo (ID)</label>
                                <input type="text" value={moduleMetaFormData.name} onChange={e => setModuleMetaFormData({...moduleMetaFormData, name: e.target.value, id: isEditingModule ? moduleMetaFormData.id : e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" required />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Descrição Curta</label>
                                <input type="text" value={moduleMetaFormData.description} onChange={e => setModuleMetaFormData({...moduleMetaFormData, description: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Thumbnail (Upload ou URL)</label>
                                <input type="file" accept="image/*" onChange={handleModuleImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700"/>
                                <div className="mt-2 text-center text-xs text-slate-500">OU</div>
                                <input type="text" placeholder="URL da imagem" value={moduleMetaFormData.thumbnail} onChange={e => setModuleMetaFormData({...moduleMetaFormData, thumbnail: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white mt-2" />
                            </div>
                            
                             <div className="flex items-center gap-4 mt-4 bg-black p-3 rounded-lg border border-slate-800">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="isHighlight"
                                        checked={moduleMetaFormData.isHighlight} 
                                        onChange={e => setModuleMetaFormData({...moduleMetaFormData, isHighlight: e.target.checked})} 
                                        className="w-4 h-4 text-red-600 rounded"
                                    />
                                    <label htmlFor="isHighlight" className="text-sm font-bold text-slate-300 flex items-center gap-2 cursor-pointer">
                                        <Sparkles size={14} className="text-yellow-500" />
                                        Destacar
                                    </label>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="isLocked"
                                        checked={moduleMetaFormData.isLocked} 
                                        onChange={e => setModuleMetaFormData({...moduleMetaFormData, isLocked: e.target.checked})} 
                                        className="w-4 h-4 text-red-600 rounded"
                                    />
                                    <label htmlFor="isLocked" className="text-sm font-bold text-slate-300 flex items-center gap-2 cursor-pointer">
                                        <Lock size={14} className="text-red-500" />
                                        Bloquear Módulo
                                    </label>
                                </div>
                            </div>

                            {moduleImagePreview && (
                                <div className="mt-2">
                                    <img src={moduleImagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-slate-700" />
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button type="submit" disabled={isUploading} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors flex items-center justify-center gap-2">
                                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : null}
                                    {isUploading ? 'Enviando...' : (isEditingModule ? 'Salvar Alterações' : 'Criar Módulo')}
                                </button>
                                {isEditingModule && <button type="button" onClick={resetModuleForm} className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">Cancelar</button>}
                            </div>
                        </form>
                    </div>

                    <div className="space-y-4">
                        {modulesMetadata.map(mod => (
                            <div key={mod.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                                <img src={mod.thumbnail} alt={mod.name} className="w-16 h-16 rounded object-cover bg-black" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        {mod.name}
                                        {mod.isHighlight && <Sparkles size={12} className="text-yellow-500" />}
                                        {mod.isLocked && <Lock size={12} className="text-red-500" />}
                                    </h4>
                                    <p className="text-xs text-slate-500">{mod.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            updateModuleMetadata({
                                                ...mod,
                                                isLocked: !mod.isLocked
                                            });
                                            showToast(`Módulo ${!mod.isLocked ? 'bloqueado' : 'desbloqueado'} com sucesso.`);
                                        }} 
                                        className={`p-2 rounded transition-colors ${mod.isLocked ? 'text-amber-500 hover:bg-amber-500/10' : 'text-slate-400 hover:bg-slate-800'}`}
                                        title={mod.isLocked ? 'Desbloquear Módulo' : 'Bloquear Módulo'}
                                    >
                                        {mod.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                                    </button>
                                    <button onClick={() => handleEditModule(mod)} className="p-2 text-blue-400 hover:bg-slate-800 rounded"><Edit3 size={16} /></button>
                                    <button onClick={() => handleDeleteModule(mod.id)} className="p-2 text-red-400 hover:bg-slate-800 rounded"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VIDEOS SUB-TAB */}
            {activeContentTab === 'videos' && (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-slate-900 p-6 rounded-2xl border border-slate-800 h-fit">
                        <h3 className="text-lg font-bold mb-4">{isVideoEditing ? 'Editar Aula' : 'Nova Aula'}</h3>
                        <form onSubmit={handleVideoSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Título da Aula</label>
                                <input type="text" value={videoFormData.title} onChange={e => setVideoFormData({...videoFormData, title: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Módulo</label>
                                <select value={videoFormData.module} onChange={e => setVideoFormData({...videoFormData, module: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" required>
                                    <option value="">Selecione...</option>
                                    {allSystemModules.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Fonte do Vídeo</label>
                                <div className="flex gap-2 mb-2">
                                    <button type="button" onClick={() => setVideoSourceType('link')} className={`flex-1 py-1 rounded text-xs ${videoSourceType === 'link' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Link Externo</button>
                                    <button type="button" onClick={() => setVideoSourceType('upload')} className={`flex-1 py-1 rounded text-xs ${videoSourceType === 'upload' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Upload</button>
                                </div>
                                {videoSourceType === 'link' ? (
                                    <input type="text" placeholder="YouTube / Vimeo URL" value={videoFormData.url} onChange={e => setVideoFormData({...videoFormData, url: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" />
                                ) : (
                                    <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700"/>
                                )}
                            </div>

                            {/* Thumbnail Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Capa do Vídeo (Thumbnail)</label>
                                <input type="file" accept="image/*" onChange={handleVideoThumbnailChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 mb-2"/>
                                <input type="text" placeholder="Ou URL da imagem..." value={videoFormData.thumbnail} onChange={e => setVideoFormData({...videoFormData, thumbnail: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white text-xs" />
                                {videoThumbnailPreview && (
                                    <div className="mt-2 w-full h-32 bg-black rounded overflow-hidden border border-slate-800">
                                        <img src={videoThumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Descrição</label>
                                <textarea rows={3} value={videoFormData.description} onChange={e => setVideoFormData({...videoFormData, description: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" disabled={isUploading} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors flex items-center justify-center gap-2">
                                    {isUploading ? <Loader2 className="animate-spin" size={16} /> : (isVideoEditing ? 'Salvar' : 'Adicionar')}
                                    {isUploading ? 'Enviando...' : ''}
                                </button>
                                {isVideoEditing && <button type="button" onClick={() => { setIsVideoEditing(false); setVideoFormData({title:'', description:'', url:'', module:'', thumbnail:''}); setVideoThumbnailPreview(null); setVideoThumbnailFile(null); }} className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">Cancelar</button>}
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        {videos.length === 0 && <p className="text-slate-500 text-center py-8">Nenhum vídeo encontrado</p>}
                        
                        {videos.map(video => (
                            <div key={video.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {previewVideoId === video.id ? (
                                    <div className="w-full sm:w-48 aspect-video bg-black rounded-lg overflow-hidden relative shrink-0 ring-1 ring-red-900/50">
                                        <video 
                                            width="100%" 
                                            height="100%" 
                                            controls 
                                            autoPlay 
                                            className="w-full h-full object-contain"
                                            controlsList="nodownload"
                                        >
                                            <source src={video.videoUrl} type="video/mp4" />
                                            Seu navegador não suporta vídeos.
                                        </video>
                                        <button 
                                            onClick={() => setPreviewVideoId(null)} 
                                            className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full transition-colors backdrop-blur-sm z-10"
                                            title="Fechar Preview"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div 
                                        className="w-full sm:w-48 aspect-video bg-black rounded-lg overflow-hidden relative flex-shrink-0 group cursor-pointer border border-slate-800 hover:border-red-500/50 transition-colors"
                                        onClick={() => setPreviewVideoId(video.id)}
                                        title="Clique para visualizar o vídeo"
                                    >
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-transparent transition-colors">
                                            <div className="w-10 h-10 bg-red-600/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                                <Play size={20} className="text-white fill-current ml-1"/>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 min-w-0 w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase font-bold border border-slate-700">{video.module}</span>
                                        <h4 className="font-bold text-white truncate text-sm">{video.title}</h4>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mb-2">{video.description}</p>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-600">
                                        <span className="flex items-center gap-1"><Clock size={10} /> {video.duration}</span>
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(video.dateAdded).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end sm:border-l sm:border-slate-800 sm:pl-4">
                                    <button onClick={() => { 
                                        setIsVideoEditing(true); 
                                        setEditVideoId(video.id); 
                                        setVideoFormData({ 
                                            title: video.title, 
                                            description: video.description, 
                                            url: video.videoUrl, 
                                            module: video.module,
                                            thumbnail: video.thumbnail 
                                        });
                                        setVideoThumbnailPreview(video.thumbnail);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }} className="flex-1 sm:flex-none p-2 text-blue-400 hover:bg-blue-900/20 rounded transition-colors flex items-center justify-center gap-2 sm:justify-start" title="Editar">
                                        <Edit3 size={16} /> <span className="sm:hidden text-xs font-bold">Editar</span>
                                    </button>
                                    <button onClick={() => deleteVideo(video.id)} className="flex-1 sm:flex-none p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors flex items-center justify-center gap-2 sm:justify-start" title="Excluir">
                                        <Trash2 size={16} /> <span className="sm:hidden text-xs font-bold">Excluir</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* RESOURCES SUB-TAB */}
            {activeContentTab === 'resources' && (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-slate-900 p-6 rounded-2xl border border-slate-800 h-fit">
                        <h3 className="text-lg font-bold mb-4">Adicionar Material</h3>
                        <form onSubmit={handleResourceSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Título do Arquivo</label>
                                <input type="text" value={resourceFormData.title} onChange={e => setResourceFormData({...resourceFormData, title: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Módulo Relacionado</label>
                                <select value={resourceFormData.module} onChange={e => setResourceFormData({...resourceFormData, module: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" required>
                                    <option value="">Selecione...</option>
                                    {allSystemModules.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Tipo de Entrada</label>
                                <div className="flex gap-2 mb-2">
                                    <button type="button" onClick={() => setResourceSourceType('upload')} className={`flex-1 py-1 rounded text-xs ${resourceSourceType === 'upload' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Upload</button>
                                    <button type="button" onClick={() => setResourceSourceType('link')} className={`flex-1 py-1 rounded text-xs ${resourceSourceType === 'link' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Link Externo</button>
                                </div>
                                {resourceSourceType === 'link' ? (
                                    <input type="url" value={resourceFormData.url} onChange={e => setResourceFormData({...resourceFormData, url: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" placeholder="https://..." />
                                ) : (
                                    <div className="relative group cursor-pointer">
                                        <input type="file" onChange={e => setResourceFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                                        <div className="w-full bg-black border border-slate-800 border-dashed rounded p-4 text-center group-hover:border-red-500/50 transition-colors">
                                            {resourceFile ? (
                                                <span className="text-white text-xs font-bold flex items-center justify-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> {resourceFile.name}</span>
                                            ) : (
                                                <span className="text-slate-500 text-xs">Arraste ou clique para selecionar</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Notas (Opcional)</label>
                                <textarea rows={2} value={resourceFormData.notes} onChange={e => setResourceFormData({...resourceFormData, notes: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" placeholder="Anotações sobre o arquivo..." />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Resumo IA (Opcional)</label>
                                <textarea rows={2} value={resourceFormData.aiSummary} onChange={e => setResourceFormData({...resourceFormData, aiSummary: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" placeholder="Resumo gerado por IA..." />
                            </div>

                            <button type="submit" disabled={isUploading} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                {isUploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                                {isUploading ? 'Enviando...' : 'Adicionar Recurso'}
                            </button>
                        </form>
                    </div>
                     <div className="lg:col-span-2 space-y-4">
                        {resources.map(res => (
                             <div key={res.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-red-500 shrink-0"><FileText size={20} /></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-white text-sm truncate">{res.title}</h4>
                                        {res.notes && <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400" title={res.notes}>Notas</span>}
                                        {res.aiSummary && <span className="text-[10px] bg-indigo-900/30 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900/50" title={res.aiSummary}>AI</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="bg-slate-800 px-1.5 rounded">{res.module}</span>
                                        {res.fileName && <span className="truncate max-w-[150px] opacity-70">{res.fileName}</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {res.url && (
                                        <>
                                            <button 
                                                onClick={() => setPreviewResource(res)} 
                                                className="p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors" 
                                                title="Visualizar no Admin"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <a href={res.url} target="_blank" rel="noreferrer" className="p-2 text-blue-400 hover:bg-slate-800 rounded" title="Baixar/Abrir em nova aba">
                                                <Download size={16} />
                                            </a>
                                        </>
                                    )}
                                    <button onClick={() => deleteResource(res.id)} className="p-2 text-red-400 hover:bg-slate-800 rounded"><Trash2 size={16} /></button>
                                </div>
                             </div>
                        ))}
                        {resources.length === 0 && (
                            <div className="text-center py-12 text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                                Nenhum material disponível.
                            </div>
                        )}
                     </div>
                </div>
            )}
          </div>
        )}

        {/* PLANS SECTION */}
        {activeSection === 'plans' && (
             <div className="space-y-8">
                <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Planos e Assinaturas</h2>
                <div className="flex gap-4 mb-6">
                    <button onClick={() => setActivePlanTab('cards')} className={`px-4 py-2 rounded-full text-sm font-bold ${activePlanTab === 'cards' ? 'bg-white text-black' : 'bg-slate-900 text-slate-400'}`}>Planos de Venda</button>
                    <button onClick={() => setActivePlanTab('page_settings')} className={`px-4 py-2 rounded-full text-sm font-bold ${activePlanTab === 'page_settings' ? 'bg-white text-black' : 'bg-slate-900 text-slate-400'}`}>Conteúdo da Página</button>
                </div>
                
                {activePlanTab === 'cards' ? (
                     <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-slate-900 p-6 rounded-2xl border border-slate-800 h-fit">
                            <h3 className="text-lg font-bold mb-4">{isPlanEditing ? 'Editar Plano' : 'Novo Plano'}</h3>
                            <form onSubmit={handlePlanSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Plano</label>
                                    <input type="text" value={planFormData.name} onChange={e => setPlanFormData({...planFormData, name: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Preço (Ex: 5.000 MZN)</label>
                                    <input type="text" value={planFormData.price} onChange={e => setPlanFormData({...planFormData, price: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Link de Pagamento (Opcional)</label>
                                    <input type="text" value={planFormData.paymentLink} onChange={e => setPlanFormData({...planFormData, paymentLink: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" placeholder="https://..." />
                                    <p className="text-[10px] text-slate-500">Se vazio, usa checkout interno.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Características (Uma por linha)</label>
                                    <textarea rows={5} value={planFormData.features} onChange={e => setPlanFormData({...planFormData, features: e.target.value})} className="w-full bg-black border border-slate-800 rounded p-2 text-white" />
                                </div>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-slate-300">
                                        <input type="checkbox" checked={planFormData.isPopular} onChange={e => setPlanFormData({...planFormData, isPopular: e.target.checked})} /> Popular
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-300">
                                        <input type="checkbox" checked={planFormData.isElite} onChange={e => setPlanFormData({...planFormData, isElite: e.target.checked})} /> Elite
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold transition-colors">
                                        {isPlanEditing ? 'Salvar Alterações' : 'Criar Plano'}
                                    </button>
                                     {isPlanEditing && <button type="button" onClick={() => { setIsPlanEditing(false); setEditPlanId(null); setPlanFormData({name:'', price:'', features:'', isPopular:false, isElite:false, allowedModules:[], paymentLink:''}); }} className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">Cancelar</button>}
                                </div>
                            </form>
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                             {plans.map(plan => (
                                 <div key={plan.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                                     <div>
                                         <h4 className="font-bold text-white flex items-center gap-2">
                                             {plan.name} 
                                             {plan.isPopular && <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded text-white">POPULAR</span>}
                                             {plan.isElite && <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded">ELITE</span>}
                                         </h4>
                                         <p className="text-slate-400 font-mono">{plan.price}</p>
                                     </div>
                                     <div className="flex gap-2">
                                        <button onClick={() => handleEditPlan(plan)} className="p-2 text-blue-400 hover:bg-slate-800 rounded"><Edit3 size={16} /></button>
                                        <button onClick={() => deletePlan(plan.id)} className="p-2 text-red-400 hover:bg-slate-800 rounded"><Trash2 size={16} /></button>
                                     </div>
                                 </div>
                             ))}
                        </div>
                     </div>
                ) : (
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <form onSubmit={handlePlansContentSubmit} className="space-y-6">
                            <div>
                                <h3 className="font-bold text-white mb-2">Hero Section</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input type="text" value={plansCmsData.hero.title} onChange={e => setPlansCmsData({...plansCmsData, hero: {...plansCmsData.hero, title: e.target.value}})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="Título Principal" />
                                    <input type="text" value={plansCmsData.hero.subtitle} onChange={e => setPlansCmsData({...plansCmsData, hero: {...plansCmsData.hero, subtitle: e.target.value}})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="Subtítulo" />
                                </div>
                            </div>
                            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold">Salvar Texto da Página</button>
                        </form>
                    </div>
                )}
             </div>
        )}

        {/* CMS SECTION */}
        {activeSection === 'cms' && (
            <div className="space-y-8">
                <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Gestão do Site</h2>
                <div className="flex gap-4 mb-6 flex-wrap">
                    <button onClick={() => setActiveCmsTab('home')} className={`px-4 py-2 rounded-full text-sm font-bold ${activeCmsTab === 'home' ? 'bg-white text-black' : 'bg-slate-900 text-slate-400'}`}>Home Page</button>
                    <button onClick={() => setActiveCmsTab('welcome')} className={`px-4 py-2 rounded-full text-sm font-bold ${activeCmsTab === 'welcome' ? 'bg-white text-black' : 'bg-slate-900 text-slate-400'}`}>Boas-vindas</button>
                    <button onClick={() => setActiveCmsTab('dashboard')} className={`px-4 py-2 rounded-full text-sm font-bold ${activeCmsTab === 'dashboard' ? 'bg-white text-black' : 'bg-slate-900 text-slate-400'}`}>Dashboard Banner</button>
                </div>

                {activeCmsTab === 'home' && (
                    <form onSubmit={handleCmsSubmit} className="space-y-8 max-w-4xl">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                            <h3 className="text-lg font-bold mb-4 text-red-500">Seção Hero (Topo)</h3>
                            <div className="grid gap-4">
                                <input type="text" value={cmsData.hero.titleLine1} onChange={e => setCmsData({...cmsData, hero: {...cmsData.hero, titleLine1: e.target.value}})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="Título Linha 1" />
                                <input type="text" value={cmsData.hero.titleHighlight} onChange={e => setCmsData({...cmsData, hero: {...cmsData.hero, titleHighlight: e.target.value}})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="Destaque em Vermelho" />
                                <textarea rows={3} value={cmsData.hero.description} onChange={e => setCmsData({...cmsData, hero: {...cmsData.hero, description: e.target.value}})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="Descrição Principal" />
                                <input type="text" value={cmsData.hero.bgImage} onChange={e => setCmsData({...cmsData, hero: {...cmsData.hero, bgImage: e.target.value}})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="URL Imagem de Fundo" />
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                            <h3 className="text-lg font-bold mb-4 text-red-500">Seção Founder</h3>
                            <div className="grid gap-4">
                                <input type="text" value={cmsData.founder.name} onChange={e => setCmsData({...cmsData, founder: {...cmsData.founder, name: e.target.value}})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="Nome" />
                                <textarea rows={5} value={cmsData.founder.description} onChange={e => setCmsData({...cmsData, founder: {...cmsData.founder, description: e.target.value}})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="Bio do Founder" />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-red-900/20">Salvar Alterações do Site</button>
                    </form>
                )}

                {activeCmsTab === 'welcome' && (
                    <form onSubmit={handleWelcomeContentSubmit} className="space-y-6 max-w-4xl">
                         <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                            <h3 className="text-lg font-bold mb-4 text-red-500">Página de Boas-vindas</h3>
                            <div className="grid gap-4">
                                <input type="text" value={welcomeCmsData.hero.title} onChange={e => setWelcomeCmsData({...welcomeCmsData, hero: {...welcomeCmsData.hero, title: e.target.value}})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="Título" />
                                <input type="text" value={welcomeCmsData.whatsappLink} onChange={e => setWelcomeCmsData({...welcomeCmsData, whatsappLink: e.target.value})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="Link do Grupo WhatsApp" />
                                <textarea rows={3} value={welcomeCmsData.terms.text} onChange={e => setWelcomeCmsData({...welcomeCmsData, terms: {...welcomeCmsData.terms, text: e.target.value}})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="Termos de Acesso" />
                            </div>
                         </div>
                         <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold">Salvar Boas-vindas</button>
                    </form>
                )}

                {activeCmsTab === 'dashboard' && (
                    <form onSubmit={handleDashboardContentSubmit} className="space-y-6 max-w-4xl">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                            <h3 className="text-lg font-bold mb-4 text-red-500">Dashboard Banner</h3>
                            <div className="grid gap-4">
                                <input type="text" value={dashboardCmsData.banner.subtitle} onChange={e => setDashboardCmsData({...dashboardCmsData, banner: {...dashboardCmsData.banner, subtitle: e.target.value}})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="Frase Motivacional" />
                                <input type="text" value={dashboardCmsData.banner.bgImage} onChange={e => setDashboardCmsData({...dashboardCmsData, banner: {...dashboardCmsData.banner, bgImage: e.target.value}})} className="bg-black border border-slate-800 rounded p-2 text-white" placeholder="URL Imagem de Fundo" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold">Salvar Dashboard</button>
                    </form>
                )}
            </div>
        )}
        
        {/* REVIEWS SECTION */}
        {activeSection === 'reviews' && (
             <div className="space-y-8">
                <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Avaliações dos Membros</h2>
                <div className="grid lg:grid-cols-2 gap-4">
                    {testimonials.map((review) => (
                        <div key={review.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-start gap-4 hover:border-slate-700 transition-colors">
                            <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full bg-black border border-slate-800" />
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-white">{review.name}</h4>
                                        <p className="text-xs text-slate-500">{review.role}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-700"} />
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-black/50 p-3 rounded-lg border border-slate-800/50 mb-3">
                                    <p className="text-sm text-slate-300 italic">"{review.content}"</p>
                                </div>
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => handleDeleteReview(review.id)}
                                        className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-bold bg-red-950/20 px-3 py-1.5 rounded hover:bg-red-950/40 border border-red-900/20"
                                    >
                                        <Trash2 size={12} /> Remover
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {testimonials.length === 0 && (
                        <div className="lg:col-span-2 text-center py-12 text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                            Nenhuma avaliação recebida ainda.
                        </div>
                    )}
                </div>
             </div>
        )}
        
        {/* ANNOUNCEMENTS SECTION */}
        {activeSection === 'announcements' && (
             <div className="max-w-2xl mx-auto space-y-8">
                 <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Enviar Comunicado</h2>
                 <form onSubmit={handleAnnouncementSubmit} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-6">
                     <div>
                         <label className="block text-sm font-bold text-slate-400 mb-2">Título do Aviso</label>
                         <input type="text" value={announcementData.title} onChange={e => setAnnouncementData({...announcementData, title: e.target.value})} className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-red-600 outline-none" required placeholder="Ex: Manutenção Programada" />
                     </div>
                     <div>
                         <label className="block text-sm font-bold text-slate-400 mb-2">Mensagem</label>
                         <textarea rows={5} value={announcementData.message} onChange={e => setAnnouncementData({...announcementData, message: e.target.value})} className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-red-600 outline-none" required placeholder="Digite a mensagem para todos os membros..." />
                     </div>
                     <button type="submit" className="w-full bg-white hover:bg-slate-200 text-black py-4 rounded-lg font-bold flex items-center justify-center gap-2">
                         <Send size={18} /> Enviar para Todos
                     </button>
                 </form>
             </div>
        )}

        {/* INTEGRATIONS SECTION */}
        {activeSection === 'integrations' && (
            <div className="max-w-2xl mx-auto space-y-8">
                <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Integrações Google Workspace</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mt-8 border-t-4 border-t-blue-500">
                    <p className="text-slate-400 text-sm mb-6">
                        Configure a chave de API e os IDs para exibir vídeos do seu Google Drive e eventos do Google Meet na plataforma para os clientes.
                        <br/><span className="text-xs text-slate-500">Nota: O calendário e a pasta do drive devem estar configurados como "Públicos".</span>
                    </p>
                    
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        await updateWorkspaceSettings({
                            googleApiKey: formData.get('googleApiKey') as string,
                            googleDriveFolderId: formData.get('googleDriveFolderId') as string,
                            googleCalendarId: formData.get('googleCalendarId') as string
                        });
                        setSuccessMsg("Integrações salvas com sucesso!");
                        setTimeout(() => setSuccessMsg(''), 3000);
                    }} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Google API Key</label>
                            <input 
                                type="password" 
                                name="googleApiKey"
                                defaultValue={workspaceSettings?.googleApiKey || ''}
                                placeholder="AIzaSy..."
                                className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Google Drive Folder ID</label>
                            <input 
                                type="text" 
                                name="googleDriveFolderId"
                                defaultValue={workspaceSettings?.googleDriveFolderId || ''}
                                placeholder="Ex: 1A2b3C4d5E6f7G8h9I0j"
                                className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Google Calendar ID</label>
                            <input 
                                type="text" 
                                name="googleCalendarId"
                                defaultValue={workspaceSettings?.googleCalendarId || ''}
                                placeholder="example@group.calendar.google.com"
                                className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <button 
                                type="submit" 
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
                            >
                                <Save size={18} /> Salvar Integrações
                            </button>
                        </div>
                        {successMsg && (
                            <div className="mt-4 p-4 bg-green-900/20 border border-green-900/50 rounded-lg text-green-500 flex items-center gap-2 animate-fadeIn">
                                <Check size={18} /> {successMsg}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        )}

        {/* APPEARANCE SECTION */}
        {activeSection === 'appearance' && (
            <div className="max-w-2xl mx-auto space-y-8">
                <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Personalização Visual</h2>
                <form onSubmit={handleThemeSubmit} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Fonte Principal</label>
                        <select value={localThemeSettings.fontFamily} onChange={e => setLocalThemeSettings({...localThemeSettings, fontFamily: e.target.value as any})} className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white">
                            <option value="Inter">Inter (Padrão)</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Roboto Mono">Roboto Mono</option>
                            <option value="Playfair Display">Playfair Display</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Tamanho Base da Fonte</label>
                        <div className="grid grid-cols-3 gap-4">
                             {['14px', '16px', '18px'].map(size => (
                                 <button type="button" key={size} onClick={() => setLocalThemeSettings({...localThemeSettings, baseFontSize: size as any})} className={`py-3 rounded-lg border ${localThemeSettings.baseFontSize === size ? 'bg-red-600 border-red-600 text-white' : 'bg-black border-slate-800 text-slate-400'}`}>
                                     {size}
                                 </button>
                             ))}
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold">Aplicar Tema</button>
                </form>
            </div>
        )}

        {/* MEMBERS SECTION */}
        {activeSection === 'members' && hasMemberControl && (
            <div className="space-y-8">
                <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Gestão de Membros</h2>
                
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4">Membro</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Plano</th>
                                    <th className="p-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {sortedUsers.map(member => (
                                    <tr key={member.id} className="hover:bg-slate-800/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}`} alt="" className="w-10 h-10 rounded-full" />
                                                <div>
                                                    <div className="font-bold text-white">{member.name}</div>
                                                    <div className="text-xs text-slate-500">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                member.status === 'active' ? 'bg-green-900/20 text-green-500' : 
                                                member.status === 'blocked' ? 'bg-red-900/20 text-red-500' : 'bg-yellow-900/20 text-yellow-500'
                                            }`}>
                                                {member.status === 'active' ? 'Ativo' : member.status === 'blocked' ? 'Bloqueado' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-slate-300 capitalize">{plans.find(p => p.id === member.planId)?.name || member.planId || 'Starter'}</span>
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <button onClick={() => handleManageMember(member)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300" title="Editar Permissões"><Edit3 size={16} /></button>
                                            
                                            {member.status === 'active' ? (
                                                <button onClick={() => { updateUserStatus(member.id, 'blocked'); showToast('Usuário bloqueado'); }} className="p-2 bg-slate-800 hover:bg-red-900/50 rounded text-red-400" title="Bloquear"><UserX size={16} /></button>
                                            ) : member.status === 'blocked' ? (
                                                <button onClick={() => { updateUserStatus(member.id, 'active'); showToast('Usuário ativado'); }} className="p-2 bg-slate-800 hover:bg-green-900/50 rounded text-green-400" title="Ativar"><UserCheck size={16} /></button>
                                            ) : (
                                                <button onClick={() => { updateUserStatus(member.id, 'active'); showToast('Usuário aprovado'); }} className="p-2 bg-slate-800 hover:bg-green-900/50 rounded text-green-400" title="Aprovar Entrada"><Check size={16} /></button>
                                            )}

                                            <button onClick={() => handleDeleteMember(member.id)} className="p-2 bg-slate-800 hover:bg-red-900/50 rounded text-red-600" title="Excluir Membro"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {allUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500">Nenhum membro encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* MANAGE MEMBER MODAL */}
      {isManageMemberOpen && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-6">Gerenciar Acesso: {selectedMember.name}</h3>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-slate-500 mb-2">Plano de Acesso</label>
                          <select 
                              value={tempSelectedPlan} 
                              onChange={(e) => setTempSelectedPlan(e.target.value)} 
                              className="w-full bg-black border border-slate-800 rounded-lg p-3 text-white focus:border-red-600 outline-none"
                          >
                              {plans.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-500 mb-2">Módulos Liberados (Overrides)</label>
                          <div className="grid grid-cols-1 gap-2 bg-black p-4 rounded-lg border border-slate-800 max-h-60 overflow-y-auto custom-scrollbar">
                              {allSystemModules.map(mod => (
                                  <label key={mod} className="flex items-center gap-3 p-2 hover:bg-slate-900 rounded cursor-pointer transition-colors">
                                      <input 
                                          type="checkbox" 
                                          className="w-4 h-4 rounded border-slate-700 text-red-600 focus:ring-red-600 bg-slate-800"
                                          checked={tempAllowedModules.includes(mod)}
                                          onChange={(e) => {
                                              if (e.target.checked) {
                                                  setTempAllowedModules([...tempAllowedModules, mod]);
                                              } else {
                                                  setTempAllowedModules(tempAllowedModules.filter(m => m !== mod));
                                              }
                                          }}
                                      />
                                      <span className="text-sm text-slate-300">{mod}</span>
                                  </label>
                              ))}
                          </div>
                          <p className="text-[10px] text-slate-600 mt-2">
                              * Selecione módulos adicionais que este usuário deve ter acesso, além do plano padrão.
                          </p>
                      </div>
                  </div>

                  <div className="flex gap-4 mt-8 pt-6 border-t border-slate-800">
                      <button 
                          onClick={() => setIsManageMemberOpen(false)} 
                          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={handleSaveMember} 
                          className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-red-900/20"
                      >
                          Salvar Permissões
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* RESOURCE PREVIEW MODAL */}
      {previewResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/90 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-600/20 text-red-500 rounded-lg">
                              <FileText size={20} />
                          </div>
                          <div>
                              <h3 className="font-bold text-white text-lg">{previewResource.title}</h3>
                              <p className="text-xs text-slate-500">{previewResource.module} • {previewResource.fileName || 'Arquivo Externo'}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <a 
                              href={previewResource.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                          >
                              <Download size={16} /> Baixar
                          </a>
                          <button 
                              onClick={() => setPreviewResource(null)} 
                              className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-colors"
                          >
                              <X size={20} />
                          </button>
                      </div>
                  </div>
                  <div className="flex-1 bg-slate-950 relative">
                      {previewResource.url.toLowerCase().endsWith('.pdf') || previewResource.type === 'pdf' ? (
                          <iframe 
                              src={previewResource.url} 
                              className="w-full h-full border-0" 
                              title="PDF Preview"
                          />
                      ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                              <p>Pré-visualização não disponível para este tipo de arquivo.</p>
                              <a 
                                  href={previewResource.url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                              >
                                  Abrir em Nova Aba
                              </a>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Admin;