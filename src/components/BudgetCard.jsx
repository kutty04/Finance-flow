import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export function BudgetCard({ id, category, limit, spent, emoji, onDelete }) {
  const { currency, privacyMode } = useSettings();
  const percentage = Math.min((spent / limit) * 100, 100);
  const isOverBudget = spent > limit;
  const remaining = limit - spent;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-surface border border-border p-6 rounded-2xl group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-2xl">
            {emoji}
          </div>
          <div>
            <h3 className="font-bold text-slate-200">{category}</h3>
            <p className="text-sm text-slate-400">
              {isOverBudget ? (
                <span className="text-danger flex items-center gap-1 mt-1">
                  <AlertCircle size={14} /> Over by {privacyMode ? '****' : `${currency}${Math.abs(remaining).toLocaleString()}`}
                </span>
              ) : (
                <span className="text-success flex items-center gap-1 mt-1">
                  <CheckCircle2 size={14} /> {privacyMode ? '****' : `${currency}${remaining.toLocaleString()}`} left
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="text-right">
            <p className="font-bold text-slate-100">{privacyMode ? '****' : `${currency}${spent.toLocaleString()}`}</p>
            <p className="text-xs text-slate-500">of {privacyMode ? '****' : `${currency}${limit.toLocaleString()}`}</p>
          </div>
          {onDelete && id && (
            <button 
              onClick={() => onDelete(id)} 
              className="text-slate-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
              title="Delete Budget"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
        {/* Progress Fill */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${
            isOverBudget 
              ? 'bg-danger' 
              : percentage > 80 
                ? 'bg-warning' 
                : 'bg-primary'
          }`}
        />
      </div>
      
      {/* Warning Text if almost over */}
      {!isOverBudget && percentage > 80 && (
        <p className="text-xs text-warning mt-3 text-right">Approaching limit!</p>
      )}
    </motion.div>
  );
}
