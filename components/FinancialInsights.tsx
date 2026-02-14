
import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { AppState } from '../types';
import { getFinancialInsights } from '../services/geminiService';

interface Insight {
  title: string;
  description: string;
}

const FinancialInsights: React.FC<{ state: AppState }> = ({ state }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getFinancialInsights(state);
      setInsights(result);
    } catch (err) {
      setError("Failed to generate AI insights. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-3xl border border-indigo-100 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <BrainCircuit size={200} className="text-indigo-600" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">AI Financial Insights</h2>
              <p className="text-slate-500 text-sm font-medium">Powered by Gemini AI Engine</p>
            </div>
          </div>
          <button 
            onClick={fetchInsights}
            disabled={loading}
            className={`p-2 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors ${loading ? 'animate-spin' : ''}`}
            title="Refresh Insights"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-indigo-600 font-medium animate-pulse">Analyzing your finances...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-center gap-4 text-rose-700">
            <AlertCircle />
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, idx) => (
              <div 
                key={idx} 
                className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-indigo-50 p-2 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{insight.title}</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
            {insights.length === 0 && (
              <div className="col-span-2 text-center py-12 text-slate-400 italic">
                No insights could be generated. Try adding more transactions.
              </div>
            )}
          </div>
        )}
        
        <div className="mt-10 p-4 bg-white/50 rounded-xl border border-indigo-50 text-xs text-slate-400 italic">
          Disclaimer: These insights are AI-generated based on your provided data and should not be considered professional financial advice.
        </div>
      </div>
    </div>
  );
};

export default FinancialInsights;
