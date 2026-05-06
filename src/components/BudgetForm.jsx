import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../lib/constants';
import { X, Loader2 } from 'lucide-react';

export function BudgetForm({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: CATEGORIES[0].label,
    monthly_limit: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert new budget limit into Supabase
      const { error } = await supabase
        .from('budgets')
        .insert([{
          category: formData.category,
          monthly_limit: parseFloat(formData.monthly_limit),
        }]);

      if (error) throw error;
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error inserting budget:', error.message);
      alert('Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-slate-100">Set Category Limit</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-primary"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.label} value={cat.label}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Monthly Limit (₹)</label>
            <input
              required
              type="number"
              step="100"
              value={formData.monthly_limit}
              onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-primary"
              placeholder="e.g. 5000"
            />
            <p className="text-xs text-slate-500 mt-2">
              This is the maximum amount you want to allow yourself to spend in this category each month.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-lg mt-6 transition-colors flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Budget Limit'}
          </button>
        </form>
      </div>
    </div>
  );
}
