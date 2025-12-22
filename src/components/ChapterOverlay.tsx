import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/game';

const CHAPTER_TITLES: Record<number, string> = {
  0: "序章：灰雾中的访客",
  1: "第一章：夜之皮",
  2: "第二章：漫宿的低语",
  3: "第三章：飞升之仪"
};

export function ChapterOverlay() {
  const { story } = useGameStore();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");

  useEffect(() => {
    const title = CHAPTER_TITLES[story.currentChapter] || `第 ${story.currentChapter} 章`;
    setCurrentTitle(title);
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000); // Show for 4 seconds

    return () => clearTimeout(timer);
  }, [story.currentChapter]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 pointer-events-none"
        >
          <div className="text-center space-y-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-px bg-gradient-to-r from-transparent via-accent-lantern to-transparent mx-auto max-w-md"
            />
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-4xl md:text-6xl font-serif text-text-primary tracking-widest font-bold"
            >
              {currentTitle}
            </motion.h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-px bg-gradient-to-r from-transparent via-accent-lantern to-transparent mx-auto max-w-md"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
