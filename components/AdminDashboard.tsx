
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, limit } from 'firebase/firestore';
import { Submission, ViewMode } from '../types';
import { summarizeFeedback } from '../services/geminiService';

const AdminDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({ books: 0, events: 0, feedback: 0, activeRooms: 0 });
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  
  const currentUser = auth.currentUser;
  const isKPIAdmin = currentUser?.email === 'umarabdullayev338@gmail.com';

  useEffect(() => {
    // Real-time Submissions
    const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"), limit(5));
    const unsubSubmissions = onSnapshot(q, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));
    });

    // Real-time Stats
    onSnapshot(collection(db, "books"), s => setStats(prev => ({ ...prev, books: s.size })));
    onSnapshot(collection(db, "events"), s => setStats(prev => ({ ...prev, events: s.size })));
    onSnapshot(collection(db, "submissions"), s => setStats(prev => ({ ...prev, feedback: s.size })));
    onSnapshot(collection(db, "room_bookings"), s => setStats(prev => ({ ...prev, activeRooms: s.size })));

    return () => unsubSubmissions();
  }, []);

  const navigateTo = (view: ViewMode) => {
    window.dispatchEvent(new CustomEvent('changeView', { detail: view }));
  };

  const handleSummarize = async (sub: Submission) => {
    if (!sub.id) return;
    setSummarizingId(sub.id);
    const summary = await summarizeFeedback(sub.message);
    await updateDoc(doc(db, "submissions", sub.id), { aiSummary: summary });
    setSummarizingId(null);
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Admin Boshqaruv Markazi</h1>
        <p className="text-slate-500 font-medium text-lg mt-1 opacity-80">ARM tizimi barcha resurslarini yagona nuqtadan boshqaring.</p>
        
        {isKPIAdmin && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></span>
            SIZDA KPI TAHRIRI HUQUQI MAVJUD
          </div>
        )}
      </div>

      {/* Stats Cards Grid - EXACTLY LIKE IMAGE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[160px]">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KITOBLAR FONDI</span>
          <span className="text-6xl font-black text-indigo-600 tracking-tighter">{stats.books}</span>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[160px]">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TADBIRLAR</span>
          <span className="text-6xl font-black text-emerald-500 tracking-tighter">{stats.events}</span>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[160px]">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">JAMI MUROJAATLAR</span>
          <span className="text-6xl font-black text-slate-800 tracking-tighter">{stats.feedback}</span>
        </div>

        <div className="bg-[#1a2332] p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-transform duration-1000">
             <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">KPI MONITORING</span>
          <span className="text-3xl font-black text-white leading-tight">Jonli Statistika</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Recent Submissions */}
        <div className="lg:col-span-2 space-y-8">
           <h3 className="text-2xl font-black text-slate-800 tracking-tight ml-2">Oxirgi Murojaatlar</h3>
           <div className="space-y-6">
              {submissions.map(sub => (
                <div key={sub.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                         <h4 className="font-black text-slate-800 text-lg">{sub.name}</h4>
                         <p className="text-xs font-bold text-indigo-500 tracking-tight">
                           {sub.email} • {new Date(sub.createdAt).toLocaleDateString()}
                         </p>
                      </div>
                      <span className="text-[9px] px-3 py-1 bg-slate-100 text-slate-500 rounded-full font-black uppercase tracking-widest">
                        {sub.category}
                      </span>
                   </div>
                   <p className="text-slate-600 font-medium leading-relaxed mb-6 italic opacity-80 text-base">
                     {sub.message}
                   </p>
                   
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleSummarize(sub)}
                        disabled={summarizingId === sub.id}
                        className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all"
                      >
                        {summarizingId === sub.id ? 'Tahlil...' : 'Gemini AI Tahlili'}
                      </button>
                      
                      {sub.aiSummary && (
                        <div className="flex-grow bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-left-2">
                           <p className="text-[11px] font-bold text-indigo-700 italic">
                             ✦ AI Xulosasi: {sub.aiSummary}
                           </p>
                        </div>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Right Column: Quick Actions & Notices */}
        <div className="space-y-8">
           <h3 className="text-2xl font-black text-slate-800 tracking-tight ml-2">Tezkor Amallar</h3>
           
           <div className="space-y-4">
              <button 
                onClick={() => navigateTo(ViewMode.ADMIN_BOOKS)}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest"
              >
                Yangi Kitob Qo'shish
              </button>
              
              <button 
                onClick={() => navigateTo(ViewMode.ADMIN_EVENTS)}
                className="w-full bg-[#1a2332] text-white font-black py-5 rounded-[1.5rem] shadow-xl hover:bg-black transition-all uppercase text-xs tracking-widest"
              >
                Tadbir E'lon Qilish
              </button>

              <button 
                onClick={() => navigateTo(ViewMode.ARM_TEAM)}
                className="w-full bg-white text-slate-700 border border-slate-200 font-black py-5 rounded-[1.5rem] shadow-sm hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
              >
                Jamoa Vazifalari
              </button>
           </div>

           {/* Notice Box - EXACTLY AS PER IMAGE */}
           <div className="bg-[#fff9e6] p-8 rounded-[2.5rem] border border-amber-100 mt-10">
              <h4 className="text-sm font-black text-amber-800 uppercase tracking-widest mb-4">Eslatma:</h4>
              <p className="text-amber-700/90 text-sm leading-relaxed font-medium italic">
                "Barcha o'zgarishlar real vaqt rejimida talabalar portalida aks etadi. Ma'lumotlarni o'chirishdan oldin ehtiyot bo'ling."
              </p>
           </div>
           
           {/* System Status Display */}
           <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mx-auto mb-4 animate-pulse"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">TIZIM HOLATI: ONLINE</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
