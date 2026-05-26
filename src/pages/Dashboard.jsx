import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, IndianRupee, DollarSign, Euro, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { IncomeExpenseChart } from '../components/charts/IncomeExpenseChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { TransactionForm } from '../components/TransactionForm';
import { useTransactions } from '../hooks/useTransactions';
import { useMonth } from '../contexts/MonthContext';
import { useSettings } from '../contexts/SettingsContext';

export function Dashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { transactions } = useTransactions();
  const { selectedMonth, setSelectedMonth } = useMonth();
  const { currency, privacyMode } = useSettings();
  const CURRENCY_ICONS = { '₹': IndianRupee, '$': DollarSign, '€': Euro };

  // 1. Filter transactions by selected month
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // 2. Process data for the KPI Cards (using FILTERED transactions)
  const { balance, income, expense } = useMemo(() => {
    let inc = 0, exp = 0;
    monthlyTransactions.forEach(t => {
      if (t.type === 'income') inc += Number(t.amount);
      if (t.type === 'expense') exp += Number(t.amount);
    });
    return { balance: inc - exp, income: inc, expense: exp };
  }, [monthlyTransactions]);

  // 3. Process data for the Category Donut Chart (using FILTERED transactions)
  const categoryData = useMemo(() => {
    const expenses = monthlyTransactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

    const colors = ['#F59E0B', '#3B82F6', '#EC4899', '#6B7280', '#EF4444', '#10B981', '#8B5CF6'];
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1]) // Sort largest to smallest
      .map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length]
      }));
  }, [monthlyTransactions]);

  // 4. Process data for the Line Chart (Shows the whole year to see trends)
  const yearlyData = useMemo(() => {
    const selectedYear = selectedMonth.split('-')[0];
    const yearlyTx = transactions.filter(t => t.date.startsWith(selectedYear));
    const grouped = yearlyTx.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!acc[month]) acc[month] = { name: month, income: 0, expense: 0, sortDate: new Date(t.date.substring(0, 7) + '-01') };
      acc[month][t.type] += Number(t.amount);
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => a.sortDate - b.sortDate);
  }, [transactions, selectedMonth]);

  const cards = [
    { title: 'Monthly Balance', amount: privacyMode ? '****' : `${currency}${balance.toLocaleString()}`, icon: CURRENCY_ICONS[currency] || IndianRupee, trend: 'This Month', isUp: balance >= 0 },
    { title: 'Monthly Income', amount: privacyMode ? '****' : `${currency}${income.toLocaleString()}`, icon: ArrowUpRight, trend: 'This Month', isUp: true },
    { title: 'Monthly Expenses', amount: privacyMode ? '****' : `${currency}${expense.toLocaleString()}`, icon: ArrowDownRight, trend: 'This Month', isUp: false },
    { title: 'Active Budgets', amount: '4', icon: CreditCard, trend: 'On track', isUp: true, isText: true },
  ];

  // Logic for Missing Income Reminder
  const hasIncomeThisMonth = monthlyTransactions.some(t => t.type === 'income');
  const isCurrentMonth = selectedMonth === new Date().toISOString().slice(0, 7);
  const showIncomeReminder = isCurrentMonth && !hasIncomeThisMonth;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 pb-24 md:pb-8 relative">
      {/* Top Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Overview</h2>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Here's what's happening with your money.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="relative flex-1 sm:flex-none">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer text-sm"
            />
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20 whitespace-nowrap text-sm sm:text-base"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Income Reminder Banner */}
      {showIncomeReminder && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 flex items-start sm:items-center gap-3 sm:gap-4"
        >
          <div className="bg-amber-500/20 p-2 rounded-full text-amber-500 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-amber-500 font-medium text-sm sm:text-base">It's a new month!</h4>
            <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
              You haven't logged any income for {new Date(selectedMonth).toLocaleString('default', { month: 'long' })} yet. Add your salary to keep your balance accurate.
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            Log Income
          </button>
        </motion.div>
      )}

      {/* KPI Cards — 1 col on mobile, 2 col on sm, 4 col on lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface border border-border rounded-2xl p-4 sm:p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <card.icon size={56} />
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 text-xs sm:text-sm font-medium">{card.title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-100 mt-2">{card.amount}</p>
              <div className="flex items-center space-x-2 mt-3 sm:mt-4">
                <span className={`text-xs sm:text-sm font-medium flex items-center ${card.isText ? 'text-slate-400' : (card.isUp ? 'text-success' : 'text-danger')}`}>
                  {!card.isText && (card.isUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />)}
                  {card.trend}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts — stack to single column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-4 sm:p-6 h-[300px] sm:h-[380px] md:h-[400px] flex flex-col">
          <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-3 sm:mb-4">
            Yearly Trends ({selectedMonth.split('-')[0]})
          </h3>
          <div className="flex-1 min-h-0 w-full overflow-hidden">
            {yearlyData.length > 0 ? (
              <IncomeExpenseChart data={yearlyData} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data yet</div>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 h-[300px] sm:h-[380px] md:h-[400px] flex flex-col">
          <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-3 sm:mb-4">Monthly Spending Breakdown</h3>
          <div className="flex-1 min-h-0 w-full overflow-hidden">
            {categoryData.length > 0 ? (
              <CategoryDonutChart data={categoryData} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No expenses this month</div>
            )}
          </div>
        </div>
      </div>

      {/* Render Modal */}
      {isFormOpen && (
        <TransactionForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
