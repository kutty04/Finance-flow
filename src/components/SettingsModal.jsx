import { motion } from 'framer-motion';
import { X, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';

export function SettingsModal({ onClose }) {
  const { currency, setCurrency, privacyMode, setPrivacyMode } = useSettings();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon size={20} className="text-primary" />
            Account Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-medium text-white">
                {user?.user_metadata?.name || 'User'}
              </p>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Preferences */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Display Currency</label>
            <div className="grid grid-cols-3 gap-2">
              {['₹', '$', '€'].map(sym => (
                <button
                  key={sym}
                  onClick={() => setCurrency(sym)}
                  className={`py-2 rounded-lg font-medium border transition-colors ${
                    currency === sym 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Privacy Mode</p>
              <p className="text-xs text-slate-500">Hide sensitive balances</p>
            </div>
            <button 
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${privacyMode ? 'bg-primary' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${privacyMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <hr className="border-border" />

          {/* Danger Zone */}
          <div>
            <p className="text-sm font-medium text-danger mb-2">Danger Zone</p>
            <button
              onClick={async () => {
                if (window.confirm("WARNING: This will permanently delete ALL your transactions and budgets. Are you sure?")) {
                  await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                  await supabase.from('budgets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                  alert("All data wiped.");
                  window.location.reload();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 text-sm font-medium transition-colors mb-3"
            >
              Erase All Data
            </button>
          </div>

          <hr className="border-border" />

          {/* Actions */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 font-medium transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
