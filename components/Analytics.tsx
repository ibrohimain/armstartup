
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { MethodicalManual, Periodical, RegulationDoc, CulturalEvent, ARM_STRUCTURE } from '../types';

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'management' | 'methodology' | 'activities' | 'journals'>('management');
  const [manuals, setManuals] = useState<MethodicalManual[]>([]);
  const [periodicals, setPeriodicals] = useState<Periodical[]>([]);
  const [regulations, setRegulations] = useState<RegulationDoc[]>([]);
  const [culturalEvents, setCulturalEvents] = useState<CulturalEvent[]>([]);
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

  const categoryStats = manuals.reduce((acc: Record<string, number>, b) => {
    acc[b.faculty] = (acc[b.faculty] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto min-h-screen animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-100 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
            Ilmiy-Nazorat Markazi
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tighter">Metodika va Monitoring</h1>
          <p className="text-slate-500 font-medium italic mt-1 opacity-80">Me'yoriy hujjatlar va metodik ishlar yagona bazasi.</p>
        </div>

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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
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
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mas'ul: <span className="text-slate-600">{reg.author}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'methodology' && (
            <div className="space-y-8 animate-in fade-in duration-500">
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
                  <div key={manual.id} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col relative overflow-hidden h-full">
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
                       <span className="text-xs font-black">{ev.date}</span>
                    </div>
                    <h4 className="font-black text-2xl text-slate-800 mb-6 leading-tight group-hover:text-indigo-600 transition-colors">{ev.title}</h4>
                    <div className="flex items-center gap-3 text-slate-400 mb-8 border-t border-slate-50 pt-6">
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
        </div>

        <div className="xl:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
               <h4 className="font-black text-xl text-slate-800 mb-4 uppercase tracking-tighter">Metodik Yo'riqnoma</h4>
               <p className="text-xs text-slate-500 mb-8 leading-relaxed font-medium italic opacity-80">
                  Ushbu bo'limda metodik fondga yangi qo'shilgan resurslar, tasdiqlangan nizomlar va kutilayotgan tadbirlar monitoringi aks etadi. 
               </p>
               <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Darsliklar: {manuals.length} ta</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Hujjatlar: {regulations.length} ta</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {selectedManual && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-[3.5rem] p-10 sm:p-14 shadow-2xl relative animate-in zoom-in-95">
              <button onClick={() => setSelectedManual(null)} className="absolute top-8 right-8 p-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all active:scale-90 border border-slate-200 group">
                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-3xl font-black text-slate-800 leading-tight mb-6 tracking-tighter uppercase">{selectedManual.title}</h2>
              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 relative shadow-inner">
                 <p className="text-slate-600 text-lg leading-relaxed font-medium italic relative z-10 pl-6 border-l-2 border-indigo-100">
                    {selectedManual.annotation}
                 </p>
              </div>
              <button onClick={() => setSelectedManual(null)} className="w-full mt-12 bg-slate-900 text-white font-black py-6 rounded-[2rem] uppercase text-[11px] tracking-[0.2em] shadow-2xl transition-all hover:bg-indigo-600">Yopish</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
