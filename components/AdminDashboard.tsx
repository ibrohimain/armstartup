
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, limit } from 'firebase/firestore';
import { Submission, ViewMode } from '../types';
import { summarizeFeedback } from '../services/geminiService';

const AdminDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({ books: 0, events: 0, feedback: 0 });
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  
  const currentUser = auth.currentUser;
  const isKPIAdmin = currentUser?.email === 'umarabdullayev338@gmail.com';

  useEffect(() => {
    // Real-time Submissions
    const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"), limit(10));
    const unsubSubmissions = onSnapshot(q, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));
    });

    // Real-time Stats
    const unsubBooks = onSnapshot(collection(db, "books"), s => setStats(prev => ({ ...prev, books: s.size })));
    const unsubEvents = onSnapshot(collection(db, "events"), s => setStats(prev => ({ ...prev, events: s.size })));
    const unsubFeed = onSnapshot(collection(db, "submissions"), s => setStats(prev => ({ ...prev, feedback: s.size })));

    return () => { unsubSubmissions(); unsubBooks(); unsubEvents(); unsubFeed(); };
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
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Admin Boshqaruv Markazi</h1>
        <p className="text-slate-500">ARM tizimi barcha resurslarini yagona nuqtadan boshqaring.</p>
        {isKPIAdmin && <div className="mt-4 inline-block px-4 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">Sizda KPI tahriri huquqi mavjud</div>}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <button onClick={() => navigateTo(ViewMode.ADMIN_BOOKS)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kitoblar fondi</p>
          <p className="text-3xl font-black text-indigo-600">{stats.books}</p>
        </button>
        <button onClick={() => navigateTo(ViewMode.ADMIN_EVENTS)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tadbirlar</p>
          <p className="text-3xl font-black text-emerald-600">{stats.events}</p>
        </button>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jami Murojaatlar</p>
          <p className="text-3xl font-black text-slate-800">{stats.feedback}</p>
        </div>
        <button onClick={() => navigateTo(ViewMode.ARM_TEAM)} className="bg-slate-800 p-6 rounded-[2rem] text-white shadow-xl hover:bg-black transition-all text-left">
          <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">KPI Monitoring</p>
          <p className="text-xl font-bold">Jonli Statistika</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-xl text-slate-800 mb-4">Oxirgi Murojaatlar</h3>
          {submissions.map(sub => (
            <div key={sub.id} className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-800">{sub.name}</h4>
                  <p className="text-xs text-indigo-600">{sub.email} • {new Date(sub.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-[10px] px-3 py-1 bg-slate-100 rounded-full font-bold uppercase tracking-widest text-slate-500">{sub.category}</span>
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{sub.message}</p>
              
              {sub.aiSummary ? (
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-xs italic text-indigo-700">AI Xulosasi: {sub.aiSummary}</p>
                </div>
              ) : (
                <button 
                  onClick={() => handleSummarize(sub)}
                  disabled={summarizingId === sub.id}
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  {summarizingId === sub.id ? 'Tahlil...' : 'Gemini AI Tahlili'}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <h3 className="font-bold text-xl text-slate-800 mb-4">Tezkor Amallar</h3>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
             <button onClick={() => navigateTo(ViewMode.ADMIN_BOOKS)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:scale-[1.02] transition-all">Yangi Kitob Qo'shish</button>
             <button onClick={() => navigateTo(ViewMode.ADMIN_EVENTS)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all">Tadbir E'lon Qilish</button>
             <button onClick={() => navigateTo(ViewMode.ARM_TEAM)} className="w-full py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">Jamoa Vazifalari</button>
          </div>
          
          <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100">
             <h4 className="font-bold text-amber-800 mb-2 italic text-sm">Eslatma:</h4>
             <p className="text-xs text-amber-700 leading-relaxed">
               Barcha o'zgarishlar real vaqt rejimida talabalar portalida aks etadi. Ma'lumotlarni o'chirishdan oldin ehtiyot bo'ling.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
