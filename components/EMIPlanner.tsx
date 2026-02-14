
import React, { useState } from 'react';
import { 
  CalendarDays, 
  Trash2, 
  CheckCircle2, 
  Receipt, 
  ArrowRight,
  Landmark,
  CreditCard,
  AlertCircle,
  Plus,
  X,
  Edit2,
  ChevronDown,
  ChevronUp,
  History,
  IndianRupee
} from 'lucide-react';
import { Account, EMI, TransactionType } from '../types.ts';

interface EMIPlannerProps {
  accounts: Account[];
  emis: EMI[];
  addEMI: (emi: Omit<EMI, 'id'>) => void;
  updateEMI: (id: string, updates: Partial<EMI>) => void;
  deleteEMI: (id: string) => void;
  addTransaction: (tx: any) => void;
}

const EMIPlanner: React.FC<EMIPlannerProps> = ({ accounts, emis, addEMI, updateEMI, deleteEMI, addTransaction }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<{emiId: string, index: number} | null>(null);
  const [editingFee, setEditingFee] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [postToLogs, setPostToLogs] = useState(true);
  
  const [emiForm, setEmiForm] = useState({ 
    accountId: '', 
    itemName: '', 
    total: '', 
    monthly: '', 
    fee: '0', 
    tenure: '', 
    paid: '0', 
    start: new Date().toISOString().split('T')[0] 
  });

  const activeEmis = emis.filter(emi => {
    const paidCount = (emi.paidAmounts || []).filter(a => a > 0).length;
    return paidCount < emi.tenure;
  });

  const totalMonthly = activeEmis.reduce((sum, e) => sum + e.monthlyAmount, 0);
  
  const totalOutstanding = activeEmis.reduce((sum, e) => {
    const paidSum = (e.paidAmounts || []).reduce((s, a) => s + a, 0);
    return sum + (e.totalAmount - paidSum);
  }, 0);

  const getAccountName = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    return acc ? acc.name : 'Unknown Card';
  };

  const handleInstallmentUpdate = () => {
    if (!editingInstallment) return;
    const { emiId, index } = editingInstallment;
    const emi = emis.find(e => e.id === emiId);
    if (!emi) return;

    const amount = parseFloat(editAmount || '0');
    const newPaidAmounts = [...(emi.paidAmounts || Array(emi.tenure).fill(0))];
    const prevAmount = newPaidAmounts[index];
    newPaidAmounts[index] = amount;
    
    const paidMonthsCount = newPaidAmounts.filter(a => a > 0).length;
    
    updateEMI(emiId, { 
      paidAmounts: newPaidAmounts,
      paidMonths: paidMonthsCount
    });

    if (postToLogs && amount > 0 && amount !== prevAmount) {
      addTransaction({
        amount: amount,
        description: `EMI ${index + 1}: ${emi.itemName}`,
        category: 'Others',
        accountId: emi.accountId,
        type: TransactionType.EXPENSE,
        date: new Date().toISOString().split('T')[0]
      });
    }
    
    setEditingInstallment(null);
    setEditAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emiForm.accountId || !emiForm.itemName || !emiForm.total || !emiForm.monthly || !emiForm.tenure) {
      alert("Pura form bhariye!");
      return;
    }
    
    const tenureNum = parseInt(emiForm.tenure);
    const initialPaidAmounts = Array(tenureNum).fill(0);
    const paidMonthsNum = parseInt(emiForm.paid || '0');
    
    for(let i=0; i<paidMonthsNum; i++) {
      initialPaidAmounts[i] = parseFloat(emiForm.monthly);
    }
    
    addEMI({
      accountId: emiForm.accountId,
      itemName: emiForm.itemName,
      totalAmount: parseFloat(emiForm.total),
      monthlyAmount: parseFloat(emiForm.monthly),
      processingFee: parseFloat(emiForm.fee || '0'),
      tenure: tenureNum,
      paidMonths: paidMonthsNum,
      startDate: emiForm.start,
      paidAmounts: initialPaidAmounts
    });
    
    setShowModal(false);
    setEmiForm({ 
      accountId: '', 
      itemName: '', 
      total: '', 
      monthly: '', 
      fee: '0', 
      tenure: '', 
      paid: '0', 
      start: new Date().toISOString().split('T')[0] 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">EMI Planner (Excel View)</h2>
          <p className="text-slate-500 font-medium italic">Manage monthly installments like your spreadsheet</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex gap-4">
            <div className="bg-white px-6 py-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Budget</span>
              <span className="text-xl font-black text-indigo-600">₹{totalMonthly.toLocaleString()}</span>
            </div>
            <div className="bg-yellow-400/10 px-6 py-4 rounded-[24px] border border-yellow-200 shadow-sm flex flex-col items-center">
              <span className="text-[9px] font-black text-yellow-700 uppercase tracking-widest mb-1">Net Outstanding</span>
              <span className="text-xl font-black text-yellow-900">₹{totalOutstanding.toLocaleString()}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-rose-600 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            Setup New EMI
          </button>
        </div>
      </div>

      {activeEmis.length === 0 ? (
        <div className="bg-white p-20 rounded-[48px] border border-slate-100 text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">All Clear!</h3>
          <p className="text-slate-400 font-medium">Koi running EMI nahi dikh rahi hai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {activeEmis.map((emi) => {
            const paidAmounts = emi.paidAmounts || Array(emi.tenure).fill(0);
            const currentTotalPaid = emi.processingFee + paidAmounts.reduce((a, b) => a + b, 0);
            const remainingPrincipal = emi.totalAmount - paidAmounts.reduce((a, b) => a + b, 0);

            return (
              <div key={emi.id} className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-slate-100 animate-in slide-in-from-bottom-4">
                <div className="bg-yellow-400 px-8 py-4 border-b border-yellow-500 flex justify-between items-center">
                   <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                      <Landmark size={20} />
                      {getAccountName(emi.accountId)} - {emi.itemName}
                   </h4>
                   <button onClick={() => { if(confirm('Delete this EMI?')) deleteEMI(emi.id); }} className="text-slate-800 hover:text-rose-600 transition-colors">
                     <Trash2 size={20} />
                   </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12">
                   <div className="lg:col-span-4 border-r border-slate-100 bg-slate-50/50">
                      <div className="divide-y divide-slate-100">
                         <div className="grid grid-cols-2 px-8 py-5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal</span>
                            <span className="text-sm font-black text-slate-900 text-right">₹{emi.totalAmount.toLocaleString()}</span>
                         </div>
                         <div className="grid grid-cols-2 px-8 py-5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Paid</span>
                            <span className="text-sm font-black text-emerald-600 text-right">₹{currentTotalPaid.toLocaleString()}</span>
                         </div>
                         <div className="grid grid-cols-2 px-8 py-5 bg-yellow-50">
                            <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">Remaining</span>
                            <span className="text-sm font-black text-yellow-900 text-right">₹{remainingPrincipal.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>

                   <div className="lg:col-span-8 p-8">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {paidAmounts.map((amt, idx) => (
                           <button 
                             key={idx}
                             onClick={() => { setEditingInstallment({emiId: emi.id, index: idx}); setEditAmount(amt.toString()); }}
                             className={`p-3 rounded-xl border text-center transition-all ${amt > 0 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-300'}`}
                           >
                             <div className="text-[8px] font-black uppercase tracking-tighter mb-0.5">Month {idx + 1}</div>
                             <div className="text-[10px] font-bold">₹{amt > 0 ? amt.toLocaleString() : '0'}</div>
                           </button>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-2xl font-black text-slate-900">New EMI Plan</h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card / Account</label>
                  <select 
                    value={emiForm.accountId} 
                    onChange={(e) => setEmiForm({...emiForm, accountId: e.target.value})} 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.filter(a => a.isLiability).map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} {acc.lastFourDigits ? `(${acc.lastFourDigits})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Description</label>
                  <input type="text" value={emiForm.itemName} onChange={(e) => setEmiForm({...emiForm, itemName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="iPhone 15 Pro, Amazon..." required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Principal (₹)</label>
                  <input type="number" value={emiForm.total} onChange={(e) => setEmiForm({...emiForm, total: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly EMI (₹)</label>
                  <input type="number" value={emiForm.monthly} onChange={(e) => setEmiForm({...emiForm, monthly: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tenure (Months)</label>
                  <input type="number" value={emiForm.tenure} onChange={(e) => setEmiForm({...emiForm, tenure: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Already Paid (Months)</label>
                   <input type="number" value={emiForm.paid} onChange={(e) => setEmiForm({...emiForm, paid: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all mt-4">Setup EMI Plan</button>
            </form>
          </div>
        </div>
      )}
      
      {editingInstallment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <h4 className="text-xl font-black text-slate-900 mb-6">Update Month {editingInstallment.index + 1}</h4>
            <div className="space-y-4">
              <input 
                type="number" 
                value={editAmount} 
                onChange={(e) => setEditAmount(e.target.value)} 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl"
                placeholder="0.00"
              />
              <div className="flex items-center gap-2 px-1">
                <input type="checkbox" id="postLogs" checked={postToLogs} onChange={(e) => setPostToLogs(e.target.checked)} className="rounded" />
                <label htmlFor="postLogs" className="text-xs font-bold text-slate-500">Post to Kharch Logs</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditingInstallment(null)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase text-xs tracking-widest">Cancel</button>
                <button onClick={handleInstallmentUpdate} className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase text-xs tracking-widest">Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EMIPlanner;
