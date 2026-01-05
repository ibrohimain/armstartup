
import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, addDoc, orderBy, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ARMTask, ChatMessage } from '../types';

const ARMTeam: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks' | 'directory'>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<ARMTask[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'O\'rta' as any, assignee: '', deadline: '' });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;
  const isKPIAdmin = currentUser?.email === 'umarabdullayev338@gmail.com';

  useEffect(() => {
    const qChat = query(collection(db, "staff_chat"), orderBy("createdAt", "asc"), limit(100));
    const unsubChat = onSnapshot(qChat, (s) => {
      setChatMessages(s.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    const qTasks = query(collection(db, "staff_tasks"), orderBy("deadline", "asc"));
    const unsubTasks = onSnapshot(qTasks, (s) => {
      setTasks(s.docs.map(d => ({ id: d.id, ...d.data() } as ARMTask)));
    });

    setLoading(false);
    return () => { unsubChat(); unsubTasks(); };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser) return;
    const emailName = currentUser.email?.split('@')[0] || "Xodim";
    try {
      await addDoc(collection(db, "staff_chat"), {
        text: chatInput,
        senderEmail: currentUser.email,
        senderName: emailName.charAt(0).toUpperCase() + emailName.slice(1),
        senderPosition: isKPIAdmin ? "Bosh Administrator" : "ARM Mutaxassisi",
        createdAt: Date.now()
      });
      setChatInput('');
    } catch (err) { console.error(err); }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "staff_tasks"), {
        ...taskForm,
        status: 'Kutilmoqda',
        createdAt: Date.now()
      });
      alert("Vazifa yuklandi!");
      setShowTaskForm(false);
      setTaskForm({ title: '', priority: 'O\'rta', assignee: '', deadline: '' });
    } catch (err) { console.error(err); }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "staff_tasks", id), { status });
  };

  const armGroups = [
    {
      name: "Xizmat Ko'rsatish Bo'limi",
      head: "Umirova Zulfiya Umarovna",
      staff: [
        "Ishanqulova Shaxnoza Baxtiyorovna (Uslubchi)",
        "G‘ulomova Zarifa Shodikulovna (Bibliograf)",
        "Rasulova Ziyoda Norboevna (Kutubxonachi)",
        "Sattorova Mayram G‘iyosovna (Kutubxonachi)",
        "Xolikova Shaxnoza Sharipovna (Kutubxonachi)",
        "Xoliqulova Rita Xolmirzaevna (Kutubxonachi)"
      ]
    },
    {
      name: "Axborot-Kutubxona Resurslarini Butlash",
      head: "Ortiqova Maloxat Tirkashevna",
      staff: [
        "Tursunova Maloxat Jamolovna (Mutaxassis)",
        "Kengasheva Mexri Sa’dullaevna (Bibliograf)",
        "Muqimova Sevara Erkinovna (Kutubxonachi)",
        "Urdusheva Sevara Pozilovna (Kutubxonachi)",
        "Mamadazizova Shaxnoza Baxrom qizi (Kutubxonachi)"
      ]
    },
    {
      name: "Ilmiy-Uslubiy va Axborot-Ma'lumot",
      head: "Tursunova Fotima Xojimuratovna",
      staff: [
        "Muhammadova Lobar Sobir qizi (Bosh mutaxassis)",
        "Qosimova Zulfiya Ergashevna (Bibliograf)",
        "Urdusheva Xurshida Ravshan qizi (Bibliograf)",
        "Xakimova Gulchexra Yokubjonovna (Bibliograf)",
        "Mustafoeva Ruxsora Islomovna (Kutubxonachi)",
        "Usmanova Nigora Bazarovna (Kutubxonachi)",
        "Usmonova Musharraf Arzievna (Kutubxonachi)",
        "Toshpo‘latova Nodira Baxtiyorovna (Kutubxonachi)",
        "To‘raeva Gulchexra Ummatkulovna (Kutubxonachi)"
      ]
    },
    {
      name: "Axborot-Kutubxona Resurslarini Raqamlashtirish",
      head: "Abdillayev Ibroxim Nurulla o'g'li",
      staff: [
        "Xzratkulova Visola Sag'dulla qizi (Mutaxassis)",
        "Bobalieva Feruza Farxod qizi (Elektron kutubxona mutaxassisi)"
      ]
    },
    {
      name: "Xorijiy Axborot-Kutubxona Resurslari",
      head: "Muzaffarova Malika Burxonovna",
      staff: [
        "Tursunova Shaxnoza Turg‘unovna (Bibliograf)",
        "Ilhomova Dildora Ijod qizi (Kutubxonachi)",
        "Mordvinkin Vladislav Sergeevich (Kutubxonachi)"
      ]
    }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Jamoa Hub</h1>
          <p className="text-slate-500 font-medium italic">Xodimlar muloqoti va vazifalar monitoringi.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('chat')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Muloqot</button>
          <button onClick={() => setActiveTab('tasks')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Vazifalar ({tasks.filter(t=>t.status!=='Yakunlandi').length})</button>
          <button onClick={() => setActiveTab('directory')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Jamoa Ro'yxati</button>
        </div>
      </div>

      {activeTab === 'chat' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl flex flex-col h-[70vh] overflow-hidden animate-fade-in">
           <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-slate-50/30 custom-scrollbar">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.senderEmail === currentUser?.email ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-6 rounded-[2rem] ${msg.senderEmail === currentUser?.email ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'}`}>
                    <p className="text-[10px] font-black uppercase opacity-60 mb-2">{msg.senderName} • {msg.senderPosition}</p>
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
           </div>
           <form onSubmit={handleSendMessage} className="p-8 bg-white border-t border-slate-100 flex gap-4">
              <input type="text" className="flex-grow px-8 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-medium" placeholder="Xabar yozing..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
              <button type="submit" disabled={!chatInput.trim()} className="bg-indigo-600 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl hover:bg-black transition-all active:scale-90"><svg className="w-8 h-8 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
           </form>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-8 animate-in fade-in">
           <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Ishchi Vazifalar Monitoringi</h3>
              {isKPIAdmin && <button onClick={() => setShowTaskForm(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">+ Vazifa yuklash</button>}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <div key={task.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative group">
                   <div className="flex justify-between items-start mb-6">
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase ${task.priority === 'Yuqori' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>{task.priority}</span>
                      <span className={`text-[9px] font-black uppercase ${task.status === 'Yakunlandi' ? 'text-emerald-500' : 'text-amber-500'}`}>{task.status}</span>
                   </div>
                   <h4 className="text-lg font-black text-slate-800 mb-4">{task.title}</h4>
                   <div className="flex items-center gap-3 mb-8">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black">{task.assignee[0]}</div>
                      <div>
                         <p className="text-xs font-bold text-slate-700">{task.assignee}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">MUDDAT: {task.deadline}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      {task.status !== 'Yakunlandi' && <button onClick={() => task.id && updateTaskStatus(task.id, 'Yakunlandi')} className="flex-grow py-3 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-xl hover:bg-emerald-600 hover:text-white transition-all">Yakunlash</button>}
                      {isKPIAdmin && <button onClick={() => task.id && deleteDoc(doc(db, "staff_tasks", task.id))} className="p-3 bg-slate-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                   </div>
                </div>
              ))}
           </div>

           {showTaskForm && (
             <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl">
                <form onSubmit={handleCreateTask} className="bg-white w-full max-w-md p-12 rounded-[3.5rem] shadow-2xl animate-in zoom-in-95">
                   <h3 className="text-2xl font-black text-slate-800 mb-8 text-center uppercase tracking-tighter">Yangi Vazifa</h3>
                   <div className="space-y-6">
                      <input required type="text" className="w-full px-7 py-4 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="Vazifa nomi..." value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
                      <input required type="text" className="w-full px-7 py-4 bg-slate-50 rounded-2xl outline-none font-bold" placeholder="Mas'ul xodim (Ismi)..." value={taskForm.assignee} onChange={e => setTaskForm({...taskForm, assignee: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                         <select className="px-7 py-4 bg-slate-50 rounded-2xl outline-none font-bold" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value as any})}>
                            <option>O'rta</option>
                            <option>Yuqori</option>
                            <option>Past</option>
                         </select>
                         <input required type="date" className="px-7 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] uppercase text-[10px] tracking-widest shadow-xl">Vazifani yuklash</button>
                      <button type="button" onClick={() => setShowTaskForm(false)} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest">Bekor qilish</button>
                   </div>
                </form>
             </div>
           )}
        </div>
      )}

      {activeTab === 'directory' && (
        <div className="space-y-12 animate-fade-in pb-20">
           {/* DIRECTOR SECTION */}
           <div className="bg-slate-900 rounded-[3rem] p-10 sm:p-14 text-white shadow-2xl flex flex-col md:flex-row items-center gap-10 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
              <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center font-black text-4xl shadow-2xl relative z-10">R</div>
              <div className="text-center md:text-left relative z-10">
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3 block">Ma'muriyat</span>
                 <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">Ropieva Muborak Abdug‘anievna</h2>
                 <p className="text-lg font-medium text-slate-400 italic">ARM Direktori</p>
              </div>
           </div>

           {/* DEPARTMENTS GRID */}
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {armGroups.map((group, idx) => (
                <div key={idx} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow">
                   <div className="bg-slate-50 p-8 border-b border-slate-100">
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Bo'lim</h4>
                      <h3 className="text-2xl font-black text-slate-800 leading-tight mb-6">{group.name}</h3>
                      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100">
                         <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl">{group.head[0]}</div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bo'lim Mudiri</p>
                            <p className="text-sm font-bold text-slate-800">{group.head}</p>
                         </div>
                      </div>
                   </div>
                   <div className="p-8 space-y-4 flex-grow bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bo'lim xodimlari ({group.staff.length})</span>
                        <div className="h-0.5 flex-grow mx-4 bg-slate-50"></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {group.staff.map((member, midx) => (
                           <div key={midx} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                              <p className="text-[11px] font-medium text-slate-600 leading-tight">{member}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* Footer Note */}
           <div className="text-center py-10 opacity-30 italic">
              <p className="text-sm font-medium">Barcha xodimlar ARM ish tartibi va lavozim yo'riqnomasi asosida faoliyat yuritadi.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default ARMTeam;
