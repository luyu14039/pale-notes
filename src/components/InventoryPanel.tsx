import { useGameStore } from '@/stores/game';
import { Package, Search, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { getClue, getLore } from '@/constants/gameData';

const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'tool', label: '工具' },
  { id: 'ingredient', label: '原料' },
  { id: 'book', label: '书籍' },
];

type TabType = 'items' | 'clues' | 'lores';

interface InventoryPanelProps {
  className?: string;
}

export function InventoryPanel({ className = '' }: InventoryPanelProps) {
  const { inventory, knownFacts, masteredLores, facts, lores } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = filter === 'all' || item.tags.includes(filter);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderItems = () => (
    <>
      {/* Search & Filter */}
      <div className="space-y-2 pb-2">
        <div className="relative">
            <input 
                type="text" 
                placeholder="搜索物品..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 border border-text-muted/20 rounded-sm px-2 py-1 text-xs text-text-primary focus:border-accent-lantern/50 outline-none"
            />
            <Search size={12} className="absolute right-2 top-1.5 text-text-muted" />
        </div>
        <div className="flex flex-wrap gap-1">
            {CATEGORIES.map(cat => (
            <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`
                text-[10px] px-2 py-1 rounded-sm border transition-all duration-300
                ${filter === cat.id 
                    ? 'bg-accent-lantern/10 border-accent-lantern text-accent-lantern shadow-[0_0_10px_rgba(234,179,8,0.1)]' 
                    : 'bg-black/20 border-text-muted/10 text-text-muted hover:border-text-muted/50 hover:text-text-secondary'}
                `}
            >
                {cat.label}
            </button>
            ))}
        </div>
      </div>
      
      {filteredInventory.length === 0 ? (
        <div className="text-xs text-text-muted italic text-center py-8 border border-dashed border-text-muted/10 rounded-sm bg-black/10">
          {searchQuery ? '没有找到匹配的物品。' : (filter === 'all' ? '你的口袋空空如也。' : '该分类下没有物品。')}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredInventory.map((item) => {
            const isExpanded = expandedItemId === item.id;
            return (
              <div 
                key={item.id} 
                onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                className={`p-3 bg-black/20 rounded-sm border transition-all duration-300 group hover:bg-black/30 cursor-pointer
                  ${isExpanded ? 'border-accent-lantern/30 bg-black/40' : 'border-text-muted/10 hover:border-accent-lantern/30'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-black/20 rounded-sm text-text-muted group-hover:text-accent-lantern transition-colors border border-white/5">
                    <Package size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-serif text-text-primary group-hover:text-accent-lantern transition-colors">{item.name}</h4>
                    <p className={`text-xs text-text-secondary mt-1 font-serif opacity-80 ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
                      {item.description}
                    </p>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-black/20 rounded-sm text-text-muted border border-text-muted/10 uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  const renderClues = () => {
    const filteredClues = knownFacts.map(factId => {
        const dynamicFact = facts.find(f => f.id === factId);
        const staticClue = getClue(factId);
        return dynamicFact || staticClue || { id: factId, name: '未知线索', description: '无法解析的线索' };
    }).filter(clue => 
        clue.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        clue.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
    <div className="space-y-2">
      <div className="relative mb-2">
            <input 
                type="text" 
                placeholder="搜索线索..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 border border-text-muted/20 rounded-sm px-2 py-1 text-xs text-text-primary focus:border-accent-moth/50 outline-none"
            />
            <Search size={12} className="absolute right-2 top-1.5 text-text-muted" />
      </div>

      {filteredClues.length === 0 ? (
        <div className="text-xs text-text-muted italic text-center py-8 border border-dashed border-text-muted/10 rounded-sm bg-black/10">
          {searchQuery ? '没有找到匹配的线索。' : '你还没有发现任何线索。'}
        </div>
      ) : (
        filteredClues.map((clue) => {
          return (
            <div key={clue.id} className="p-3 bg-black/20 rounded-sm border border-text-muted/10 hover:border-accent-moth/30 transition-all duration-300 group hover:bg-black/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-black/20 rounded-sm text-text-muted group-hover:text-accent-moth transition-colors border border-white/5">
                  <Search size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-serif text-text-primary group-hover:text-accent-moth transition-colors">{clue.name}</h4>
                  <p className="text-xs text-text-secondary mt-1 font-serif opacity-80">{clue.description}</p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
  };

  const renderLores = () => {
    const filteredLores = masteredLores.map(loreId => {
        const dynamicLore = lores.find(l => l.id === loreId);
        const staticLore = getLore(loreId);
        // @ts-ignore
        return dynamicLore || staticLore || { id: loreId, name: '未知密传', description: '无法解析的密传', principle: 'unknown' };
    }).filter(lore => 
        lore.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        lore.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
    <div className="space-y-2">
      <div className="relative mb-2">
            <input 
                type="text" 
                placeholder="搜索密传..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 border border-text-muted/20 rounded-sm px-2 py-1 text-xs text-text-primary focus:border-accent-knock/50 outline-none"
            />
            <Search size={12} className="absolute right-2 top-1.5 text-text-muted" />
      </div>

      {filteredLores.length === 0 ? (
        <div className="text-xs text-text-muted italic text-center py-8 border border-dashed border-text-muted/10 rounded-sm bg-black/10">
          {searchQuery ? '没有找到匹配的密传。' : '你尚未掌握任何密传。'}
        </div>
      ) : (
        filteredLores.map((lore) => {
          return (
            <div key={lore.id} className="p-3 bg-black/20 rounded-sm border border-text-muted/10 hover:border-accent-knock/30 transition-all duration-300 group hover:bg-black/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-black/20 rounded-sm text-text-muted group-hover:text-accent-knock transition-colors border border-white/5">
                  <BookOpen size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-serif text-text-primary group-hover:text-accent-knock transition-colors">{lore.name}</h4>
                  <p className="text-xs text-text-secondary mt-1 font-serif opacity-80">{lore.description}</p>
                  <div className="mt-2">
                    <span className="text-[10px] px-1.5 py-0.5 bg-black/20 rounded-sm text-accent-knock border border-accent-knock/20 uppercase tracking-wider">
                      {/* @ts-ignore */}
                      {lore.principle || lore.aspect}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
  };

  return (
    <div className={`h-full p-4 space-y-6 overflow-y-auto bg-surface/30 border-l border-text-muted/20 backdrop-blur-sm flex flex-col ${className}`}>
      <section className="space-y-3 flex-1">
        <div className="flex items-center justify-between border-b border-text-muted/20 pb-2">
          <h3 className="text-xs font-serif text-text-muted uppercase tracking-[0.2em]">
            {activeTab === 'items' && '物品栏'}
            {activeTab === 'clues' && '线索'}
            {activeTab === 'lores' && '密传'}
          </h3>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-1 bg-black/20 p-1 rounded-sm mb-4">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-1.5 text-xs font-serif transition-all rounded-sm flex items-center justify-center gap-2
              ${activeTab === 'items' 
                ? 'bg-surface/40 text-text-primary shadow-sm' 
                : 'text-text-muted hover:text-text-secondary hover:bg-surface/10'}
            `}
          >
            <Package size={12} />
            <span>物品</span>
          </button>
          <button
            onClick={() => setActiveTab('clues')}
            className={`flex-1 py-1.5 text-xs font-serif transition-all rounded-sm flex items-center justify-center gap-2
              ${activeTab === 'clues' 
                ? 'bg-surface/40 text-text-primary shadow-sm' 
                : 'text-text-muted hover:text-text-secondary hover:bg-surface/10'}
            `}
          >
            <Search size={12} />
            <span>线索</span>
          </button>
          <button
            onClick={() => setActiveTab('lores')}
            className={`flex-1 py-1.5 text-xs font-serif transition-all rounded-sm flex items-center justify-center gap-2
              ${activeTab === 'lores' 
                ? 'bg-surface/40 text-text-primary shadow-sm' 
                : 'text-text-muted hover:text-text-secondary hover:bg-surface/10'}
            `}
          >
            <BookOpen size={12} />
            <span>密传</span>
          </button>
        </div>

        {activeTab === 'items' && renderItems()}
        {activeTab === 'clues' && renderClues()}
        {activeTab === 'lores' && renderLores()}
      </section>
    </div>
  );
}
