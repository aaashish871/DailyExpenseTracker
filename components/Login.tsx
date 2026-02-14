
import React, { useState } from 'react';
import { CreditCard, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Sparkles, Eye, EyeOff, Info } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-defined Admin
    const ADMIN_EMAIL = 'admin@tracker.com';
    const ADMIN_PASS = 'admin77';

    const users = JSON.parse(localStorage.getItem('expense_tracker_users') || '[]');

    if (isLogin) {
      // Check for Admin first
      if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        onLogin({ id: 'admin-001', email: ADMIN_EMAIL, name: 'Ashish (Admin)', role: 'admin' });
        return;
      }

      // Check for local users
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      if (foundUser) {
        onLogin({ id: foundUser.id, email: foundUser.email, name: foundUser.name, role: 'user' });
      } else {
        setError('Invalid credentials.');
      }
    } else {
      // Registration
      if (users.some((u: any) => u.email === email)) {
        setError('User already exists.');
        return;
      }
      const newUser = { id: Date.now().toString(), email, password, name, role: 'user' };
      localStorage.setItem('expense_tracker_users', JSON.stringify([...users, newUser]));
      onLogin({ id: newUser.id, email: newUser.email, name: newUser.name, role: 'user' as const });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-200 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-200 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[48px] shadow-2xl overflow-hidden relative z-10 border border-white/20">
        {/* Left Side: Branding */}
        <div className="bg-slate-900 p-12 flex flex-col justify-between text-white relative">
          <Sparkles className="absolute top-12 right-12 text-rose-500/20" size={120} />
          
          <div>
            <div className="flex items-center gap-4 mb-12">
              <div className="bg-rose-600 p-3 rounded-2xl shadow-lg shadow-rose-900/50">
                <CreditCard size={32} />
              </div>
              <span className="text-3xl font-black tracking-tighter italic">ExpenseTracker</span>
            </div>
            
            <h1 className="text-5xl font-black leading-tight mb-6">
              Track like a <span className="text-rose-500">Pro</span>, <br />
              Save like an <span className="text-emerald-500">Expert</span>.
            </h1>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest">Secure Sync</p>
                <p className="text-xs text-slate-500">End-to-end encrypted storage</p>
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Idea developed by Ashish Ahuja</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-12 lg:p-20 flex flex-col justify-center">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              {isLogin ? 'Please enter your credentials' : 'Join the elite financial circle'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-900 font-bold"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-900 font-bold"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-900 font-bold"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3 active:scale-[0.98]">
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={20} />
            </button>
          </form>

          {/* Default Credentials Box */}
          {isLogin && (
            <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-3xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="mt-0.5 text-rose-500">
                <Info size={16} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Admin Login</p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-bold text-slate-700">Email: <span className="text-rose-600 select-all">admin@tracker.com</span></p>
                  <p className="text-xs font-bold text-slate-700">Password: <span className="text-rose-600 select-all">admin77</span></p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setShowPassword(false);
              }}
              className="text-slate-400 font-bold hover:text-rose-600 transition-colors text-sm"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
