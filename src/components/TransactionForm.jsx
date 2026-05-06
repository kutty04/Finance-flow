import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../lib/constants';
import { X, Loader2, Camera } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export function TransactionForm({ onClose, onSuccess, initialData }) {
  const { currency } = useSettings();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  
  // If initialData exists, we are EDITING. If not, we are CREATING.
  const [formData, setFormData] = useState(initialData || {
    amount: '',
    type: 'expense',
    category: CATEGORIES[0].label,
    description: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    is_recurring: false,
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "You are a receipt scanner. Return ONLY a valid JSON object with four keys: 'amount' (number), 'category' (exactly one of: Food & Dining, Transport, Shopping, Entertainment, Health, Utilities, EMI / Loan, Subscriptions, Education, Other), 'description' (2-4 words), and 'date' (YYYY-MM-DD). Do not include any conversational text, newlines, or markdown. Start with { and end with }."
                  },
                  {
                    type: "image_url",
                    image_url: { url: base64Image }
                  }
                ]
              }
            ],
            temperature: 0,
            max_tokens: 1024,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || "Failed to scan image");
        }

        const data = await response.json();
        let resultText = data.choices[0].message.content.trim();
        
        try {
          // 1. Sanitize smart quotes (AI sometimes uses ” instead of ") which causes "Unterminated string"
          resultText = resultText.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

          // 2. Remove markdown blocks if they still appear
          if (resultText.startsWith('```')) {
            const match = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (match) resultText = match[1];
          }

          // 3. Fallback extraction if there's trailing text
          const firstBrace = resultText.indexOf('{');
          const lastBrace = resultText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            resultText = resultText.substring(firstBrace, lastBrace + 1);
          }

          const parsed = JSON.parse(resultText);

          setFormData(prev => ({
            ...prev,
            amount: parsed.amount || prev.amount,
            category: parsed.category || prev.category,
            description: parsed.description || prev.description,
            date: parsed.date || prev.date,
            type: 'expense'
          }));
        } catch (parseError) {
          console.error("Original Parse Error:", parseError);
          console.error("Raw AI Output:", resultText);
          alert(`Parse Error: ${parseError.message}\n\nCheck console for details.`);
          throw parseError;
        }
      };
    } catch (err) {
      console.error(err);
      alert("AI Scan failed: " + err.message);
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';

      const payload = {
        user_id: userId,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.type === 'income' ? 'Income' : formData.category,
        description: formData.description,
        date: formData.date,
        is_recurring: formData.type === 'income' ? false : formData.is_recurring,
      };

      if (initialData?.id) {
        // UPDATE existing row
        const { error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        // INSERT new row
        const { error } = await supabase
          .from('transactions')
          .insert([payload]);
        if (error) throw error;
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error.message);
      alert('Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
            {initialData ? 'Edit Transaction' : 'Add Transaction'}
            {!initialData && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-full transition-colors disabled:opacity-50"
              >
                {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                {isScanning ? 'Scanning...' : 'AI Scan'}
              </button>
            )}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={20} />
          </button>
        </div>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          hidden 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Type Toggle */}
          <div className="flex rounded-lg bg-slate-900 p-1">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                formData.type === 'expense' ? 'bg-danger text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setFormData({ ...formData, type: 'expense' })}
            >
              Expense
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                formData.type === 'income' ? 'bg-success text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setFormData({ ...formData, type: 'income' })}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Amount ({currency})</label>
            <input
              required
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="0.00"
            />
          </div>

          {/* Category & Date Row */}
          <div className="grid grid-cols-2 gap-4">
            {formData.type === 'expense' && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.label} value={cat.label}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className={formData.type === 'income' ? "col-span-2" : ""}>
              <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
              <input
                required
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-primary"
              placeholder="e.g., Grocery shopping"
            />
          </div>

          {/* Recurring Checkbox */}
          {formData.type === 'expense' && (
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is_recurring"
                name="is_recurring"
                checked={formData.is_recurring}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-700 text-primary focus:ring-primary bg-slate-900"
              />
              <label htmlFor="is_recurring" className="text-sm text-slate-300">
                This is a recurring bill/subscription
              </label>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-lg mt-6 transition-colors flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}
