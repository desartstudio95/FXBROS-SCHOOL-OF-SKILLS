import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Camera, Edit2, LogOut, Layout, PlayCircle, Lock, 
  MessageSquare, Send, UserCircle, Settings, Image as ImageIcon,
  Loader2, CheckCircle2, ChevronRight, Files, Bell, Star
} from 'lucide-react';
import { db } from '../firebaseConfig';
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  limit, serverTimestamp, Timestamp 
} from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: any;
}

const SchoolOfSkills: React.FC = () => {
  const { user, logout, updateUserProfile, uploadImage, videos, completedVideoIds } = useApp();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'lessons' | 'profile' | 'chat'>('lessons');
  const [name, setName] = useState(user?.name || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || (!user.subscribedCourses?.includes('SCHOOL OF SKILLS') && user.role !== 'admin' && user.role !== 'super_admin')) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Handle Chat Subscription
  useEffect(() => {
    if (activeTab === 'chat') {
        const q = query(
            collection(db, "sos_chat"),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list: Message[] = [];
            snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(list.reverse());
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
        });

        return () => unsubscribe();
    }
  }, [activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
        await addDoc(collection(db, "sos_chat"), {
            text: newMessage,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar || null,
            createdAt: serverTimestamp()
        });
        setNewMessage('');
    } catch (error) {
        console.error("Error sending message", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        await updateUserProfile(name, photoFile);
        setIsSaving(false);
        // Refresh local preview
        setPhotoFile(null);
    } catch (error) {
        console.error(error);
        setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  // Filter lessons for SOS
  const sosLessons = videos.filter(v => 
    v.module.includes('SOS') || 
    v.module.includes('Skills') || 
    v.module.includes('Rooter')
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      {/* Sidebar / Topbar for Mobile */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-40 lg:hidden">
         <div className="flex items-center gap-2">
            <img src="https://i.ibb.co/G4bmxpLm/5.png" alt="FXBROS" className="w-8 h-8 object-contain" />
            <span className="font-bold tracking-tighter text-lg">SCHOOL OF <span className="text-red-600">SKILLS</span></span>
         </div>
         <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-full h-full object-cover" />
         </button>
      </div>

      <div className="flex h-screen pt-16 lg:pt-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 h-full bg-[#050505] border-r border-white/5 flex-col p-6 fixed left-0 top-0 overflow-y-auto">
            <div className="mb-10 flex items-center gap-3">
                <img src="https://i.ibb.co/G4bmxpLm/5.png" alt="FXBROS" className="w-10 h-10 object-contain" />
                <div>
                   <h1 className="font-black text-xl leading-none">SOS.</h1>
                   <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest mt-1">School of Skills</p>
                </div>
            </div>

            <nav className="space-y-2 flex-grow">
                <button 
                  onClick={() => setActiveTab('lessons')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'lessons' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <PlayCircle size={18} /> Aulas do Curso
                </button>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <MessageSquare size={18} /> Chat ao Vivo
                </button>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <UserCircle size={18} /> Meu Perfil
                </button>
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                    </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={18} /> Sair
                </button>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-72 p-6 lg:p-10 overflow-y-auto w-full">
            
            {/* TAB: LESSONS */}
            {activeTab === 'lessons' && (
                <div className="animate-fadeIn">
                    <div className="mb-6">
                        <h2 className="text-3xl lg:text-4xl font-black mb-2">School of Skills</h2>
                        <p className="text-slate-500">Mergulhe fundo na Rooter Strategy e domine o mercado.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sosLessons.length > 0 ? sosLessons.map((video, idx) => (
                          <div key={video.id} className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden group hover:border-red-600/50 transition-all hover:scale-[1.02]">
                             <div className="aspect-video relative overflow-hidden">
                                <img src={video.thumbnail || `https://picsum.photos/seed/${video.id}/640/360`} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                                        <PlayCircle className="text-white" size={32} />
                                    </div>
                                </div>
                                <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-[10px] font-bold">{video.duration}</div>
                             </div>
                             <div className="p-6">
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1 block">Aula {idx + 1}</span>
                                <h3 className="font-bold text-white mb-2 line-clamp-1">{video.title}</h3>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{video.description}</p>
                                <div className="flex items-center justify-between">
                                    {completedVideoIds.includes(video.id) ? (
                                        <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                                            <CheckCircle2 size={14} /> Concluída
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400">Pendente</span>
                                    )}
                                    <button className="text-[10px] font-black uppercase text-white hover:text-red-500 transition-colors flex items-center gap-1">Assistir <ChevronRight size={12} /></button>
                                </div>
                             </div>
                          </div>
                        )) : (
                            <div className="lg:col-span-3 py-12 text-center bg-slate-950/40 border border-dashed border-white/10 rounded-[3rem]">
                                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Files className="text-slate-700" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-400 mb-2">Primeiras aulas sendo processadas</h3>
                                <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">Estamos preparando o conteúdo oficial da Rooter Strategy. Em breve, as aulas aparecerão aqui.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
                <div className="max-w-2xl mx-auto animate-fadeIn">
                     <div className="text-center mb-6">
                        <h2 className="text-4xl font-black mb-2">Meu Perfil</h2>
                        <p className="text-slate-500">Gerencie sua identidade no School of Skills.</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-8 bg-slate-950/40 border border-white/5 p-8 lg:p-12 rounded-[3rem]">
                         <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-red-600/30 group-hover:border-red-600 transition-colors shadow-2xl">
                                    <img 
                                      src={photoPreview || user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                                      alt="Avatar" 
                                      className="w-full h-full object-cover" 
                                    />
                                </div>
                                <label className="absolute bottom-0 right-0 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-all hover:scale-110">
                                    <Camera size={18} />
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setPhotoFile(file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => setPhotoPreview(reader.result as string);
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <p className="text-[10px] text-slate-600 mt-4 uppercase tracking-widest font-bold">Clique no ícone para alterar a foto</p>
                         </div>

                         <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Nome de Exibição</label>
                                <input 
                                  type="text" 
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:border-red-600 outline-none transition-all font-bold"
                                  placeholder="Como devemos te chamar?"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Endereço de E-mail</label>
                                <div className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-slate-500 text-sm font-bold opacity-50 cursor-not-allowed">
                                    {user.email}
                                </div>
                            </div>
                         </div>

                         <button 
                           type="submit" 
                           disabled={isSaving}
                           className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-red-900/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                         >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Settings size={16} />}
                            {isSaving ? 'Salvando...' : 'Atualizar Perfil'}
                         </button>
                    </form>
                </div>
            )}

            {/* TAB: CHAT */}
            {activeTab === 'chat' && (
                <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-80px)] flex flex-col bg-slate-950/40 border border-white/5 rounded-[3rem] overflow-hidden animate-fadeIn">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                Live Chat: School of Skills
                            </h2>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Interaja com a comunidade Rooter</p>
                        </div>
                        <div className="flex -space-x-2">
                             {[1,2,3,4].map(i => (
                                 <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 overflow-hidden">
                                     <img src={`https://i.pravatar.cc/100?u=fxbros${i}`} alt="User" />
                                 </div>
                             ))}
                             <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold border-2 border-slate-950">+12</div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-start gap-4 ${msg.userId === user.id ? 'flex-row-reverse' : ''}`}>
                                <img 
                                  src={msg.userAvatar || `https://ui-avatars.com/api/?name=${msg.userName}&background=random`} 
                                  alt={msg.userName} 
                                  className="w-10 h-10 rounded-xl object-cover shrink-0" 
                                />
                                <div className={`flex flex-col ${msg.userId === user.id ? 'items-end' : ''}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-slate-500 uppercase">{msg.userName}</span>
                                        <span className="text-[9px] text-slate-700 italic">{(msg.createdAt as Timestamp)?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-sm ${msg.userId === user.id ? 'bg-red-600 text-white rounded-tr-none shadow-lg shadow-red-900/10' : 'bg-slate-900 text-slate-300 rounded-tl-none border border-white/5'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-8 border-t border-white/5 bg-black/20">
                        <form onSubmit={handleSendMessage} className="flex gap-4">
                            <input 
                              type="text" 
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Digite sua mensagem para a comunidade..."
                              className="flex-1 bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:border-red-600 outline-none transition-all"
                            />
                            <button 
                              type="submit"
                              className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-red-900/20 hover:scale-105 active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default SchoolOfSkills;
