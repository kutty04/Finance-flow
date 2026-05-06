import { Sparkles, Calendar } from 'lucide-react';
import { AIAuditPanel } from '../components/AIAuditPanel';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import { useMonth } from '../contexts/MonthContext';

export function AIAudit() {
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { selectedMonth, setSelectedMonth } = useMonth();

  const monthName = new Date(selectedMonth + '-01').toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-8 space-y-8 pb-24 md:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Sparkles className="text-violet-400" size={32} />
            AI Financial Advisor
          </h2>
          <p className="text-slate-400 mt-1">
            Get a personalized monthly audit powered by AI.
          </p>
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(() => {
          const monthly = transactions.filter(t => t.date.startsWith(selectedMonth));
          const inc = monthly.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
          const exp = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
          const txCount = monthly.length;
          const catCount = new Set(monthly.filter(t => t.type === 'expense').map(t => t.category)).size;

          const stats = [
            { label: 'Transactions', value: txCount },
            { label: 'Categories', value: catCount },
            { label: 'Budgets Set', value: budgets.length },
            { label: 'Savings Rate', value: inc > 0 ? `${(((inc - exp) / inc) * 100).toFixed(0)}%` : '—' },
          ];

          return stats.map((s, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-100">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ));
        })()}
      </div>

      {/* AI Audit Panel */}
      <AIAuditPanel
        transactions={transactions}
        budgets={budgets}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
