import { useGameStore, AspectState } from '@/stores/game';
import { useUIStore } from '@/stores/ui';
import { Heart, Brain, Coins, LogOut, Settings } from 'lucide-react';

const aspectImages: Record<keyof AspectState, string> = {
  lantern: 'images/icons/lantern.png',
  forge: 'images/icons/forge.png',
  edge: 'images/icons/edge.png',
  winter: 'images/icons/winter.webp',
  heart: 'images/icons/heart.png',
  grail: 'images/icons/grail.png',
  moth: 'images/icons/moth.png',
  knock: 'images/icons/knock.png',
};

const aspectColors: Record<keyof AspectState, string> = {
  lantern: 'text-accent-lantern',
  forge: 'text-accent-grail', // Forge is usually red/orange
  edge: 'text-accent-edge',
  winter: 'text-accent-winter',
  heart: 'text-accent-grail', // Heart is red
  grail: 'text-accent-grail',
  moth: 'text-accent-moth',
  knock: 'text-accent-mansus',
};

interface StatusPanelProps {
  className?: string;
}

export function StatusPanel({ className = '' }: StatusPanelProps) {
  const { resources, aspects, returnToTitle } = useGameStore();
  const { setApiKeyModalOpen } = useUIStore();

  return (
    <div className={`h-full p-4 space-y-6 overflow-y-auto bg-surface/30 border-r border-text-muted/20 backdrop-blur-sm flex flex-col ${className}`}>
      {/* Resources Section */}
      <section className="space-y-3">
        <h3 className="text-xs font-serif text-text-muted uppercase tracking-[0.2em] border-b border-text-muted/20 pb-2">资源</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-sm border border-text-muted/10 hover:border-accent-lantern/30 transition-colors group">
            <div className="flex items-center gap-3 text-text-secondary group-hover:text-accent-lantern transition-colors">
              <Coins size={16} className="opacity-70" />
              <span className="text-sm font-serif">资金</span>
            </div>
            <span className="font-mono text-accent-lantern">{resources.funds}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/20 rounded-sm border border-text-muted/10 hover:border-accent-grail/30 transition-colors group">
            <div className="flex items-center gap-3 text-text-secondary group-hover:text-accent-grail transition-colors">
              <Heart size={16} className="opacity-70" />
              <span className="text-sm font-serif">健康</span>
            </div>
            <span className="font-mono text-accent-grail">{resources.health} / {resources.maxHealth}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-black/20 rounded-sm border border-text-muted/10 hover:border-accent-moth/30 transition-colors group">
            <div className="flex items-center gap-3 text-text-secondary group-hover:text-accent-moth transition-colors">
              <Brain size={16} className="opacity-70" />
              <span className="text-sm font-serif">理智</span>
            </div>
            <span className="font-mono text-accent-moth">{resources.sanity} / {resources.maxSanity}</span>
          </div>
        </div>
      </section>

      {/* Aspects Section */}
      <section className="space-y-3">
        <h3 className="text-xs font-serif text-text-muted uppercase tracking-[0.2em] border-b border-text-muted/20 pb-2">性相</h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(aspects) as [keyof AspectState, number][]).map(([key, value]) => {
            if (value === 0) return null; // Hide zero aspects
            return (
              <div key={key} className="flex items-center gap-2 p-2 bg-black/20 rounded-sm border border-text-muted/10 hover:border-text-muted/30 transition-colors">
                <img 
                  src={aspectImages[key]} 
                  alt={key} 
                  className="w-8 h-8 object-contain opacity-80 drop-shadow-md"
                  title={key}
                />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-text-muted">{key}</span>
                  <span className={`text-sm font-mono font-bold ${aspectColors[key]}`}>{value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="pt-6 mt-auto border-t border-text-muted/20 space-y-2">
        <button 
          onClick={() => setApiKeyModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm text-text-muted hover:text-accent-lantern hover:bg-accent-lantern/10 border border-transparent hover:border-accent-lantern/30 rounded transition-all"
        >
          <Settings size={14} />
          <span>设置</span>
        </button>
        <button 
          onClick={returnToTitle}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm text-text-muted hover:text-accent-lantern hover:bg-accent-lantern/10 border border-transparent hover:border-accent-lantern/30 rounded transition-all"
        >
          <LogOut size={14} />
          <span>返回标题</span>
        </button>
      </div>
    </div>
  );
}
