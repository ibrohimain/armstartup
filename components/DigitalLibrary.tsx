
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, addDoc, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { DigitalResource, ResourceType } from '../types';
import { onAuthStateChanged } from 'firebase/auth';

const DigitalLibrary: React.FC = () => {
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ResourceType | 'All'>('All');
  const [viewerDoc, setViewerDoc] = useState<DigitalResource | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    type: 'Kitob' as ResourceType,
    year: new Date().getFullYear(),
    url: '',
    pages: 0,
    isProtected: true
  });

  useEffect(() => {
    // Check admin status
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });

    // Fetch resources from Firebase
    const q = query(collection(db, "digital_resources"), orderBy("createdAt", "desc"));
    const unsubData = onSnapshot(q, (snapshot) => {
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DigitalResource)));
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubData();
    };
  }, []);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "digital_resources"), {
        ...formData,
        createdAt: Date.now()
      });
      alert("Resurs muvaffaqiyatli qo'shildi!");
      setFormData({
        title: '',
        author: '',
        type: 'Kitob',
        year: new Date().getFullYear(),
        url: '',
        pages: 0,
        isProtected: true
      });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi!");
    }
  };

  const deleteResource = async (id: string) => {
    if (confirm("Ushbu resursni o'chirmoqchimisiz?")) {
      await deleteDoc(doc(db, "digital_resources", id));
    }
  };

  const filtered = resources.filter(doc => 
    (filterType === 'All' || doc.type === filterType) &&
    (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></span>
            Elektron Resurslar Markazi
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Raqamli ARM</h1>
          <p className="text-slate-500 font-medium italic">Skanerlangan kitoblar, diplom va dissertatsiyalar bazasi.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {isAdmin && (
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {showAddForm ? 'Yopish' : '+ Resurs Qo\'shish'}
            </button>
          )}
          <div className="relative flex-grow sm:min-w-[300px]">
            <input 
              type="text" 
              placeholder="Qidiruv..."
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-4 top-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Admin Add Form */}
      {isAdmin && showAddForm && (
        <div className="mb-12 bg-white p-10 rounded-[3rem] border border-indigo-100 shadow-2xl animate-in slide-in-from-top duration-500">
          <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tighter">Yangi elektron resurs registratsiyasi</h3>
          <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hujjat sarlavhasi</label>
              <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Masalan: Logistika asoslari" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Muallif</label>
              <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} placeholder="F.I.SH" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Turi</label>
              <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-600" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ResourceType})}>
                <option value="Kitob">Kitob (PDF)</option>
                <option value="Diplom">Diplom ishi</option>
                <option value="Dissertatsiya">Dissertatsiya</option>
                <option value="Maqola">Ilmiy maqola</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nashr yili</label>
              <input required type="number" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sahifalar soni</label>
              <input required type="number" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.pages} onChange={e => setFormData({...formData, pages: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fayl URL (Simulatsiya)</label>
              <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://..." />
            </div>
            <div className="lg:col-span-3 pt-4">
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-black transition-all uppercase text-xs tracking-widest">Bazaga qo'shish</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-8">
        {['All', 'Diplom', 'Dissertatsiya', 'Maqola', 'Kitob'].map(type => (
          <button 
            key={type}
            onClick={() => setFilterType(type as any)}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filterType === type ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-400'}`}
          >
            {type === 'All' ? 'Barchasi' : type === 'Kitob' ? 'E-Kitoblar' : type + 'lar'}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="py-40 text-center animate-pulse">
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Raqamli fond yuklanmoqda...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative flex flex-col">
              {isAdmin && (
                <button 
                  onClick={() => doc.id && deleteResource(doc.id)}
                  className="absolute top-6 right-6 p-2 text-slate-200 hover:text-rose-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
              
              <div className="w-16 h-16 bg-slate-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>

              <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest w-fit mb-4 ${
                doc.type === 'Dissertatsiya' ? 'bg-amber-100 text-amber-600' :
                doc.type === 'Diplom' ? 'bg-indigo-100 text-indigo-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {doc.type}
              </span>

              <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[3.5rem]">{doc.title}</h3>
              <p className="text-sm font-bold text-slate-400 italic mb-8">Muallif: {doc.author}</p>
              
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{doc.year}-yil</span>
                  <span className="text-[10px] font-bold text-slate-400">{doc.pages} bet</span>
                </div>
                <button 
                  onClick={() => setViewerDoc(doc)}
                  className="bg-slate-900 text-white text-[10px] font-black px-6 py-3 rounded-2xl hover:bg-emerald-600 transition-all uppercase tracking-widest shadow-xl shadow-slate-100"
                >
                  Mutolaa qilish
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center border-2 border-dashed border-slate-100 rounded-[4rem]">
          <p className="text-slate-300 font-bold italic">Resurslar topilmadi.</p>
        </div>
      )}

      {/* Secure Viewer Modal */}
      {viewerDoc && (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-in fade-in duration-500">
          <div className="h-20 bg-slate-900 border-b border-white/5 flex items-center justify-between px-10 text-white relative z-20">
            <div className="flex items-center gap-5">
               <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
               </div>
               <div>
                  <h4 className="font-black text-sm tracking-tight leading-none mb-1">{viewerDoc.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{viewerDoc.author} • RAQAMLI ARM</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="hidden lg:flex flex-col items-end mr-6 text-right">
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Xavfsiz Mutolaa</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Skrinshot va yuklash taqiqlangan</span>
               </div>
               <button 
                onClick={() => setViewerDoc(null)}
                className="bg-white/5 hover:bg-rose-600 p-4 rounded-2xl transition-all"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
          </div>

          <div className="flex-grow relative overflow-hidden flex items-center justify-center bg-slate-900 p-4 sm:p-10">
            {/* Watermark Layers */}
            <div className="absolute inset-0 z-10 pointer-events-none select-none flex flex-wrap gap-20 p-20 overflow-hidden opacity-[0.05]">
               {Array.from({ length: 50 }).map((_, i) => (
                 <div key={i} className="text-white text-3xl font-black rotate-[-35deg] whitespace-nowrap uppercase tracking-[0.5em]">
                   ARM HUB SECURE • {new Date().toLocaleDateString()} • {viewerDoc.id?.slice(0,5)}
                 </div>
               ))}
            </div>

            {/* Document Simulation View */}
            <div className="w-full max-w-5xl h-full bg-white rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative z-0 flex flex-col items-center justify-center p-12 text-slate-200 border border-white/10 group">
               <div className="text-center">
                  <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <svg className="w-16 h-16 text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h5 className="text-2xl font-black text-slate-300 mb-2">Hujjat mazmuni yuklanmoqda...</h5>
                  <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto">
                    Xavfsizlik yuzasidan ushbu faylni yuklab olish yoki nusxalash cheklangan. Mutolaa faqat onlayn rejimda amalga oshiriladi.
                  </p>
               </div>

               {/* Custom Bottom Reader Bar */}
               <div className="absolute bottom-10 inset-x-12 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="flex gap-2">
                     <button className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Sahifa 1 / {viewerDoc.pages}</button>
                  </div>
                  <div className="flex gap-3">
                     <button className="bg-slate-50 text-slate-400 p-4 rounded-2xl cursor-not-allowed shadow-sm border border-slate-100" title="Yuklab olish cheklangan">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     </button>
                     <button onClick={() => window.print()} className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl shadow-emerald-900/20 hover:bg-black transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalLibrary;
