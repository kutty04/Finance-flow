import { useState } from 'react';
import { LayoutDashboard, ReceiptText, PieChart, Wallet, Sparkles, X, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { SettingsModal } from './SettingsModal';

export function Layout({ children, currentView, setCurrentView }) {
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'budgets', label: 'Budgets', icon: Wallet },
    { id: 'ai-audit', label: 'AI Advisor', icon: Sparkles },
  ];

  const handleNavClick = (id) => {
    setCurrentView(id);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex w-64 border-r border-border bg-surface flex-col shrink-0">
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
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative",
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

      {/* ── Mobile Top Header Bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-surface border-b border-border flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          FinanceFlow
        </h1>
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* ── Mobile Slide-in Drawer ── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              onClick={() => setMobileDrawerOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-surface border-r border-border z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  FinanceFlow
                </h1>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      )}
                    >
                      <Icon size={20} className={isActive ? "text-primary" : "text-slate-400"} />
                      <span className="text-base">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Drawer User Profile */}
              <div className="p-4 border-t border-border">
                <button
                  onClick={() => { setShowSettings(true); setMobileDrawerOpen(false); }}
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto bg-background pt-14 md:pt-0 pb-16 md:pb-0">
        {children}
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-surface border-t border-border flex justify-around items-center py-2 z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 flex-1 py-1 transition-colors",
                isActive ? "text-primary" : "text-slate-400 active:text-slate-200"
              )}
            >
              <Icon size={22} />
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
