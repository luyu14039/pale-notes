import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, AspectState } from '@/stores/game';
import { useMetaStore } from '@/stores/meta';
import { useUIStore } from '@/stores/ui';
import { Trophy, Book, Map, Settings } from 'lucide-react';
import { TutorialModal } from '@/components/TutorialModal';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { DebugPanel } from '@/components/DebugPanel';
import { StarRequestModal } from '@/components/StarRequestModal';

const ASPECTS: { key: keyof AspectState; label: string; desc: string; color: string }[] = [
  { key: 'lantern', label: '灯', desc: '理智，光明，残酷的真理', color: 'text-yellow-400' },
  { key: 'forge', label: '铸', desc: '力量，改变，火焰', color: 'text-orange-500' },
  { key: 'edge', label: '刃', desc: '斗争，征服，痛苦', color: 'text-green-400' },
  { key: 'winter', label: '冬', desc: '寂静，终结，寒冷', color: 'text-blue-200' },
  { key: 'heart', label: '心', desc: '生命，保存，永恒的跳动', color: 'text-red-400' },
  { key: 'grail', label: '杯', desc: '欲望，诱惑，感官', color: 'text-red-600' },
  { key: 'moth', label: '蛾', desc: '混乱，自然，难以捉摸', color: 'text-amber-200' },
  { key: 'knock', label: '启', desc: '开启，秘密，界限', color: 'text-purple-400' },
];

const ORIGINS = [
  { id: 'rich', title: '富家子弟', desc: '家族显赫，衣食无忧。', bonus: { funds: 30, sanity: -1 } },
  { id: 'doctor', title: '医师', desc: '追求理性与科学。', bonus: { sanity: 1, lantern: 1 } },
  { id: 'detective', title: '警探', desc: '追踪罪恶，身经百战。', bonus: { health: 1, edge: 1 } }
];

const CHILDHOODS = [
  { id: 'bookworm', title: '书虫', desc: '埋首于书堆之中。', bonus: { lantern: 1 } },
  { id: 'urchin', title: '街头顽童', desc: '学会了生存的法则。', bonus: { edge: 1 } },
  { id: 'aristocrat', title: '深闺/贵族', desc: '学会了礼仪与伪装。', bonus: { funds: 10 } }
];

const TRAITS = [
  { id: 'dreamer', title: '清醒梦者', desc: '在梦中保持清醒。', bonus: { moth: 1 } },
  { id: 'survivor', title: '幸存者', desc: '死神拒绝了你。', bonus: { winter: 1 } },
  { id: 'curious', title: '窥视者', desc: '忍不住打开锁着的门。', bonus: { knock: 1 } }
];

const MAX_POINTS = 9;

export function StartScreen() {
  const { setAspects, setResources, setOrigin, setStoryState, startGame, addItem, resetGame, story } = useGameStore();
  const { completedOrigins, maxChapterReached, keyEventsWitnessed } = useMetaStore();
  const { setApiKeyModalOpen, showTutorial, setShowTutorial } = useUIStore();
  const [step, setStep] = useState<'intro' | 'creation'>('intro');
  const hasSave = story.origin !== null;
  
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      // Delay slightly to let the intro animation play a bit
      const timer = setTimeout(() => setShowTutorial(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };
  
  const [allocations, setAllocations] = useState<AspectState>({
    lantern: 0, forge: 0, edge: 0, winter: 0, heart: 0, grail: 0, moth: 0, knock: 0,
  });

  const [selection, setSelection] = useState<{
    origin: string;
    childhood: string;
    uniqueTrait: string;
    name: string;
    gender: string;
    appearance: string;
  }>({
    origin: 'rich',
    childhood: 'bookworm',
    uniqueTrait: 'dreamer',
    name: '无名氏',
    gender: '其他',
    appearance: '迷雾中的身影。'
  });

  const totalPointsUsed = Object.values(allocations).reduce((a, b) => a + b, 0);
  const remainingPoints = MAX_POINTS - totalPointsUsed;

  // Calculate Final Stats
  const finalStats = useMemo(() => {
    // Base Stats
    let stats = {
      health: 3, maxHealth: 3,
      sanity: 3, maxSanity: 3,
      funds: 10,
      aspects: { ...allocations }
    };

    // Apply Narrative Bonuses
    const origin = ORIGINS.find(o => o.id === selection.origin);
    const childhood = CHILDHOODS.find(c => c.id === selection.childhood);
    const trait = TRAITS.find(t => t.id === selection.uniqueTrait);

    [origin, childhood, trait].forEach(item => {
      if (!item) return;
      // @ts-ignore
      if (item.bonus.funds) stats.funds += item.bonus.funds;
      // @ts-ignore
      if (item.bonus.health) { stats.health += item.bonus.health; stats.maxHealth += item.bonus.health; }
      // @ts-ignore
      if (item.bonus.sanity) { stats.sanity += item.bonus.sanity; stats.maxSanity += item.bonus.sanity; }
      
      // Add aspect bonuses from background to the total aspects
      Object.keys(item.bonus).forEach(key => {
        if (key in stats.aspects) {
          stats.aspects[key as keyof AspectState] += (item.bonus as any)[key];
        }
      });
    });

    // Apply Aspect Bonuses to Dimensions
    // Heart/Edge/Forge -> Health
    const healthBonus = Math.floor((stats.aspects.heart * 1 + stats.aspects.edge * 0.5 + stats.aspects.forge * 0.5));
    stats.maxHealth += healthBonus;
    stats.health += healthBonus;

    // Lantern/Winter/Knock -> Sanity
    const sanityBonus = Math.floor((stats.aspects.lantern * 1 + stats.aspects.winter * 0.5 + stats.aspects.knock * 0.5));
    stats.maxSanity += sanityBonus;
    stats.sanity += sanityBonus;

    // Grail/Moth -> Funds
    const fundsBonus = (stats.aspects.grail + stats.aspects.moth) * 2;
    stats.funds += fundsBonus;

    return stats;
  }, [allocations, selection]);

  const handleIncrement = (key: keyof AspectState) => {
    if (remainingPoints > 0) {
      setAllocations(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
  };

  const handleDecrement = (key: keyof AspectState) => {
    if (allocations[key] > 0) {
      setAllocations(prev => ({ ...prev, [key]: prev[key] - 1 }));
    }
  };

  const handleStart = () => {
    // Reset previous game state before applying new configuration
    resetGame();
    
    // Set Player Profile
    useGameStore.getState().setPlayerProfile(selection.name, selection.gender as any, selection.appearance);

    setAspects(finalStats.aspects);
    setResources({ 
      funds: finalStats.funds, 
      health: finalStats.health, 
      maxHealth: finalStats.maxHealth, 
      sanity: finalStats.sanity, 
      maxSanity: finalStats.maxSanity 
    });
    
    setOrigin(selection.origin as any);
    setStoryState({ childhood: selection.childhood, uniqueTrait: selection.uniqueTrait });

    // Add items based on origin
    if (selection.origin === 'rich') {
      addItem({ id: 'family_crest', name: '烧焦的家徽', description: '曾经是荣耀的象征。', tags: ['remnant'] });
    } else if (selection.origin === 'doctor') {
      addItem({ id: 'scalpel', name: '沾血的手术刀', description: '它切开过太多秘密。', tags: ['tool', 'weapon'] });
    } else if (selection.origin === 'detective') {
      addItem({ id: 'tarot_card', name: '无瞳之眼', description: '一张塔罗牌。', tags: ['clue'] });
    }

    addItem({ id: 'journal', name: '陈旧的笔记', description: '记录着你最初的疑问与疯狂。', tags: ['tool', 'record'] });
    
    startGame();
  };

  const renderIntro = () => {
    return (
    <div className="h-screen w-full overflow-y-auto relative bg-background text-text-primary">
      <ApiKeyModal />
      <StarRequestModal />
      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        className="fixed inset-0 bg-neutral-900 pointer-events-none"
      />

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setApiKeyModalOpen(true)}
        className="fixed top-4 right-4 p-2 text-text-muted hover:text-accent-lantern transition-colors z-20"
        title="API Key Settings"
      >
        <Settings size={24} />
      </motion.button>

      <div className="min-h-full w-full flex flex-col items-center justify-center p-6 md:p-8 pb-48 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative text-center z-10 w-full max-w-md md:max-w-none"
        >
          <h1 className="text-5xl md:text-8xl font-serif text-accent-lantern font-bold tracking-[0.2em] drop-shadow-[0_0_15px_rgba(234,179,8,0.3)] mb-2 break-words">
            苍白卷宗
          </h1>
          <div className="h-px w-24 md:w-32 bg-gradient-to-r from-transparent via-accent-lantern/50 to-transparent mx-auto" />
          <p className="text-xs md:text-sm font-mono text-accent-lantern/60 mt-4 tracking-widest uppercase">
            PALE NOTES
          </p>
        </motion.div>

        {/* Records Section */}
        {(completedOrigins.length > 0 || maxChapterReached > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 z-10 text-text-muted text-[10px] md:text-xs font-mono uppercase tracking-wider"
          >
            <div className="flex items-center gap-2" title="已完成的序章">
              <Trophy size={14} className="text-accent-grail" />
              <span>Origins: {completedOrigins.length}/{ORIGINS.length}</span>
            </div>
            <div className="flex items-center gap-2" title="最高到达章节">
              <Book size={14} className="text-accent-lantern" />
              <span>Max Chapter: {maxChapterReached}</span>
            </div>
            <div className="flex items-center gap-2" title="经历的关键情节">
              <Map size={14} className="text-accent-edge" />
              <span>Key Events: {keyEventsWitnessed.length}</span>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="space-y-6 text-lg text-text-secondary leading-relaxed font-serif bg-black/40 p-10 rounded-sm border border-text-muted/10 backdrop-blur-md shadow-2xl max-w-2xl mt-8 z-10"
        >
          <p className="first-letter:text-4xl first-letter:font-bold first-letter:text-accent-lantern first-letter:mr-1">
            1900年代的伦敦，雾气中隐藏着不可名状的秘密。
          </p>
          <p>
            你将扮演一名被迫卷入超自然事件的防剿局探员。在凡俗的职责与隐秘的渴望之间挣扎，
            探索梦境中的漫宿，收集禁忌的知识，甚至建立自己的教团。
          </p>
          <p className="italic text-accent-moth border-l-2 border-accent-moth/30 pl-4">
            “这不是一个关于英雄的故事，而是一个关于代价的故事。”
          </p>
        </motion.div>
        
        <div className="flex flex-col md:flex-row gap-6 mt-12 z-10 items-center">
          {hasSave && (
            <motion.button
              whileHover={{ scale: 1.05, letterSpacing: "0.2em" }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="w-64 md:w-auto px-12 py-4 bg-accent-lantern/10 border border-accent-lantern/30 text-accent-lantern font-serif text-xl tracking-widest hover:bg-accent-lantern/20 hover:border-accent-lantern transition-all duration-500 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]"
            >
              继续旅程
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05, letterSpacing: "0.2em" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetGame();
              setStep('creation');
            }}
            className={`w-64 md:w-auto px-12 py-4 border font-serif text-xl tracking-widest transition-all duration-500
              ${hasSave 
                ? 'bg-black/40 border-text-secondary/30 text-text-secondary hover:bg-text-secondary/10 hover:border-text-secondary hover:text-text-primary' 
                : 'bg-accent-lantern/10 border-accent-lantern/30 text-accent-lantern hover:bg-accent-lantern/20 hover:border-accent-lantern shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]'
              }
            `}
          >
            新的开始
          </motion.button>
        </div>
      </div>

      {/* API Key Prompt - Fixed Position, No Animation */}
      <div className="fixed top-4 left-4 z-[60] flex justify-center pointer-events-none">
        <div 
          onClick={() => setApiKeyModalOpen(true)}
          className="cursor-pointer pointer-events-auto bg-black/80 border border-accent-forge/50 text-accent-forge px-4 py-2 rounded shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:bg-accent-forge/10 transition-colors max-w-xs text-left backdrop-blur-sm"
        >
          <p className="font-bold text-xs mb-0.5">⚠ 配置 DeepSeek API Key</p>
          <p className="text-[10px] text-text-muted">公共 Key 额度有限，建议使用自己的 Key。</p>
        </div>
      </div>

      {/* Footer Info & Stats */}
      <div className="fixed bottom-2 w-full text-center z-50 flex flex-col items-center gap-1 pointer-events-none select-none">
        <div className="text-[10px] text-text-muted/30 font-serif tracking-wider px-4 flex flex-col gap-1">
          <p>基于 Weather Factory 作品二创 | 素材版权归原作者所有 | 仅供非商业交流</p>
          <div className="flex gap-4 justify-center pointer-events-auto">
            <a href="https://github.com/luyu14039/Hush-House" target="_blank" rel="noopener noreferrer" className="hover:text-accent-lantern transition-colors">Hush House</a>
            <span>•</span>
            <a href="https://github.com/luyu14039/Which-hour-will-you-serve" target="_blank" rel="noopener noreferrer" className="hover:text-accent-lantern transition-colors">Which Hour Will You Serve?</a>
          </div>
        </div>
        <div className="text-[10px] text-text-muted/40 font-mono flex justify-center gap-4">
          <span id="busuanzi_container_site_pv">
            Total Views: <span id="busuanzi_value_site_pv" className="text-text-muted/60">--</span>
          </span>
          <span className="opacity-30">|</span>
          <span id="busuanzi_container_site_uv">
            Visitors: <span id="busuanzi_value_site_uv" className="text-text-muted/60">--</span>
          </span>
        </div>
      </div>

      <DebugPanel />
    </div>
  );
  };

  const renderCreation = () => (
    <div className="h-screen bg-background text-text-primary p-4 font-serif overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 pb-12"
      >
        {/* Header */}
        <div className="lg:col-span-12 text-center space-y-2 mb-4">
          <h1 className="text-5xl font-bold text-accent-lantern tracking-widest drop-shadow-lg">苍白卷宗</h1>
          <p className="text-text-secondary text-lg tracking-widest uppercase">PALE NOTES</p>
        </div>

        {/* Left Column: Narrative Choices */}
        <div className="lg:col-span-3 space-y-6">
          {/* Character Profile Section */}
          <div className="bg-surface/10 p-6 rounded-sm border border-accent-lantern/20">
            <h3 className="text-xl font-bold text-accent-lantern mb-4 border-b border-accent-lantern/20 pb-2">人物设定</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">姓名</label>
                <input 
                  type="text" 
                  value={selection.name}
                  onChange={(e) => setSelection(s => ({ ...s, name: e.target.value }))}
                  className="w-full bg-black/30 border border-accent-lantern/30 rounded p-2 text-text-primary focus:border-accent-lantern outline-none"
                  placeholder="输入姓名..."
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">性别</label>
                <div className="flex gap-2">
                  {['男', '女', '其他'].map(g => (
                    <button
                      key={g}
                      onClick={() => setSelection(s => ({ ...s, gender: g as any }))}
                      className={`flex-1 py-1 px-2 text-xs border rounded capitalize ${
                        selection.gender === g 
                          ? 'bg-accent-lantern/20 border-accent-lantern text-accent-lantern' 
                          : 'bg-transparent border-transparent hover:bg-surface/20 text-text-secondary'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">外貌</label>
                <textarea 
                  value={selection.appearance}
                  onChange={(e) => setSelection(s => ({ ...s, appearance: e.target.value }))}
                  className="w-full bg-black/30 border border-accent-lantern/30 rounded p-2 text-text-primary focus:border-accent-lantern outline-none text-xs h-20 resize-none"
                  placeholder="描述你的角色..."
                />
              </div>
            </div>
          </div>

          <div className="bg-surface/10 p-6 rounded-sm border border-accent-lantern/20">
            <h3 className="text-xl font-bold text-accent-lantern mb-4 border-b border-accent-lantern/20 pb-2">出身</h3>
            <div className="space-y-2">
              {ORIGINS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelection(s => ({ ...s, origin: opt.id }))}
                  className={`w-full text-left p-3 rounded transition-all border ${
                    selection.origin === opt.id 
                      ? 'bg-accent-lantern/20 border-accent-lantern text-accent-lantern' 
                      : 'bg-transparent border-transparent hover:bg-surface/20 text-text-secondary'
                  }`}
                >
                  <div className="font-bold">{opt.title}</div>
                  <div className="text-xs opacity-70">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface/10 p-6 rounded-sm border border-accent-lantern/20">
            <h3 className="text-xl font-bold text-accent-lantern mb-4 border-b border-accent-lantern/20 pb-2">童年</h3>
            <div className="space-y-2">
              {CHILDHOODS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelection(s => ({ ...s, childhood: opt.id }))}
                  className={`w-full text-left p-3 rounded transition-all border ${
                    selection.childhood === opt.id 
                      ? 'bg-accent-lantern/20 border-accent-lantern text-accent-lantern' 
                      : 'bg-transparent border-transparent hover:bg-surface/20 text-text-secondary'
                  }`}
                >
                  <div className="font-bold">{opt.title}</div>
                  <div className="text-xs opacity-70">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface/10 p-6 rounded-sm border border-accent-lantern/20">
            <h3 className="text-xl font-bold text-accent-lantern mb-4 border-b border-accent-lantern/20 pb-2">特质</h3>
            <div className="space-y-2">
              {TRAITS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelection(s => ({ ...s, uniqueTrait: opt.id }))}
                  className={`w-full text-left p-3 rounded transition-all border ${
                    selection.uniqueTrait === opt.id 
                      ? 'bg-accent-lantern/20 border-accent-lantern text-accent-lantern' 
                      : 'bg-transparent border-transparent hover:bg-surface/20 text-text-secondary'
                  }`}
                >
                  <div className="font-bold">{opt.title}</div>
                  <div className="text-xs opacity-70">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Aspect Allocation */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-black/40 p-8 rounded-sm border border-accent-lantern/30 backdrop-blur-sm h-full">
            <div className="flex justify-between items-end mb-8 border-b border-accent-lantern/30 pb-4">
              <h2 className="text-2xl font-bold text-text-primary">性相调律</h2>
              <div className="text-right">
                <div className="text-sm text-text-secondary">剩余点数</div>
                <div className={`text-3xl font-mono font-bold ${remainingPoints === 0 ? 'text-green-500' : 'text-accent-lantern'}`}>
                  {remainingPoints}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {ASPECTS.map((aspect) => (
                <div
                  key={aspect.key}
                  className={`
                    p-3 rounded border transition-all flex flex-col gap-2
                    ${allocations[aspect.key] > 0 ? 'bg-surface/20 border-accent-lantern/40' : 'bg-surface/5 border-surface/10'}
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-bold ${aspect.color}`}>{aspect.label}</span>
                    <span className="font-mono text-xl">{finalStats.aspects[aspect.key]}</span>
                  </div>
                  <div className="text-xs text-text-secondary h-8 leading-tight">{aspect.desc}</div>
                  
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => handleDecrement(aspect.key)}
                      disabled={allocations[aspect.key] === 0}
                      className="flex-1 bg-surface/30 hover:bg-surface/50 disabled:opacity-20 rounded text-sm py-1"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleIncrement(aspect.key)}
                      disabled={remainingPoints === 0}
                      className="flex-1 bg-surface/30 hover:bg-surface/50 disabled:opacity-20 rounded text-sm py-1"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-xs text-text-secondary text-center italic">
              * 性相将影响你的初始属性：心/刃/铸 → 健康，灯/冬/启 → 理智，杯/蛾 → 资金
            </div>
          </div>
        </div>

        {/* Right Column: Stats Preview & Start */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-surface/10 p-6 rounded-sm border border-accent-lantern/20 flex-1">
            <h3 className="text-xl font-bold text-accent-lantern mb-6 border-b border-accent-lantern/20 pb-2">属性预览</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-text-secondary">资金</span>
                  <span className="text-accent-lantern font-mono text-xl">{finalStats.funds}</span>
                </div>
                <div className="h-2 bg-surface/30 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600" style={{ width: `${Math.min(100, finalStats.funds)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-text-secondary">健康</span>
                  <span className="text-red-400 font-mono text-xl">{finalStats.health} / {finalStats.maxHealth}</span>
                </div>
                <div className="h-2 bg-surface/30 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-text-secondary">理智</span>
                  <span className="text-blue-300 font-mono text-xl">{finalStats.sanity} / {finalStats.maxSanity}</span>
                </div>
                <div className="h-2 bg-surface/30 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-black/30 rounded text-sm text-text-secondary font-mono">
              <div className="mb-2 text-accent-lantern">初始物品:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>陈旧的笔记</li>
                {selection.origin === 'rich' && <li>烧焦的家徽</li>}
                {selection.origin === 'doctor' && <li>沾血的手术刀</li>}
                {selection.origin === 'detective' && <li>无瞳之眼</li>}
              </ul>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={remainingPoints < 0}
            className={`
              w-full py-6 rounded-sm text-xl font-bold tracking-widest uppercase transition-all shadow-lg
              ${remainingPoints >= 0 
                ? 'bg-accent-lantern text-black hover:bg-accent-lantern/90 hover:shadow-accent-lantern/20' 
                : 'bg-surface/20 text-text-secondary cursor-not-allowed'}
            `}
          >
            开始旅程
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {step === 'intro' ? (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {renderIntro()}
        </motion.div>
      ) : (
        <motion.div
          key="creation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {renderCreation()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
