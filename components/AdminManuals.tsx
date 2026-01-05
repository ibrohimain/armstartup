
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ARM_STRUCTURE, MethodicalType } from '../types';

const AdminManuals: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'manual' | 'regulation' | 'cultural' | 'periodical'>('manual');
  const [loading, setLoading] = useState(false);
  
  // Methodical Resource Form
  const [manualForm, setManualForm] = useState({
    title: '', author: '', faculty: 'Transport muhandisligi', department: 'Transport vositalari muhandisligi', 
    subject: 'Metodika', year: 2024, type: 'Qo\'llanma' as MethodicalType, annotation: ''
  });

  // Regulation Doc Form
  const [regForm, setRegForm] = useState({
    title: '', category: 'Nizom' as any, author: '', status: 'Yangi' as any
  });

  // Cultural Event Form
  const [eventForm, setEventForm] = useState({
    title: '', type: 'Taqdimot' as any, date: '', responsible: '', monitoringStatus: 'Rejalashtirilgan' as any
  });

  // Periodical Form
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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Ilmiy-uslubiy bo'lim Nazorati</h2>
          <p className="text-slate-500 font-medium italic mt-1">Me'yoriy hujjatlar va metodik monitoring boshqaruvi.</p>
        </div>
        <div className="flex bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
           {[
             { id: 'manual', label: 'Resurslar' },
             { id: 'regulation', label: 'Xujjatlar' },
             { id: 'cultural', label: 'Tadbirlar' },
             { id: 'periodical', label: 'Nashrlar' }
           ].map(tab => (
             <button key={tab.id} onClick={() => setActiveSubTab(tab.id as any)} className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSubTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}>
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeSubTab === 'manual' && (
        <form onSubmit={handleManualSubmit} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Resurs sarlavhasi</label>
              <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" placeholder="Masalan: Ma'ruzalar matni" value={manualForm.title} onChange={e => setManualForm({...manualForm, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Muallif / Professor</label>
              <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" placeholder="Ism Familiya" value={manualForm.author} onChange={e => setManualForm({...manualForm, author: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Turkum</label>
              <select className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-600" value={manualForm.type} onChange={e => setManualForm({...manualForm, type: e.target.value as MethodicalType})}>
                <option value="Darslik">Darslik</option>
                <option value="Qo'llanma">Metodik qo'llanma</option>
                <option value="Ma'ruza">Ma'ruzalar matni</option>
                <option value="Avtoreferat">Avtoreferat</option>
                <option value="EMB">EMB (Elektron materiallar)</option>
                <option value="Ilmiy ish">Ilmiy ish</option>
              </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fakultet</label>
               <select className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-600" value={manualForm.faculty} onChange={e => setManualForm({...manualForm, faculty: e.target.value, department: ARM_STRUCTURE[e.target.value as keyof typeof ARM_STRUCTURE][0]})}>
                 {Object.keys(ARM_STRUCTURE).map(f => <option key={f} value={f}>{f}</option>)}
               </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kafedra</label>
              <select className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold text-slate-600" value={manualForm.department} onChange={e => setManualForm({...manualForm, department: e.target.value})}>
                {ARM_STRUCTURE[manualForm.faculty as keyof typeof ARM_STRUCTURE].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Annotatsiya</label>
            <textarea required rows={5} className="w-full px-7 py-5 bg-slate-50 border-none rounded-[3rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium leading-relaxed" placeholder="Resurs mazmuni..." value={manualForm.annotation} onChange={e => setManualForm({...manualForm, annotation: e.target.value})} />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl hover:bg-black transition-all uppercase text-[11px] tracking-widest">Fondga qo'shish</button>
        </form>
      )}

      {/* Fixed: Replaced activeTab with activeSubTab */}
      {activeSubTab === 'regulation' && (
        <form onSubmit={handleRegSubmit} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Xujjat nomi</label>
                 <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" placeholder="Masalan: ARM bo'lim Nizomi" value={regForm.title} onChange={e => setRegForm({...regForm, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Turi</label>
                 <select className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" value={regForm.category} onChange={e => setRegForm({...regForm, category: e.target.value as any})}>
                    <option value="Nizom">Nizom</option>
                    <option value="Yo'riqnoma">Lavozim yo'riqnomasi</option>
                    <option value="Ish rejasi">Ish rejasi (Yillik/Oylik)</option>
                    <option value="Tavsiyanoma">Uslubiy tavsiyanoma</option>
                 </select>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mas'ul xodim</label>
                 <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" placeholder="F.I.SH" value={regForm.author} onChange={e => setRegForm({...regForm, author: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Holati</label>
                 <select className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" value={regForm.status} onChange={e => setRegForm({...regForm, status: e.target.value as any})}>
                    <option value="Yangi">Yangi</option>
                    <option value="Jarayonda">Jarayonda</option>
                    <option value="Tasdiqlangan">Tasdiqlangan</option>
                 </select>
              </div>
           </div>
           <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase text-[11px] tracking-widest">Xujjatni saqlash</button>
        </form>
      )}

      {/* Fixed: Replaced activeTab with activeSubTab */}
      {activeSubTab === 'cultural' && (
        <form onSubmit={handleCulturalSubmit} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-8 animate-in fade-in duration-500">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tadbir/Ko'rgazma nomi</label>
              <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" placeholder="Masalan: Abdulla Qodiriy ijodiy kechasi" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Turi</label>
                 <select className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value as any})}>
                    <option value="Taqdimot">Kitob taqdimoti</option>
                    <option value="Ko'rgazma">Kitob ko'rgazmasi</option>
                    <option value="Davra suhbati">Davra suhbati</option>
                    <option value="Debat">Bahs-munozara (Debat)</option>
                    <option value="Savdo">Kitob savdosi</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sana</label>
                 <input required type="date" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mas'ul xodim / Bo'lim</label>
                 <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" placeholder="Masalan: Ma'naviyat bo'limi" value={eventForm.responsible} onChange={e => setEventForm({...eventForm, responsible: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Monitoring holati</label>
                 <select className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" value={eventForm.monitoringStatus} onChange={e => setEventForm({...eventForm, monitoringStatus: e.target.value as any})}>
                    <option value="Rejalashtirilgan">Rejalashtirilgan</option>
                    <option value="Yakunlangan">Yakunlangan</option>
                    <option value="Bekor qilingan">Bekor qilingan</option>
                 </select>
              </div>
           </div>
           <button disabled={loading} type="submit" className="w-full bg-emerald-600 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase text-[11px] tracking-widest">Tadbirni tasdiqlash</button>
        </form>
      )}

      {/* Fixed: Replaced activeTab with activeSubTab */}
      {activeSubTab === 'periodical' && (
        <form onSubmit={handlePeriodicalSubmit} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nashr nomi</label>
              <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" placeholder="Transport jurnali" value={periodicalForm.name} onChange={e => setPeriodicalForm({...periodicalForm, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Oxirgi olingan soni</label>
              <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] font-bold" placeholder="№5, 2024" value={periodicalForm.lastIssue} onChange={e => setPeriodicalForm({...periodicalForm, lastIssue: e.target.value})} />
            </div>
          </div>
          <div className="bg-indigo-50/50 p-10 rounded-[3.5rem] border border-indigo-100 space-y-6">
             <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">Monitoring Vazifasi (Xodimlar uchun)</h4>
             <textarea rows={3} className="w-full px-7 py-5 bg-white border border-indigo-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium" placeholder="Ushbu nashrni qabul qilish, ro'yxatga olish va yangiliklarni ommalashtirish vazifasi..." value={periodicalForm.staffTask} onChange={e => setPeriodicalForm({...periodicalForm, staffTask: e.target.value})} />
             <input type="text" className="w-full px-7 py-5 bg-white border border-indigo-100 rounded-[2rem] outline-none" placeholder="Mas'ul xodim F.I.SH" value={periodicalForm.responsibleStaff} onChange={e => setPeriodicalForm({...periodicalForm, responsibleStaff: e.target.value})} />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-slate-800 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase text-[11px] tracking-widest">Nashrni kiritish</button>
        </form>
      )}
    </div>
  );
};

export default AdminManuals;
