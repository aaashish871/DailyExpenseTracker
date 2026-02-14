
import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Sparkles, 
  Info,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { Account, AccountType, EMI } from '../types.ts';

interface CreditCardsProps {
  accounts: Account[];
  emis: EMI[];
  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addEMI: (emi: Omit<EMI, 'id'>) => void;
  updateEMI: (id: string, updates: Partial<EMI>) => void;
  deleteEMI: (id: string) => void;
}

const CreditCards: React.FC<CreditCardsProps> = ({ accounts, emis, addAccount, updateAccount, deleteAccount, addEMI, updateEMI, deleteEMI }) => {
  const [showModal, setShowModal] = useState(false);
  const [showEMIModal, setShowEMIModal] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  
  // Form States
  const [cardForm, setCardForm] = useState({ id: '', name: '', balance: '', lastFour: '' });
  const [emiForm, setEmiForm] = useState({ itemName: '', total: '', monthly: '', fee: '', tenure: '', paid: '0', start: new Date().toISOString().split('T')[0] });

  const cardAccounts = accounts.filter(acc => acc.isLiability);

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: cardForm.name,
      balance: parseFloat(cardForm.balance || '0'),
      lastFourDigits: cardForm.lastFour,
      type: AccountType.CREDIT_CARD,
      isLiability: true
    };
    if (cardForm.id) updateAccount(cardForm.id, data);
    else addAccount(data);
    setShowModal(false);
  };

  const handleEMISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCardId) return;
    addEMI({
      accountId: activeCardId,
      itemName: emiForm.itemName,
      totalAmount: parseFloat(emiForm.total),
      monthlyAmount: parseFloat(emiForm.monthly),
      processingFee: parseFloat(emiForm.fee || '0'),
      tenure: parseInt(emiForm.tenure),
      paidMonths: parseInt(emiForm.paid),
      startDate: emiForm.start
    });
    setShowEMIModal(false);
    setEmiForm({ itemName: '', total: '', monthly: '', fee: '', tenure: '', paid: '0', start: new Date().toISOString().split('T')[0] });
  };

  const markEMIPaid = (emi: EMI) => {
    if (emi.paidMonths < emi.tenure) {
      updateEMI(emi.id, { paidMonths: emi.paidMonths + 1 });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Cards & EMI Tracker</h2>
          <p className="text-slate-500 font-medium italic">Manage bills and installment plans (Yellow highlight = Outstanding)</p>
        </div>
        <button 
          onClick={() => { setCardForm({ id: '', name: '', balance: '', lastFour: '' }); setShowModal(true); }}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-rose-600 transition-all"
        >
          <Plus size={18} />
          Add New Card
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {cardAccounts.map(acc => {
          const cardEmis = emis.filter(e => e.accountId === acc.id);
          const totalEmiOutstanding = cardEmis.reduce((sum, e) => sum + (e.monthlyAmount * (e.tenure - e.paidMonths)), 0);
          
          return (
            <div key={acc.id} className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden ring-1 ring-slate-100">
              <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className="p-5 bg-white/5 rounded-[24px] border border-white/10">
                      <CreditCard size={32} />
                   </div>
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded">Barna Hai</span>
                        {acc.lastFourDigits && <span className="text-xs font-bold text-slate-500">**** {acc.lastFourDigits}</span>}
                     </div>
                     <h4 className="text-3xl font-black tracking-tight">{acc.name}</h4>
                   </div>
                </div>
                
                <div className="flex flex-col md:items-end gap-2">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Liability (Card + EMIs)</div>
                  <div className="text-4xl font-black tracking-tighter text-yellow-400">₹{(acc.balance + totalEmiOutstanding).toLocaleString()}</div>
                  <div className="flex gap-2">
                    <button onClick={() => { setActiveCardId(acc.id); setShowEMIModal(true); }} className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"><Plus size={14} /> New EMI</button>
                    <button onClick={() => { setCardForm({ id: acc.id, name: acc.name, balance: acc.balance.toString(), lastFour: acc.lastFourDigits || '' }); setShowModal(true); }} className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"><Edit2 size={14} /> Edit</button>
                  </div>
                </div>
              </div>

              {/* EMI List Section (Matches User Spreadsheet look) */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Receipt size={18} className="text-slate-400" />
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Active Installment Plans</h5>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cardEmis.map(emi => (
                    <div key={emi.id} className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h6 className="font-black text-slate-900 truncate max-w-[150px]">{emi.itemName}</h6>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Started: {emi.startDate}</p>
                        </div>
                        <button onClick={() => { if(confirm('Remove EMI?')) deleteEMI(emi.id); }} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">Monthly EMI</span>
                          <span className="font-black text-slate-900">₹{emi.monthlyAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">Processing Fee</span>
                          <span className="font-black text-slate-900">₹{emi.processingFee.toLocaleString()}</span>
                        </div>
                        <div className="bg-yellow-100 p-2 rounded-lg flex justify-between items-center text-xs border border-yellow-200">
                          <span className="text-yellow-700 font-black uppercase text-[10px]">Outstanding</span>
                          <span className="font-black text-yellow-900">₹{(emi.monthlyAmount * (emi.tenure - emi.paidMonths)).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>Progress</span>
                          <span className="text-indigo-600">{emi.paidMonths} / {emi.tenure} Paid</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${(emi.paidMonths / emi.tenure) * 100}%` }}
                          />
                        </div>
                        <button 
                          disabled={emi.paidMonths >= emi.tenure}
                          onClick={() => markEMIPaid(emi)}
                          className={`w-full mt-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            emi.paidMonths >= emi.tenure ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-slate-200 text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
                          }`}
                        >
                          {emi.paidMonths >= emi.tenure ? 'Completed' : 'Mark Installment Paid'}
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {cardEmis.length === 0 && (
                    <div className="col-span-full py-10 border-2 border-dashed border-slate-100 rounded-[32px] text-center">
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Active EMIs on this card</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-2xl font-black text-slate-900">{cardForm.id ? 'Edit Card' : 'New Card'}</h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCardSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Name</label>
                <input type="text" value={cardForm.name} onChange={(e) => setCardForm({...cardForm, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-bold text-lg" placeholder="HDFC Regalia" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Bill (₹)</label>
                  <input type="number" value={cardForm.balance} onChange={(e) => setCardForm({...cardForm, balance: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-black text-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last 4 Digits</label>
                  <input type="text" maxLength={4} value={cardForm.lastFour} onChange={(e) => setCardForm({...cardForm, lastFour: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-rose-600 transition-all mt-4">{cardForm.id ? 'Update Details' : 'Save Card'}</button>
            </form>
          </div>
        </div>
      )}

      {/* EMI Modal (Matches spreadsheet logic) */}
      {showEMIModal && (
        <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-2xl font-black text-slate-900">Add Installment Plan</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card: {cardAccounts.find(a => a.id === activeCardId)?.name}</p>
              </div>
              <button onClick={() => setShowEMIModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleEMISubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Description</label>
                  <input type="text" value={emiForm.itemName} onChange={(e) => setEmiForm({...emiForm, itemName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="iPhone 15 Pro, Amazon Purchase..." required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Amount (Received)</label>
                  <input type="number" value={emiForm.total} onChange={(e) => setEmiForm({...emiForm, total: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly EMI Amount</label>
                  <input type="number" value={emiForm.monthly} onChange={(e) => setEmiForm({...emiForm, monthly: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Processing Fee</label>
                  <input type="number" value={emiForm.fee} onChange={(e) => setEmiForm({...emiForm, fee: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tenure (Months)</label>
                   <input type="number" value={emiForm.tenure} onChange={(e) => setEmiForm({...emiForm, tenure: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Already Paid (Months)</label>
                   <input type="number" value={emiForm.paid} onChange={(e) => setEmiForm({...emiForm, paid: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                   <input type="date" value={emiForm.start} onChange={(e) => setEmiForm({...emiForm, start: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all mt-4">Setup EMI Plan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCards;
