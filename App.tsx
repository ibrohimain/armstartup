
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
import SystemManual from './components/SystemManual';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from "@firebase/auth";
import { collection, setDoc, doc, onSnapshot, deleteDoc, serverTimestamp } from "@firebase/firestore";

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState(1);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });

    const sessionId = Math.random().toString(36).substring(7);
    const sessionRef = doc(collection(db, "active_sessions"), sessionId);

    const setupPresence = async () => {
      try {
        await setDoc(sessionRef, {
          lastActive: serverTimestamp(),
          id: sessionId
        });
      } catch (e) { console.error(e); }
    };

    setupPresence();

    const unsubPresence = onSnapshot(collection(db, "active_sessions"), (snapshot) => {
      setActiveUsers(snapshot.size || 1);
    });

    const handleUnload = () => {
      deleteDoc(sessionRef);
    };
    window.addEventListener('beforeunload', handleUnload);

    const handleViewChange = (e: any) => {
      if (e.detail) {
        setViewMode(e.detail);
        setIsMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('changeView', handleViewChange);

    return () => {
      unsubscribeAuth();
      unsubPresence();
      handleUnload();
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('changeView', handleViewChange);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsMobileMenuOpen(false);
    setViewMode(ViewMode.DASHBOARD);
  };

  const navItems = [
    { id: ViewMode.DASHBOARD, label: 'Asosiy', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: ViewMode.CATALOG, label: 'Katalog', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13' },
    { id: ViewMode.DIGITAL_LIBRARY, label: 'Raqamli ARM', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2' },
    { id: ViewMode.ANALYTICS, label: 'Metodika', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10' },
    { id: ViewMode.SERVICE_DESK, label: 'Xizmatlar', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { id: ViewMode.SCIENTIFIC_ROADMAP, label: 'Ilmiy Ko\'mak', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9' },
    { id: ViewMode.USER_MANUAL, label: 'Yo\'riqnoma', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13' },
    { id: ViewMode.FEEDBACK, label: 'Murojaat Yo\'llash', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994-.586' }
  ];

  const adminNavItems = [
    { id: ViewMode.ADMIN_DASHBOARD, label: 'Dashboard' },
    { id: ViewMode.ARM_TEAM, label: 'ARM Team (Xodim)' },
    { id: ViewMode.ADMIN_ROOM_MANAGEMENT, label: 'Xona Boshqaruvi' },
    { id: ViewMode.ADMIN_CATALOGING, label: 'Smart Katalog' },
    { id: ViewMode.ADMIN_MANUALS, label: 'Metodika (+)' },
  ];

  const LiveBadge = () => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm">
       <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
       </span>
       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{activeUsers} Jonli</span>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden">
      <div className="h-28 flex flex-col justify-center px-6 shrink-0 gap-3">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => { setViewMode(ViewMode.DASHBOARD); setIsMobileMenuOpen(false); }}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
            </svg>
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-800 italic uppercase">ARM Hub</span>
        </div>
        <div className="self-start">
           <LiveBadge />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar px-3 py-2 flex flex-col gap-1">
        <div className="px-4 py-2 mb-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Asosiy Menyu</span>
        </div>
        {navItems.map(item => {
          const isActive = viewMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setViewMode(item.id); setIsMobileMenuOpen(false); }}
              className={`group flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 relative ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600 font-semibold'
              }`}
            >
              <div className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d={item.icon} />
                </svg>
              </div>
              <span className="text-[13px] tracking-tight">{item.label}</span>
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 shrink-0 mt-auto">
        {isAdmin ? (
          <div className="bg-slate-50/80 rounded-[2rem] p-3 border border-slate-100">
            <div className="px-3 py-1 mb-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Boshqaruv</span>
            </div>
            <div className="flex flex-col gap-1">
              {adminNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setViewMode(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 text-[11px] font-black uppercase tracking-wider ${
                    viewMode === item.id 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button 
              onClick={handleLogout}
              className="w-full mt-3 py-3 text-[9px] font-black text-rose-500 uppercase tracking-[0.3em] hover:bg-rose-50 rounded-xl transition-colors text-center"
            >
              CHIQISH
            </button>
          </div>
        ) : (
          <button 
            onClick={() => { setViewMode(ViewMode.ADMIN_LOGIN); setIsMobileMenuOpen(false); }} 
            className="w-full group bg-slate-900 text-white font-black py-4.5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            ADMIN KIRISH
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/30 flex flex-col lg:flex-row overflow-hidden font-sans">
      <aside className="hidden lg:block w-72 h-screen flex-shrink-0 border-r border-slate-100 bg-white z-50">
        <SidebarContent />
      </aside>

      <header className="lg:hidden sticky top-0 z-[100] w-full px-5 py-3.5 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div 
          className="flex items-center gap-2.5 cursor-pointer" 
          onClick={() => setViewMode(ViewMode.DASHBOARD)}
        >
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
            </svg>
          </div>
          <span className="font-black text-base tracking-tighter text-slate-800 uppercase italic">ARM Hub</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2.5 bg-slate-100 text-slate-700 rounded-xl active:scale-90 transition-all border border-slate-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      <div 
        className={`fixed inset-0 z-[150] lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        <div 
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`} 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <div 
          className={`absolute top-0 left-0 w-[280px] h-full bg-white shadow-2xl transition-transform duration-300 transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent />
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 active:scale-90"
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>
      </div>

      <main className="flex-grow h-screen overflow-y-auto relative no-scrollbar scroll-smooth">
        <div className="max-w-[1600px] mx-auto w-full p-4 sm:p-6 lg:p-10">
          <div className="min-h-full pb-20 lg:pb-0">
            {viewMode === ViewMode.DASHBOARD && (
              <div className="space-y-8 sm:space-y-12 animate-fade-in">
                 <div className="bg-indigo-600 rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-16 lg:p-24 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 backdrop-blur-md border border-white/10">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Oliy Ma'lumot Markazi
                      </div>
                      <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-8 leading-tight tracking-tighter">
                        Kelajak <br className="hidden sm:block"/>Kutubxonasi
                      </h1>
                      <p className="text-indigo-100 text-base sm:text-xl lg:text-2xl max-w-2xl mb-12 leading-relaxed font-medium opacity-90 italic">
                        Barcha ilmiy resurslar, elektron katalog va xizmatlar yagona intellektual platformada jamlangan.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <button onClick={() => setViewMode(ViewMode.CATALOG)} className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black shadow-2xl hover:bg-slate-50 transition-all text-[11px] uppercase tracking-[0.2em]">Katalog</button>
                        <button onClick={() => setViewMode(ViewMode.DIGITAL_LIBRARY)} className="bg-indigo-500/30 text-white border border-white/20 px-10 py-5 rounded-2xl font-black backdrop-blur-lg hover:bg-white/10 transition-all text-[11px] uppercase tracking-[0.2em]">Raqamli ARM</button>
                      </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-pointer" onClick={() => setViewMode(ViewMode.CATALOG)}>
                      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" /></svg>
                      </div>
                      <h3 className="font-black text-slate-800 mb-4 text-2xl tracking-tighter uppercase">Katalog</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed italic">Fonddagi barcha kitoblarni topish, band qilish va statusini kuzatish.</p>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-pointer" onClick={() => setViewMode(ViewMode.ANALYTICS)}>
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" /></svg>
                      </div>
                      <h3 className="font-black text-slate-800 mb-4 text-2xl tracking-tighter uppercase">Metodika</h3>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed italic">Uslubiy qo'llanmalar, me'yoriy hujjatlar va yillik ish rejalari bazasi.</p>
                    </div>
                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group" onClick={() => setViewMode(ViewMode.SCIENTIFIC_ROADMAP)}>
                      <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-10 group-hover:bg-indigo-600 transition-all">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9" /></svg>
                      </div>
                      <h3 className="font-black mb-4 text-2xl tracking-tighter uppercase">Ilmiy Ko'mak</h3>
                      <p className="text-indigo-200 opacity-70 text-sm font-medium leading-relaxed italic">Scopus bazalarida ishlash bo'yicha ekspert tavsiyalari va yo'riqnomalar.</p>
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
            {viewMode === ViewMode.USER_MANUAL && <SystemManual />}
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
        </div>
      </main>
    </div>
  );
};

export default App;
