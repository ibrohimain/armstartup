
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ScientificContent, RoadmapStep } from '../types';

const AdminRoadmap: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'strategy'>('content');
  const [scientificContent, setScientificContent] = useState<ScientificContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<RoadmapStep[]>([
    { id: 1, title: "Elektron katalog + sayt", description: "ARMning yagona veb-platformasini yaratish.", status: 'Completed', progress: 100, icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" },
    { id: 2, title: "Onlayn buyurtma va QR", description: "Masofadan band qilish tizimi.", status: 'Completed', progress: 95, icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3" },
    { id: 3, title: "Raqamli fond", description: "Diplom va dissertatsiyalarning PDF bazasini yaratish.", status: 'Active', progress: 70, icon: "M19 11H5m14 0a2 2 0 012 2v6" },
    { id: 4, title: "Scopus/WoS platforma", description: "Ilmiy xodimlar uchun konsalting xizmati.", status: 'Active', progress: 55, icon: "M21 12a9 9 0 01-9 9" }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'guide' as 'guide' | 'video',
    category: 'Scopus' as any,
    url: ''
  });

  useEffect(() => {
    const q = query(collection(db, "scientific_content"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setScientificContent(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScientificContent)));
    });
    return () => unsub();
  }, []);

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "scientific_content"), {
        ...formData,
        createdAt: Date.now()
      });
      alert("Kontent muvaffaqiyatli qo'shildi!");
      setFormData({ title: '', description: '', type: 'guide', category: 'Scopus', url: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (id: string) => {
    if (confirm("O'chirilsinmi?")) await deleteDoc(doc(db, "scientific_content", id));
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Ilmiy Yo'l Xarita Boshqaruvi</h1>
          <p className="text-slate-500 font-medium italic">Scopus/WoS materiallari va strategiya bo'limi</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[2rem] border border-slate-100 shadow-sm">
           <button onClick={() => setActiveSubTab('content')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeSubTab === 'content' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Kontent Boshqaruvi</button>
           <button onClick={() => setActiveSubTab('strategy')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${activeSubTab === 'strategy' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Strategiya Monitori</button>
        </div>
      </div>

      {activeSubTab === 'content' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
           <div className="xl:col-span-1">
              <form onSubmit={handleAddContent} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6 sticky top-8">
                 <h3 className="font-black text-xl text-slate-800 mb-6 uppercase tracking-tight">Yangi Material Qo'shish</h3>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sarlavha</label>
                    <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Maqola yozish sirlari..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Turi</label>
                    <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-600" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                       <option value="guide">Yo'riqnoma (Matn)</option>
                       <option value="video">Video Darslik</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategoriya</label>
                    <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-600" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                       <option value="Scopus">Scopus</option>
                       <option value="WoS">Web of Science</option>
                       <option value="Methodology">Metodologiya</option>
                    </select>
                 </div>
                 {formData.type === 'video' && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video URL</label>
                      <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://youtube.com/..." />
                   </div>
                 )}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tavsif</label>
                    <textarea required rows={4} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Qisqacha mazmun..." />
                 </div>
                 <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-black transition-all uppercase text-[10px] tracking-widest">Saqlash</button>
              </form>
           </div>

           <div className="xl:col-span-2 space-y-6">
              <h3 className="font-black text-xl text-slate-800 mb-6 uppercase tracking-tight">Mavjud Materiallar</h3>
              {scientificContent.map(item => (
                <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm flex justify-between items-center group hover:border-indigo-100 transition-all">
                   <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${item.type === 'video' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                         {item.type === 'video' ? 'VID' : 'MAT'}
                      </div>
                      <div>
                         <h4 className="font-black text-slate-800">{item.title}</h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.category} • {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <button onClick={() => item.id && deleteContent(item.id)} className="p-4 text-slate-200 hover:text-rose-500 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeSubTab === 'strategy' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-in fade-in duration-500">
           <div className="xl:col-span-3 space-y-6">
              {steps.map(step => (
                <div key={step.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all">
                   <div className="flex flex-col md:flex-row gap-8">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 ${step.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                         <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={step.icon} /></svg>
                      </div>
                      <div className="flex-grow">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Bosqich {step.id}</span>
                               <h3 className="text-xl font-bold text-slate-800">{step.title}</h3>
                            </div>
                            <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${step.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>{step.status}</span>
                         </div>
                         <p className="text-sm text-slate-500 mb-6 italic">"{step.description}"</p>
                         <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${step.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${step.progress}%` }}></div>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
           <div className="space-y-6">
              <div className="bg-slate-900 p-10 rounded-[4rem] text-white text-center shadow-2xl">
                 <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-8">Umumiy Progress</h4>
                 <div className="text-6xl font-black mb-2">82%</div>
                 <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">A'lo darajada</div>
                 <div className="mt-10 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[82%]"></div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoadmap;
