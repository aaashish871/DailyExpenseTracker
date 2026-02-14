
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Plus, IndianRupee, Tag, FileText, Wallet, Calendar, Settings, ChevronRight, TrendingUp, History, Receipt, ArrowUpRight, ArrowDownLeft, ShieldCheck, Download, AlertCircle, Sparkles
} from 'lucide-react';
import { AppState, TransactionType, Account, Transaction, AccountType, DebtType } from '../types';

interface DashboardProps {
  state: AppState;
  addTransaction: (tx: any) => void;
  setActiveTab: (tab: any) => void;
  totals: { barna: number; lena: number; pass: number; income: number };
}

const Dashboard: React.FC<DashboardProps> = ({ state, addTransaction, setActiveTab, totals }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickCategory, setQuickCategory] = useState<any>('Personal');
  const [quickAccount, setQuickAccount] = useState('');
  const [quickDate, setQuickDate] = useState(todayStr);
  const [isIncome, setIsIncome] = useState(false);
  const [existingStatus, setExistingStatus] = useState('');

  // Fix: Ensure default account is set if currently empty (happens after reset)
  useEffect(() => {
    if (!quickAccount && state.accounts.length > 0) {
      setQuickAccount(state.accounts[0].id);
    }
  }, [state.accounts, quickAccount]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAmount || !quickDesc || !quickAccount) return;
    addTransaction({
      amount: parseFloat(quickAmount),
      description: quickDesc,
      category: quickCategory,
      accountId: quickAccount,
      type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
      date: quickDate
    });
    setQuickAmount('');
    setQuickDesc('');
  };

  const currentStatusTotal = (totals.pass + totals.lena) - totals.barna;
  const difference = existingStatus ? parseFloat(existingStatus) - currentStatusTotal : 0;

  return (
    <div className="space-y-8">
      {/* 1. Aaj ka Kharcha (Primary Entry) */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 ring-1 ring-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl text-white shadow-xl transition-colors duration-500 ${isIncome ? 'bg-emerald-600 shadow-emerald-100' : 'bg-rose-600 shadow-rose-100'}`}>
              {isIncome ? <Download size={28} strokeWidth={3} /> : <Plus size={28} strokeWidth={3} />}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {isIncome ? 'Paisa Aaya' : 'Aaj ka Kharcha'}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entry Karo, Balance Auto Update Hoga</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
            <button onClick={() => { setIsIncome(false); setQuickCategory('Personal'); }} className={`flex-1 md:w-32 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${!isIncome ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>Gaya (Out)</button>
            <button onClick={() => { setIsIncome(true); setQuickCategory('Income'); }} className={`flex-1 md:w-32 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isIncome ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Aaya (In)</button>
          </div>
        </div>
        
        {state.accounts.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-rose-200 rounded-[32px] bg-rose-50">
             <AlertCircle size={40} className="mx-auto text-rose-500 mb-4" />
             <p className="text-rose-900 font-black uppercase tracking-widest text-sm mb-4">Reset Successful. Sab zero zero hai.</p>
             <button onClick={() => setActiveTab('accounts')} className="bg-rose-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200">Go to Setup (Initial Data)</button>
          </div>
        ) : (
          <form onSubmit={handleQuickAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Date</label><input type="date" value={quickDate} onChange={(e) => setQuickDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm" required /></div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Amount</label>
              <div className="relative"><IndianRupee size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-black ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`} /><input type="number" placeholder="0.00" value={quickAmount} onChange={(e) => setQuickAmount(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black text-lg" required /></div>
            </div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Description</label><input type="text" placeholder={isIncome ? "e.g. Cashback" : "e.g. Lunch"} value={quickDesc} onChange={(e) => setQuickDesc(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm" required /></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Kahan {isIncome ? 'Aaya?' : 'Gaya?'}</label><select value={quickAccount} onChange={(e) => setQuickAccount(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm appearance-none cursor-pointer">
              {state.accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} {acc.lastFourDigits ? `(${acc.lastFourDigits})` : ''}</option>)}
            </select></div>
            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Type</label><select value={quickCategory} onChange={(e) => setQuickCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm">
              {!isIncome ? (<><option value="Personal">Personal</option><option value="Home (Refundable)">Home (Refundable)</option><option value="Work (Refundable)">Work (Refundable)</option><option value="Faltu">Faltu</option></>) : (<><option value="Income">Cashback/Income</option><option value="Others">Others</option></>)}
            </select></div>
            <div className="lg:col-span-5"><button type="submit" className={`w-full text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${isIncome ? 'bg-emerald-600 shadow-emerald-50' : 'bg-slate-900 shadow-slate-100'}`}>{isIncome ? 'Log Income' : 'Log Expense'}</button></div>
          </form>
        )}
      </div>

      {/* 2. Three Pillars (Mobile Sheet Mirror) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 border-t-4 border-rose-500">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ArrowDownLeft size={14} className="text-rose-500" /> Yeh Barna Hai</h4>
            <span className="text-lg font-black text-rose-600">₹{totals.barna.toLocaleString()}</span>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
            {state.accounts.filter(a => a.isLiability).map(acc => (
              <div key={acc.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-700 truncate">{acc.name} {acc.lastFourDigits ? `(${acc.lastFourDigits})` : ''}</span>
                <span className="text-xs font-black text-slate-900">₹{acc.balance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 border-t-4 border-emerald-500">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ArrowUpRight size={14} className="text-emerald-500" /> Yeh Lena Hai</h4>
            <span className="text-lg font-black text-emerald-600">₹{totals.lena.toLocaleString()}</span>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
            {state.debts.filter(d => d.type === DebtType.TO_COLLECT).map(debt => (
              <div key={debt.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-700 truncate">{debt.person}</span>
                <span className="text-xs font-black text-slate-900">₹{debt.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 border-t-4 border-blue-500">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Wallet size={14} className="text-blue-500" /> Mere Pass Hai</h4>
            <span className="text-lg font-black text-blue-600">₹{totals.pass.toLocaleString()}</span>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
            {state.accounts.filter(a => !a.isLiability).map(acc => (
              <div key={acc.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-700 truncate">{acc.name}</span>
                <span className="text-xs font-black text-slate-900">₹{acc.balance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Reconciliation (Excel Screenshot logic) */}
      <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden text-white">
        <Sparkles className="absolute top-4 right-4 text-rose-500/20" size={100} />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
           <div className="space-y-2">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">App Status</h4>
             <div className="text-4xl font-black tracking-tighter">₹{currentStatusTotal.toLocaleString()}</div>
           </div>
           <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
             <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Bank Status (Real)</h4>
             <div className="relative">
                <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500" />
                <input 
                  type="number" 
                  placeholder="Enter Bank Total" 
                  value={existingStatus}
                  onChange={(e) => setExistingStatus(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-white/10 rounded-2xl border-0 focus:ring-2 focus:ring-rose-500 text-lg font-black text-white" 
                />
             </div>
           </div>
           <div className="flex flex-col items-center md:items-end space-y-2">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Difference</h4>
             <div className={`text-4xl font-black tracking-tighter ${difference === 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {difference === 0 ? 'OK' : `₹${difference.toLocaleString()}`}
             </div>
             <p className="text-[10px] font-bold text-slate-500">Matches Excel Reconciliation</p>
           </div>
        </div>
      </div>

      {/* 4. Recent Logs */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
            <History size={16} className="text-indigo-600" />
            Kharch Tracker Sheets
          </h3>
          <button onClick={() => setActiveTab('transactions')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg">All Logs</button>
        </div>
        <div className="space-y-1">
          {state.transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="grid grid-cols-4 items-center p-3 hover:bg-slate-50 rounded-xl border-b border-slate-50 last:border-0 group">
               <span className="text-[9px] font-bold text-slate-400">{tx.date}</span>
               <span className="text-xs font-bold text-slate-800 truncate pr-2">{tx.description}</span>
               <span className={`text-xs font-black ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>{tx.type === TransactionType.INCOME ? '+' : '-'}₹{tx.amount.toLocaleString()}</span>
               <span className="text-[9px] font-black text-slate-400 uppercase text-right">{state.accounts.find(a => a.id === tx.accountId)?.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
