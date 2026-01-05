
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const UserForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', category: 'Feedback', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "submissions"), {
        ...formData,
        createdAt: Date.now()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', category: 'Feedback', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-indigo-600 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold">Murojaat Yo'llash</h1>
          <p className="mt-2 text-indigo-100 opacity-90">Sizning fikringiz biz uchun muhim. Ma'lumotlarni to'ldiring va yuboring.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To'liq ismingiz</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ivanov Ivan"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email manzilingiz</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategoriya</label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option>Taklif</option>
              <option>Shikoyat</option>
              <option>Savol</option>
              <option>Boshqa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Xabar matni</label>
            <textarea
              required
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Xabaringizni yozing..."
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center animate-bounce">
              Xabaringiz muvaffaqiyatli yuborildi! Rahmat.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserForm;
