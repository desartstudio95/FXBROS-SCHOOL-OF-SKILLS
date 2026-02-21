import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname === '/login';
  
  const handleLogout = async () => {
      await logout();
      setIsMenuOpen(false);
      navigate('/login');
  };

  if (isAuthPage) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="https://i.ibb.co/G4bmxpLm/5.png" 
              alt="FXBROS Logo" 
              className="w-10 h-10 object-contain transform group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
            />
            <span className="text-2xl font-bold text-white font-sans tracking-tight">
              FXBROS<span className="text-red-600">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors text-sm font-medium uppercase tracking-wide">Início</Link>
            <Link to="/plans" className="text-slate-300 hover:text-white transition-colors text-sm font-medium uppercase tracking-wide">Planos</Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                 <Link 
                  to={user.role === 'admin' ? "/admin" : "/dashboard"} 
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  <LayoutDashboard size={16} className="text-red-500" />
                  <span className="text-sm font-medium">{user.role === 'admin' ? 'Painel Admin' : 'Área de Membros'}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Sair"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all shadow-lg shadow-red-900/20 uppercase tracking-wide"
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-300 hover:text-white"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md uppercase tracking-wide font-medium"
            >
              Início
            </Link>
            <Link 
              to="/plans"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md uppercase tracking-wide font-medium"
            >
              Planos
            </Link>
             {user ? (
              <>
                <Link 
                  to={user.role === 'admin' ? "/admin" : "/dashboard"} 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-3 text-red-500 hover:bg-slate-800 rounded-md font-medium uppercase tracking-wide"
                >
                  {user.role === 'admin' ? 'Painel Admin' : 'Área de Membros'}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-3 text-slate-400 hover:bg-slate-800 rounded-md uppercase tracking-wide font-medium"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center mt-4 px-5 py-3 rounded-lg bg-red-600 text-white font-bold uppercase"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;