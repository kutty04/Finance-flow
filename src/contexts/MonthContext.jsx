import { createContext, useContext, useState } from 'react';

const MonthContext = createContext();

export function MonthProvider({ children }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7); // Returns "YYYY-MM"
  });

  return (
    <MonthContext.Provider value={{ selectedMonth, setSelectedMonth }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  return useContext(MonthContext);
}
