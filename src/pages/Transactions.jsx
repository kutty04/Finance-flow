import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useMonth } from '../contexts/MonthContext';
import { useSettings } from '../contexts/SettingsContext';
import { CATEGORIES } from '../lib/constants';
import { Loader2, ArrowUpRight, ArrowDownRight, Search, Trash2, Pencil, Calendar, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TransactionForm } from '../components/TransactionForm';

export function Transactions() {
  const { transactions, loading, setTransactions, refetch } = useTransactions();
  const { selectedMonth, setSelectedMonth } = useMonth();
  const { currency, privacyMode } = useSettings();
  const [editingTx, setEditingTx] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper to find the emoji for a category
  const getCategoryEmoji = (categoryName) => {
    if (categoryName === 'Income') return '💰';
    const cat = CATEGORIES.find(c => c.label === categoryName);
    return cat ? cat.emoji : '📦';
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete transaction.");
    }
  };

  // Filter transactions by Month AND Search Query
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // If there is a search query, ignore the month filter to search entire history
      if (searchQuery.trim() !== "") {
        return tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
               tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      }
      // Otherwise, filter by selected month
      return tx.date.startsWith(selectedMonth);
    });
  }, [transactions, selectedMonth, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (INR)'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t =>
        `${t.date},"${t.description.replace(/"/g, '""')}",${t.category},${t.type},${t.amount}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `FinanceFlow_Export_${searchQuery ? 'Search' : selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 pb-24 md:pb-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Transactions</h2>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Review your recent income and expenses.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Month Filter */}
          <div className="relative flex-1 sm:flex-none">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSearchQuery(""); // Clear search when changing month
              }}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer text-sm"
            />
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:w-56 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all history..."
              className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-primary placeholder:text-slate-500"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg transition-colors border border-slate-700 justify-center text-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container — horizontal scroll on mobile */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full text-left border-collapse" style={{ minWidth: '560px' }}>
              <thead>
                <tr className="border-b border-border bg-slate-800/50">
                  <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-400 whitespace-nowrap">Date</th>
                  <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-400">Description</th>
                  <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-400 hidden sm:table-cell">Category</th>
                  <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-400 text-right">Amount</th>
                  <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-400 text-center w-14 sm:w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, i) => (
                    <tr
                      key={tx.id || i}
                      className="border-b border-border last:border-0 hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="p-3 sm:p-4 text-xs sm:text-sm text-slate-400 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-3 sm:p-4 text-xs sm:text-sm text-slate-200 font-medium max-w-[140px] sm:max-w-none">
                        <span className="block truncate">{tx.description}</span>
                        {tx.is_recurring && (
                          <span className="mt-0.5 inline-block px-1.5 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-400 uppercase tracking-wider">
                            Recurring
                          </span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4 text-xs sm:text-sm text-slate-300 hidden sm:table-cell whitespace-nowrap">
                        <span className="mr-1.5">{getCategoryEmoji(tx.category)}</span>
                        {tx.category}
                      </td>
                      <td className={`p-3 sm:p-4 text-right font-medium text-xs sm:text-sm ${
                        tx.type === 'income' ? 'text-success' : 'text-slate-200'
                      }`}>
                        <div className="flex items-center justify-end space-x-1">
                          {tx.type === 'income' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} className="text-danger" />}
                          <span className="whitespace-nowrap">{privacyMode ? '****' : `${currency}${tx.amount.toLocaleString()}`}</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <div className="flex items-center justify-center space-x-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:focus-within:opacity-100">
                          <button
                            onClick={() => setEditingTx(tx)}
                            className="text-slate-500 hover:text-primary p-1.5 sm:p-2 rounded-lg hover:bg-primary/10 transition-colors"
                            title="Edit Transaction"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="text-slate-500 hover:text-danger p-1.5 sm:p-2 rounded-lg hover:bg-danger/10 transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 sm:p-12 text-center text-slate-500 text-sm">
                      No transactions found for {searchQuery ? `"${searchQuery}"` : 'this month'}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingTx && (
        <TransactionForm
          initialData={editingTx}
          onClose={() => setEditingTx(null)}
          onSuccess={() => {
            setEditingTx(null);
            refetch(); // Silently pull the updated row from the database!
          }}
        />
      )}
    </div>
  );
}
