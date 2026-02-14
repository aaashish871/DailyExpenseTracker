
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
  Edit3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Account, EMI } from '../types.ts';

interface EMIPlannerProps {
  accounts: Account[];
  emis: EMI[];
  addEMI: (emi: Omit<EMI, 'id'>) => void;
  updateEMI: (id: string, updates: Partial<EMI>) => void;
  deleteEMI: (id: string) => void;
}

const EMIPlanner: React.FC<EMIPlannerProps> = ({ accounts, emis, addEMI, updateEMI, deleteEMI }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<{emiId: string, index: number} | null>(null);
  const [editAmount, setEditAmount] = useState('');
  
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
    const paidSum = (emi.paidAmounts || []).filter(a => a > 0).length;
    return paidSum < emi.tenure;
  });

  const totalMonthly = activeEmis.reduce((sum, e) => sum + e.monthlyAmount, 0);
  
  const totalOutstanding = activeEmis.reduce((sum, e) => {
    const paidSum = (e.paidAmounts || []).reduce((s, a) => s + a, 0);
    return sum + (e.totalAmount - paidSum);
  }, 0);

  const creditCardAccounts = accounts.filter(acc => acc.isLiability);

  const getAccountName = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    return acc ? acc.name : 'Unknown Card';
  };

  const handleInstallmentUpdate = () => {
    if (!editingInstallment) return;
    const { emiId, index } = editingInstallment;
    const emi = emis.find(e => e.id === emiId);
    if (!emi) return;

    const newPaidAmounts = [...(emi.paidAmounts || Array(emi.tenure).fill(0))];
    newPaidAmounts[index] = parseFloat(editAmount || '0');
    
    const paidMonthsCount = newPaidAmounts.filter(a => a > 0).length;
    
    updateEMI(emiId, { 
      paidAmounts: newPaidAmounts,
      paidMonths: paidMonthsCount
    });
    
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
    
    // Pre-fill already paid months with the estimated monthly amount
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
                {/* Excel Style Header */}
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
                   {/* Left Column: Summary (Matches Excel Rows) */}
                   <div className="lg:col-span-4 border-r border-slate-100 bg-slate-50/50">
                      <div className="divide-y divide-slate-100">
                         <div className="grid grid-cols-2 px-8 py-5">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount Received</span>
                            <span className="text-right font-black text-slate-900">₹{emi.totalAmount.toLocaleString()}</span>
                         </div>
                         <div className="grid grid-cols-2 px-8 py-5">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Processing Fee</span>
                            <span className="text-right font-black text-slate-900">₹{emi.processingFee.toLocaleString()}</span>
                         </div>
                         <div className="px-8 py-10 bg-indigo-50/50">
                            <div className="flex justify-between items-end mb-4">
                               <div className="space-y-1">
                                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Remaining Principal</span>
                                  <div className="text-3xl font-black text-indigo-900 tracking-tighter">₹{remainingPrincipal.toLocaleString()}</div>
                               </div>
                               <div className="text-right">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                                  <div className="text-lg font-black text-slate-900">{emi.paidMonths} / {emi.tenure}</div>
                               </div>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                               <div 
                                  className="bg-indigo-600 h-full transition-all duration-700" 
                                  style={{ width: `${(emi.paidMonths / emi.tenure) * 100}%` }}
                               />
                            </div>
                         </div>
                         <div className="grid grid-cols-2 px-8 py-6 bg-yellow-400/20 border-t-2 border-yellow-400">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-widest italic underline">Total Outflow</span>
                            <span className="text-right text-xl font-black text-slate-900">₹{currentTotalPaid.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>

                   {/* Right Column: Monthly Grid (The actual logging area) */}
                   <div className="lg:col-span-8 p-8">
                      <div className="flex items-center gap-2 mb-6">
                         <CalendarDays size={18} className="text-slate-400" />
                         <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Installment Log (Click to Edit)</h5>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {paidAmounts.map((amt, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => { setEditingInstallment({emiId: emi.id, index: idx}); setEditAmount(amt > 0 ? amt.toString() : ''); }}
                            className={`flex flex-col p-4 rounded-2xl border transition-all text-left group ${
                              amt > 0 
                              ? 'bg-emerald-50 border-emerald-100 hover:border-emerald-300' 
                              : 'bg-white border-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${amt > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                              EMI {idx + 1}
                            </span>
                            <div className="flex items-center justify-between">
                               <span className={`text-sm font-black ${amt > 0 ? 'text-emerald-900' : 'text-slate-300'}`}>
                                 {amt > 0 ? `₹${amt.toLocaleString()}` : '---'}
                               </span>
                               <Edit3 size={12} className="text-slate-200 group-hover:text-slate-400" />
                            </div>
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

      {/* Manual Installment Amount Modal */}
      {editingInstallment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl animate-in zoom-in duration-200">
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-black text-slate-900 tracking-tight">Log EMI {editingInstallment.index + 1}</h4>
                <button onClick={() => setEditingInstallment(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
             </div>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter Exact Amount Paid</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                      <input 
                        type="number" 
                        autoFocus
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-full pl-10 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-2xl font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        placeholder="0.00"
                      />
                   </div>
                </div>
                <div className="flex flex-col gap-3">
                   <button 
                     onClick={handleInstallmentUpdate}
                     className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                   >
                     Update Monthly Log
                   </button>
                   <button 
                     onClick={() => { setEditAmount('0'); handleInstallmentUpdate(); }}
                     className="w-full text-slate-400 py-3 font-bold text-xs uppercase tracking-widest hover:text-rose-500"
                   >
                     Clear Entry
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Manual Setup Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl p-8 md:p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-2xl font-black text-slate-900">Setup New Installment</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spreadsheet Sync</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card / Bank Source</label>
                  <select 
                    value={emiForm.accountId} 
                    onChange={(e) => setEmiForm({...emiForm, accountId: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-600 focus:outline-none appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select Account</option>
                    {creditCardAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} {acc.lastFourDigits ? `(${acc.lastFourDigits})` : ''}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item (e.g. iPhone, TV)</label>
                  <input type="text" value={emiForm.itemName} onChange={(e) => setEmiForm({...emiForm, itemName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Received Amount</label>
                  <input type="number" value={emiForm.total} onChange={(e) => setEmiForm({...emiForm, total: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Est. Monthly EMI</label>
                  <input type="number" value={emiForm.monthly} onChange={(e) => setEmiForm({...emiForm, monthly: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Processing Fee</label>
                  <input type="number" value={emiForm.fee} onChange={(e) => setEmiForm({...emiForm, fee: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tenure (Months)</label>
                  <input type="number" value={emiForm.tenure} onChange={(e) => setEmiForm({...emiForm, tenure: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required />
                </div>
              </div>
              
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:scale-[0.98] mt-4">
                Initialize EMI Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Helpful Info */}
      <div className="bg-amber-50 border border-amber-100 p-8 rounded-[32px] flex items-start gap-4">
        <AlertCircle className="text-amber-600 mt-1 shrink-0" />
        <div>
          <h4 className="font-black text-amber-900 uppercase text-xs tracking-widest mb-2">Manual Tracker Instructions</h4>
          <p className="text-amber-800/70 text-sm leading-relaxed font-medium">
            Yeh section aapke Excel logic ko follow karta hai. 
            Jab aap bank se payment karein, bas us EMI number (e.g. EMI 1) par click karke actual paid amount enter kar dein. 
            "Total Outflow" mein automatically Processing Fee aur installments add ho jayenge.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EMIPlanner;
