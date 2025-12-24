
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const AdminEvents: React.FC = () => {
  const [formData, setFormData] = useState({ title: '', date: '', location: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "events"), { ...formData, createdAt: Date.now() });
      alert("Tadbir qo'shildi!");
      setFormData({ title: '', date: '', location: '', description: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-8">Yangi Tadbir / E'lon</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Sarlavha</label>
          <input required type="text" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Sana</label>
            <input required type="date" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Joylashuv</label>
            <input required type="text" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Batafsil tavsif</label>
          <textarea rows={4} className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        <button disabled={loading} type="submit" className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-black transition-all">
          {loading ? 'Yuklanmoqda...' : 'Tadbirni e\'lon qilish'}
        </button>
      </form>
    </div>
  );
};

export default AdminEvents;
