
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
import { AppState, Account, Transaction, Debt, AccountType, TransactionType, DebtType, User } from './types';
import Dashboard from './components/Dashboard';
import Wallets from './components/Wallets';
import Transactions from './components/Transactions';
import Debts from './components/Debts';
import Sidebar from './components/Sidebar';
import FinancialInsights from './components/FinancialInsights';
import PromptView from './components/PromptView';
import Login from './components/Login';
import { supabase } from './services/supabaseClient';

const INITIAL_STATE: AppState = {
  accounts: [],
  transactions: [],
  debts: []
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('expense_tracker_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'transactions' | 'debts' | 'insights' | 'prompt'>('dashboard');
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data from Supabase on login or mount
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const { data: accounts, error: accError } = await supabase
        .from('ExpenseTracker_accounts')
        .select('*')
        .eq('user_id', currentUser.id);

      const { data: transactions, error: txError } = await supabase
        .from('ExpenseTracker_transactions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('date', { ascending: false });

      const { data: debts, error: dError } = await supabase
        .from('ExpenseTracker_debts')
        .select('*')
        .eq('user_id', currentUser.id);

      if (accError || txError || dError) {
        console.error("Supabase load error:", { accError, txError, dError });
      }

      setState({
        accounts: accounts || [],
        transactions: transactions || [],
        debts: debts || []
      });
    } catch (error) {
      console.error("Error loading from Supabase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setState(INITIAL_STATE);
  };

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('ExpenseTracker_transactions')
        .insert([{ ...tx, user_id: currentUser.id }])
        .select();

      if (error) throw error;
      const newTx = data[0];

      // Update local state and account balances
      setState(prev => {
        const updatedAccounts = prev.accounts.map(acc => {
          if (acc.id === tx.accountId) {
            let newBalance = acc.balance;
            if (tx.type === TransactionType.INCOME) {
              newBalance = acc.isLiability ? Math.max(0, acc.balance - tx.amount) : acc.balance + tx.amount;
            } else {
              newBalance = acc.isLiability ? acc.balance + tx.amount : acc.balance - tx.amount;
            }
            updateAccountBalanceInDb(acc.id, newBalance);
            return { ...acc, balance: newBalance };
          }
          return acc;
        });

        return { ...prev, accounts: updatedAccounts, transactions: [newTx, ...prev.transactions] };
      });

      // Special handling for Refundable categories
      if (tx.type === TransactionType.EXPENSE && (tx.category === 'Home (Refundable)' || tx.category === 'Work (Refundable)')) {
        const newDebt = {
          person: tx.category.includes('Home') ? 'Home Refund' : 'Work Refund',
          amount: tx.amount,
          type: DebtType.TO_COLLECT,
          description: tx.description
        };
        addDebt(newDebt);
      }
    } catch (err) {
      console.error("Failed to add transaction:", err);
      alert("Error saving transaction to Live Server.");
    }
  };

  const updateAccountBalanceInDb = async (id: string, balance: number) => {
    await supabase
      .from('ExpenseTracker_accounts')
      .update({ balance })
      .eq('id', id);
  };

  const addAccount = async (acc: Omit<Account, 'id'>) => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from('ExpenseTracker_accounts')
        .insert([{ ...acc, user_id: currentUser.id }])
        .select();

      if (error) throw error;
      setState(prev => ({ ...prev, accounts: [...prev.accounts, data[0]] }));
    } catch (err) {
      console.error("Supabase account error:", err);
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const { error } = await supabase
        .from('ExpenseTracker_accounts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setState(prev => ({
        ...prev,
        accounts: prev.accounts.map(acc => acc.id === id ? { ...acc, ...updates } : acc)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ExpenseTracker_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setState(prev => ({ ...prev, accounts: prev.accounts.filter(acc => acc.id !== id) }));
    } catch (err) {
      console.error(err);
    }
  };

  const settleDebt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ExpenseTracker_debts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setState(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
    } catch (err) {
      console.error(err);
    }
  };

  const addDebt = async (debt: Omit<Debt, 'id'>) => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from('ExpenseTracker_debts')
        .insert([{ ...debt, user_id: currentUser.id }])
        .select();

      if (error) throw error;
      setState(prev => ({ ...prev, debts: [...prev.debts, data[0]] }));
    } catch (err) {
      console.error(err);
    }
  };

  const resetAllData = async () => {
    if (!currentUser) return;
    try {
      await supabase.from('ExpenseTracker_transactions').delete().eq('user_id', currentUser.id);
      await supabase.from('ExpenseTracker_debts').delete().eq('user_id', currentUser.id);
      await supabase.from('ExpenseTracker_accounts').delete().eq('user_id', currentUser.id);
      setState(INITIAL_STATE);
      setActiveTab('dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const totalBarnaHai = useMemo(() => state.accounts.filter(a => a.isLiability).reduce((sum, a) => sum + a.balance, 0), [state.accounts]);
  const totalLenaHai = useMemo(() => state.debts.filter(d => d.type === DebtType.TO_COLLECT).reduce((sum, d) => sum + d.amount, 0), [state.debts]);
  const totalMerePass = useMemo(() => state.accounts.filter(a => !a.isLiability).reduce((sum, a) => sum + a.balance, 0), [state.accounts]);
  const totalIncome = useMemo(() => state.transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0), [state.transactions]);
  const overallStatus = (totalMerePass + totalLenaHai) - totalBarnaHai;

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onReset={resetAllData} 
        user={currentUser} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest bg-slate-100 px-2 py-0.5 rounded">Idea developed by Ashish Ahuja</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                Kharch Tracker
                {isLoading && <Loader2 className="animate-spin text-indigo-600" size={24} />}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Supabase Live Cloud v3.0</span>
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-600 hover:border-rose-100 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
              
              <div className="bg-white px-8 py-5 rounded-[28px] shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[200px] ring-1 ring-slate-50">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Overall Net Status</span>
                 <div className={`text-sm font-black px-2 py-0.5 rounded-md mb-1 ${overallStatus >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                   {overallStatus >= 0 ? 'STATUS: OK' : 'STATUS: NEGATIVE'}
                 </div>
                 <div className="text-3xl font-black text-slate-900 tracking-tighter">₹{overallStatus.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatMiniCard title="Mere Pass Hai" value={totalMerePass} icon={<Wallet size={16} />} color="text-blue-600" />
          <StatMiniCard title="Lena Hai" value={totalLenaHai} icon={<ArrowUpRight size={16} />} color="text-emerald-600" />
          <StatMiniCard title="Barna Hai" value={totalBarnaHai} icon={<ArrowDownLeft size={16} />} color="text-rose-600" />
          <StatMiniCard title="Cashback/Income" value={totalIncome} icon={<TrendingUp size={16} />} color="text-indigo-600" />
        </div>

        <div className="space-y-8 pb-20">
          {activeTab === 'dashboard' && <Dashboard state={state} addTransaction={addTransaction} setActiveTab={setActiveTab} totals={{ barna: totalBarnaHai, lena: totalLenaHai, pass: totalMerePass, income: totalIncome }} />}
          {activeTab === 'accounts' && <Wallets accounts={state.accounts} addAccount={addAccount} updateAccount={updateAccount} deleteAccount={deleteAccount} onReset={resetAllData} />}
          {activeTab === 'transactions' && <Transactions transactions={state.transactions} accounts={state.accounts} addTransaction={addTransaction} />}
          {activeTab === 'debts' && <Debts debts={state.debts} addDebt={addDebt} settleDebt={settleDebt} />}
          {activeTab === 'insights' && <FinancialInsights state={state} />}
          {activeTab === 'prompt' && currentUser.role === 'admin' && <PromptView />}
        </div>
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around p-3 md:hidden z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 rounded-xl ${activeTab === 'dashboard' ? 'text-rose-600 bg-rose-50' : 'text-slate-400'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[9px] mt-1 font-black uppercase tracking-tighter">Status</span>
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center p-2 rounded-xl ${activeTab === 'transactions' ? 'text-rose-600 bg-rose-50' : 'text-slate-400'}`}>
          <History size={20} />
          <span className="text-[9px] mt-1 font-black uppercase tracking-tighter">Logs</span>
        </button>
        <button onClick={() => setActiveTab('accounts')} className={`flex flex-col items-center p-2 rounded-xl ${activeTab === 'accounts' ? 'text-rose-600 bg-rose-50' : 'text-slate-400'}`}>
          <Wallet size={20} />
          <span className="text-[9px] mt-1 font-black uppercase tracking-tighter">Setup</span>
        </button>
        {currentUser.role === 'admin' && (
          <button onClick={() => setActiveTab('prompt')} className={`flex flex-col items-center p-2 rounded-xl ${activeTab === 'prompt' ? 'text-rose-600 bg-rose-50' : 'text-slate-400'}`}>
            <Code2 size={20} />
            <span className="text-[9px] mt-1 font-black uppercase tracking-tighter">Source</span>
          </button>
        )}
      </nav>
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
