import { useMemo, useState } from 'react';
import { useBudgets } from '../hooks/useBudgets';
import { useTransactions } from '../hooks/useTransactions';
import { useMonth } from '../contexts/MonthContext';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetForm } from '../components/BudgetForm';
import { CATEGORIES } from '../lib/constants';
import { Wallet, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Budgets() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { budgets, loading: budgetsLoading, refetch } = useBudgets();
  const { transactions, loading: txLoading } = useTransactions();

  const handleDeleteBudget = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return;
    try {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
      refetch(); // Update UI instantly
    } catch (err) {
      alert("Failed to delete budget.");
    }
  };

  const { selectedMonth } = useMonth();

  // We combine the budget limits with the actual spent amounts from transactions
  const budgetData = useMemo(() => {
    if (!budgets.length) return [];

    return budgets.map(budget => {
      const spent = transactions
        .filter(tx => tx.category === budget.category && tx.type === 'expense' && tx.date.startsWith(selectedMonth))
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      const categoryData = CATEGORIES.find(c => c.label === budget.category);

      return {
        ...budget,
        spent,
        emoji: categoryData?.emoji || '📦'
      };
    });
  }, [budgets, transactions, selectedMonth]);

  const isLoading = budgetsLoading || txLoading;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 pb-24 md:pb-8 max-w-5xl mx-auto relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2 sm:gap-3">
            <Wallet className="text-primary shrink-0" size={28} />
            Budgets
          </h2>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Keep track of your monthly spending limits.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer text-sm"
            />
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex-1 sm:flex-none bg-surface hover:bg-slate-800 border border-border text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm text-center"
          >
            + Create Budget
          </button>
        </div>
      </div>

      {/* Budget Cards — single column on mobile, 2-col on md+ */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : budgetData.length === 0 ? (
        <div className="text-center py-16 sm:py-20 text-slate-500">
          <Wallet size={40} className="mx-auto mb-4 opacity-40" />
          <p className="text-sm sm:text-base">No budgets yet. Create one to start tracking!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {budgetData.map((budget, i) => (
            <BudgetCard
              key={budget.id || i}
              id={budget.id}
              category={budget.category}
              limit={budget.monthly_limit}
              spent={budget.spent}
              emoji={budget.emoji}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <BudgetForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            refetch(); // Call the database silently instead of reloading the page!
          }}
        />
      )}
    </div>
  );
}
