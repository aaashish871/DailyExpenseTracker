
import React, { useState } from 'react';
import { Plus, Check, X, UserMinus, UserPlus } from 'lucide-react';
import { Debt, DebtType } from '../types';

interface DebtsProps {
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  settleDebt: (id: string) => void;
}

const Debts: React.FC<DebtsProps> = ({ debts, addDebt, settleDebt }) => {
  const [showModal, setShowModal] = useState(false);
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<DebtType>(DebtType.TO_COLLECT);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || !amount) return;
    addDebt({ person, amount: parseFloat(amount), type, description });
    setPerson('');
    setAmount('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">Lend & Borrow Tracker</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Add Record</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* To Collect */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-bold text-emerald-600 border-b border-emerald-100 pb-2">
            <UserPlus size={20} />
            To Collect (Money Others Owe You)
          </h4>
          <div className="space-y-3">
            {debts.filter(d => d.type === DebtType.TO_COLLECT).map((debt) => (
              <DebtItem key={debt.id} debt={debt} onSettle={settleDebt} />
            ))}
            {debts.filter(d => d.type === DebtType.TO_COLLECT).length === 0 && (
              <p className="text-sm text-slate-400 italic py-4">No one owes you money currently.</p>
            )}
          </div>
        </div>

        {/* To Pay */}
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-bold text-rose-600 border-b border-rose-100 pb-2">
            <UserMinus size={20} />
            To Pay (Money You Owe Others)
          </h4>
          <div className="space-y-3">
            {debts.filter(d => d.type === DebtType.TO_PAY).map((debt) => (
              <DebtItem key={debt.id} debt={debt} onSettle={settleDebt} />
            ))}
            {debts.filter(d => d.type === DebtType.TO_PAY).length === 0 && (
              <p className="text-sm text-slate-400 italic py-4">You have no pending debts to pay.</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h4 className="text-xl font-bold text-slate-800">Add Debt/Loan</h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Person Name</label>
                <input 
                  type="text" 
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Who is it?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as DebtType)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value={DebtType.TO_COLLECT}>They owe me</option>
                  <option value={DebtType.TO_PAY}>I owe them</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Lunch, taxi, gift, etc."
                  rows={2}
                />
              </div>
              <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-all shadow-lg mt-4">
                Add Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DebtItem: React.FC<{ debt: Debt; onSettle: (id: string) => void }> = ({ debt, onSettle }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between group">
    <div>
      <h5 className="font-semibold text-slate-800">{debt.person}</h5>
      <p className="text-xs text-slate-400">{debt.description}</p>
      <p className={`text-lg font-bold mt-1 ${debt.type === DebtType.TO_COLLECT ? 'text-emerald-500' : 'text-rose-500'}`}>
        ₹{debt.amount.toLocaleString()}
      </p>
    </div>
    <button 
      onClick={() => onSettle(debt.id)}
      className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-all"
      title="Mark as Settled"
    >
      <Check size={20} />
    </button>
  </div>
);

export default Debts;
