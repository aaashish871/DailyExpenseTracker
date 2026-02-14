
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  History, 
  Users, 
  BrainCircuit,
  CreditCard,
  Trash2,
  AlertTriangle,
  X,
  Code2,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  CalendarDays
} from 'lucide-react';
import { User } from '../types.ts';

interface SidebarProps {
  activeTab: 'dashboard' | 'accounts' | 'cards' | 'transactions' | 'debts' | 'insights' | 'prompt' | 'emis';
  setActiveTab: (tab: any) => void;
  onReset?: () => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onReset, user, onLogout }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [captcha, setCaptcha] = useState({ q: '', a: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [isValid, setIsValid] = useState(false);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 20) + 1;
    const n2 = Math.floor(Math.random() * 20) + 1;
    setCaptcha({ q: `${n1} + ${n2}`, a: n1 + n2 });
    setUserAnswer('');
    setIsValid(false);
  };

  useEffect(() => {
    if (showConfirm) generateCaptcha();
  }, [showConfirm]);

  useEffect(() => {
    setIsValid(parseInt(userAnswer) === captcha.a);
  }, [userAnswer, captcha]);

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'emis', label: 'EMI Planner', icon: CalendarDays },
    { id: 'cards', label: 'My Cards', icon: CreditCard },
    { id: 'transactions', label: 'Kharch Logs', icon: History },
    { id: 'debts', label: 'Lena / Dena', icon: Users },
    { id: 'accounts', label: 'App Setup', icon: Wallet },
    { id: 'insights', label: 'AI Insights', icon: BrainCircuit },
    { id: 'prompt', label: 'App Prompt', icon: Code2, adminOnly: true },
  ].filter(item => !item.adminOnly || user.role === 'admin');

  const handleResetClick = () => {
    if (onReset && isValid) {
      onReset();
      setShowConfirm(false);
    }
  };

  return (
    <>
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 text-slate-300 min-h-screen p-8 sticky top-0">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="bg-rose-600 p-2.5 rounded-2xl shadow-lg shadow-rose-900/50">
            <CreditCard className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter italic">ExpenseTracker</span>
        </div>

        <nav className="space-y-3 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-rose-600 text-white shadow-xl shadow-rose-900/20' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-rose-500 transition-colors'} />
                <span className="font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="bg-slate-800/50 rounded-3xl p-5 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-600">
                <UserIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user.role}</p>
              </div>
              <button onClick={onLogout} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
            
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl transition-all duration-300 bg-rose-900/10 text-rose-500 hover:bg-rose-900/30 border border-rose-900/20"
            >
              <Trash2 size={16} />
              <span className="font-black uppercase text-[10px] tracking-widest">Master Reset</span>
            </button>
          </div>
        </div>
      </aside>

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[1000] flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 text-center animate-in zoom-in duration-300 shadow-2xl border border-slate-100">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-rose-50">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Full Reset?</h2>
            <p className="text-slate-500 font-bold leading-relaxed mb-8 text-sm px-4">
              This will wipe everything. Please solve the CAPTCHA to verify.
            </p>
            <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 mb-8">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Solve CAPTCHA</label>
               <div className="flex items-center justify-center gap-4">
                 <span className="text-xl font-black text-slate-900 tracking-tighter">{captcha.q} = ?</span>
                 <input type="number" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} className="w-24 text-center bg-white border border-slate-200 py-3 rounded-xl text-xl font-black text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none" />
               </div>
            </div>
            <div className="space-y-4">
              <button onClick={handleResetClick} disabled={!isValid} className={`w-full py-5 rounded-3xl font-black text-lg uppercase tracking-widest transition-all ${isValid ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-xl' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>Yes, Clear Everything</button>
              <button onClick={() => setShowConfirm(false)} className="w-full bg-slate-50 text-slate-500 py-5 rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
