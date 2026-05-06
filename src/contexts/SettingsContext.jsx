import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext({});

export const SettingsProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('finance_currency') || '₹';
  });
  
  const [privacyMode, setPrivacyMode] = useState(() => {
    return localStorage.getItem('finance_privacy') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('finance_currency', currency);
    localStorage.setItem('finance_privacy', privacyMode);
  }, [currency, privacyMode]);

  return (
    <SettingsContext.Provider value={{ currency, setCurrency, privacyMode, setPrivacyMode }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
