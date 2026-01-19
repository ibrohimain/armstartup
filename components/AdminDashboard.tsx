
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Submission, ViewMode } from '../types';

const AdminDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({ books: 0, events: 0, feedback: 0, activeRooms: 0 });
  
  const currentUser = auth.currentUser;
  const isKPIAdmin = currentUser?.email === 'umarabdullayev338@gmail.com';

  useEffect(() => {
    const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"), limit(5));
    const unsubSubmissions = onSnapshot(q, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));
    });

    onSnapshot(collection(db, "books"), s => setStats(prev => ({ ...prev, books: s.size })));
    onSnapshot(collection(db, "events"), s => setStats(prev => ({ ...prev, events: s.size })));
    onSnapshot(collection(db, "submissions"), s => setStats(prev => ({ ...prev, feedback: s.size })));
    onSnapshot(collection(db, "room_bookings"), s => setStats(prev => ({ ...prev, activeRooms: s.size })));

    return () => unsubSubmissions();
  }, []);

  const navigateTo = (view: ViewMode) => {
    window.dispatchEvent(new CustomEvent('changeView', { detail: view }));
  };

  return (
    <div className="p-2 sm:p-8 max-w-full animate-fade-in overflow-x-hidden">
      <div className="mb-8 px-2">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tighter uppercase">Admin Boshqaruv</h1>
        <p className="text-slate-500 font-medium text-sm sm:text-lg mt-1 opacity-80">ARM tizimi resurslari nazorati.</p>
        
        {isKPIAdmin && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></span>
            KPI TAHRIRI HUQUQI
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 px-1">
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">KITOBLAR</span>
          <span className="text-4xl sm:text-5xl font-black text-indigo-600 tracking-tighter">{stats.books}</span>
        </div>
        
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TADBIRLAR</span>
          <span className="text-4xl sm:text-5xl font-black text-emerald-500 tracking-tighter">{stats.events}</span>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MUROJAATLAR</span>
          <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tighter">{stats.feedback}</span>
        </div>

        <div className="bg-[#1a2332] p-6 sm:p-8 rounded-[2rem] shadow-2xl flex flex-col justify-between min-h-[120px] relative overflow-hidden group">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest relative z-10">KPI MONITORING</span>
          <span className="text-xl sm:text-2xl font-black text-white leading-tight relative z-10">Jonli Statistika</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight ml-2">Oxirgi Murojaatlar</h3>
           <div className="space-y-4">
              {submissions.map(sub => (
                <div key={sub.id} className="bg-white p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm transition-all group overflow-hidden">
                   <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                      <div>
                         <h4 className="font-black text-slate-800 text-base sm:text-lg truncate max-w-[200px] sm:max-w-none">{sub.name}</h4>
                         <p className="text-[10px] sm:text-xs font-bold text-indigo-500 tracking-tight">
                           {sub.email}
                         </p>
                      </div>
                      <span className="text-[8px] px-3 py-1 bg-slate-50 text-slate-500 rounded-full font-black uppercase tracking-widest">
                        {sub.category}
                      </span>
                   </div>
                   <p className="text-slate-600 font-medium leading-relaxed mb-6 italic opacity-80 text-sm sm:text-base">
                     {sub.message}
                   </p>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight ml-2">Tezkor Amallar</h3>
           <div className="flex flex-col gap-3">
              <button onClick={() => navigateTo(ViewMode.ADMIN_BOOKS)} className="w-full bg-indigo-600 text-white font-black py-4.5 rounded-2xl shadow-lg text-[10px] uppercase tracking-widest">Yangi Kitob</button>
              <button onClick={() => navigateTo(ViewMode.ADMIN_EVENTS)} className="w-full bg-[#1a2332] text-white font-black py-4.5 rounded-2xl shadow-lg text-[10px] uppercase tracking-widest">Tadbir E'lon Qilish</button>
              <button onClick={() => navigateTo(ViewMode.ARM_TEAM)} className="w-full bg-white text-slate-700 border border-slate-200 font-black py-4.5 rounded-2xl text-[10px] uppercase tracking-widest">Jamoa Vazifalari</button>
           </div>
           
           <div className="bg-[#fff9e6] p-6 rounded-[2rem] border border-amber-100">
              <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-2">Eslatma:</h4>
              <p className="text-amber-700/90 text-xs leading-relaxed font-medium italic">
                Barcha o'zgarishlar real vaqtda aks etadi. Sayt bo'yicha yo'riqnomani navigatsiya bo'limidan olishingiz mumkin.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
