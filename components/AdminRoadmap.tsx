
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ScientificContent, RoadmapStep, Consultation } from '../types';

const AdminRoadmap: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'consultations'>('consultations');
  const [scientificContent, setScientificContent] = useState<ScientificContent[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'guide' as any, category: 'Scopus' as any, url: ''
  });

  useEffect(() => {
    const unsubContent = onSnapshot(query(collection(db, "scientific_content"), orderBy("createdAt", "desc")), (s) => {
      setScientificContent(s.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScientificContent)));
    });
    const unsubCons = onSnapshot(query(collection(db, "consultations"), orderBy("createdAt", "desc")), (s) => {
      setConsultations(s.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation)));
    });
    return () => { unsubContent(); unsubCons(); };
  }, []);

  const handleUpdateStatus = async (id: string, status: 'Tasdiqlangan' | 'Rad etildi') => {
    try {
      await updateDoc(doc(db, "consultations", id), { status });
    } catch (e) { console.error(e); }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "scientific_content"), { ...formData, createdAt: Date.now() });
      alert("Resurs qo'shildi!");
      setFormData({ title: '', description: '', type: 'guide', category: 'Scopus', url: '' });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Ilmiy-Ko'mak Boshqaruvi</h1>
          <p className="text-slate-500 font-medium italic">YouTube yo'riqnomalar va ilmiy shablonlar nazorati</p>
        </div>
        <div className="flex bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm">
           {[
             { id: 'consultations', label: 'So\'rovlar' },
             { id: 'content', label: 'Video & Resurslar' }
           ].map(tab => (
             <button key={tab.id} onClick={() => setActiveSubTab(tab.id as any)} className={`px-8 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${activeSubTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeSubTab === 'consultations' && (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
           <div className="p-10 border-b border-slate-50 bg-slate-50/40">
              <h3 className="font-black text-2xl text-slate-800 uppercase tracking-tighter">Konsultatsiya So'rovlari</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                   <tr>
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tadqiqotchi</th>
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ekspert / Mavzu</th>
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amallar</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {consultations.map(c => (
                     <tr key={c.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-10 py-8">
                           <p className="font-black text-slate-800">{c.studentName}</p>
                           <p className="text-xs font-black text-indigo-600 mt-1">{c.studentPhone}</p>
                        </td>
                        <td className="px-10 py-8">
                           <p className="font-bold text-slate-800 text-xs">Prof: {c.teacherName}</p>
                           <p className="text-sm text-slate-500 italic mt-1 line-clamp-1">{c.topic}</p>
                        </td>
                        <td className="px-10 py-8 text-center">
                           <span className={`text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest ${
                             c.status === 'Tasdiqlangan' ? 'bg-emerald-100 text-emerald-600' :
                             c.status === 'Rad etildi' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                           }`}>{c.status}</span>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <div className="flex justify-end gap-2">
                              <button onClick={() => c.id && handleUpdateStatus(c.id, 'Tasdiqlangan')} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg></button>
                              <button onClick={() => c.id && handleUpdateStatus(c.id, 'Rad etildi')} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeSubTab === 'content' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 animate-in fade-in">
           <form onSubmit={handleAddContent} className="xl:col-span-1 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-8 h-fit">
              <h3 className="font-black text-2xl text-slate-800 mb-2 uppercase tracking-tighter">Yangi Ilmiy Material</h3>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Sarlavha</label>
                 <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-bold" placeholder="Maqola tahriri..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <select className="px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                    <option value="video">YouTube Video</option>
                    <option value="guide">Yo'riqnoma (Fayl)</option>
                    <option value="template">Shablon (Matnli)</option>
                 </select>
                 <select className="px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                    <option value="Scopus">Scopus</option>
                    <option value="WoS">WoS</option>
                    <option value="Methodology">Metodika</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Havola / YouTube URL</label>
                 <input type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none" placeholder="https://youtube.com/..." value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
              </div>
              <textarea required rows={4} className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-medium" placeholder="Tavsif yoki Smart Shablon matni..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase text-[11px] tracking-widest">Fondga Qo'shish</button>
           </form>

           <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
              {scientificContent.map(item => (
                <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col group">
                   <div className="flex justify-between items-start mb-6">
                      <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${item.type === 'video' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>{item.type}</span>
                      <button onClick={() => item.id && deleteDoc(doc(db, "scientific_content", item.id))} className="p-3 text-slate-200 hover:text-rose-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                   </div>
                   <h4 className="font-black text-slate-800 line-clamp-2 min-h-[3rem] mb-2">{item.title}</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-auto">{item.category}</p>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoadmap;
