import { useMemo } from 'react';
import { kmeans } from '../lib/kmeans';
import { ClusterScatterChart } from '../components/charts/ClusterScatterChart';
import { BrainCircuit } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';

export function Analytics() {
  const { transactions } = useTransactions();

  // Feed REAL transactions into the K-Means algorithm
  const clusteredData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return [];

    const rawData = expenses.map(t => {
      const dateObj = new Date(t.date);
      return {
        x: dateObj.getDate(),
        y: Number(t.amount),
        label: t.description || t.category,
      };
    });

    const k = Math.min(3, rawData.length);
    return kmeans(rawData, k);
  }, [transactions]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 pb-24 md:pb-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2 sm:gap-3">
            <BrainCircuit className="text-purple-500 shrink-0" size={28} />
            AI Analytics
          </h2>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Machine Learning analysis of your spending behavior.</p>
        </div>
      </div>

      {/* Main Content Grid — stacks on mobile, side-by-side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Left Column: The Chart */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-4 sm:p-6 flex flex-col">
          <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-1 sm:mb-2">Spending Clusters (K-Means)</h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
            We grouped your expenses based on Date and Amount. Notice any patterns?
          </p>
          {/* Chart container with overflow protection */}
          <div className="flex-1 min-h-[280px] sm:min-h-[380px] md:min-h-[400px] w-full overflow-hidden">
            {clusteredData.length > 0 ? (
              <ClusterScatterChart clusteredData={clusteredData} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm text-center px-4">
                Add some expenses to see your clusters!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Explanations */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-3 sm:mb-4">What am I looking at?</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-3 sm:mb-4">
              This chart plots your <strong className="text-slate-200">real expenses</strong> with the{' '}
              <strong className="text-slate-200">Day of the Month</strong> on the bottom axis and the{' '}
              <strong className="text-slate-200">Amount</strong> on the side axis.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Our algorithm automatically detects "personas" in your spending without looking at the categories you chose.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-bold text-purple-400 uppercase tracking-wide mb-3">Detected Patterns</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></div>
                Frequent, low-cost daily habits
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                <div className="w-3 h-3 rounded-full bg-pink-500 shrink-0"></div>
                Heavy start-of-month bills
              </li>
              <li className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></div>
                Mid-range weekend spikes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
