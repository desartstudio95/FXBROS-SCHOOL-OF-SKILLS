export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
  type: 'info' | 'success' | 'warning';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'super_admin';
  avatar?: string;
  photoFileName?: string | null; // Nome original do arquivo da foto (Firestore uses null)
  status: 'active' | 'pending' | 'blocked';
  joinDate: string;
  planId?: string; // ID do plano assinado
  allowedModules?: string[]; // Lista de nomes de módulos permitidos (overrides ou adicionais)
  subscribedCourses?: string[]; // Novos cursos como "SCHOOL OF SKILLS"
  notifications?: AppNotification[];
  completedVideos?: string[];
  favoriteVideos?: string[];
}

export interface VideoLesson {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string; // YouTube embed URL or internal
  duration: string;
  module: string;
  dateAdded: string;
}

export interface ModuleResource {
  id: string;
  title: string;
  url: string;
  module: string; // Módulo ao qual o PDF pertence
  type: 'pdf';
  dateAdded: string;
  // New fields for file management
  notes?: string;
  aiSummary?: string;
  userId?: string; // ID of user who uploaded
  fileName?: string;
}

export interface ModuleMetadata {
  id: string; // O ID será o próprio nome do módulo
  name: string;
  description: string;
  thumbnail: string;
  isHighlight?: boolean; // Define se o módulo aparece na seção de destaque
  isLocked?: boolean; // Define se o módulo está bloqueado para todos (exceto admin)
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  isElite?: boolean;
  allowedModules?: string[]; // Módulos que este plano libera automaticamente
  paymentLink?: string; // Link externo para pagamento (opcional)
}

export interface PlansPageContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    bgImage: string;
  };
  benefitsSection: {
    title: string;
    subtitle: string;
  };
}

export interface WelcomeContent {
  hero: {
    title: string;
    subtitlePrefix: string; // "Olá, [Nome]. "
    subtitleSuffix: string; // "Sua jornada..."
    bgImage: string;
  };
  section1: {
    title: string;
    items: string[];
  };
  section2: {
    title: string;
    items: string[];
  };
  terms: {
    text: string;
  };
  whatsappLink: string;
}

export interface DashboardContent {
  banner: {
    titlePrefix: string; // "Olá,"
    subtitle: string;
    bgImage: string;
  };
  sections: {
    continueWatchingTitle: string;
    modulesTitle: string;
  };
  devQuantForPro?: boolean;
}

export interface HomeContent {
  hero: {
    badge: string;
    titleLine1: string;
    titleHighlight: string;
    description: string;
    bgImage: string;
  };
  about: {
    badge: string;
    title: string;
    description: string;
    imageUrl: string;
    items: string[];
  };
  founder: {
    name: string;
    role: string;
    description: string;
    imageUrl: string;
    yearsExp: string;
    assetsManaged: string;
  };
  footer: {
    description: string;
    instagramLink: string;
    youtubeLink: string;
    whatsappLink: string;
    supportEmail: string;
    copyrightText: string;
  };
}

export interface AboutPageContent {
  hero: {
    badge: string;
    title: string;
    description: string;
  };
  mission: {
    title: string;
    description: string;
    image: string;
  };
  values: {
    title: string;
    subtitle: string;
    items: { title: string; description: string }[];
  };
}

export interface RobotDefinition {
  id: string;
  name: string;
  type: string;
  description: string;
  price: string;
  features: string[];
  image: string;
  accent: string;
}

export interface RobotsPageContent {
  hero: {
    badge: string;
    title: string;
    description: string;
  };
  stats: { label: string; value: string; suffix: string }[];
  catalog: {
    title: string;
    subtitle: string;
  };
}

export interface ThemeSettings {
  fontFamily: 'Inter' | 'Montserrat' | 'Roboto Mono' | 'Playfair Display';
  baseFontSize: '14px' | '16px' | '18px';
}