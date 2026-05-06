import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error; 
      
      setTransactions(data || []);
    } catch (err) {
      console.error('Supabase fetch failed:', err.message);
      setTransactions([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return { transactions, loading, setTransactions, refetch: fetchTransactions };
}
