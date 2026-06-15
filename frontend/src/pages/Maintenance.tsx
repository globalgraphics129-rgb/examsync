import { motion } from 'framer-motion';
import Logo from '../components/ui/Logo';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md space-y-8"
      >
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        
        <div className="space-y-4">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border-4 border-amber-500/20">
            <span className="material-symbols-outlined text-4xl text-amber-500 animate-pulse">engineering</span>
          </div>
          <h1 className="text-4xl font-black text-on-surface tracking-tight">Scheduled Maintenance</h1>
          <p className="text-on-surface-variant text-lg">
            ExamSync is currently undergoing scheduled updates to improve your experience. We'll be back online shortly.
          </p>
        </div>

        <div className="pt-8 border-t border-outline/10">
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest mb-4">Follow us for updates</p>
          <div className="flex justify-center gap-6">
            <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">alternate_email</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">share</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Maintenance;
