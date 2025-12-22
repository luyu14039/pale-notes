import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, BookOpen, Zap, Map } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

const SLIDES = [
  {
    title: "欢迎来到苍白笔记",
    icon: <BookOpen size={48} className="text-accent-lantern" />,
    content: (
      <div className="space-y-4">
        <p>这是一个由 <strong>LLM (大语言模型)</strong> 驱动的文字角色扮演游戏。</p>
        <p>在这里，没有固定的剧本。你的每一个选择，都会被 AI 实时演绎，编织出独一无二的故事。</p>
        <p className="text-sm text-text-muted italic">"在1900s的伦敦阴影下，凡俗的职责与隐秘的渴望交织..."</p>
      </div>
    )
  },
  {
    title: "核心机制：性相与资源",
    icon: <Zap size={48} className="text-accent-grail" />,
    content: (
      <div className="space-y-4">
        <p>你需要管理三种核心资源：</p>
        <ul className="list-disc list-inside space-y-2 text-left pl-4">
          <li><span className="text-accent-lantern">资金</span>：世俗的通行证，开启特殊的机遇。</li>
          <li><span className="text-accent-grail">健康</span>：肉体的容器，耗尽可能导致永久的改变。</li>
          <li><span className="text-accent-moth">理智</span>：认知的边界，归零并非终结，而是通往不可名状的疯狂与飞升。</li>
        </ul>
        <p className="text-sm text-text-secondary mt-2">
          <span className="text-accent-lantern">提示：</span> 资源归零并不意味着游戏失败（Game Over），而是引导故事走向不同的结局。请享受这段跌宕起伏的旅程，而非将其视为单纯的生存挑战。
        </p>
        <p>同时，你的行为会积累不同的<strong>性相</strong>，如灯、铸、刃等，这将决定你擅长的领域。</p>
      </div>
    )
  },
  {
    title: "自由探索与抉择",
    icon: <Map size={48} className="text-accent-edge" />,
    content: (
      <div className="space-y-4">
        <p>目前游戏仅支持<strong>预设选项</strong>，但你的每一个选择都会影响故事的走向。</p>
        <p>想尝试一些疯狂的想法？或者另辟蹊径？</p>
        <p>请期待后续版本更新，届时将支持自由输入行动。</p>
        <div className="p-2 bg-surface/30 rounded text-xs font-mono border-l-2 border-accent-lantern">
          提示: 善用物品栏中的道具，它们往往是解谜的关键。
        </div>
      </div>
    )
  }
];

export function TutorialModal({ onClose }: TutorialModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md bg-surface border border-accent-lantern/20 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
          <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
            新手引导 {currentSlide + 1}/{SLIDES.length}
          </span>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col items-center text-center overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center space-y-6"
            >
              <div className="p-4 bg-black/30 rounded-full border border-white/5 shadow-inner">
                {SLIDES[currentSlide].icon}
              </div>
              
              <h3 className="text-xl font-serif font-bold text-accent-lantern">
                {SLIDES[currentSlide].title}
              </h3>
              
              <div className="text-sm md:text-base text-text-secondary leading-relaxed font-serif">
                {SLIDES[currentSlide].content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer / Navigation */}
        <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center">
          <button 
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`p-2 rounded hover:bg-white/5 transition-colors ${currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronLeft size={24} className="text-text-muted" />
          </button>

          <div className="flex gap-2">
            {SLIDES.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-accent-lantern w-4' : 'bg-white/20'}`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-accent-lantern/10 hover:bg-accent-lantern/20 text-accent-lantern rounded border border-accent-lantern/30 transition-all text-sm font-bold"
          >
            {currentSlide === SLIDES.length - 1 ? '开始旅程' : '下一步'}
            {currentSlide < SLIDES.length - 1 && <ChevronRight size={16} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
