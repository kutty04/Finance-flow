import { useState } from 'react';
import { LayoutDashboard, ReceiptText, PieChart, Wallet, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { SettingsModal } from './SettingsModal';

export function Layout({ children, currentView, setCurrentView }) {
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'budgets', label: 'Budgets', icon: Wallet },
    { id: 'ai-audit', label: 'AI Advisor', icon: Sparkles },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            FinanceFlow
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <Icon size={20} className={isActive ? "text-primary" : "text-slate-400"} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" 
                  />
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center space-x-3 w-full hover:bg-slate-800/50 p-2 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.user_metadata?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface border-t border-border flex justify-around p-4 z-50">
         {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  "flex flex-col items-center space-y-1",
                  isActive ? "text-primary" : "text-slate-400"
                )}
              >
                <Icon size={24} />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
      </nav>
    </div>
  );
}
