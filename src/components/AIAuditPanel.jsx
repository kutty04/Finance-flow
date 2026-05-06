import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Loader2, TrendingUp, TrendingDown, Lightbulb,
  AlertTriangle, Star, ChevronRight, RefreshCw
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

// Maps AI tags to icons and styles
const INSIGHT_CONFIG = {
  smart_move: {
    icon: Star,
    label: 'Smart Move',
    bg: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    labelColor: 'text-emerald-400',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    bg: 'from-rose-500/10 to-red-500/10',
    border: 'border-rose-500/30',
    iconColor: 'text-rose-400',
    labelColor: 'text-rose-400',
  },
  saving_tip: {
    icon: Lightbulb,
    label: 'Saving Tip',
    bg: 'from-amber-500/10 to-yellow-500/10',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    labelColor: 'text-amber-400',
  },
  trend: {
    icon: TrendingUp,
    label: 'Trend',
    bg: 'from-blue-500/10 to-sky-500/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    labelColor: 'text-blue-400',
  },
  overspending: {
    icon: TrendingDown,
    label: 'Overspending',
    bg: 'from-orange-500/10 to-red-500/10',
    border: 'border-orange-500/30',
    iconColor: 'text-orange-400',
    labelColor: 'text-orange-400',
  },
};

function buildFinancialPrompt(transactions, budgets, currency, selectedMonth) {
  const monthlyExpenses = transactions.filter(
    t => t.type === 'expense' && t.date.startsWith(selectedMonth)
  );
  const monthlyIncome = transactions.filter(
    t => t.type === 'income' && t.date.startsWith(selectedMonth)
  );

  const totalIncome = monthlyIncome.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = monthlyExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;

  // Category spending summary
  const categorySpend = monthlyExpenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const categoryBreakdown = Object.entries(categorySpend)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => {
      const budget = budgets.find(b => b.category === cat);
      const budgetLine = budget
        ? ` (Budget: ${currency}${budget.monthly_limit}, ${((amount / budget.monthly_limit) * 100).toFixed(0)}% used)`
        : ' (No budget set)';
      return `  - ${cat}: ${currency}${amount.toLocaleString()}${budgetLine}`;
    })
    .join('\n');

  // Top 5 individual transactions
  const topTransactions = [...monthlyExpenses]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)
    .map(t => `  - ${t.description || t.category}: ${currency}${Number(t.amount).toLocaleString()} on ${t.date}`)
    .join('\n');

  return `You are a warm, witty, and insightful personal financial advisor. Analyze this user's financial data for ${selectedMonth} and provide a monthly audit.

FINANCIAL DATA:
- Total Income: ${currency}${totalIncome.toLocaleString()}
- Total Expenses: ${currency}${totalExpense.toLocaleString()}
- Net Savings: ${currency}${(totalIncome - totalExpense).toLocaleString()}
- Savings Rate: ${savingsRate}%

CATEGORY BREAKDOWN (vs budgets):
${categoryBreakdown || '  - No expenses this month yet.'}

TOP TRANSACTIONS:
${topTransactions || '  - No transactions yet.'}

INSTRUCTIONS:
Return a valid JSON object with this exact structure:
{
  "summary": "A 1-2 sentence warm, human overview of the month. Be specific about the numbers.",
  "insights": [
    {
      "type": "smart_move" | "warning" | "saving_tip" | "trend" | "overspending",
      "title": "Short punchy title (max 6 words)",
      "detail": "2-3 sentence explanation. Be specific about amounts and dates. Be encouraging but honest."
    }
  ]
}

Rules:
- Return 3 to 5 insights. Mix positive and constructive feedback.
- Always use the currency symbol "${currency}" when mentioning amounts.
- Be conversational and human, not robotic. Use phrases like "Nice work!", "Watch out for this", "Here's a thought".
- For "smart_move": celebrate a specific good decision they made.
- For "warning" or "overspending": be gentle but clear about a concern.
- For "saving_tip": give one concrete, actionable tip.
- Return ONLY the JSON. No markdown, no extra text.`;
}

export function AIAuditPanel({ transactions, budgets, selectedMonth }) {
  const { currency } = useSettings();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    setAudit(null);

    try {
      const prompt = buildFinancialPrompt(transactions, budgets, currency, selectedMonth);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1024,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Groq API request failed');
      }

      const data = await response.json();
      let resultText = data.choices[0].message.content.trim();

      // Sanitize just in case
      const firstBrace = resultText.indexOf('{');
      const lastBrace = resultText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        resultText = resultText.substring(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(resultText);
      setAudit(parsed);
    } catch (err) {
      console.error('AI Audit Error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const monthName = new Date(selectedMonth + '-01').toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="text-violet-400" size={20} />
            AI Monthly Audit
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">
            Powered by Groq Llama · {monthName}
          </p>
        </div>
        <button
          onClick={runAudit}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/20"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : audit ? (
            <RefreshCw size={16} />
          ) : (
            <Sparkles size={16} />
          )}
          {loading ? 'Analyzing...' : audit ? 'Re-analyze' : 'Run Audit'}
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Idle state */}
          {!loading && !audit && !error && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-violet-400" size={28} />
              </div>
              <p className="text-slate-300 font-medium">Ready for your financial audit?</p>
              <p className="text-slate-500 text-sm mt-1">
                Our AI will analyze your income, expenses, budgets, and transactions to give you personalized insights.
              </p>
              <button
                onClick={runAudit}
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all"
              >
                <Sparkles size={16} />
                Get My {monthName} Audit
                <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* Loading state */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="flex justify-center gap-1 mb-4">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-violet-500"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <p className="text-slate-300 font-medium">Your AI advisor is thinking...</p>
              <p className="text-slate-500 text-sm mt-1">Reading your transactions and budget history</p>
            </motion.div>
          )}

          {/* Error state */}
          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-rose-400 font-medium">⚠️ Audit Failed</p>
              <p className="text-slate-500 text-sm mt-1">{error}</p>
              <button onClick={runAudit} className="mt-4 text-violet-400 underline text-sm">
                Try Again
              </button>
            </motion.div>
          )}

          {/* Results state */}
          {!loading && audit && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Summary banner */}
              <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-xl p-4">
                <p className="text-slate-200 leading-relaxed">{audit.summary}</p>
              </div>

              {/* Insight cards */}
              <div className="space-y-3">
                {audit.insights?.map((insight, i) => {
                  const config = INSIGHT_CONFIG[insight.type] || INSIGHT_CONFIG.trend;
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-gradient-to-r ${config.bg} border ${config.border} rounded-xl p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 shrink-0 ${config.iconColor}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wider ${config.labelColor}`}>
                              {config.label}
                            </span>
                          </div>
                          <p className="text-slate-200 font-medium text-sm">{insight.title}</p>
                          <p className="text-slate-400 text-sm mt-1 leading-relaxed">{insight.detail}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-600 text-center">
                Generated by Groq Llama 3.3 · Refresh to re-analyze · Data is processed securely
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
