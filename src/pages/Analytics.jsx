import { useMemo } from 'react';
import { kmeans } from '../lib/kmeans';
import { ClusterScatterChart } from '../components/charts/ClusterScatterChart';
import { BrainCircuit } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';

export function Analytics() {
  const { transactions } = useTransactions();

  // We are now feeding the REAL transactions into the K-Means algorithm!
  const clusteredData = useMemo(() => {
    // 1. Filter out income (we only want to cluster expenses)
    const expenses = transactions.filter(t => t.type === 'expense');

    if (expenses.length === 0) return [];

    // 2. Map the data into the { x, y, label } format that kmeans expects
    const rawData = expenses.map(t => {
      const dateObj = new Date(t.date);
      return {
        x: dateObj.getDate(), // Day of the month (1-31)
        y: Number(t.amount),  // Amount spent
        label: t.description || t.category // Label for the tooltip
      };
    });

    // 3. We dynamically choose 'k'. If they only have 2 transactions, k=3 will crash.
    const k = Math.min(3, rawData.length);
    
    return kmeans(rawData, k);
  }, [transactions]);

  return (
    <div className="p-8 space-y-8 pb-24 md:pb-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <BrainCircuit className="text-purple-500" size={32} />
            AI Analytics
          </h2>
          <p className="text-slate-400 mt-1">Machine Learning analysis of your spending behavior.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: The Chart */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Spending Clusters (K-Means)</h3>
          <p className="text-sm text-slate-400 mb-6">
            We grouped your expenses based on Date and Amount. Notice any patterns?
          </p>
          <div className="flex-1 min-h-[400px]">
            {clusteredData.length > 0 ? (
              <ClusterScatterChart clusteredData={clusteredData} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Add some expenses to see your clusters!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Explanations */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">What am I looking at?</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              This chart plots your <strong className="text-slate-200">real expenses</strong> with the <strong className="text-slate-200">Day of the Month</strong> on the bottom axis and the <strong className="text-slate-200">Amount</strong> on the side axis.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our algorithm automatically detects "personas" in your spending without looking at the categories you chose.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wide mb-3">Detected Patterns</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                Frequent, low-cost daily habits
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                Heavy start-of-month bills
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                Mid-range weekend spikes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
