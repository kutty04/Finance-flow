import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*');

      if (error) throw error;
      setBudgets(data || []);
    } catch (err) {
      console.error('Supabase budget fetch failed', err);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  return { budgets, loading, refetch: fetchBudgets };
}
