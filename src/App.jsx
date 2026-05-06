import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { Budgets } from './pages/Budgets';
import { Landing } from './pages/Landing';
import { Layout } from './components/Layout';
import { MonthProvider } from './contexts/MonthContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Loader2 } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return (
    <MonthProvider>
      <Layout currentView={currentView} setCurrentView={setCurrentView}>
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'transactions' && <Transactions />}
        {currentView === 'analytics' && <Analytics />}
        {currentView === 'budgets' && <Budgets />}
      </Layout>
    </MonthProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainApp />
      </SettingsProvider>
    </AuthProvider>
  );
}
