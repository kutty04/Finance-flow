import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, PieChart, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthModal } from '../components/AuthModal';

export function Landing() {
  const [showAuth, setShowAuth] = useState(false);

  const features = [
    {
      icon: BrainCircuit,
      title: 'AI Spending Clusters',
      desc: 'Our K-Means machine learning algorithm automatically detects hidden patterns in your spending habits without any manual tagging.',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      icon: Wallet,
      title: 'Smart Budgets',
      desc: 'Set strict limits on specific categories. Watch real-time progress bars turn from green to red as you approach your monthly limits.',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      icon: PieChart,
      title: 'Visual Analytics',
      desc: 'Beautiful, interactive charts that break down your income vs. expenses so you always know exactly where your money is going.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl w-full z-10 space-y-16">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-300 mb-4">
            <ShieldCheck size={16} className="text-emerald-400" />
            Your data is secured with Supabase RLS
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
            Take Control of Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
              Financial Future
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop wondering where your money went. FinanceFlow uses advanced visual analytics and AI clustering to give you total clarity on your wealth.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAuth(true)}
            className="mt-8 px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] flex items-center gap-2 mx-auto"
          >
            Enter Dashboard <ArrowRight size={20} />
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 pt-12 border-t border-border/50">
          {features.map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:bg-surface transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feat.bg} mb-6`}>
                <feat.icon className={feat.color} size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
