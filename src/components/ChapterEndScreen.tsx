import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/game';
import { Clock, RotateCcw } from 'lucide-react';

export function ChapterEndScreen() {
  const { returnToTitle } = useGameStore();

  return (
    <div className="h-screen w-full bg-background text-text-primary flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/images/texture-paper.png')] opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-background/90 to-background pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-2xl text-center space-y-8 border border-accent-lantern/20 bg-black/40 p-8 md:p-12 rounded-sm backdrop-blur-sm"
      >
        <div className="space-y-4">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-accent-lantern tracking-widest">
            第一章：完
          </h1>
          <h2 className="font-serif text-xl md:text-2xl text-text-secondary italic">
            Chapter I: Completed
          </h2>
        </div>

        <div className="h-px w-32 bg-gradient-to-r from-transparent via-text-muted/50 to-transparent mx-auto" />

        <div className="space-y-6 text-text-muted font-serif leading-relaxed">
          <p>
            你已走到了当前旅途的终点。
            <br />
            但这并非故事的结束，只是暂时的休憩。
          </p>
          
          <div className="flex flex-col items-center gap-3 py-4 bg-surface/20 rounded border border-text-muted/10">
            <Clock className="text-accent-moth animate-pulse" size={24} />
            <p className="text-sm font-mono text-accent-moth">
              第二章将于一周后发布
            </p>
            <p className="text-xs opacity-60">
              (Next chapter coming in 7 days)
            </p>
          </div>

          <p>
            与此同时，为何不尝试一种新的身份？
            <br />
            不同的出身与抉择，将引领你走向截然不同的命运。
          </p>
        </div>

        <button
          onClick={returnToTitle}
          className="group flex items-center justify-center gap-3 w-full py-4 mt-8 bg-accent-lantern/10 border border-accent-lantern/30 text-accent-lantern hover:bg-accent-lantern/20 hover:border-accent-lantern transition-all font-serif tracking-widest uppercase text-sm font-bold"
        >
          <RotateCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500" />
          返回标题 (Return to Title)
        </button>
      </motion.div>
    </div>
  );
}
