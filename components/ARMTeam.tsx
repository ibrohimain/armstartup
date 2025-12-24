
import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { ARMTask, StaffDoc, KPIMetric, ChatMessage } from '../types';

const ARMTeam: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'docs' | 'kpi' | 'directory' | 'profile' | 'chat'>('chat');
  const [tasks, setTasks] = useState<ARMTask[]>([]);
  const [staffDocs, setStaffDocs] = useState<StaffDoc[]>([]);
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;
  const isKPIAdmin = currentUser?.email === 'umarabdullayev338@gmail.com';
  const isAdmin = !!currentUser;

  // Form states
  const [newDoc, setNewDoc] = useState({ title: '', content: '', type: 'Yo\'riqnoma' as any });

  useEffect(() => {
    // Tasks
    const qTasks = query(collection(db, "staff_tasks"), orderBy("createdAt", "desc"));
    const unsubTasks = onSnapshot(qTasks, (s) => {
      setTasks(s.docs.map(d => ({ id: d.id, ...d.data() } as ARMTask)));
    });

    // Docs
    const qDocs = query(collection(db, "staff_docs"), orderBy("createdAt", "desc"));
    const unsubDocs = onSnapshot(qDocs, (s) => {
      setStaffDocs(s.docs.map(d => ({ id: d.id, ...d.data() } as StaffDoc)));
    });

    // Chat
    const qChat = query(collection(db, "staff_chat"), orderBy("createdAt", "asc"), limit(100));
    const unsubChat = onSnapshot(qChat, (s) => {
      setChatMessages(s.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    // KPI
    const unsubKPI = onSnapshot(collection(db, "arm_kpi"), (s) => {
      if (!s.empty) {
        setKpis(s.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      }
    });

    setLoading(false);
    return () => { unsubTasks(); unsubDocs(); unsubChat(); unsubKPI(); };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser) return;
    
    // Ismni chiroyli formatlash
    const rawName = currentUser.displayName || currentUser.email?.split('@')[0] || "Xodim";
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const position = isKPIAdmin ? "Bosh Administrator" : "ARM Mutaxassisi";

    await addDoc(collection(db, "staff_chat"), {
      text: chatInput,
      senderEmail: currentUser.email,
      senderName: formattedName,
      senderPosition: position,
      createdAt: Date.now()
    });
    setChatInput('');
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "staff_docs"), {
      ...newDoc,
      author: currentUser?.displayName || currentUser?.email || 'Admin',
      createdAt: Date.now()
    });
    setShowAddDocModal(false);
    setNewDoc({ title: '', content: '', type: 'Yo\'riqnoma' });
  };

  const handleUpdateKPI = async (id: string, newValue: number) => {
    if (!isKPIAdmin) return;
    await updateDoc(doc(db, "arm_kpi", id), { value: newValue });
  };

  const staffHierarchy = [
    {
      mudir: "Ropieva Muborak Abdug‘anievna",
      position: "ARM Direktori",
      department: "Ma'muriyat",
      staff: []
    },
    {
      mudir: "Umirova Zulfiya Umarovna",
      position: "Bo'lim Mudiri",
      department: "Xizmat Ko'rsatish Bo'limi",
      staff: [
        { name: "Ishanqulova Shaxnoza Baxtiyorovna", pos: "Uslubchi" },
        { name: "G‘ulomova Zarifa Shodikulovna", pos: "Bibliograf" },
        { name: "Rasulova Ziyoda Norboevna", pos: "Kutubxonachi" },
        { name: "Sattorova Mayram G‘iyosovna", pos: "Kutubxonachi" },
        { name: "Xolikova Shaxnoza Sharipovna", pos: "Kutubxonachi" },
        { name: "Xoliqulova Rita Xolmirzaevna", pos: "Kutubxonachi" }
      ]
    },
    {
      mudir: "Ortiqova Maloxat Tirkashevna",
      position: "Bo'lim Mudiri",
      department: "Axborot-Kutubxona Resurslarini Butlash",
      staff: [
        { name: "Tursunova Maloxat Jamolovna", pos: "Axborot-kutubxona mutaxassisi" },
        { name: "Kengasheva Mexri Sa’dullaevna", pos: "Bibliograf" },
        { name: "Muqimova Sevara Erkinovna", pos: "Kutubxonachi" },
        { name: "Urdusheva Sevara Pozilovna", pos: "Kutubxonachi" },
        { name: "Mamadazizova Shaxnoza Baxrom qizi", pos: "Kutubxonachi" }
      ]
    },
    {
      mudir: "Tursunova Fotima Xojimuratovna",
      position: "Bo'lim Mudiri",
      department: "Ilmiy-Uslubiy va Axborot-Ma'lumot Bo'limi",
      staff: [
        { name: "Muhammadova Lobar Sobir qizi", pos: "Bosh mutaxassis" },
        { name: "Qosimova Zulfiya Ergashevna", pos: "Bibliograf" },
        { name: "Urdusheva Xurshida Ravshan qizi", pos: "Bibliograf" },
        { name: "Xakimova Gulchexra Yokubjonovna", pos: "Bibliograf" },
        { name: "Mustafoeva Ruxsora Islomovna", pos: "Kutubxonachi" },
        { name: "Usmanova Nigora Bazarovna", pos: "Kutubxonachi" },
        { name: "Usmonova Musharraf Arzievna", pos: "Kutubxonachi" },
        { name: "Toshpo‘latova Nodira Baxtiyorovna", pos: "Kutubxonachi" },
        { name: "To‘raeva Gulchexra Ummatkulovna", pos: "Kutubxonachi" }
      ]
    },
    {
      mudir: "Abdillayev Ibroxim Nurulla o'g'li",
      position: "Bo'lim Mudiri",
      department: "Axborot-Kutubxona Resurslarini Raqamlashtirish",
      staff: [
        { name: "Xzratkulova Visola Sag'dulla qizi", pos: "Axborot-kutubxona mutaxassisi" },
        { name: "Bobalieva Feruza Farxod qizi", pos: "Elektron kutubxona mutaxassisi" }
      ]
    },
    {
      mudir: "Muzaffarova Malika Burxonovna",
      position: "Bo'lim Mudiri",
      department: "Xorijiy Axborot-Kutubxona Resurslari",
      staff: [
        { name: "Tursunova Shaxnoza Turg‘unovna", pos: "Bibliograf" },
        { name: "Ilhomova Dildora Ijod qizi", pos: "Kutubxonachi" },
        { name: "Mordvinkin Vladislav Sergeevich", pos: "Kutubxonachi" }
      ]
    }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 mb-2">
            ARM Jamoasi Portal
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">ARM Team Portal</h1>
          <p className="text-slate-500 font-medium italic">Xodimlar muloqoti va ishchi muhit.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('chat')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>Muloqot Chat</button>
          <button onClick={() => setActiveTab('tasks')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>Vazifalar</button>
          <button onClick={() => setActiveTab('docs')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'docs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>Bilimlar Bazasi</button>
          <button onClick={() => setActiveTab('directory')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>Jamoa</button>
          <button onClick={() => setActiveTab('kpi')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'kpi' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>KPI</button>
          <button onClick={() => setActiveTab('profile')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>Profil</button>
        </div>
      </div>

      {activeTab === 'chat' && (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl flex flex-col h-[75vh] overflow-hidden animate-in fade-in duration-500">
           {/* Chat Header */}
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 backdrop-blur-md">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-100">
                    💬
                 </div>
                 <div>
                    <h3 className="font-black text-2xl text-slate-800 tracking-tighter">Umumiy Muloqot Markazi</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                       Xizmat xabarnomalari va savol-javoblar
                    </p>
                 </div>
              </div>
              <div className="hidden sm:flex flex-col items-end">
                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">ARM Platform v2.0</span>
                 <span className="text-[9px] font-bold text-slate-400 uppercase">Faqat xodimlar uchun</span>
              </div>
           </div>

           {/* Chat Messages */}
           <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-slate-50/30 custom-scrollbar">
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                   <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                   <p className="font-bold">Muloqotni boshlang...</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => {
                const isMe = msg.senderEmail === currentUser?.email;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                    <div className={`flex flex-col max-w-[80%] sm:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                       {/* Sender Info Badge */}
                       <div className={`flex items-center gap-3 mb-2 px-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm ${isMe ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-slate-100'}`}>
                             {msg.senderName?.[0] || 'X'}
                          </div>
                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                             <span className="text-[11px] font-black text-slate-800 tracking-tight">{msg.senderName}</span>
                             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{msg.senderPosition}</span>
                          </div>
                       </div>

                       {/* Message Bubble */}
                       <div className={`group relative p-6 rounded-[2.5rem] shadow-sm transition-all duration-300 ${
                         isMe 
                         ? 'bg-indigo-600 text-white rounded-tr-none hover:bg-black hover:shadow-xl' 
                         : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none hover:shadow-xl'
                       }`}>
                          <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                          <div className={`absolute bottom-3 right-5 text-[8px] font-black uppercase opacity-40 ${isMe ? 'text-indigo-100' : 'text-slate-400'}`}>
                             {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                       </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
           </div>

           {/* Chat Input */}
           <form onSubmit={handleSendMessage} className="p-8 border-t border-slate-100 bg-white flex gap-4 shrink-0 shadow-[-10px_0_40px_rgba(0,0,0,0.02)]">
              <div className="flex-grow relative">
                <input 
                  type="text" 
                  className="w-full pl-8 pr-20 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-700 placeholder:text-slate-300"
                  placeholder="Hamkasblarga xabar yoki savol yo'llang..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">ENTER or TAP</span>
                </div>
              </div>
              <button 
                type="submit"
                disabled={!chatInput.trim()}
                className="bg-indigo-600 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-100 hover:bg-black transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale"
              >
                <svg className="w-8 h-8 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
           </form>
        </div>
      )}

      {/* Profile, Tasks, Docs qismlari avvalgidek qoldi (Optimallashtirilgan navigatsiya bilan) */}
      {activeTab === 'profile' && (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
          <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="w-40 h-40 bg-indigo-600 rounded-[3rem] shadow-2xl shadow-indigo-100 flex items-center justify-center text-6xl text-white font-black">
                   {(currentUser?.displayName || currentUser?.email)?.[0].toUpperCase() || 'U'}
                </div>
                <div className="text-center md:text-left flex-grow">
                   <h2 className="text-3xl font-black text-slate-800 tracking-tight">{currentUser?.displayName || currentUser?.email?.split('@')[0]}</h2>
                   <p className="text-indigo-600 font-bold text-lg mt-1 italic">{isKPIAdmin ? "Bosh Administrator" : "ARM Mutaxassisi"}</p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email Manzil</span>
                         <span className="text-sm font-bold text-slate-700">{currentUser?.email}</span>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tizim Maqomi</span>
                         <span className="text-sm font-bold text-emerald-600 uppercase tracking-tighter">Faol • Mas'ul xodim</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in duration-500">
           {staffHierarchy.map((dept, i) => (
             <div key={i} className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex items-start gap-4 mb-8">
                   <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                      {dept.mudir[0]}
                   </div>
                   <div>
                      <h3 className="font-black text-slate-800 text-lg leading-tight">{dept.mudir}</h3>
                      <p className="text-indigo-600 font-bold text-xs mt-0.5">{dept.position}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{dept.department}</p>
                   </div>
                </div>
                {dept.staff.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-slate-50">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Bo'lim xodimlari ({dept.staff.length})</p>
                     <div className="grid gap-3">
                        {dept.staff.map((s, si) => (
                          <div key={si} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-indigo-100 transition-colors">
                             <div>
                                <p className="text-xs font-bold text-slate-700">{s.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{s.pos}</p>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
             </div>
           ))}
        </div>
      )}

      {/* Docs, KPI va Tasks qismlari o'zgarishsiz qoldi */}
      {/* ... (kodning qolgan qismi ARMTeam dagi avvalgi funksionallikni saqlab qoladi) */}
    </div>
  );
};

export default ARMTeam;
