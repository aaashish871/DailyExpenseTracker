
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  History,
  TrendingUp,
  BrainCircuit,
  CreditCard as CreditCardIcon,
  Banknote,
  Receipt,
  IndianRupee,
  AlertCircle,
  TrendingDown,
  Trash2,
  CheckCircle2,
  Code2,
  LogOut,
  Loader2
} from 'lucide-react';
import { AppState, Account, Transaction, Debt, EMI, AccountType, TransactionType, DebtType, User } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import Wallets from './components/Wallets.tsx';
import Transactions from './components/Transactions.tsx';
import Debts from './components/Debts.tsx';
import Sidebar from './components/Sidebar.tsx';
import FinancialInsights from './components/FinancialInsights.tsx';
import PromptView from './components/PromptView.tsx';
import CreditCards from './components/CreditCards.tsx';
import Login from './components/Login.tsx';
import { supabase } from './services/supabaseClient.ts';

const INITIAL_STATE: AppState = {
  accounts: [],
  transactions: [],
  debts: [],
  emis: []
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('expense_tracker_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse session", e);
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'cards' | 'transactions' | 'debts' | 'insights' | 'prompt'>('dashboard');
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const { data: accounts } = await supabase.from('ExpenseTracker_accounts').select('*').eq('user_id', currentUser.id);
      const { data: transactions } = await supabase.from('ExpenseTracker_transactions').select('*').eq('user_id', currentUser.id).order('date', { ascending: false });
      const { data: debts } = await supabase.from('ExpenseTracker_debts').select('*').eq('user_id', currentUser.id);
      const { data: emis } = await supabase.from('ExpenseTracker_emis').select('*').eq('user_id', currentUser.id);

      setState({
        accounts: accounts || [],
        transactions: transactions || [],
        debts: debts || [],
        emis: emis || []
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAccount = async (acc: Omit<Account, 'id'>) => {
    if (!currentUser) return;
    const { data, error } = await supabase.from('ExpenseTracker_accounts').insert([{ ...acc, user_id: currentUser.id }]).select();
    if (!error) setState(prev => ({ ...prev, accounts: [...prev.accounts, data[0]] }));
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    const { error } = await supabase.from('ExpenseTracker_accounts').update(updates).eq('id', id);
    if (!error) setState(prev => ({ ...prev, accounts: prev.accounts.map(acc => acc.id === id ? { ...acc, ...updates } : acc) }));
  };

  const deleteAccount = async (id: string) => {
    await supabase.from('ExpenseTracker_accounts').delete().eq('id', id);
    setState(prev => ({ ...prev, accounts: prev.accounts.filter(acc => acc.id !== id) }));
  };

  const addEMI = async (emi: Omit<EMI, 'id'>) => {
    if (!currentUser) return;
    const { data, error } = await supabase.from('ExpenseTracker_emis').insert([{ ...emi, user_id: currentUser.id }]).select();
    if (!error) setState(prev => ({ ...prev, emis: [...prev.emis, data[0]] }));
  };

  const updateEMI = async (id: string, updates: Partial<EMI>) => {
    const { error } = await supabase.from('ExpenseTracker_emis').update(updates).eq('id', id);
    if (!error) setState(prev => ({ ...prev, emis: prev.emis.map(e => e.id === id ? { ...e, ...updates } : e) }));
  };

  const deleteEMI = async (id: string) => {
    await supabase.from('ExpenseTracker_emis').delete().eq('id', id);
    setState(prev => ({ ...prev, emis: prev.emis.filter(e => e.id !== id) }));
  };

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (!currentUser) return;
    const { data, error } = await supabase.from('ExpenseTracker_transactions').insert([{ ...tx, user_id: currentUser.id }]).select();
    if (error) return;
    
    setState(prev => {
      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.id === tx.accountId) {
          let newBalance = acc.balance;
          if (tx.type === TransactionType.INCOME) {
            newBalance = acc.isLiability ? Math.max(0, acc.balance - tx.amount) : acc.balance + tx.amount;
          } else {
            newBalance = acc.isLiability ? acc.balance + tx.amount : acc.balance - tx.amount;
          }
          supabase.from('ExpenseTracker_accounts').update({ balance: newBalance }).eq('id', acc.id);
          return { ...acc, balance: newBalance };
        }
        return acc;
      });
      return { ...prev, accounts: updatedAccounts, transactions: [data[0], ...prev.transactions] };
    });
  };

  const totalBarnaHai = useMemo(() => {
    const cardBalances = state.accounts.filter(a => a.isLiability).reduce((sum, a) => sum + a.balance, 0);
    const emiOutstanding = state.emis.reduce((sum, emi) => sum + (emi.monthlyAmount * (emi.tenure - emi.paidMonths)), 0);
    return cardBalances + emiOutstanding;
  }, [state.accounts, state.emis]);

  const totalLenaHai = useMemo(() => state.debts.filter(d => d.type === DebtType.TO_COLLECT).reduce((sum, d) => sum + d.amount, 0), [state.debts]);
  const totalMerePass = useMemo(() => state.accounts.filter(a => !a.isLiability).reduce((sum, a) => sum + a.balance, 0), [state.accounts]);
  const totalIncome = useMemo(() => state.transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0), [state.transactions]);
  const overallStatus = (totalMerePass + totalLenaHai) - totalBarnaHai;

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} onLogout={() => setCurrentUser(null)} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest bg-slate-100 px-2 py-0.5 rounded">Idea developed by Ashish Ahuja</span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">Kharch Tracker</h1>
          </div>
          <div className="bg-white px-8 py-5 rounded-[28px] shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[200px]">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overall Net Status</span>
             <div className="text-3xl font-black text-slate-900 tracking-tighter">₹{overallStatus.toLocaleString()}</div>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatMiniCard title="Mere Pass" value={totalMerePass} icon={<Wallet size={16} />} color="text-blue-600" />
          <StatMiniCard title="Lena Hai" value={totalLenaHai} icon={<ArrowUpRight size={16} />} color="text-emerald-600" />
          <StatMiniCard title="Barna Hai" value={totalBarnaHai} icon={<ArrowDownLeft size={16} />} color="text-rose-600" />
          <StatMiniCard title="Income" value={totalIncome} icon={<TrendingUp size={16} />} color="text-indigo-600" />
        </div>

        <div className="space-y-8 pb-20">
          {activeTab === 'dashboard' && <Dashboard state={state} addTransaction={addTransaction} setActiveTab={setActiveTab} totals={{ barna: totalBarnaHai, lena: totalLenaHai, pass: totalMerePass, income: totalIncome }} />}
          {activeTab === 'accounts' && <Wallets accounts={state.accounts} addAccount={addAccount} updateAccount={updateAccount} deleteAccount={deleteAccount} />}
          {activeTab === 'cards' && <CreditCards accounts={state.accounts} emis={state.emis} addAccount={addAccount} updateAccount={updateAccount} deleteAccount={deleteAccount} addEMI={addEMI} updateEMI={updateEMI} deleteEMI={deleteEMI} />}
          {activeTab === 'transactions' && <Transactions transactions={state.transactions} accounts={state.accounts} addTransaction={addTransaction} />}
          {activeTab === 'debts' && <Debts debts={state.debts} addDebt={(d) => {}} settleDebt={(id) => {}} />}
        </div>
      </main>
    </div>
  );
};

const StatMiniCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
    <div className="flex items-center gap-2 mb-2">
      <div className={`p-1.5 rounded-lg bg-slate-50 ${color}`}>{icon}</div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
    </div>
    <div className={`text-lg font-black text-slate-900 tracking-tight truncate`}>₹{value.toLocaleString()}</div>
  </div>
);

export default App;
