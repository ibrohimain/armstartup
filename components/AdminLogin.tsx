
import React, { useState } from 'react';
import { auth } from '../firebase';
// Fix: Use @firebase scope for named exports
import { signInWithEmailAndPassword } from "@firebase/auth";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Functional approach for Firebase v9+
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError('Email yoki parol noto\'g\'ri. Iltimos qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 animate-in fade-in zoom-in duration-500">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Admin Panel</h2>
          <p className="text-slate-400 font-medium mt-2">Tizimga kirish uchun login va parolingizni kiriting</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold animate-pulse text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Email manzilingiz</label>
            <input
              required
              type="email"
              className="w-full px-7 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Parolingiz</label>
            <input
              required
              type="password"
              className="w-full px-7 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-indigo-600 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all disabled:opacity-50 uppercase text-xs tracking-widest mt-4"
          >
            {loading ? 'Kirish...' : 'Tizimga kirish'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;