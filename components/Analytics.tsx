
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { getManagementInsights } from '../services/geminiService';
import { MethodicalManual, Periodical, RegulationDoc, CulturalEvent, ARM_STRUCTURE } from '../types';

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'management' | 'methodology' | 'activities' | 'journals'>('management');
  const [manuals, setManuals] = useState<MethodicalManual[]>([]);
  const [periodicals, setPeriodicals] = useState<Periodical[]>([]);
  const [regulations, setRegulations] = useState<RegulationDoc[]>([]);
  const [culturalEvents, setCulturalEvents] = useState<CulturalEvent[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('All');
  const [selectedManual, setSelectedManual] = useState<MethodicalManual | null>(null);

  useEffect(() => {
    const unsubManuals = onSnapshot(query(collection(db, "manuals"), orderBy("createdAt", "desc")), (s) => {
      setManuals(s.docs.map(doc => ({ id: doc.id, ...doc.data() } as MethodicalManual)));
    });
    const unsubPeriodicals = onSnapshot(collection(db, "periodicals"), (s) => {
      setPeriodicals(s.docs.map(doc => ({ id: doc.id, ...doc.data() } as Periodical)));
    });
    const unsubRegs = onSnapshot(query(collection(db, "regulations"), orderBy("createdAt", "desc")), (s) => {
      setRegulations(s.docs.map(doc => ({ id: doc.id, ...doc.data() } as RegulationDoc)));
    });
    const unsubEvents = onSnapshot(query(collection(db, "cultural_events"), orderBy("createdAt", "desc")), (s) => {
      setCulturalEvents(s.docs.map(doc => ({ id: doc.id, ...doc.data() } as CulturalEvent)));
    });

    return () => { unsubManuals(); unsubPeriodicals(); unsubRegs(); unsubEvents(); };
  }, []);

  const handleGetAiAdvice = async () => {
    setLoadingAi(true);
    const statsStr = `ARMda ${regulations.length}ta me'yoriy hujjat, ${culturalEvents.length}ta rejalashtirilgan tadbir bor.`;
    const insight = await getManagementInsights(statsStr);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto min-h-screen animate-fade-in">
      {/* Dynamic Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-100 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
            Ilmiy-Nazorat Markazi
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tighter">Metodika va Monitoring</h1>
          <p className="text-slate-500 font-medium italic mt-1 opacity-80">Me'yoriy hujjatlar va metodik ishlar yagona bazasi.</p>
        </div>

        {/* Improved Professional Tab Bar */}
        <div className="bg-white p-1.5 border border-slate-100 rounded-[2rem] shadow-sm flex items-center overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'management', label: 'Boshqaruv' },
            { id: 'methodology', label: 'Metodik fond' },
            { id: 'activities', label: 'Monitoring' },
            { id: 'journals', label: 'Nashrlar' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid with Compact AI Widget */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* LEFT/MAIN CONTENT AREA */}
        <div className="xl:col-span-3">
          {activeTab === 'management' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regulations.map(reg => (
                  <div key={reg.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${
                        reg.category === 'Nizom' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>{reg.category}</span>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Hujjat ID: #{reg.id?.slice(-4)}</span>
                    </div>
                    <h4 className="font-black text-xl text-slate-800 mb-4 leading-tight group-hover:text-indigo-600 transition-colors">{reg.title}</h4>
                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-3">
                       <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mas'ul: <span className="text-slate-600">{reg.author}</span></p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Strategic Insights Banner */}
              <div className="bg-[#1a2332] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-grow">
                    <h4 className="text-2xl font-black mb-3 tracking-tight">Metodik Strategiya — 2025</h4>
                    <p className="text-slate-400 text-sm font-medium italic opacity-80 leading-relaxed max-w-xl">
                      ARM me'yoriy hujjatlar sifatini nazorat qilish va xodimlar malakasini oshirish bo'yicha metodik tavsiyalar majmuasi.
                    </p>
                  </div>
                  <div className="flex gap-4 shrink-0">
                    <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                      <span className="text-2xl font-black block text-emerald-400">100%</span>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Nazorat</span>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center min-w-[120px]">
                      <span className="text-2xl font-black block text-amber-400">24/7</span>
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Yordam</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'methodology' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Refined Faculty Filter */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {['All', ...Object.keys(ARM_STRUCTURE)].map(fac => (
                  <button 
                    key={fac}
                    onClick={() => setSelectedFaculty(fac)}
                    className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                      selectedFaculty === fac 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-100 hover:text-indigo-600'
                    }`}
                  >
                    {fac === 'All' ? 'Barcha yo\'nalishlar' : fac}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {manuals.filter(m => selectedFaculty === 'All' || m.faculty === selectedFaculty).map(manual => (
                  <div key={manual.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col relative overflow-hidden">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" /></svg>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[8px] font-black px-2.5 py-1 bg-slate-50 text-slate-400 rounded-md uppercase tracking-widest">{manual.type}</span>
                      <span className="text-[8px] font-black text-indigo-500/60">{manual.year}-yil</span>
                    </div>
                    <h4 className="font-black text-lg text-slate-800 mb-6 leading-tight line-clamp-2 min-h-[3rem] group-hover:text-indigo-600 transition-colors">{manual.title}</h4>
                    <div className="mt-auto pt-6 border-t border-slate-50 flex flex-col gap-3">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate opacity-70">Muallif: <span className="text-slate-600">{manual.author}</span></p>
                       <button onClick={() => setSelectedManual(manual)} className="w-full bg-slate-50 text-slate-500 font-black py-3.5 rounded-xl text-[9px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">Annotatsiya</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
               {culturalEvents.map(ev => (
                 <div key={ev.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden">
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest shadow-md">{ev.type}</div>
                    <div className="flex items-center gap-3 text-indigo-500 mb-4">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                       <span className="text-xs font-black">{ev.date}</span>
                    </div>
                    <h4 className="font-black text-2xl text-slate-800 mb-6 leading-tight group-hover:text-indigo-600 transition-colors">{ev.title}</h4>
                    <div className="flex items-center gap-3 text-slate-400 mb-8 border-t border-slate-50 pt-6">
                       <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                       <span className="text-[10px] font-black uppercase tracking-widest truncate">{ev.responsible}</span>
                    </div>
                    <div className={`py-3 rounded-xl text-[9px] font-black uppercase text-center tracking-widest border ${
                       ev.monitoringStatus === 'Yakunlangan' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                       ev.monitoringStatus === 'Bekor qilingan' ? 'bg-rose-50 text-rose-500 border-rose-100' : 
                       'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>{ev.monitoringStatus}</div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'journals' && (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left min-w-[700px]">
                     <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                           <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nashr / Davriylik</th>
                           <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitoring Vazifasi</th>
                           <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {periodicals.map((j, i) => (
                          <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-10 py-8">
                               <p className="font-black text-slate-800 text-base mb-1">{j.name}</p>
                               <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">№{j.lastIssue}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{j.periodicity}</span>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <p className="text-xs text-slate-600 font-bold leading-relaxed italic line-clamp-2 max-w-md">"{j.staffTask}"</p>
                               <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-2">Mas'ul: {j.responsibleStaff}</p>
                            </td>
                            <td className="px-10 py-8 text-center">
                               <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                  j.status === 'Mavjud' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                               }`}>{j.status}</span>
                            </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}
        </div>

        {/* COMPACT AI INSIGHT WIDGET (RIGHT SIDEBAR) */}
        <div className="xl:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
               {/* Decorative Element */}
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-colors"></div>
               
               <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               <h4 className="font-black text-xl text-slate-800 mb-4 uppercase tracking-tighter">Gemini AI</h4>
               <p className="text-xs text-slate-500 mb-8 leading-relaxed font-medium italic opacity-80 min-h-[80px]">
                  {aiInsight || "Metodik jarayonlar va boshqaruv samaradorligini tahlil qilish uchun Gemini yordamidan foydalaning."}
               </p>
               
               <button 
                onClick={handleGetAiAdvice} 
                disabled={loadingAi} 
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 text-[10px] tracking-widest uppercase disabled:opacity-50"
               >
                  {loadingAi ? 'Tahlil...' : 'Hisobotni shakllantirish'}
                  {!loadingAi && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
               </button>
            </div>

            {/* Quick Stats Widget */}
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl">
               <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Tezkor Statistika</h5>
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-400">Me'yoriy hujjatlar:</span>
                     <span className="text-lg font-black text-indigo-400">{regulations.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-400">Metodik qo'llanmalar:</span>
                     <span className="text-lg font-black text-emerald-400">{manuals.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-400">Monitoring tadbirlari:</span>
                     <span className="text-lg font-black text-amber-400">{culturalEvents.length}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Detail Modal */}
      {selectedManual && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-[3.5rem] p-10 sm:p-14 shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setSelectedManual(null)} className="absolute top-8 right-8 p-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all active:scale-90 border border-slate-200 group">
                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="inline-block px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">Resurs Tafsilotlari</div>
              <h2 className="text-3xl font-black text-slate-800 leading-tight mb-6 tracking-tighter uppercase">{selectedManual.title}</h2>
              <div className="flex flex-wrap items-center gap-6 mb-12">
                 <div className="bg-slate-50 px-4 py-2 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Muallif</p>
                    <p className="text-sm font-bold text-indigo-600">{selectedManual.author}</p>
                 </div>
                 <div className="bg-slate-50 px-4 py-2 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fakultet</p>
                    <p className="text-sm font-bold text-slate-600">{selectedManual.faculty}</p>
                 </div>
              </div>
              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 relative shadow-inner">
                 <div className="absolute top-4 left-6 text-5xl text-indigo-100 font-serif opacity-30">“</div>
                 <p className="text-slate-600 text-lg leading-relaxed font-medium italic relative z-10 pl-6 border-l-2 border-indigo-100">
                    {selectedManual.annotation}
                 </p>
              </div>
              <button onClick={() => setSelectedManual(null)} className="w-full mt-12 bg-slate-900 text-white font-black py-6 rounded-[2rem] uppercase text-[11px] tracking-[0.2em] shadow-2xl active:scale-95 transition-all hover:bg-indigo-600">O'qib chiqdim</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
