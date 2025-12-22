import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Option {
  id: string;
  text: string;
  style?: 'lantern' | 'forge' | 'edge' | 'winter' | 'heart' | 'grail' | 'moth' | 'knock' | 'neutral' | 'story';
  disabled?: boolean;
}

interface ChoicePanelProps {
  options: Option[];
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const styleMap = {
  lantern: 'border-accent-lantern text-accent-lantern hover:bg-accent-lantern/10',
  forge: 'border-accent-grail text-accent-grail hover:bg-accent-grail/10', // 暂用红色
  edge: 'border-accent-edge text-accent-edge hover:bg-accent-edge/10',
  winter: 'border-accent-winter text-accent-winter hover:bg-accent-winter/10',
  heart: 'border-accent-grail text-accent-grail hover:bg-accent-grail/10', // 暂用红色
  grail: 'border-accent-grail text-accent-grail hover:bg-accent-grail/10',
  moth: 'border-accent-moth text-accent-moth hover:bg-accent-moth/10',
  knock: 'border-accent-mansus text-accent-mansus hover:bg-accent-mansus/10',
  neutral: 'border-text-muted text-text-primary hover:bg-text-muted/10',
  story: 'border-text-primary text-text-primary bg-surface/80 hover:bg-surface hover:border-accent-lantern font-bold tracking-wide',
};

export function ChoicePanel({ options, onSelect, disabled }: ChoicePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-expand when options change
  useEffect(() => {
    if (options.length > 0) {
      setIsExpanded(true);
    }
  }, [options]);

  if (options.length === 0) return null;

  return (
    <div className="border-t border-text-muted/20 bg-black/40 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.3)] transition-all duration-300">
      {/* Toggle Handle */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center p-2 text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 md:p-6 pt-0 flex flex-col gap-3 max-w-3xl mx-auto">
              <div className="text-xs font-serif text-text-muted uppercase tracking-[0.3em] text-center mb-4 opacity-60">
                — 抉择 —
              </div>
              {options.map((opt, index) => {
                const isDisabled = disabled || opt.disabled;
                return (
                  <motion.button
                    key={opt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => !isDisabled && onSelect(opt.id)}
                    disabled={isDisabled}
                    className={`
                      w-full p-4 text-left border rounded-sm transition-all duration-300 font-serif text-base md:text-lg relative overflow-hidden group
                      ${styleMap[opt.style || 'neutral']}
                      ${isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-lg hover:-translate-y-0.5'}
                    `}
                  >
                    <span className="relative z-10 flex items-center justify-between">
                      <span className="flex items-center gap-3">
                        <span className="opacity-50 text-xs transition-transform group-hover:rotate-45">◇</span>
                        {opt.text}
                      </span>
                      {!isDisabled && <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm font-mono">→</span>}
                    </span>
                    {!isDisabled && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
