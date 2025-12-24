
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const AdminBooks: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '', 
    author: '', 
    category: 'Badiiy adabiyot', 
    isbn: '', 
    inventoryNumber: '',
    price: 0,
    description: '', 
    isAvailable: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "books"), {
        ...formData,
        price: Number(formData.price),
        coverUrl: '', 
        status: 'Normal',
        createdAt: Date.now()
      });
      alert("Kitob muvaffaqiyatli qo'shildi! Butlash bo'limi kitobni fondga qabul qildi.");
      setFormData({ 
        title: '', author: '', category: 'Badiiy adabiyot', 
        isbn: '', inventoryNumber: '', price: 0, 
        description: '', isAvailable: true 
      });
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Kitobni Fondga Qabul Qilish</h2>
        <p className="text-slate-500 font-medium italic mt-1">Butlash va kataloglashtirish bo'limi registratsiyasi</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl space-y-8 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kitob sarlavhasi</label>
            <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-800" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Masalan: O'tkan kunlar" />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Muallif nomi</label>
            <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-800" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} placeholder="Abdulla Qodiriy" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yo'nalish</label>
            <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-600 appearance-none border-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option>Badiiy adabiyot</option>
              <option>Ilmiy darslik</option>
              <option>Metodik qo'llanma</option>
              <option>Lug'at va Ma'lumotnoma</option>
              <option>IT va Texnologiya</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inventar raqami</label>
            <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-black text-indigo-600" value={formData.inventoryNumber} onChange={e => setFormData({...formData, inventoryNumber: e.target.value})} placeholder="INV-0001" />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tan narxi (so'mda)</label>
            <input required type="number" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-black text-emerald-600" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} placeholder="50000" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ISBN va Bibliografik ma'lumot</label>
          <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-800" value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} placeholder="ISBN-13: 978-..." />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Annotatsiya</label>
          <textarea rows={4} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium leading-relaxed" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Kitob mazmuni haqida..." />
        </div>

        <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-2xl hover:bg-black transition-all active:scale-[0.98] uppercase text-xs tracking-[0.2em]">
          {loading ? 'Bazaga yozilmoqda...' : 'Fondga qabul qilish'}
        </button>
      </form>
    </div>
  );
};

export default AdminBooks;
