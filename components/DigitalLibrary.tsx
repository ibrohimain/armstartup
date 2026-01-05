
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, addDoc, orderBy, deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { DigitalResource, ResourceType } from '../types';
import { onAuthStateChanged } from "@firebase/auth";

const DigitalLibrary: React.FC = () => {
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ResourceType | 'All'>('All');
  const [viewerDoc, setViewerDoc] = useState<DigitalResource | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'details' | 'file'>('info');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({ 
    title: '', 
    author: '', 
    type: 'Kitob' as ResourceType, 
    year: new Date().getFullYear(), 
    url: '', 
    pages: 0, 
    annotation: '',
    isProtected: true 
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setIsAdmin(!!user));
    
    const q = query(collection(db, "digital_resources"), orderBy("createdAt", "desc"));
    const unsubData = onSnapshot(q, (snapshot) => {
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DigitalResource)));
      setLoading(false);
    });
    return () => { unsubscribe(); unsubData(); };
  }, []);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.annotation) {
      alert("Sarlavha va Annotatsiya bo'limlarini to'ldirish shart!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const dataToSave = { 
        ...formData, 
        year: Number(formData.year),
        pages: Number(formData.pages),
        likes: 0,
        createdAt: Date.now() 
      };
      
      if (!formData.url.trim()) {
        delete (dataToSave as any).url;
      }

      await addDoc(collection(db, "digital_resources"), dataToSave);
      setShowAddForm(false);
      setFormData({ title: '', author: '', type: 'Kitob', year: new Date().getFullYear(), url: '', pages: 0, annotation: '', isProtected: true });
    } catch (err) { 
      console.error("Xatolik:", err);
      alert("Resurs qo'shishda xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ushbu resursni fonddan butkul o'chirmoqchimisiz?")) {
      try {
        await deleteDoc(doc(db, "digital_resources", id));
      } catch (err) { console.error(err); }
    }
  };

  const handleLike = async (resId: string) => {
    if (likedIds.has(resId)) return;
    try {
      await updateDoc(doc(db, "digital_resources", resId), {
        likes: increment(1)
      });
      setLikedIds(prev => new Set(prev).add(resId));
    } catch (err) { console.error(err); }
  };

  const filtered = resources.filter(doc => 
    (filterType === 'All' || doc.type === filterType) &&
    (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     doc.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
     doc.annotation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const popularTags = ["Dasturlash", "Fizika", "Scopus", "Diplom"];

  const closeViewer = () => {
    setViewerDoc(null);
    setActiveTab('info');
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto min-h-screen animate-fade-in relative">
      {/* Simple Header & Search Bar aligned */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
            Raqamli Fond
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tighter">Elektron Kutubxona</h1>
          <p className="text-slate-500 font-medium italic mt-1 opacity-80">Raqamli resurslar va annotatsiyalar bazasi.</p>
        </div>

        <div className="w-full lg:w-auto flex flex-col gap-3">
          <div className="relative group min-w-[320px]">
            <input 
              type="text" 
              placeholder="Sarlavha yoki muallif..." 
              className="w-full pl-12 pr-10 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          {/* Subtle Tags under search */}
          <div className="flex gap-2 justify-end">
            {popularTags.map(tag => (
              <button key={tag} onClick={() => setSearchTerm(tag)} className="text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Quick Control */}
      {isAdmin && (
        <div className="mb-10">
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
              showAddForm ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-black'
            }`}
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${showAddForm ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            {showAddForm ? 'Yopish' : 'Resurs Qo\'shish'}
          </button>
        </div>
      )}

      {/* Admin Add Form Section */}
      {isAdmin && showAddForm && (
        <div className="mb-12 animate-in slide-in-from-top-10 fade-in duration-500">
           <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden">
              <h3 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tighter">Yangi Resurs Qo'shish</h3>
              <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sarlavha *</label>
                    <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" placeholder="Nomi" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Muallif</label>
                    <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="F.I.SH" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Resurs turi</label>
                    <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold appearance-none outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ResourceType})}>
                       <option value="Kitob">📚 Kitob</option>
                       <option value="Diplom">🎓 Diplom ishi</option>
                       <option value="Dissertatsiya">🔬 Dissertatsiya</option>
                       <option value="Maqola">📝 Maqola</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Yil</label>
                    <input type="number" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sahifalar</label>
                    <input type="number" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold" placeholder="0" value={formData.pages} onChange={e => setFormData({...formData, pages: Number(e.target.value)})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">URL Havolasi (Ixtiyoriy)</label>
                    <input type="url" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold outline-none" placeholder="https://..." value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
                 </div>
                 <div className="lg:col-span-3 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Resurs Annotatsiyasi *</label>
                    <textarea required rows={4} className="w-full px-6 py-5 bg-slate-50 rounded-[2rem] outline-none font-medium italic leading-relaxed" placeholder="Resurs mazmuni va annotatsiyasini kiriting..." value={formData.annotation} onChange={e => setFormData({...formData, annotation: e.target.value})} />
                 </div>
                 <div className="lg:col-span-3 pt-4">
                    <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl hover:bg-black transition-all uppercase text-[11px] tracking-widest disabled:opacity-50">
                       {isSubmitting ? 'Saqlanmoqda...' : 'Resursni bazaga kiritish'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-10">
        {['All', 'Kitob', 'Maqola', 'Diplom', 'Dissertatsiya'].map(type => (
          <button 
            key={type} 
            onClick={() => setFilterType(type as any)} 
            className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap active:scale-95 ${
              filterType === type 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105' 
                : 'bg-white border-slate-100 text-slate-400 hover:text-indigo-600 shadow-sm'
            }`}
          >
            {type === 'All' ? 'Barcha Resurslar' : type + 'lar'}
          </button>
        ))}
      </div>

      {/* Result Status */}
      {searchTerm && (
        <div className="mb-6 animate-in fade-in">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Qidiruv natijasi: <span className="text-indigo-600">{filtered.length} ta material</span>
          </p>
        </div>
      )}

      {/* Resource Grid */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center opacity-30">
           <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-20">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col relative overflow-hidden h-full">
              <div className="flex justify-between items-start mb-6">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                   doc.type === 'Kitob' ? 'bg-blue-50 text-blue-600' :
                   doc.type === 'Maqola' ? 'bg-amber-50 text-amber-600' :
                   doc.type === 'Diplom' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                 }`}>
                   <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 </div>
                 
                 {isAdmin && (
                   <button onClick={() => doc.id && handleDelete(doc.id)} className="p-3 text-slate-200 hover:text-rose-500 rounded-xl transition-all">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                 )}
              </div>

              <div className="flex-grow">
                 <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      doc.type === 'Kitob' ? 'bg-blue-100 text-blue-700' :
                      doc.type === 'Maqola' ? 'bg-amber-100 text-amber-700' :
                      doc.type === 'Diplom' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {doc.type}
                    </span>
                 </div>
                 
                 <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3rem]">{doc.title}</h3>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight italic truncate mb-6">{doc.author || "Noma'lum muallif"}</p>
                 <p className="text-xs text-slate-500 font-medium line-clamp-3 italic opacity-80 leading-relaxed mb-6">{doc.annotation}</p>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-rose-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">{doc.likes || 0}</span>
                 </div>
                 <button onClick={() => setViewerDoc(doc)} className="px-6 py-3 bg-slate-900 text-white text-[9px] font-black rounded-xl hover:bg-indigo-600 transition-all uppercase tracking-widest active:scale-95 shadow-lg">
                    Batafsil
                 </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-40 border-2 border-dashed border-slate-100 rounded-[3rem] mb-20">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
           <p className="text-slate-400 font-black italic tracking-tight uppercase text-sm">Resurs topilmadi</p>
           <button onClick={() => setSearchTerm('')} className="mt-4 text-indigo-600 font-bold text-xs uppercase tracking-widest hover:underline">Filtrlarni tozalash</button>
        </div>
      )}

      {/* Centralized Flexible Tab Modal Viewer */}
      {viewerDoc && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh] overflow-hidden border border-white/20">
            
            {/* Modal Top Bar */}
            <div className="p-8 sm:p-10 border-b border-slate-50 flex justify-between items-start shrink-0">
               <div className="pr-10">
                  <div className="flex items-center gap-3 mb-2">
                     <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-full tracking-widest">{viewerDoc.type}</span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">№{viewerDoc.year}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tighter">{viewerDoc.title}</h3>
               </div>
               <button onClick={closeViewer} className="p-4 bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all shadow-sm active:scale-90 group">
                  <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            {/* Flexible Internal Tab Bar */}
            <div className="bg-slate-50/50 p-3 sm:px-10 shrink-0 border-b border-slate-50 flex gap-2">
               {[
                 { id: 'info', label: 'Annotatsiya', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                 { id: 'details', label: 'Texnik ma\'lumot', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                 { id: 'file', label: 'Raqamli fayl', icon: 'M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4' }
               ].map(tab => (
                 <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-grow sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                  }`}
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} /></svg>
                   <span className="hidden sm:inline">{tab.label}</span>
                 </button>
               ))}
            </div>

            {/* Modal Body / Tab Content */}
            <div className="flex-grow p-8 sm:p-12 overflow-y-auto no-scrollbar">
               {activeTab === 'info' && (
                 <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="relative mb-8">
                       <div className="absolute top-0 left-0 text-5xl text-indigo-50 font-serif opacity-50">“</div>
                       <p className="text-slate-600 text-lg leading-relaxed font-medium italic relative z-10 pl-6 border-l-2 border-indigo-100">
                         {viewerDoc.annotation}
                       </p>
                    </div>
                    <div className="flex items-center gap-4 py-6 border-t border-slate-50">
                       <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center font-black">{viewerDoc.author[0]}</div>
                       <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Asosiy muallif</p>
                          <p className="text-sm font-bold text-slate-700">{viewerDoc.author || "Noma'lum"}</p>
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === 'details' && (
                 <div className="animate-in fade-in slide-in-from-bottom-2 grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nashr yili</p>
                       <p className="text-xl font-black text-slate-800">{viewerDoc.year}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sahifalar soni</p>
                       <p className="text-xl font-black text-slate-800">{viewerDoc.pages} bet</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Resurs turi</p>
                       <p className="text-xl font-black text-indigo-600 uppercase">{viewerDoc.type}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bazadagi ID</p>
                       <p className="text-xs font-black text-slate-400 uppercase truncate">#{viewerDoc.id?.slice(-8)}</p>
                    </div>
                 </div>
               )}

               {activeTab === 'file' && (
                 <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center justify-center py-10 text-center">
                    {viewerDoc.url ? (
                      <div className="space-y-6 w-full">
                         <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         </div>
                         <h4 className="text-xl font-black text-slate-800 tracking-tight uppercase">Raqamli resurs tayyor</h4>
                         <p className="text-sm text-slate-500 italic max-w-xs mx-auto mb-8 leading-relaxed">Fayl xavfsiz serverda joylashgan. {viewerDoc.isProtected ? "Mutolaa faqat onlayn rejimda amalga oshiriladi." : "Faylni bemalol yuklab olishingiz mumkin."}</p>
                         <button onClick={() => window.open(viewerDoc.url, '_blank')} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all uppercase text-[10px] tracking-widest">
                            {viewerDoc.isProtected ? "Xavfsiz Mutolaani Boshlash" : "Hujjatni Yuklab Olish"}
                         </button>
                      </div>
                    ) : (
                      <div className="opacity-40 space-y-4">
                         <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                         <p className="text-sm font-bold uppercase tracking-widest italic">Raqamli fayl biriktirilmagan</p>
                      </div>
                    )}
                 </div>
               )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-8 sm:px-12 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between shrink-0">
               <button 
                onClick={() => viewerDoc.id && handleLike(viewerDoc.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  viewerDoc.id && likedIds.has(viewerDoc.id) ? 'bg-rose-500 text-white shadow-xl' : 'bg-white text-rose-500 border border-rose-100 hover:bg-rose-50'
                }`}
               >
                  <svg className={`w-5 h-5 transition-transform ${viewerDoc.id && likedIds.has(viewerDoc.id) ? 'scale-125' : 'group-hover:scale-110'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                  {viewerDoc.id && likedIds.has(viewerDoc.id) ? 'Sizga yoqdi' : 'Yoqtirish'}
               </button>
               <button onClick={closeViewer} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
                 Yopish (ESC)
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalLibrary;
