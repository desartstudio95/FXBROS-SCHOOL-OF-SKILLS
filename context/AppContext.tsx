import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendEmailVerification,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs,
  query,
  where,
  addDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL
} from 'firebase/storage';
import { auth, db, storage } from '../firebaseConfig';
import type { User, VideoLesson, PricingPlan, HomeContent, ThemeSettings, Testimonial, ModuleResource, PlansPageContent, ModuleMetadata, WelcomeContent, DashboardContent, AppNotification } from '../types';

import { toast } from 'sonner';

interface AppContextType {
  user: User | null;
  loadingAuth: boolean;
  login: (email: string, password?: string) => Promise<string | null>;
  loginAsAdminByCode: () => void;
  register: (email: string, password: string, name: string) => Promise<string | null>;
  // Admin System Functions
  checkSystemInitialized: () => Promise<boolean>;
  registerSystemAdmin: (email: string, password: string, name: string) => Promise<string | null>;
  
  resetPassword: (email: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  
  // Content Management
  videos: VideoLesson[];
  addVideo: (video: VideoLesson) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  updateVideo: (video: VideoLesson) => Promise<void>;
  uploadVideo: (file: File, videoId?: string) => Promise<string>;
  uploadImage: (file: File, path?: string, fixedName?: string) => Promise<string>;
  
  resources: ModuleResource[];
  addResource: (resource: ModuleResource) => void; 
  uploadResource: (file: File | null, meta: { title: string, module: string, notes?: string, aiSummary?: string, url?: string }) => Promise<string | null>;
  deleteResource: (id: string) => Promise<void>;
  
  plans: PricingPlan[];
  addPlan: (plan: PricingPlan) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  updatePlan: (plan: PricingPlan) => Promise<void>;
  
  // CMS Content
  plansPageContent: PlansPageContent;
  updatePlansPageContent: (content: PlansPageContent) => Promise<void>;
  modulesMetadata: ModuleMetadata[];
  updateModuleMetadata: (metadata: ModuleMetadata) => Promise<void>;
  deleteModuleMetadata: (id: string) => Promise<void>;
  homeContent: HomeContent;
  updateHomeContent: (content: HomeContent) => Promise<void>;
  welcomeContent: WelcomeContent;
  updateWelcomeContent: (content: WelcomeContent) => Promise<void>;
  dashboardContent: DashboardContent;
  updateDashboardContent: (content: DashboardContent) => Promise<void>;
  
  themeSettings: ThemeSettings;
  updateThemeSettings: (settings: ThemeSettings) => void;
  
  testimonials: Testimonial[];
  addTestimonial: (testimonial: Testimonial) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  
  // User Progress
  completedVideoIds: string[];
  toggleVideoCompletion: (id: string) => Promise<void>;
  favoriteVideoIds: string[];
  toggleVideoFavorite: (id: string) => Promise<void>;
  
  // User Management
  allUsers: User[];
  updateUserStatus: (userId: string, status: 'active' | 'pending' | 'blocked') => Promise<void>;
  updateUserProfile: (name: string, photoFile?: File | null) => Promise<string | null>;
  updateUserModules: (userId: string, modules: string[]) => void;
  updateUserPlan: (userId: string, planId: string) => void;
  deleteUser: (userId: string) => Promise<void>; 
  deleteAccount: () => Promise<string | null>; 
  markNotificationAsRead: (userId: string, notificationId: string) => void;
  sendGlobalAnnouncement: (title: string, message: string) => void;
  requestNotificationPermission: () => void;
}

// --- DEFAULTS (Content & Data) ---

const defaultPlans: PricingPlan[] = [
  { id: 'starter', name: 'Starter', price: '2.500 MZN', features: ['Acesso ao Módulo Fundamentos', 'Suporte Básico via Email', 'Acesso à Comunidade Discord', '1 Aula ao Vivo Mensal'], isPopular: false, isElite: false },
  { id: 'pro', name: 'Pro Trader', price: '5.000 MZN', features: ['Acesso Completo a Todos os Módulos', 'Mentoria Semanal', 'Análise Diária', 'Suporte Prioritário', 'Indicadores Exclusivos'], isPopular: true, isElite: false },
  { id: 'elite', name: 'Mentoria Elite', price: '15.000 MZN', features: ['Tudo do Pro', 'Acompanhamento 1x1', 'Sala ao Vivo', 'Gestão Personalizada', 'Modo Quant (IA)'], isPopular: false, isElite: true }
];

const defaultTestimonials: Testimonial[] = [
  { id: '1', name: 'Carlos Mendes', role: 'Trader Consistente', content: 'A metodologia institucional mudou completamente minha visão. Parei de caçar topos e fundos e comecei a seguir o dinheiro inteligente.', rating: 5, image: 'https://ui-avatars.com/api/?name=Carlos+Mendes&background=0D8ABC&color=fff' },
  { id: '2', name: 'Ana Paula', role: 'Aluna Pro', content: 'O suporte da equipe FXBROS é incrível. As aulas de psicologia foram essenciais para eu parar de quebrar bancas.', rating: 5, image: 'https://ui-avatars.com/api/?name=Ana+Paula&background=E40437&color=fff' }
];

const defaultModulesMetadata: ModuleMetadata[] = [
  { id: 'Fundamentos', name: '01. Fundamentos', description: 'A base sólida necessária para iniciar no mercado Forex. Entenda o que move o preço.', thumbnail: 'https://images.unsplash.com/photo-1611974765215-0dd5963263c4?auto=format&fit=crop&q=80&w=600', isHighlight: true },
  { id: 'AnaliseTecnica', name: '02. Análise Técnica', description: 'Domine a leitura gráfica, price action e indicadores essenciais.', thumbnail: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=600', isHighlight: true },
  { id: 'Institucional', name: '03. Smart Money Concepts', description: 'Aprenda como os bancos operam. Order Blocks, Liquidez e Estrutura.', thumbnail: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&q=80&w=600', isHighlight: true },
  { id: 'Psicologia', name: '04. Psicologia do Trader', description: 'Blindagem mental e gestão emocional para alta performance.', thumbnail: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80&w=600', isHighlight: false }
];

const defaultHomeContent: HomeContent = {
  hero: { badge: 'Educação de Nível Institucional', titleLine1: 'Domine a Arte da', titleHighlight: 'Precisão no Trading', description: 'Junte-se ao círculo de elite de traders lucrativos. Combinamos análise técnica, dados institucionais e treinamento psicológico rigoroso.', bgImage: 'https://i.ibb.co/8Lt4Yrb1/Whisk-76888b109aec7939e59491f4a2baecafdr.jpg' },
  about: { badge: 'Nossa Metodologia', title: 'Trading Baseado em Dados. Sem Achismos.', description: 'Ensinamos você a interpretar o mercado pela ótica institucional.', imageUrl: 'https://i.ibb.co/bjrMzyJP/Whisk-b7b5d8d9cc7bdb4b2c94e4cb8a9d59addr.jpg', items: ["Análise Institucional", "Gestão de Risco", "Algoritmos", "Psicologia"] },
  founder: { 
    name: 'Isaac Mugabe', 
    role: 'Coach - Fundador', 
    description: `Fundador e Trader Profissional com 6 anos de experiência no mercado Forex, dedicou sua carreira ao estudo profundo dos mercados financeiros, gestão de risco e desenvolvimento de estratégias consistentes. Ao longo desses anos, construiu uma metodologia própria baseada em disciplina, análise técnica e controle emocional — pilares essenciais para a longevidade no trading.

Com experiência prática em diferentes ciclos de mercado, seu foco sempre foi transformar conhecimento técnico em resultados reais e sustentáveis. A academia nasceu com o propósito de ensinar Forex de forma clara, profissional e responsável, ajudando traders a evoluírem com método, mentalidade correta e visão de longo prazo.

Mais do que ensinar a operar, o fundador acredita em formar traders preparados para tomar decisões conscientes, gerir risco com inteligência e atuar no mercado com consistência e profissionalismo.`, 
    imageUrl: 'https://i.ibb.co/qYvQNZrY/FXBROS-WORLD-2.png', 
    yearsExp: '6+', 
    assetsManaged: '2B MT' 
  },
  footer: { description: 'A primeira academia High-Tech de Forex. Formamos traders consistentes através de dados institucionais e psicologia avançada.', instagramLink: 'https://www.instagram.com/_forexbros_/', youtubeLink: 'https://youtube.com/@fxbroscapital', whatsappLink: 'https://wa.link/r71g96', supportEmail: 'suporte@fxbros.com', copyrightText: '© 2026 FXBROS SCHOOL OF SKILLS.' }
};

const defaultPlansPageContent: PlansPageContent = {
  hero: { badge: 'Investimento em Você', title: 'Escolha Seu Nível de Excelência', subtitle: 'Planos desenhados para acompanhar cada estágio da sua evolução.', bgImage: 'https://i.ibb.co/tpNWk1b3/Whisk-d222899255279fb84a0494d3fcb069a1dr.jpg' },
  benefitsSection: { title: 'Por que FXBROS?', subtitle: 'Ecossistema completo focado em alta performance.' }
};

const defaultWelcomeContent: WelcomeContent = {
  hero: { title: 'Bem-vindo à FXBROS.', subtitlePrefix: 'Olá,', subtitleSuffix: 'Sua jornada para a consistência começa agora.', bgImage: 'https://i.ibb.co/0y04kDk1/Whisk-b3242647bfe5403b0614d6233e6f09d5dr.jpg' },
  section1: { title: 'O Caminho do Trader', items: ['Domínio completo da estrutura.', 'Gestão de risco profissional.', 'Psicologia avançada.'] },
  section2: { title: 'O Que Esperamos de Você', items: ['Disciplina inegociável.', 'Resiliência.', 'Comprometimento.'] },
  terms: { text: 'Todo conteúdo disponibilizado na plataforma é de propriedade intelectual da FXBROS.' },
  whatsappLink: 'https://chat.whatsapp.com/Bu1f0JvEl017bFuTiOJz1Q'
};

const defaultDashboardContent: DashboardContent = {
  banner: { titlePrefix: "Olá,", subtitle: "Continue sua jornada rumo à consistência.", bgImage: "https://images.unsplash.com/photo-1611974765215-0dd5963263c4?auto=format&fit=crop&q=80&w=1200" },
  sections: { continueWatchingTitle: "Assistir Agora", modulesTitle: "Módulos do Treinamento" },
  devQuantForPro: true
};

const defaultThemeSettings: ThemeSettings = { fontFamily: 'Inter', baseFontSize: '16px' };

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to convert File to Base64 for local storage persistence
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

function usePersistedState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.warn("Error reading from localStorage", e);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem(key, JSON.stringify(state));
    } catch(e) {
        console.warn("Storage quota exceeded or error saving", e);
    }
  }, [key, state]);

  return [state, setState];
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- DATABASE STATE ---
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [resources, setResources] = useState<ModuleResource[]>([]);
  
  // SESSION STATE
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // --- CONTENT STATE (Local Persisted for now) ---
  const [plans, setPlans] = usePersistedState<PricingPlan[]>('fxbros_plans', defaultPlans);
  // const [modulesMetadata, setModulesMetadata] = usePersistedState<ModuleMetadata[]>('fxbros_modules', defaultModulesMetadata);
  const [modulesMetadata, setModulesMetadata] = useState<ModuleMetadata[]>([]);
  const [testimonials, setTestimonials] = usePersistedState<Testimonial[]>('fxbros_testimonials', defaultTestimonials);
  
  // CMS Content
  const [homeContent, setHomeContent] = usePersistedState<HomeContent>('fxbros_home_content', defaultHomeContent);
  const [plansPageContent, setPlansPageContent] = usePersistedState<PlansPageContent>('fxbros_plans_page', defaultPlansPageContent);
  const [welcomeContent, setWelcomeContent] = usePersistedState<WelcomeContent>('fxbros_welcome', defaultWelcomeContent);
  const [dashboardContent, setDashboardContent] = usePersistedState<DashboardContent>('fxbros_dashboard_v2', defaultDashboardContent);
  const [themeSettings, setThemeSettings] = usePersistedState<ThemeSettings>('fxbros_theme', defaultThemeSettings);

  // User Progress
  const [completedVideoIds, setCompletedVideoIds] = useState<string[]>([]);
  const [favoriteVideoIds, setFavoriteVideoIds] = useState<string[]>([]);

  // --- FETCH DATA ---
  const fetchModulesMetadata = useCallback(async () => {
      try {
          const querySnapshot = await getDocs(collection(db, "modules"));
          const list: ModuleMetadata[] = [];
          querySnapshot.forEach((doc) => {
              list.push(doc.data() as ModuleMetadata);
          });
          
          if (list.length === 0) {
              // Seed default data
              console.log("Seeding default modules metadata...");
              for (const meta of defaultModulesMetadata) {
                  await setDoc(doc(db, "modules", meta.id), meta);
                  list.push(meta);
              }
          }
          
          setModulesMetadata(list);
      } catch (error) {
          console.error("Error fetching modules metadata:", error);
          // Fallback to default if error (e.g. offline)
          setModulesMetadata(prev => prev.length === 0 ? defaultModulesMetadata : prev);
      }
  }, []);

  const fetchAllUsers = useCallback(async () => {
      try {
          const querySnapshot = await getDocs(collection(db, "users"));
          const usersList: User[] = [];
          querySnapshot.forEach((doc) => {
              usersList.push(doc.data() as User);
          });
          setAllUsers(usersList);
      } catch (error: any) {
          if (error.code !== 'permission-denied') console.error("Error fetching users:", error);
      }
  }, []);

  const fetchVideos = useCallback(async () => {
      try {
          const querySnapshot = await getDocs(collection(db, "videos"));
          const vList: VideoLesson[] = [];
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              vList.push({
                  id: doc.id,
                  title: data.title,
                  description: data.description || "",
                  thumbnail: data.thumbnailURL || data.thumbnail || "",
                  videoUrl: data.videoURL || data.videoUrl || "",
                  duration: data.duration || "10:00",
                  module: data.module || "Geral",
                  dateAdded: data.createdAt?.toDate?.().toISOString() || new Date().toISOString()
              });
          });
          setVideos(vList);
      } catch (error) {
          console.warn("Error fetching videos");
      }
  }, []);

  const fetchResources = useCallback(async () => {
      try {
          const querySnapshot = await getDocs(collection(db, "resources"));
          const rList: ModuleResource[] = [];
          querySnapshot.forEach((doc) => {
              rList.push({ id: doc.id, ...doc.data() } as ModuleResource);
          });
          setResources(rList);
      } catch (error) {
          console.warn("Error fetching resources");
      }
  }, []);

  useEffect(() => {
      if (user) {
          fetchVideos();
          fetchResources();
          fetchModulesMetadata();
      }
  }, [user, fetchVideos, fetchResources, fetchModulesMetadata]);

  // --- AUTH & USER SYNC ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If email is not verified, we generally don't allow access, or handle it as unverified
        // But let's check verification status
        if (firebaseUser.emailVerified) {
             try {
                const docRef = doc(db, "users", firebaseUser.uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const userData = docSnap.data() as User;
                    setUser({ ...userData, id: docSnap.id });
                    setCompletedVideoIds(userData.completedVideos || []);
                    setFavoriteVideoIds(userData.favoriteVideos || []);
                } else {
                    // User authenticated but no doc? Should not happen if registered correctly.
                    setUser(null);
                }
             } catch (error) {
                 console.error("Error fetching user doc", error);
                 setUser(null);
             }
        } else {
            // Email not verified
            setUser(null); 
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync users list if admin
  useEffect(() => {
      if (user && (user.role === 'admin' || user.role === 'super_admin')) {
          fetchAllUsers();
      }
  }, [user]);

  // --- ACTIONS ---

  const login = async (email: string, password?: string): Promise<string | null> => {
      try {
          if (!password) throw new Error("Senha é obrigatória");
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          if (!userCredential.user.emailVerified) {
              await signOut(auth);
              return 'unverified';
          }
          return null; // Success
      } catch (error: any) {
          return error.message;
      }
  };

  const loginAsAdminByCode = () => {
      console.log("Login by code not implemented in Firebase version");
  };

  const register = async (email: string, password: string, name: string): Promise<string | null> => {
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await sendEmailVerification(userCredential.user);
          
          const newUser: User = {
              id: userCredential.user.uid,
              name,
              email,
              role: 'member',
              status: 'pending',
              joinDate: new Date().toISOString(),
              notifications: []
          };
          
          await setDoc(doc(db, "users", userCredential.user.uid), newUser);
          await signOut(auth); // Force logout to enforce verification
          return null;
      } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') return "Usuário já existe. Deseja fazer login?";
          return error.message;
      }
  };

  const checkSystemInitialized = async (): Promise<boolean> => {
      try {
          const q = query(collection(db, "users"), where("role", "==", "super_admin"));
          const snapshot = await getDocs(q);
          return !snapshot.empty;
      } catch (e) {
          // console.error("Error checking system init", e);
          return true; // Assume initialized on error to prevent hijacking
      }
  };

  const registerSystemAdmin = async (email: string, password: string, name: string): Promise<string | null> => {
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await sendEmailVerification(userCredential.user);

          const newAdmin: User = {
              id: userCredential.user.uid,
              name,
              email,
              role: 'super_admin',
              status: 'active', // Auto active
              joinDate: new Date().toISOString(),
              notifications: []
          };
          
          await setDoc(doc(db, "users", userCredential.user.uid), newAdmin);
          await signOut(auth);
          return null;
      } catch (error: any) {
          return error.message;
      }
  };

  const resetPassword = async (email: string): Promise<string | null> => {
      try {
          await sendPasswordResetEmail(auth, email);
          return null;
      } catch (error: any) {
          return error.message;
      }
  };

  const logout = async () => {
      await signOut(auth);
      setUser(null);
  };

  const refreshUserProfile = async () => {
      if (!auth.currentUser) return;
      try {
          const docRef = doc(db, "users", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
              setUser({ id: docSnap.id, ...docSnap.data() } as User);
          }
      } catch (e) {
          console.error("Refresh profile error", e);
      }
  };

  // Content Management

  const addVideo = async (video: VideoLesson) => {
      try {
          await setDoc(doc(db, "videos", video.id), {
              ...video,
              createdAt: new Date()
          });
          fetchVideos();
      } catch (error) {
          console.error("Error adding video", error);
      }
  };

  const deleteVideo = async (id: string) => {
      try {
          await deleteDoc(doc(db, "videos", id));
          fetchVideos();
      } catch (error) {
          console.error("Error deleting video", error);
      }
  };

  const updateVideo = async (video: VideoLesson) => {
      try {
          await updateDoc(doc(db, "videos", video.id), { ...video });
          fetchVideos();
      } catch (error) {
           console.error("Error updating video", error);
      }
  };

  const uploadVideo = async (file: File, videoId?: string): Promise<string> => {
      try {
          // Use specific path if videoId is provided, as requested
          let storagePath = `videos/${Date.now()}_${file.name}`;
          if (videoId) {
              storagePath = `videos/${videoId}/video.mp4`;
          }
          
          console.log(`Iniciando upload de vídeo para: ${storagePath}`);
          const storageRef = ref(storage, storagePath);
          
          // Adiciona metadados para garantir que o tipo de arquivo seja correto (video/mp4)
          // Isso é CRUCIAL para que o navegador reproduza em vez de baixar
          const metadata = {
              contentType: file.type || 'video/mp4',
          };

          const result = await uploadBytes(storageRef, file, metadata);
          const url = await getDownloadURL(result.ref);
          console.log(`Upload de vídeo concluído: ${url}`);
          return url;
      } catch (error: any) {
          console.error("Erro detalhado no uploadVideo:", error);
          if (error.code === 'storage/unauthorized') {
              throw new Error(`Permissão negada para salvar vídeo. Verifique as regras do Storage.`);
          }
          throw error;
      }
  };

  const uploadImage = async (file: File, path: string = 'images', fixedName?: string): Promise<string> => {
       try {
           // Using specific path logic for thumbnails if requested
           let storagePath = `${path}/${Date.now()}_${file.name}`;
           
           if (fixedName) {
               // Se fixedName for passado, usa ele como nome do arquivo (sobrescreve anterior)
               // Isso é útil para avatares (avatars/USER_ID)
               storagePath = `${path}/${fixedName}`;
           } else if (path === 'thumbnails') {
               storagePath = `thumbnails/${file.name}`;
           }

           console.log(`Iniciando upload de imagem para: ${storagePath}`);
           const storageRef = ref(storage, storagePath);
           
           // Adiciona metadados para garantir que o tipo de arquivo seja correto
           const metadata = {
               contentType: file.type,
           };

           const result = await uploadBytes(storageRef, file, metadata);
           const url = await getDownloadURL(result.ref);
           console.log(`Upload concluído com sucesso: ${url}`);
           return url;
       } catch (error: any) {
           console.error("Erro detalhado no uploadImage:", error);
           if (error.code === 'storage/unauthorized') {
               throw new Error(`Permissão negada para salvar em '${path}'. Verifique as regras do Storage.`);
           }
           throw error;
       }
  };

  const addResource = (resource: ModuleResource) => {
     // Handled by uploadResource usually, but if manually added:
     // Implement if needed for manual entry without file upload
  };

  const uploadResource = async (file: File | null, meta: { title: string, module: string, notes?: string, aiSummary?: string, url?: string }): Promise<string | null> => {
      try {
          let downloadURL = meta.url || "";
          if (file) {
              const storageRef = ref(storage, `resources/${Date.now()}_${file.name}`);
              const result = await uploadBytes(storageRef, file);
              downloadURL = await getDownloadURL(result.ref);
          }

          const newResource: ModuleResource = {
              id: Date.now().toString(),
              title: meta.title,
              module: meta.module,
              type: 'pdf',
              url: downloadURL,
              dateAdded: new Date().toISOString(),
              notes: meta.notes,
              aiSummary: meta.aiSummary,
              fileName: file?.name
          };

          await setDoc(doc(db, "resources", newResource.id), newResource);
          fetchResources();
          return null;
      } catch (error: any) {
          return error.message;
      }
  };

  const deleteResource = async (id: string) => {
      try {
          await deleteDoc(doc(db, "resources", id));
          fetchResources();
      } catch (error) {
          console.error("Error deleting resource", error);
      }
  };

  // Plans Management (Local Persisted)
  const addPlan = async (plan: PricingPlan) => setPlans([...plans, plan]);
  const deletePlan = async (id: string) => setPlans(plans.filter(p => p.id !== id));
  const updatePlan = async (plan: PricingPlan) => setPlans(plans.map(p => p.id === plan.id ? plan : p));

  // CMS
  const updatePlansPageContent = async (content: PlansPageContent) => setPlansPageContent(content);
  const updateHomeContent = async (content: HomeContent) => setHomeContent(content);
  const updateWelcomeContent = async (content: WelcomeContent) => setWelcomeContent(content);
  const updateDashboardContent = async (content: DashboardContent) => setDashboardContent(content);
  const updateModuleMetadata = async (meta: ModuleMetadata) => {
      try {
          await setDoc(doc(db, "modules", meta.id), meta);
          // Optimistic update or refetch
          setModulesMetadata(prev => {
              const exists = prev.find(m => m.id === meta.id);
              if (exists) {
                  return prev.map(m => m.id === meta.id ? meta : m);
              } else {
                  return [...prev, meta];
              }
          });
      } catch (e) {
          console.error("Error updating module metadata", e);
      }
  };
  const deleteModuleMetadata = async (id: string) => {
      try {
          await deleteDoc(doc(db, "modules", id));
          setModulesMetadata(prev => prev.filter(m => m.id !== id));
      } catch (e) {
          console.error("Error deleting module metadata", e);
      }
  };
  
  const updateThemeSettings = (settings: ThemeSettings) => setThemeSettings(settings);
  
  const addTestimonial = async (t: Testimonial) => setTestimonials([...testimonials, t]);
  const deleteTestimonial = async (id: string) => setTestimonials(testimonials.filter(t => t.id !== id));

  // User Progress
  const toggleVideoCompletion = async (id: string) => {
      if (!user) return;
      
      const newCompleted = completedVideoIds.includes(id) 
          ? completedVideoIds.filter(v => v !== id) 
          : [...completedVideoIds, id];
      
      setCompletedVideoIds(newCompleted);
      
      // Optimistic update for user state
      setUser(prev => prev ? { ...prev, completedVideos: newCompleted } : null);

      try {
          await updateDoc(doc(db, "users", user.id), { completedVideos: newCompleted });
      } catch (e) {
          console.error("Error updating completed videos", e);
      }
  };

  const toggleVideoFavorite = async (id: string) => {
      if (!user) return;

      const newFavorites = favoriteVideoIds.includes(id) 
          ? favoriteVideoIds.filter(v => v !== id) 
          : [...favoriteVideoIds, id];
      
      setFavoriteVideoIds(newFavorites);
      
      // Optimistic update for user state
      setUser(prev => prev ? { ...prev, favoriteVideos: newFavorites } : null);

      try {
          await updateDoc(doc(db, "users", user.id), { favoriteVideos: newFavorites });
      } catch (e) {
          console.error("Error updating favorite videos", e);
      }
  };

  // User Management
  const updateUserStatus = async (userId: string, status: 'active' | 'pending' | 'blocked') => {
      try {
          await updateDoc(doc(db, "users", userId), { status });
          fetchAllUsers();
      } catch (e) {
          console.error("Update status error", e);
      }
  };

  const updateUserProfile = async (name: string, photoFile?: File | null): Promise<string | null> => {
      if (!user) return "Usuário não autenticado";
      try {
          let photoURL = user.avatar;
          if (photoFile) {
              console.log("Iniciando atualização de avatar...");
              // Upload to 'avatars' folder with the user ID as the filename (overwrites previous)
              photoURL = await uploadImage(photoFile, 'avatars', user.id);
          } else if (photoFile === null) {
              photoURL = ""; // Remove photo
          }

          await updateDoc(doc(db, "users", user.id), {
              name,
              avatar: photoURL
          });
          
          setUser(prev => prev ? { ...prev, name, avatar: photoURL } : null);
          return null;
      } catch (e: any) {
          console.error("Erro ao atualizar perfil:", e);
          return e.message;
      }
  };

  const updateUserModules = async (userId: string, modules: string[]) => {
      try {
          await updateDoc(doc(db, "users", userId), { allowedModules: modules });
          fetchAllUsers();
      } catch(e) { console.error(e); }
  };
  
  const updateUserPlan = async (userId: string, planId: string) => {
      try {
          await updateDoc(doc(db, "users", userId), { planId });
          fetchAllUsers();
      } catch(e) { console.error(e); }
  };

  const deleteUser = async (userId: string) => {
      try {
          await deleteDoc(doc(db, "users", userId));
          fetchAllUsers();
      } catch(e) { console.error(e); }
  };

  const deleteAccount = async (): Promise<string | null> => {
      if (!auth.currentUser) return "Erro";
      try {
          await deleteDoc(doc(db, "users", auth.currentUser.uid));
          await auth.currentUser.delete();
          return null;
      } catch (e: any) {
          return e.message;
      }
  };

  const markNotificationAsRead = async (userId: string, notificationId: string) => {
    if (!user || !user.notifications) return;
    try {
      const updatedNotifications = user.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      await updateDoc(doc(db, "users", userId), { notifications: updatedNotifications });
      setUser({ ...user, notifications: updatedNotifications });
    } catch (e) {
      console.error("Erro ao marcar notificação:", e);
    }
  };

  const sendGlobalAnnouncement = async (title: string, message: string) => {
    try {
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      
      const newNotification: AppNotification = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        message,
        read: false,
        date: new Date().toISOString(),
        type: 'info'
      };

      const promises = snapshot.docs.map(userDoc => {
        const userData = userDoc.data() as User;
        const notifications = userData.notifications || [];
        return updateDoc(doc(db, "users", userDoc.id), {
          notifications: [...notifications, newNotification]
        });
      });

      await Promise.all(promises);
      toast.success("Anúncio enviado com sucesso!");
    } catch (e) {
      console.error("Erro ao enviar anúncio global:", e);
      toast.error("Erro ao enviar anúncio.");
    }
  };

  const requestNotificationPermission = () => {
    toast.info("Notificações Push ativadas no navegador!");
  };

  const value: AppContextType = {
      user,
      loadingAuth,
      login,
      loginAsAdminByCode,
      register,
      checkSystemInitialized,
      registerSystemAdmin,
      resetPassword,
      logout,
      refreshUserProfile,
      
      videos,
      addVideo,
      deleteVideo,
      updateVideo,
      uploadVideo,
      uploadImage,
      
      resources,
      addResource,
      uploadResource,
      deleteResource,
      
      plans,
      addPlan,
      deletePlan,
      updatePlan,
      
      plansPageContent,
      updatePlansPageContent,
      modulesMetadata,
      updateModuleMetadata,
      deleteModuleMetadata,
      homeContent,
      updateHomeContent,
      welcomeContent,
      updateWelcomeContent,
      dashboardContent,
      updateDashboardContent,
      
      themeSettings,
      updateThemeSettings,
      
      testimonials,
      addTestimonial,
      deleteTestimonial,
      
      completedVideoIds,
      toggleVideoCompletion,
      favoriteVideoIds,
      toggleVideoFavorite,
      
      allUsers,
      updateUserStatus,
      updateUserProfile,
      updateUserModules,
      updateUserPlan,
      deleteUser,
      deleteAccount,
      markNotificationAsRead,
      sendGlobalAnnouncement,
      requestNotificationPermission
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};