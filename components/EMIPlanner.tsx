
import React from 'react';
import { 
  CalendarDays, 
  Trash2, 
  CheckCircle2, 
  Receipt, 
  ArrowRight,
  Landmark,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { Account, EMI } from '../types.ts';

interface EMIPlannerProps {
  accounts: Account[];
  emis: EMI[];
  updateEMI: (id: string, updates: Partial<EMI>) => void;
  deleteEMI: (id: string) => void;
}

const EMIPlanner: React.FC<EMIPlannerProps> = ({ accounts, emis, updateEMI, deleteEMI }) => {
  const activeEmis = emis.filter(emi => emi.paidMonths < emi.tenure);
  const totalMonthly = activeEmis.reduce((sum, e) => sum + e.monthlyAmount, 0);
  const totalOutstanding = activeEmis.reduce((sum, e) => sum + (e.monthlyAmount * (e.tenure - e.paidMonths)), 0);

  const getAccountName = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    return acc ? acc.name : 'Unknown Card';
  };

  const markPaid = (emi: EMI) => {
    if (emi.paidMonths < emi.tenure) {
      updateEMI(emi.id, { paidMonths: emi.paidMonths + 1 });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">EMI Master Planner</h2>
          <p className="text-slate-500 font-medium italic">Track every running installment in one place</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white px-6 py-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Total</span>
            <span className="text-xl font-black text-indigo-600">₹{totalMonthly.toLocaleString()}</span>
          </div>
          <div className="bg-yellow-400/10 px-6 py-4 rounded-[24px] border border-yellow-200 shadow-sm flex flex-col items-center">
            <span className="text-[9px] font-black text-yellow-700 uppercase tracking-widest mb-1">Total Outstanding</span>
            <span className="text-xl font-black text-yellow-900">₹{totalOutstanding.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {activeEmis.length === 0 ? (
        <div className="bg-white p-20 rounded-[48px] border border-slate-100 text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">All EMIs Completed!</h3>
          <p className="text-slate-400 font-medium">Koi bhi running EMI nahi hai. Sukoon!</p>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Item / Purchase</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Payment Source</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Monthly EMI</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Progress</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Outstanding (Yellow)</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeEmis.map((emi) => (
                  <tr key={emi.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900">{emi.itemName}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Start: {emi.startDate}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-indigo-600" />
                        <span className="text-xs font-bold text-slate-600">{getAccountName(emi.accountId)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-900">₹{emi.monthlyAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <span>Month</span>
                          <span className="text-indigo-600">{emi.paidMonths} / {emi.tenure}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full transition-all duration-700" 
                            style={{ width: `${(emi.paidMonths / emi.tenure) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="bg-yellow-100 px-3 py-1.5 rounded-xl border border-yellow-200 inline-block">
                          <span className="text-sm font-black text-yellow-900">₹{(emi.monthlyAmount * (emi.tenure - emi.paidMonths)).toLocaleString()}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => markPaid(emi)}
                          className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          title="Mark Current Month Paid"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button 
                          onClick={() => { if(confirm('Remove this EMI record?')) deleteEMI(emi.id); }}
                          className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Helpful Info */}
      <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[32px] flex items-start gap-4">
        <AlertCircle className="text-indigo-600 mt-1" />
        <div>
          <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest mb-2">EMI Tracking Logic</h4>
          <p className="text-indigo-800/70 text-sm leading-relaxed font-medium">
            Jitne bhi "Active Installments" hain, unka total monthly amount aapke dashboard ke **"Barna Hai"** section mein auto-add ho raha hai.
            Har mahine pay karne ke baad 'Tick' button dabaen, progress automatic update hogi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EMIPlanner;
