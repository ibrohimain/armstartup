
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const AdminEvents: React.FC = () => {
  const [formData, setFormData] = useState({ 
    title: '', 
    date: '', 
    location: '', 
    description: '', 
    category: 'Yangilik' as 'Yangilik' | 'Tadbir',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "events"), { ...formData, createdAt: Date.now() });
      alert("Xabar muvaffaqiyatli e'lon qilindi!");
      setFormData({ title: '', date: '', location: '', description: '', category: 'Yangilik', imageUrl: '' });
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Media Markaz Nazorati</h2>
        <p className="text-slate-500 font-medium italic mt-1">Yangilik va Tadbirlarni portalga joylashtirish bo'limi</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-8 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sarlavha (Kratkiy)</label>
              <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-bold text-slate-800" placeholder="Yangilik nomi..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kategoriya</label>
              <select className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-600 appearance-none cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                 <option value="Yangilik">🗞️ Yangilik</option>
                 <option value="Tadbir">📅 Tadbir / Kecha</option>
              </select>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sana</label>
              <input required type="date" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-800" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Joylashuv / Platforma</label>
              <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-800" placeholder="ZUM, O'quv zali, Masofaviy..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Banner Rasm URL (Faqat havola)</label>
           <input type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-800" placeholder="https://image-hosting.com/banner.jpg" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
           <p className="text-[9px] text-slate-300 italic px-4">Maslahat: Unsplash yoki boshqa hostingdan olingan to'g'ridan-to'g'ri havolani qo'ying.</p>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Batafsil tavsif (To'liq matn)</label>
           <textarea required rows={6} className="w-full px-7 py-5 bg-slate-50 border-none rounded-[3rem] outline-none font-medium leading-relaxed text-slate-700" placeholder="Tadbir dasturi yoki yangilik mazmuni haqida batafsil..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-2xl hover:bg-black transition-all active:scale-[0.98] uppercase text-xs tracking-[0.2em]">
           {loading ? 'Nashr etilmoqda...' : 'Portalga e\'lon qilish'}
        </button>
      </form>
    </div>
  );
};

export default AdminEvents;
