
import React, { useState } from 'react';
// Added ShieldCheck to the imports from lucide-react
import { Copy, Check, Code2, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

const PromptView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const APP_PROMPT = `Act as a world-class senior frontend engineer. Create a high-end personal finance app (Kharch Tracker) that mirrors a specific Excel-based management logic.

Key Logic:
1. Three Pillars of Truth:
   - "Mere Pass Hai" (Assets): Bank balances, Cash, Wallets.
   - "Barna Hai" (Liabilities): Credit card bills, Pay Later dues.
   - "Lena Hai" (Expected): Lendings, Refunds pending.
2. Accounting Rules:
   - Income/Cashback on Credit Card -> REDUCES the bill balance.
   - Income on Bank -> INCREASES the balance.
   - Specific Categories: "Home (Refundable)" or "Work (Refundable)" expenses should automatically create a "Lena Hai" entry.
3. Safety & Verification:
   - Master Reset: A high-visibility reset button that clears all data.
   - Human Verification: Implement a Math CAPTCHA (random arithmetic) that must be solved before the reset action is enabled.
4. Features:
   - Dashboard with "Aaya vs Gaya" (Income/Expense) toggle quick-entry form.
   - Reconciliation Card: User inputs "Real Bank Balance" and the app shows the difference vs the calculated App Status.
   - Payment Source Setup: Ability to set initial data/balances for all wallets and cards.
   - Gemini AI Insights: Use @google/genai to analyze trends and provide 3-4 financial tips.
5. Aesthetics:
   - High-contrast Slate/Rose/Emerald theme.
   - Rounded 32px-40px corners, soft glassmorphism, black accents for high-end feel.
   - Developer signature: "Developed by Ashish Ahuja" visible at the top.

Technologies: React, Tailwind CSS, Lucide-React, @google/genai (Gemini 3 Flash).`;

  const handleCopy = () => {
    navigator.clipboard.writeText(APP_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Code2 size={240} className="text-white" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-rose-600 p-4 rounded-3xl shadow-lg shadow-rose-900/50">
              <Sparkles className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">App Source Prompt</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Build your own version</p>
            </div>
          </div>

          <p className="text-slate-300 text-lg font-medium leading-relaxed mb-10 max-w-2xl">
            Copy this "Master Prompt" and give it to an AI to recreate or customize this entire application from scratch. It contains all the Excel logic, accounting rules, and human verification safety features.
          </p>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-indigo-600 rounded-[32px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-slate-950 rounded-[32px] border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-8 py-4 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">System_Prompt_v2.txt</span>
                </div>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-white/10 hover:bg-rose-600 text-white px-4 py-2 rounded-xl transition-all font-black text-xs uppercase tracking-widest"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </button>
              </div>
              <pre className="p-8 text-sm font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px] scrollbar-hide">
                {APP_PROMPT}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-start gap-6">
          <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl">
            <BookOpen size={24} />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 mb-2">How it works?</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              This prompt describes the "Three Pillars" logic (Lena Hai, Barna Hai, Mere Pass Hai) that Ashish Ahuja designed to match professional accounting standards.
            </p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-start gap-6">
          <div className="bg-indigo-100 text-indigo-600 p-4 rounded-2xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 mb-2">Human Verified</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              The reset logic now includes a Math CAPTCHA to prevent accidental data loss, making the application safer for professional use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptView;
