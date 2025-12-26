
import React, { useState, useEffect } from 'react';
import { ViewMode } from './types';
import UserForm from './components/UserForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Catalog from './components/Catalog';
import Events from './components/Events';
import MyCabinet from './components/MyCabinet';
import Analytics from './components/Analytics';
import ServiceDesk from './components/ServiceDesk';
import DigitalLibrary from './components/DigitalLibrary';
import ScientificRoadmap from './components/ScientificRoadmap';
import ARMTeam from './components/ARMTeam';
import AdminRoadmap from './components/AdminRoadmap';
import AdminBooks from './components/AdminBooks';
import AdminEvents from './components/AdminEvents';
import AdminManuals from './components/AdminManuals';
import SmartCatalog from './components/SmartCatalog';
import AdminRoomManagement from './components/AdminRoomManagement';
import AIChatbot from './components/AIChatbot';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './index.css';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });

    const handleViewChange = (e: any) => {
      if (e.detail) {
        setViewMode(e.detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('changeView', handleViewChange);

    return () => {
      unsubscribe();
      window.removeEventListener('changeView', handleViewChange);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setViewMode(ViewMode.DASHBOARD);
  };

  const navItems = [
    { id: ViewMode.DASHBOARD, label: 'Asosiy', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: ViewMode.CATALOG, label: 'Katalog', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: ViewMode.DIGITAL_LIBRARY, label: 'Raqamli ARM', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: ViewMode.ANALYTICS, label: 'Metodika', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2' },
    { id: ViewMode.SERVICE_DESK, label: 'Xizmatlar', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { id: ViewMode.SCIENTIFIC_ROADMAP, label: 'Ilmiy Ko\'mak', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9' },
    { id: ViewMode.EVENTS, label: 'Tadbirlar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col flex-shrink-0 animate-in fade-in slide-in-from-left duration-500">
        <div className="p-8 flex-grow flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-3 text-indigo-600 mb-10 flex-shrink-0 cursor-pointer" onClick={() => setViewMode(ViewMode.DASHBOARD)}>
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-800 italic">ARM Hub</span>
          </div>

          <nav className="flex-grow space-y-1 overflow-y-auto pr-2 scroll-smooth no-scrollbar">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${viewMode === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                <span className="font-bold tracking-wide text-sm">{item.label}</span>
              </button>
            ))}
            <button onClick={() => setViewMode(ViewMode.FEEDBACK)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${viewMode === ViewMode.FEEDBACK ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
              <span className="font-bold text-sm tracking-wide">Murojaat Yo'llash</span>
            </button>
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-50 flex-shrink-0">
            {isAdmin ? (
              <div className="space-y-2 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2 px-1">Admin Boshqaruvi</p>
                <button onClick={() => setViewMode(ViewMode.ADMIN_DASHBOARD)} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === ViewMode.ADMIN_DASHBOARD ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-600 hover:bg-indigo-100'}`}>Dashboard</button>
                <button onClick={() => setViewMode(ViewMode.ARM_TEAM)} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === ViewMode.ARM_TEAM ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}>ARM Team (Xodim)</button>
                <button onClick={() => setViewMode(ViewMode.ADMIN_ROOM_MANAGEMENT)} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === ViewMode.ADMIN_ROOM_MANAGEMENT ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}>Xona Boshqaruvi</button>
                <button onClick={() => setViewMode(ViewMode.ADMIN_CATALOGING)} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === ViewMode.ADMIN_CATALOGING ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}>Smart Katalog</button>
                <button onClick={() => setViewMode(ViewMode.ADMIN_MANUALS)} className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === ViewMode.ADMIN_MANUALS ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-white'}`}>Metodika (+)</button>
                <button onClick={handleLogout} className="w-full text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest mt-4">Chiqish</button>
              </div>
            ) : (
              <button onClick={() => setViewMode(ViewMode.ADMIN_LOGIN)} className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl text-sm hover:bg-black transition-all shadow-lg hover:scale-[1.02]">Admin Kirish</button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative pb-24 lg:pb-0 scroll-smooth no-scrollbar">
        <div className="flex-grow max-w-7xl mx-auto w-full animate-fade-in p-2 sm:p-4 lg:p-0">
          {viewMode === ViewMode.DASHBOARD && (
            <div className="p-4 sm:p-8">
               <div className="bg-indigo-600 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-16 text-white shadow-2xl mb-12 relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="bg-indigo-500/50 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 inline-block backdrop-blur-md border border-white/10">Yagona Axborot Markazi</span>
                    <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight tracking-tight">Ilm-fan va <br/>Inovatsiyalar ARM</h1>
                    <p className="text-indigo-100 text-base sm:text-xl max-w-2xl mb-10 leading-relaxed font-medium">Barcha turdagi axborot resurslari, raqamli PDF fondi va xalqaro bazalar bilan ishlash tizimi.</p>
                    <div className="flex flex-wrap gap-4">
                      <button onClick={() => setViewMode(ViewMode.CATALOG)} className="bg-white text-indigo-600 px-10 py-4.5 rounded-[1.5rem] font-black shadow-xl hover:scale-105 transition-all text-sm uppercase tracking-wider">Katalogga o'tish</button>
                      <button onClick={() => setViewMode(ViewMode.ANALYTICS)} className="bg-indigo-500/40 text-white border border-white/20 px-10 py-4.5 rounded-[1.5rem] font-black backdrop-blur-md hover:bg-indigo-500 transition-all text-sm uppercase tracking-wider">Metodik Bo'lim</button>
                    </div>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 pointer-events-none">
                    <svg className="w-[30rem] h-[30rem]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
                    <h3 className="font-black text-slate-800 mb-4 text-2xl">Smart Katalog</h3>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">Kitoblarni qidirish, QR-kod orqali ma'lumot olish va onlayn band qilish imkoniyati.</p>
                    <button onClick={() => setViewMode(ViewMode.CATALOG)} className="text-indigo-600 font-black text-sm hover:translate-x-2 transition-transform inline-flex items-center gap-2 uppercase">KITOB QIDIRISH →</button>
                  </div>
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2" /></svg></div>
                    <h3 className="font-black text-slate-800 mb-4 text-2xl">Metodik Markaz</h3>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">Sohaga oid metodik qo'llanmalar va davriy nashrlar bazasi.</p>
                    <button onClick={() => setViewMode(ViewMode.ANALYTICS)} className="text-emerald-600 font-black text-sm hover:translate-x-2 transition-transform inline-flex items-center gap-2 uppercase">METODIKAGA O'TISH →</button>
                  </div>
                  <div className="bg-slate-800 p-10 rounded-[2.5rem] text-white shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-8"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9" /></svg></div>
                    <h3 className="font-black mb-4 text-2xl">Ilmiy Ko'mak</h3>
                    <p className="text-sm opacity-70 mb-8 leading-relaxed">Scopus va WoS jurnallari uchun ilmiy yo'l xaritalari.</p>
                    <button onClick={() => setViewMode(ViewMode.SCIENTIFIC_ROADMAP)} className="text-white font-black text-sm hover:translate-x-2 transition-transform inline-flex items-center gap-2 uppercase">YO'L XARITASI →</button>
                  </div>
               </div>
            </div>
          )}
          {viewMode === ViewMode.CATALOG && <Catalog />}
          {viewMode === ViewMode.DIGITAL_LIBRARY && <DigitalLibrary />}
          {viewMode === ViewMode.SCIENTIFIC_ROADMAP && <ScientificRoadmap />}
          {viewMode === ViewMode.SERVICE_DESK && <ServiceDesk />}
          {viewMode === ViewMode.EVENTS && <Events />}
          {viewMode === ViewMode.MY_CABINET && <MyCabinet />}
          {viewMode === ViewMode.FEEDBACK && <UserForm />}
          {viewMode === ViewMode.ANALYTICS && <Analytics />}
          
          {/* Admin Views */}
          {viewMode === ViewMode.ADMIN_LOGIN && !isAdmin && <AdminLogin onLoginSuccess={() => setViewMode(ViewMode.ADMIN_DASHBOARD)} />}
          {viewMode === ViewMode.ADMIN_DASHBOARD && isAdmin && <AdminDashboard />}
          {viewMode === ViewMode.ADMIN_BOOKS && isAdmin && <AdminBooks />}
          {viewMode === ViewMode.ADMIN_EVENTS && isAdmin && <AdminEvents />}
          {viewMode === ViewMode.ADMIN_ROADMAP && isAdmin && <AdminRoadmap />}
          {viewMode === ViewMode.ADMIN_MANUALS && isAdmin && <AdminManuals />}
          {viewMode === ViewMode.ADMIN_CATALOGING && isAdmin && <SmartCatalog />}
          {viewMode === ViewMode.ADMIN_ROOM_MANAGEMENT && isAdmin && <AdminRoomManagement />}
          {viewMode === ViewMode.ARM_TEAM && isAdmin && <ARMTeam />}
        </div>

        <AIChatbot />

        {/* Improved Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2rem] px-6 py-4 flex justify-around items-center z-50 animate-in slide-in-from-bottom-20 duration-700">
           <button onClick={() => setViewMode(ViewMode.DASHBOARD)} className={`flex flex-col items-center transition-all ${viewMode === ViewMode.DASHBOARD ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
           </button>
           <button onClick={() => setViewMode(ViewMode.CATALOG)} className={`flex flex-col items-center transition-all ${viewMode === ViewMode.CATALOG ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
           </button>
           <button onClick={() => setViewMode(ViewMode.ANALYTICS)} className={`flex flex-col items-center transition-all ${viewMode === ViewMode.ANALYTICS ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2" /></svg>
           </button>
           <button onClick={() => setViewMode(ViewMode.MY_CABINET)} className={`flex flex-col items-center transition-all ${viewMode === ViewMode.MY_CABINET ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
           </button>
           {isAdmin && (
             <button onClick={() => setViewMode(ViewMode.ADMIN_DASHBOARD)} className={`flex flex-col items-center transition-all ${viewMode === ViewMode.ADMIN_DASHBOARD ? 'text-amber-500 scale-110' : 'text-slate-400'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </button>
           )}
        </div>
      </main>
    </div>
  );
};

export default App;
