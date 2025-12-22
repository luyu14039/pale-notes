import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Star, ExternalLink, X } from 'lucide-react';

const STORAGE_KEY_VISITS = 'pale_notes_visit_count';
const STORAGE_KEY_MODAL_SHOWN = 'pale_notes_star_modal_shown';

export const StarRequestModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if modal has already been shown
    const hasShown = localStorage.getItem(STORAGE_KEY_MODAL_SHOWN);
    if (hasShown) return;

    // Increment visit count
    const currentVisits = parseInt(localStorage.getItem(STORAGE_KEY_VISITS) || '0');
    const newVisits = currentVisits + 1;
    localStorage.setItem(STORAGE_KEY_VISITS, newVisits.toString());

    // Show modal if visits >= 2
    if (newVisits >= 2) {
      // Small delay to not startle the user immediately
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(STORAGE_KEY_MODAL_SHOWN, 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-neutral-900 border border-accent-lantern/30 rounded-lg max-w-2xl w-full shadow-[0_0_50px_rgba(234,179,8,0.1)] overflow-hidden relative"
        >
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={24} />
          </button>

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6 text-accent-lantern">
              <Star className="fill-accent-lantern" size={32} />
              <h2 className="text-2xl font-serif font-bold tracking-wider">漫宿的低语...</h2>
            </div>

            <p className="text-text-secondary mb-8 leading-relaxed font-serif">
              看来您已经多次造访这片迷雾笼罩的伦敦。如果您喜欢这段旅程，能否在 GitHub 上为我们点亮一颗星？这如同灯相的光辉，将指引我们继续前行。
            </p>

            <div className="flex justify-center mb-10">
              <a
                href="https://github.com/luyu14039/pale-notes" // TODO: Replace with actual repo URL if known, otherwise user needs to update
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-accent-lantern text-black font-bold rounded hover:bg-accent-lantern/90 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Github size={20} />
                <span>Star on GitHub</span>
              </a>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">
                更多来自作者的神秘学研究
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <a 
                  href="https://github.com/luyu14039/Hush-House"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 bg-white/5 rounded border border-white/5 hover:border-accent-lantern/30 transition-all hover:bg-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-accent-lantern group-hover:underline">Hush House / 噤声书屋</span>
                    <ExternalLink size={14} className="opacity-50" />
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    基于 LLM 的《密教模拟器》与《司辰之书》沉浸式可视化阅读器与知识图谱。
                  </p>
                </a>

                <a 
                  href="https://github.com/luyu14039/Which-hour-will-you-serve"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 bg-white/5 rounded border border-white/5 hover:border-accent-lantern/30 transition-all hover:bg-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-accent-lantern group-hover:underline">Which Hour Will You Serve?</span>
                    <ExternalLink size={14} className="opacity-50" />
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    探索你的灵魂归属。一个基于司辰特质的心理测试与命运指引。
                  </p>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
