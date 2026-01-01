import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

export function NewYearModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkDateAndShow = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // 0-indexed
      const day = now.getDate();

      // Check if date is between 2026.1.1 and 2026.1.7
      // For debugging: You can manually set the date or force show
      const isTime = (year === 2026 && month === 1 && day >= 1 && day <= 7);
      
      // Check if already seen
      const hasSeen = localStorage.getItem('has_seen_new_year_2026');

      if (isTime && !hasSeen) {
        setIsOpen(true);
      }
    };

    checkDateAndShow();

    // Expose debug function to window
    // @ts-ignore
    window.showNewYearModal = () => {
      localStorage.removeItem('has_seen_new_year_2026');
      setIsOpen(true);
      console.log("New Year Modal Forced Open");
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('has_seen_new_year_2026', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-neutral-900 border border-accent-lantern/30 shadow-[0_0_50px_rgba(234,179,8,0.1)] rounded-lg overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2 text-accent-lantern">
                <Sparkles size={20} />
                <h2 className="font-serif font-bold tracking-wider">2026 新年快乐</h2>
              </div>
              <button 
                onClick={handleClose}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 text-center space-y-6 font-serif text-text-secondary leading-relaxed">
              <p className="text-lg text-accent-lantern font-bold">
                2026年快乐！祝大家元旦快乐！
              </p>
              
              <div className="space-y-2 text-sm md:text-base">
                <p>
                  很高兴我考试周做的这个小东西
                </p>
                <p>
                  能获得这么多人的喜爱，
                </p>
                <p>
                  希望在新的一年也能多多做出
                </p>
                <p>
                  这些大家喜爱，我也喜爱的小东西。
                </p>
              </div>

              <p className="text-accent-lantern/80 pt-2">
                新的一年还望大家多多关照
              </p>
            </div>

            {/* Footer Decoration */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-accent-lantern/50 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
