
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ARM_STRUCTURE } from '../types';

const AdminManuals: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'manual' | 'periodical'>('manual');
  const [loading, setLoading] = useState(false);
  
  const [manualForm, setManualForm] = useState({
    title: '', author: '', faculty: 'Transport muhandisligi', department: 'Transport vositalari muhandisligi', 
    subject: 'Metodika', year: 2024, annotation: '', fileUrl: '', fileSize: '0.0 MB'
  });

  const [periodicalForm, setPeriodicalForm] = useState({
    name: '', type: 'Jurnal', periodicity: 'Har oyda', lastIssue: '', status: 'Mavjud',
    staffTask: '', responsibleStaff: ''
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "manuals"), {
        ...manualForm,
        likes: 0,
        createdAt: Date.now()
      });
      alert("Metodik qo'llanma muvaffaqiyatli qo'shildi!");
      setManualForm({ ...manualForm, title: '', author: '', annotation: '', fileUrl: '', fileSize: '0.0 MB' });
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "periodicals"), {
        ...periodicalForm,
        createdAt: Date.now()
      });
      alert("Davriy nashr va xizmat vazifasi muvaffaqiyatli qo'shildi!");
      setPeriodicalForm({ name: '', type: 'Jurnal', periodicity: 'Har oyda', lastIssue: '', status: 'Mavjud', staffTask: '', responsibleStaff: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Metodika Admin Paneli</h2>
          <p className="text-slate-500 font-medium italic">Fakultet va Kafedralar kesimida fondni boshqarish.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
           <button onClick={() => setActiveSubTab('manual')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeSubTab === 'manual' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Qo'llanma</button>
           <button onClick={() => setActiveSubTab('periodical')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeSubTab === 'periodical' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Nashrlar Monitoringi</button>
        </div>
      </div>

      {activeSubTab === 'manual' && (
        <form onSubmit={handleManualSubmit} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qo'llanma sarlavhasi</label>
              <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Masalan: Logistika tizimlarini loyihalash" value={manualForm.title} onChange={e => setManualForm({...manualForm, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Muallif(lar)</label>
              <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Ism Familiya" value={manualForm.author} onChange={e => setManualForm({...manualForm, author: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fakultet</label>
              <select 
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-600" 
                value={manualForm.faculty} 
                onChange={e => setManualForm({...manualForm, faculty: e.target.value, department: ARM_STRUCTURE[e.target.value as keyof typeof ARM_STRUCTURE][0]})}
              >
                {Object.keys(ARM_STRUCTURE).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kafedra</label>
              <select 
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-600" 
                value={manualForm.department} 
                onChange={e => setManualForm({...manualForm, department: e.target.value})}
              >
                {ARM_STRUCTURE[manualForm.faculty as keyof typeof ARM_STRUCTURE].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mavzu yo'nalishi</label>
              <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none" placeholder="Masalan: Logistika" value={manualForm.subject} onChange={e => setManualForm({...manualForm, subject: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nashr yili</label>
              <input type="number" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none" value={manualForm.year} onChange={e => setManualForm({...manualForm, year: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fayl hajmi</label>
              <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none" placeholder="Masalan: 3.4 MB" value={manualForm.fileSize} onChange={e => setManualForm({...manualForm, fileSize: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To'liq Annotatsiya</label>
            <textarea required rows={5} className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium leading-relaxed" placeholder="Ushbu metodik qo'llanmada soha bo'yicha quyidagilar keltirilgan..." value={manualForm.annotation} onChange={e => setManualForm({...manualForm, annotation: e.target.value})} />
          </div>

          <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2.5rem] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] uppercase text-xs tracking-widest">
            {loading ? 'Saqlanmoqda...' : 'Metodik fondga qo\'shish'}
          </button>
        </form>
      )}

      {activeSubTab === 'periodical' && (
        <form onSubmit={handlePeriodicalSubmit} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nashr nomi</label>
              <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Masalan: Transport jurnali" value={periodicalForm.name} onChange={e => setPeriodicalForm({...periodicalForm, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Oxirgi olingan soni</label>
              <input required type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="№4, 2024" value={periodicalForm.lastIssue} onChange={e => setPeriodicalForm({...periodicalForm, lastIssue: e.target.value})} />
            </div>
          </div>

          <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100 space-y-6">
             <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Xodimlar uchun ichki vazifa</h4>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Vazifa matni</label>
                <textarea rows={3} className="w-full px-6 py-4 bg-white border border-indigo-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-900" placeholder="Nashrning keyingi sonini qabul qilib olib, bazaga kiritish lozim." value={periodicalForm.staffTask} onChange={e => setPeriodicalForm({...periodicalForm, staffTask: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mas'ul xodim</label>
                <input type="text" className="w-full px-6 py-4 bg-white border border-indigo-100 rounded-2xl outline-none" placeholder="Masalan: Ali Valiyev" value={periodicalForm.responsibleStaff} onChange={e => setPeriodicalForm({...periodicalForm, responsibleStaff: e.target.value})} />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nashr turi</label>
              <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none" value={periodicalForm.type} onChange={e => setPeriodicalForm({...periodicalForm, type: e.target.value})}>
                <option>Jurnal</option>
                <option>Gazeta</option>
                <option>Ilmiy to'plam</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Davriyligi</label>
              <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none" value={periodicalForm.periodicity} onChange={e => setPeriodicalForm({...periodicalForm, periodicity: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Holati</label>
              <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none" value={periodicalForm.status} onChange={e => setPeriodicalForm({...periodicalForm, status: e.target.value as any})}>
                <option value="Mavjud">Mavjud</option>
                <option value="Kutilmoqda">Kutilmoqda</option>
              </select>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-slate-800 text-white font-black py-5 rounded-[2.5rem] shadow-xl hover:bg-black transition-all active:scale-[0.98] uppercase text-xs tracking-widest">
            {loading ? 'Yangilanmoqda...' : 'Monitoring tizimiga kiritish'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminManuals;
