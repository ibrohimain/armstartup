
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
    
    // Foydalanuvchi ismini email orqali formatlash
    const rawEmailName = currentUser.email?.split('@')[0] || "Xodim";
    const formattedName = rawEmailName.charAt(0).toUpperCase() + rawEmailName.slice(1);
    
    // Lavozim (Simulatsiya: Admin bo'lsa Bosh Admin, aks holda Mutaxassis)
    const position = isKPIAdmin ? "Bosh Administrator" : "ARM Mutaxassisi";

    try {
      await addDoc(collection(db, "staff_chat"), {
        text: chatInput,
        senderEmail: currentUser.email,
        senderName: formattedName,
        senderPosition: position,
        createdAt: Date.now()
      });
      setChatInput('');
    } catch (err) {
      console.error("Chat Error:", err);
    }
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
        { name: "G‘ulomova Zarifa Shodikulovna", pos: "Bibliograf" }
      ]
    },
    {
      mudir: "Abdillayev Ibroxim Nurulla o'g'li",
      position: "Bo'lim Mudiri",
      department: "Axborot-Kutubxona Resurslarini Raqamlashtirish",
      staff: [
        { name: "Bobalieva Feruza Farxod qizi", pos: "Elektron kutubxona mutaxassisi" }
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
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Xodimlar Ishchi Muhiti</h1>
          <p className="text-slate-500 font-medium italic">Professional muloqot va vazifalar boshqaruvi.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('chat')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Chat</button>
          <button onClick={() => setActiveTab('tasks')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Vazifalar</button>
          <button onClick={() => setActiveTab('docs')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'docs' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Bilimlar</button>
          <button onClick={() => setActiveTab('directory')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Jamoa</button>
          <button onClick={() => setActiveTab('profile')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Profil</button>
        </div>
      </div>

      {activeTab === 'chat' && (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl flex flex-col h-[70vh] overflow-hidden animate-fade-in">
           {/* Chat Header */}
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                    💬
                 </div>
                 <div>
                    <h3 className="font-black text-xl text-slate-800">Xodimlar Chat-Markazi</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-vaqt muloqoti</p>
                 </div>
              </div>
              <div className="hidden sm:block text-right">
                 <p className="text-[10px] font-black text-indigo-600 uppercase">Faqat xodimlar uchun</p>
                 <p className="text-[9px] font-bold text-slate-300 italic">Xavfsiz ulanish faol</p>
              </div>
           </div>

           {/* Messages Container */}
           <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-slate-50/30 custom-scrollbar">
              {chatMessages.map((msg, idx) => {
                const isMe = msg.senderEmail === currentUser?.email;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                       {/* Header: Name and Position */}
                       <div className={`flex items-center gap-2 mb-2 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="text-[11px] font-black text-slate-800">{msg.senderName}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">| {msg.senderPosition}</span>
                       </div>
                       
                       {/* Message Bubble */}
                       <div className={`p-6 rounded-[2rem] shadow-sm relative ${
                         isMe 
                         ? 'bg-indigo-600 text-white rounded-tr-none' 
                         : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                       }`}>
                          <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                          <span className={`block mt-2 text-[8px] font-black opacity-40 text-right ${isMe ? 'text-white' : 'text-slate-400'}`}>
                             {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                       </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
           </div>

           {/* Chat Input */}
           <form onSubmit={handleSendMessage} className="p-8 border-t border-slate-100 bg-white flex gap-4 shrink-0">
              <input 
                type="text" 
                className="flex-grow px-8 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-700"
                placeholder="Xabaringizni yozing..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!chatInput.trim()}
                className="bg-indigo-600 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-100 hover:bg-black transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
              >
                <svg className="w-8 h-8 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
           </form>
        </div>
      )}

      {/* Profile Section */}
      {activeTab === 'profile' && (
        <div className="animate-fade-in max-w-4xl mx-auto">
          <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl">
             <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-40 h-40 bg-indigo-600 rounded-[3rem] shadow-2xl flex items-center justify-center text-6xl text-white font-black">
                   {currentUser?.email?.[0].toUpperCase()}
                </div>
                <div className="text-center md:text-left flex-grow">
                   <h2 className="text-3xl font-black text-slate-800 tracking-tight">{currentUser?.email?.split('@')[0].toUpperCase()}</h2>
                   <p className="text-indigo-600 font-bold text-lg mt-1">{isKPIAdmin ? "Bosh Administrator" : "ARM Mutaxassisi"}</p>
                   <div className="mt-8 flex flex-col gap-3">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email Manzil</span>
                         <span className="text-sm font-bold text-slate-700">{currentUser?.email}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* ... Boshqa tablar (Tasks, Directory) avvalgi holatida qoladi ... */}
    </div>
  );
};

export default ARMTeam;
