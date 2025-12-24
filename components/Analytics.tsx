
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { getManagementInsights } from '../services/geminiService';
import { MethodicalManual, Periodical, ARM_STRUCTURE } from '../types';

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'manuals' | 'journals'>('manuals');
  const [manuals, setManuals] = useState<MethodicalManual[]>([]);
  const [periodicals, setPeriodicals] = useState<Periodical[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('All');
  const [selectedManual, setSelectedManual] = useState<MethodicalManual | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubManuals = onSnapshot(query(collection(db, "manuals"), orderBy("createdAt", "desc")), (s) => {
      setManuals(s.docs.map(doc => ({ id: doc.id, ...doc.data() } as MethodicalManual)));
    });
    const unsubPeriodicals = onSnapshot(collection(db, "periodicals"), (s) => {
      setPeriodicals(s.docs.map(doc => ({ id: doc.id, ...doc.data() } as Periodical)));
    });
    return () => { unsubManuals(); unsubPeriodicals(); };
  }, []);

  const handleLike = async (manualId: string) => {
    if (likedIds.has(manualId)) return;
    
    try {
      const manualRef = doc(db, "manuals", manualId);
      await updateDoc(manualRef, {
        likes: increment(1)
      });
      setLikedIds(prev => new Set(prev).add(manualId));
    } catch (error) {
      console.error("Error liking manual:", error);
    }
  };

  const statsData = {
    topSubjects: [
      { name: "Axborot Texnologiyalari", count: 580, color: "bg-indigo-600" },
      { name: "Iqtisodiyot va Biznes", count: 420, color: "bg-emerald-500" },
      { name: "Siyosatshunoslik", count: 310, color: "bg-amber-500" },
      { name: "Filologiya", count: 190, color: "bg-rose-500" }
    ],
    readingTrend: "Elektron resurslarga bo'lgan talab o'tgan oyga nisbatan 18% ga oshgan."
  };

  const handleGetAiAdvice = async () => {
    setLoadingAi(true);
    const statsStr = `Top fanlar: ${statsData.topSubjects.map(s => s.name + " (" + s.count + ")").join(", ")}. Trend: ${statsData.readingTrend}`;
    const insight = await getManagementInsights(statsStr);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  const filteredManuals = manuals.filter(m => selectedFaculty === 'All' || m.faculty === selectedFaculty);

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ilmiy-uslubiy bo‘lim</h1>
          <p className="text-slate-500 font-medium italic">ARM Analitika va Metodik ko'rsatmalar platformasi</p>
        </div>
        <div className="flex p-1.5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'stats', label: 'Analitika' },
            { id: 'manuals', label: 'Metodik qo\'llanmalar' },
            { id: 'journals', label: 'Davriy nashrlar' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'manuals' && (
        <div className="space-y-8">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            <button 
              onClick={() => setSelectedFaculty('All')}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedFaculty === 'All' ? 'bg-slate-800 border-slate-800 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-400'}`}
            >
              Barchasi
            </button>
            {Object.keys(ARM_STRUCTURE).map(fac => (
              <button 
                key={fac}
                onClick={() => setSelectedFaculty(fac)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${selectedFaculty === fac ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-400'}`}
              >
                {fac}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredManuals.length > 0 ? filteredManuals.map(manual => (
              <div key={manual.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                   <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h4 className="font-bold text-xl text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3rem]">{manual.title}</h4>
                <div className="flex flex-col gap-1 mb-6">
                   <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{manual.faculty}</span>
                   <span className="text-[10px] font-bold text-slate-400 italic truncate">{manual.department}</span>
                </div>
                
                <div className="mt-auto flex gap-3">
                   <button 
                    onClick={() => setSelectedManual(manual)}
                    className="flex-grow bg-slate-50 text-slate-600 font-black py-3.5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all"
                   >
                     Batafsil
                   </button>
                   <button 
                    onClick={() => manual.id && handleLike(manual.id)}
                    className={`flex items-center gap-2 px-5 rounded-2xl transition-all shadow-sm group/like ${likedIds.has(manual.id || '') ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-rose-200 hover:text-rose-500'}`}
                   >
                     <svg className={`w-5 h-5 transition-transform ${likedIds.has(manual.id || '') ? 'scale-110 fill-current' : 'group-hover/like:scale-125'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                     </svg>
                     <span className="text-xs font-black">{manual.likes || 0}</span>
                   </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 animate-pulse">
                 <p className="text-slate-400 font-medium italic">Ushbu fakultet bo'yicha metodik qo'llanmalar hozircha mavjud emas.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'journals' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
             <div>
                <h3 className="font-bold text-xl text-slate-800">Davriy nashrlar va Monitoring</h3>
                <p className="text-xs text-slate-400 mt-1">ARM xodimlari uchun xizmat vazifalari bilan birgalikda.</p>
             </div>
             <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Mavjud</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Kutilmoqda</span>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nashr va Davr</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mas'ul Vazifa (Xodimlar uchun)</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Holati</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {periodicals.length > 0 ? periodicals.map((journal, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6">
                      <p className="font-bold text-slate-800 text-base">{journal.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{journal.type} • {journal.lastIssue}</p>
                    </td>
                    <td className="px-10 py-6">
                      <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                         <p className="text-xs text-indigo-700 font-bold leading-relaxed">
                           {journal.staffTask || " Monitoring vazifasi belgilanmagan."}
                         </p>
                         <p className="text-[9px] text-indigo-400 uppercase font-black mt-2">Mas'ul: {journal.responsibleStaff || "Barcha xodimlar"}</p>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-sm ${journal.status === 'Mavjud' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>
                        {journal.status}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                       <button className="text-slate-400 hover:text-indigo-600 p-2">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       </button>
                    </td>
                  </tr>
                )) : (
                   <tr>
                     <td colSpan={4} className="px-10 py-20 text-center text-slate-400 italic">Ma'lumotlar yuklanmoqda...</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <h3 className="font-bold text-2xl text-slate-800 mb-8">Fanlar bo‘yicha kitobxonlik darajasi</h3>
              <div className="space-y-8 relative z-10">
                {statsData.topSubjects.map((subject, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">{subject.name}</span>
                      <span className="text-sm font-black text-slate-800">{subject.count} o'quvchi</span>
                    </div>
                    <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                      <div 
                        className={`h-full ${subject.color} rounded-full transition-all duration-1000 ease-out shadow-sm`} 
                        style={{ width: `${(subject.count / 600) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 flex items-start gap-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-emerald-800 text-lg mb-1">Fond shakllantirish hisoboti</h4>
                <p className="text-sm text-emerald-700 leading-relaxed opacity-80">
                  {statsData.readingTrend} IT va iqtisodiyot yo'nalishidagi yangi adabiyotlar bazasini kengaytirish ilmiy asoslangan zaruriyat hisoblanadi.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-slate-800 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
              <h4 className="font-bold text-xl mb-6 flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl"><svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                Strategik AI Tahlil
              </h4>
              <p className="text-sm text-slate-300 mb-8 leading-relaxed italic min-h-[100px]">
                {aiInsight || "Fondni shakllantirish bo'yicha Gemini AI tavsiyalarini yuklash uchun tugmani bosing."}
              </p>
              <button 
                onClick={handleGetAiAdvice}
                disabled={loadingAi}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase text-xs tracking-widest"
              >
                {loadingAi ? 'Tahlil qilinmoqda...' : 'Tavsiyalarni tayyorlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Details Modal */}
      {selectedManual && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
              <div className="p-10 pb-0">
                 <button 
                  onClick={() => setSelectedManual(null)}
                  className="absolute top-8 right-8 p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-2xl transition-all"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                 <div className="flex gap-4 mb-6">
                    <span className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Metodik Fond</span>
                    <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedManual.year}-yil</span>
                 </div>
                 <h2 className="text-3xl font-black text-slate-800 leading-tight mb-4">{selectedManual.title}</h2>
                 <p className="text-sm font-bold text-indigo-600 mb-8">{selectedManual.author} • {selectedManual.faculty} • {selectedManual.department}</p>
                 
                 <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-8">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Annotatsiya / To'liq tavsif</h5>
                    <p className="text-slate-600 text-sm leading-relaxed italic">
                      {selectedManual.annotation}
                    </p>
                 </div>
              </div>
              <div className="p-10 pt-0 flex justify-end gap-4">
                 <button 
                  onClick={() => selectedManual.id && handleLike(selectedManual.id)}
                  className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] font-black transition-all shadow-xl uppercase text-xs tracking-widest ${likedIds.has(selectedManual.id || '') ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-500'}`}
                 >
                   <svg className={`w-5 h-5 ${likedIds.has(selectedManual.id || '') ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                   </svg>
                   {likedIds.has(selectedManual.id || '') ? 'Yoqtirildi' : 'Yoqtirish'} ({selectedManual.likes || 0})
                 </button>
                 <button 
                  onClick={() => setSelectedManual(null)}
                  className="px-10 bg-slate-100 text-slate-600 font-black py-5 rounded-[2rem] hover:bg-slate-200 transition-all uppercase text-xs tracking-widest"
                 >
                   Yopish
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
