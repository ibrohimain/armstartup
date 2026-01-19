
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ARM_STRUCTURE, MethodicalType } from '../types';

const AdminManuals: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'manual' | 'regulation' | 'cultural' | 'periodical'>('manual');
  const [loading, setLoading] = useState(false);
  
  const [manualForm, setManualForm] = useState({
    title: '', author: '', faculty: 'Transport muhandisligi', department: 'Transport vositalari muhandisligi', 
    subject: 'Metodika', year: 2024, type: 'Qo\'llanma' as MethodicalType, annotation: ''
  });

  const [regForm, setRegForm] = useState({
    title: '', category: 'Nizom' as any, author: '', status: 'Yangi' as any
  });

  const [eventForm, setEventForm] = useState({
    title: '', type: 'Taqdimot' as any, date: '', responsible: '', monitoringStatus: 'Rejalashtirilgan' as any
  });

  const [periodicalForm, setPeriodicalForm] = useState({
    name: '', type: 'Jurnal', periodicity: 'Har oyda', lastIssue: '', status: 'Mavjud',
    staffTask: '', responsibleStaff: ''
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "manuals"), { ...manualForm, likes: 0, createdAt: Date.now() });
      alert("Ilmiy-metodik resurs muvaffaqiyatli qo'shildi!");
      setManualForm({ ...manualForm, title: '', author: '', annotation: '' });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "regulations"), { ...regForm, createdAt: Date.now() });
      alert("Me'yoriy hujjat ro'yxatga olindi!");
      setRegForm({ title: '', category: 'Nizom', author: '', status: 'Yangi' });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCulturalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "cultural_events"), { ...eventForm, createdAt: Date.now() });
      alert("Tadbir monitoring tizimiga kiritildi!");
      setEventForm({ title: '', type: 'Taqdimot', date: '', responsible: '', monitoringStatus: 'Rejalashtirilgan' });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handlePeriodicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "periodicals"), { ...periodicalForm, createdAt: Date.now() });
      alert("Davriy nashr va monitoring vazifasi saqlandi!");
      setPeriodicalForm({ name: '', type: 'Jurnal', periodicity: 'Har oyda', lastIssue: '', status: 'Mavjud', staffTask: '', responsibleStaff: '' });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="p-3 sm:p-8 max-w-full mx-auto overflow-x-hidden">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 px-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight uppercase">Metodika Boshqaruvi</h2>
          <p className="text-slate-500 font-medium italic text-sm mt-1">Me'yoriy hujjatlar va metodik monitoring.</p>
        </div>
        <div className="w-full lg:w-auto bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar flex items-center gap-1">
           {[
             { id: 'manual', label: 'Resurslar' },
             { id: 'regulation', label: 'Xujjatlar' },
             { id: 'cultural', label: 'Tadbirlar' },
             { id: 'periodical', label: 'Nashrlar' }
           ].map(tab => (
             <button key={tab.id} onClick={() => setActiveSubTab(tab.id as any)} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${activeSubTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {activeSubTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Sarlavha</label>
                <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 rounded-xl outline-none font-bold text-sm" placeholder="Resurs nomi..." value={manualForm.title} onChange={e => setManualForm({...manualForm, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Muallif</label>
                <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 rounded-xl outline-none font-bold text-sm" placeholder="F.I.SH" value={manualForm.author} onChange={e => setManualForm({...manualForm, author: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Turkum</label>
                <select className="w-full px-5 py-3.5 bg-slate-50 rounded-xl font-bold text-xs" value={manualForm.type} onChange={e => setManualForm({...manualForm, type: e.target.value as MethodicalType})}>
                  <option value="Darslik">Darslik</option>
                  <option value="Qo'llanma">Qo'llanma</option>
                  <option value="Ma'ruza">Ma'ruza</option>
                  <option value="Avtoreferat">Avtoreferat</option>
                  <option value="EMB">EMB</option>
                  <option value="Ilmiy ish">Ilmiy ish</option>
                </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Fakultet</label>
                 <select className="w-full px-5 py-3.5 bg-slate-50 rounded-xl font-bold text-xs" value={manualForm.faculty} onChange={e => setManualForm({...manualForm, faculty: e.target.value, department: ARM_STRUCTURE[e.target.value as keyof typeof ARM_STRUCTURE][0]})}>
                   {Object.keys(ARM_STRUCTURE).map(f => <option key={f} value={f}>{f}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Kafedra</label>
                <select className="w-full px-5 py-3.5 bg-slate-50 rounded-xl font-bold text-xs" value={manualForm.department} onChange={e => setManualForm({...manualForm, department: e.target.value})}>
                  {ARM_STRUCTURE[manualForm.faculty as keyof typeof ARM_STRUCTURE].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Annotatsiya</label>
              <textarea required rows={4} className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-medium text-sm leading-relaxed" placeholder="Tavsif..." value={manualForm.annotation} onChange={e => setManualForm({...manualForm, annotation: e.target.value})} />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white font-black py-4.5 rounded-2xl shadow-lg uppercase text-[10px] tracking-widest">Fondga qo'shish</button>
          </form>
        )}

        {activeSubTab === 'regulation' && (
          <form onSubmit={handleRegSubmit} className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6 animate-in fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Xujjat nomi</label>
                   <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 rounded-xl font-bold text-sm" placeholder="Nomi..." value={regForm.title} onChange={e => setRegForm({...regForm, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Turi</label>
                   <select className="w-full px-5 py-3.5 bg-slate-50 rounded-xl font-bold text-xs" value={regForm.category} onChange={e => setRegForm({...regForm, category: e.target.value as any})}>
                      <option value="Nizom">Nizom</option>
                      <option value="Yo'riqnoma">Yo'riqnoma</option>
                      <option value="Ish rejasi">Ish rejasi</option>
                      <option value="Tavsiyanoma">Tavsiyanoma</option>
                   </select>
                </div>
             </div>
             <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white font-black py-4.5 rounded-2xl uppercase text-[10px] tracking-widest">Xujjatni saqlash</button>
          </form>
        )}

        {activeSubTab === 'cultural' && (
          <form onSubmit={handleCulturalSubmit} className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6 animate-in fade-in">
             <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Tadbir nomi</label>
                <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 rounded-xl font-bold text-sm" placeholder="Nomi..." value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Turi</label>
                   <select className="w-full px-5 py-3.5 bg-slate-50 rounded-xl font-bold text-xs" value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value as any})}>
                      <option value="Taqdimot">Taqdimot</option>
                      <option value="Ko'rgazma">Ko'rgazma</option>
                      <option value="Davra suhbati">Suhbat</option>
                      <option value="Debat">Debat</option>
                      <option value="Savdo">Savdo</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Sana</label>
                   <input required type="date" className="w-full px-5 py-3.5 bg-slate-50 rounded-xl font-bold text-sm" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
                </div>
             </div>
             <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white font-black py-4.5 rounded-2xl uppercase text-[10px] tracking-widest">Tadbirni tasdiqlash</button>
          </form>
        )}

        {activeSubTab === 'periodical' && (
          <form onSubmit={handlePeriodicalSubmit} className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Nashr nomi</label>
                <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 rounded-xl font-bold text-sm" value={periodicalForm.name} onChange={e => setPeriodicalForm({...periodicalForm, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Soni</label>
                <input required type="text" className="w-full px-5 py-3.5 bg-slate-50 rounded-xl font-bold text-sm" value={periodicalForm.lastIssue} onChange={e => setPeriodicalForm({...periodicalForm, lastIssue: e.target.value})} />
              </div>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-slate-800 text-white font-black py-4.5 rounded-2xl uppercase text-[10px] tracking-widest">Nashrni kiritish</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminManuals;
