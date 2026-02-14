
import React, { useState, useEffect } from 'react';
import { Plus, Wallet as WalletIcon, Banknote, Landmark, X, CreditCard, Edit2, Trash2, AlertTriangle, ShieldCheck, Sparkles, BrainCircuit, Loader2, Info } from 'lucide-react';
import { Account, AccountType } from '../types';
import { parseFinancialSetup } from '../services/geminiService';

interface WalletsProps {
  accounts: Account[];
  addAccount: (acc: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  onReset?: () => void;
}

const Wallets: React.FC<WalletsProps> = ({ accounts, addAccount, updateAccount, deleteAccount, onReset }) => {
  const [showModal, setShowModal] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [magicInput, setMagicInput] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>(AccountType.BANK);
  const [balance, setBalance] = useState('');
  const [lastFour, setLastFour] = useState('');

  const openAdd = () => {
    setEditId(null);
    setName('');
    setType(AccountType.BANK);
    setBalance('');
    setLastFour('');
    setShowModal(true);
  };

  const handleMagicSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicInput.trim()) return;
    setIsMagicLoading(true);
    try {
      const detectedAccounts = await parseFinancialSetup(magicInput);
      if (detectedAccounts && detectedAccounts.length > 0) {
        detectedAccounts.forEach(acc => {
          addAccount(acc as Omit<Account, 'id'>);
        });
        setMagicInput('');
        setShowMagicModal(false);
      } else {
        alert("AI could not detect any accounts. Please try being more specific, e.g., 'SBI Bank 5000, Cash 200'.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong with the AI setup.");
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;
    const accountData = { 
      name, 
      type, 
      balance: parseFloat(balance),
      lastFourDigits: (type === AccountType.CREDIT_CARD || type === AccountType.BANK) ? lastFour : undefined,
      isLiability: type === AccountType.CREDIT_CARD || type === AccountType.PAY_LATER
    };
    if (editId) updateAccount(editId, accountData);
    else addAccount(accountData);
    setShowModal(false);
  };

  const getIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.BANK: return <Landmark className="text-blue-500" />;
      case AccountType.WALLET: return <WalletIcon className="text-purple-500" />;
      case AccountType.CASH: return <Banknote className="text-emerald-500" />;
      case AccountType.CREDIT_CARD: return <CreditCard className="text-indigo-600" />;
      case AccountType.PAY_LATER: return <CreditCard className="text-orange-500" />;
      default: return <Landmark />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Setup & Wallets</h3>
          <p className="text-sm text-slate-500 font-medium italic">Sabse pehle apne banks aur wallets add karein</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMagicModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl hover:bg-indigo-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Sparkles size={16} />
            <span>AI Magic Setup</span>
          </button>
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl hover:bg-rose-600 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95"
          >
            <Plus size={16} />
            <span>Add Source</span>
          </button>
        </div>
      </div>

      {accounts.length === 0 && (
        <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[32px] text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info size={32} />
          </div>
          <h4 className="text-xl font-black text-indigo-900">App Khali Hai!</h4>
          <p className="text-slate-600 font-medium max-w-md mx-auto">
            Data put karne ke liye "Add Source" button se apna Bank Balance ya Cash enter karein. 
            Aap AI Magic Setup bhi use kar sakte hain!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 group hover:shadow-md transition-all relative overflow-hidden ring-1 ring-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-white group-hover:shadow-inner transition-all">
                {getIcon(acc.type)}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { 
                    setEditId(acc.id); 
                    setName(acc.name); 
                    setType(acc.type); 
                    setBalance(acc.balance.toString()); 
                    setLastFour(acc.lastFourDigits || ''); 
                    setShowModal(true); 
                  }} 
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => { if(confirm('Delete this account?')) deleteAccount(acc.id); }} 
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{acc.type.replace('_', ' ')}</span>
                {acc.lastFourDigits && (
                  <span className="text-[9px] font-bold text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded italic">**** {acc.lastFourDigits}</span>
                )}
              </div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight truncate">{acc.name}</h4>
              <div className={`text-2xl font-black ${acc.isLiability ? 'text-rose-600' : 'text-slate-900'}`}>
                ₹{acc.balance.toLocaleString()}
              </div>
            </div>

            {acc.isLiability && (
              <div className="absolute top-0 right-0 p-2">
                <div className="bg-rose-100 text-rose-600 text-[8px] font-black px-2 py-0.5 rounded-bl-xl uppercase tracking-widest">Liability</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Manual Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-2xl font-black text-slate-900">{editId ? 'Edit Source' : 'Add New Source'}</h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account/Card Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ICICI Savings, OneCard" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value as AccountType)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold appearance-none">
                    <option value={AccountType.BANK}>Bank Account</option>
                    <option value={AccountType.WALLET}>Digital Wallet</option>
                    <option value={AccountType.CASH}>Cash on Hand</option>
                    <option value={AccountType.CREDIT_CARD}>Credit Card</option>
                    <option value={AccountType.PAY_LATER}>Pay Later</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Balance / Bill</label>
                  <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0.00" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-black text-lg" required />
                </div>
              </div>

              {(type === AccountType.CREDIT_CARD || type === AccountType.BANK) && (
                <div className="space-y-1.5 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last 4 Digits (Optional)</label>
                  <input type="text" maxLength={4} value={lastFour} onChange={(e) => setLastFour(e.target.value)} placeholder="1234" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold" />
                </div>
              )}

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl active:scale-[0.98] mt-4">
                {editId ? 'Update Source' : 'Add Source'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Magic Modal */}
      {showMagicModal && (
        <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <BrainCircuit size={160} className="text-indigo-600" />
             </div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">AI Magic Setup</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beta v1.0</p>
                </div>
              </div>
              <button onClick={() => setShowMagicModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="relative z-10 space-y-6">
              <p className="text-slate-600 font-medium leading-relaxed">
                Aap simply likhiye ki aapke pass kitne paise kahan hain. AI apne aap accounts create kar dega.
                <br />
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2 block italic">Example: "Mere SBI bank mein 5000 hain, Cash 200 hai aur OneCard ka 4500 bill barna hai"</span>
              </p>

              <form onSubmit={handleMagicSetup} className="space-y-6">
                <textarea 
                  value={magicInput}
                  onChange={(e) => setMagicInput(e.target.value)}
                  placeholder="Yahan likhein..."
                  className="w-full h-40 px-6 py-5 bg-slate-50 border border-slate-200 rounded-[32px] focus:ring-4 focus:ring-indigo-500/10 focus:outline-none font-bold text-lg resize-none"
                  disabled={isMagicLoading}
                  required
                />

                <button 
                  type="submit" 
                  disabled={isMagicLoading || !magicInput.trim()}
                  className={`w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] ${
                    isMagicLoading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isMagicLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>AI Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>Activate Magic</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallets;
