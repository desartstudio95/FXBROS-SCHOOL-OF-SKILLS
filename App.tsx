import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AdminSetup from './pages/AdminSetup';
import Plans from './pages/Plans';
import Methodology from './pages/Methodology';
import Robots from './pages/Robots';
import About from './pages/About';
import Welcome from './pages/Welcome';
import SchoolOfSkills from './pages/SchoolOfSkills';
import { Terms, Privacy, Risk } from './pages/Legal';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/welcome') || location.pathname.startsWith('/school-of-skills') || location.pathname === '/admin-portal';
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {!location.pathname.startsWith('/welcome') && !location.pathname.startsWith('/school-of-skills') && location.pathname !== '/admin-portal' && <Navbar />}
      {children}
      {!isDashboard && <Footer />}
    </>
  );
};

const AppContent: React.FC = () => {
  const { themeSettings, loadingAuth } = useApp();

  // Inject Theme Settings into CSS Variables
  useEffect(() => {
    document.documentElement.style.setProperty('--font-main', themeSettings.fontFamily);
    document.documentElement.style.fontSize = themeSettings.baseFontSize;
  }, [themeSettings]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
         {/* Background Ambience */}
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/5 rounded-full blur-3xl"></div>
         
         <div className="relative z-10 flex flex-col items-center animate-fadeIn">
            <div className="w-20 h-20 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-600/10 animate-pulse"></div>
                <img 
                  src="https://i.ibb.co/G4bmxpLm/5.png" 
                  alt="FXBROS" 
                  className="w-10 h-10 object-contain relative z-10" 
                />
            </div>
            
            <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                <span className="text-white font-bold tracking-tight">FXBROS.</span>
            </div>
            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em]">Carregando Sistema</p>
         </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/robots" element={<Robots />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/school-of-skills" element={<SchoolOfSkills />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-portal" element={<AdminSetup />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/risk" element={<Risk />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Toaster position="top-right" theme="dark" richColors />
      <AppContent />
    </AppProvider>
  );
};

export default App;