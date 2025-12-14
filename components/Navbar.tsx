import React, { useState, useEffect } from 'react';
import { Menu, X, GraduationCap, LogIn, LayoutDashboard, LogOut, Users, Trophy } from 'lucide-react';
import { User, LibraryStat } from '../types';
import { storageService } from '../services/storageService';

interface NavbarProps {
  onNavigate: (view: string) => void;
  currentView: string;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<LibraryStat>(storageService.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
        setStats(storageService.getStats());
    }, 5000);
    const handleStorageUpdate = () => setStats(storageService.getStats());
    window.addEventListener('storage_updated', handleStorageUpdate);
    return () => {
        clearInterval(interval);
        window.removeEventListener('storage_updated', handleStorageUpdate);
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Bosh sahifa' },
    { id: 'search', label: 'Elektron Katalog' },
    { id: 'competition', label: 'Reyting', icon: <Trophy className="w-4 h-4 mr-1 text-yellow-500" /> }, // New Link
    { id: 'departments', label: 'Bo\'limlar' },
    { id: 'news', label: 'Media Markaz' },
  ];

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center cursor-pointer group" onClick={() => handleNavClick('home')}>
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
                <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col ml-3">
              <span className="font-extrabold text-xl tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">JizPI ARM</span>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Future Library 2030</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    currentView === item.id
                      ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-4">
             <div className="hidden xl:flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100" title="Bugungi tashriflar">
                 <div className="relative flex h-3 w-3 mr-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                 </div>
                 <Users className="w-4 h-4 text-gray-400 mr-2" />
                 <span className="text-xs font-bold text-gray-700">{stats.dailyVisits.toLocaleString()}</span>
             </div>

             <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {user ? (
                <div className="flex items-center space-x-2">
                {user.role === 'admin' && (
                    <button onClick={() => handleNavClick('admin')} className={`flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all ${currentView === 'admin' ? 'bg-yellow-400 text-blue-900' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Boshqaruv
                    </button>
                )}
                <button onClick={onLogout} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all"><LogOut className="w-5 h-5" /></button>
                </div>
            ) : (
                <button onClick={() => handleNavClick('login')} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-md">
                <LogIn className="w-4 h-4 mr-2" /> Kirish
                </button>
            )}
          </div>

          <div className="flex lg:hidden items-center space-x-4">
            <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full border border-gray-100 lg:hidden">
                 <div className="relative flex h-2 w-2 mr-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></div>
                 <span className="text-xs font-bold text-gray-700">{stats.dailyVisits}</span>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-blue-600 focus:outline-none p-2">{isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-fadeIn">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => handleNavClick(item.id)} className={`flex items-center w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${currentView === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                {item.icon} <span className={item.icon ? "ml-2" : ""}>{item.label}</span>
              </button>
            ))}
            <div className="border-t border-gray-100 my-2 pt-2">
                {user ? (
                <>
                    {user.role === 'admin' && <button onClick={() => handleNavClick('admin')} className="flex items-center w-full px-4 py-3 text-yellow-600 font-bold hover:bg-yellow-50 rounded-xl"><LayoutDashboard className="w-5 h-5 mr-3"/> Admin Panel</button>}
                    <button onClick={onLogout} className="flex items-center w-full px-4 py-3 text-red-500 font-medium hover:bg-red-50 rounded-xl"><LogOut className="w-5 h-5 mr-3"/> Chiqish</button>
                </>
                ) : (
                <button onClick={() => handleNavClick('login')} className="flex items-center w-full px-4 py-3 text-blue-600 font-bold hover:bg-blue-50 rounded-xl"><LogIn className="w-5 h-5 mr-3"/> Tizimga kirish</button>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
