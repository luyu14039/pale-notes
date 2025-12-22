import { useGameStore } from '@/stores/game';
import { useUIStore } from '@/stores/ui';
import { getItemTemplate } from '@/constants/items';
import { Bug, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DebugPanelProps {
  dataInput?: string | null;
  dataOutput?: string | null;
}

export function DebugPanel({ dataInput, dataOutput }: DebugPanelProps) {
  const { 
    modifyResource, 
    setAspects, 
    aspects, 
    addItem, 
    inventory, 
    addHistory 
  } = useGameStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'cheats' | 'data-ai'>('cheats');

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-2 bg-red-900/50 text-red-200 rounded-full hover:bg-red-900 z-50 border border-red-700"
        title="Open Debug Panel"
      >
        <Bug size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-surface border border-red-900/50 rounded-lg shadow-2xl z-50 p-4 text-xs font-mono">
      <div className="flex justify-between items-center mb-4 border-b border-red-900/30 pb-2">
        <h3 className="text-red-400 font-bold flex items-center gap-2">
          <Bug size={14} /> DEBUG CONSOLE
        </h3>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('cheats')}
                className={`text-xs px-2 py-1 rounded ${activeTab === 'cheats' ? 'bg-red-900/50 text-white' : 'text-text-muted hover:text-white'}`}
            >
                Cheats
            </button>
            <button 
                onClick={() => setActiveTab('data-ai')}
                className={`text-xs px-2 py-1 rounded ${activeTab === 'data-ai' ? 'bg-red-900/50 text-white' : 'text-text-muted hover:text-white'}`}
            >
                Data AI
            </button>
            <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary ml-2">
            Close
            </button>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activeTab === 'cheats' ? (
            <>
                {/* Resources */}
                <div className="space-y-2">
                  <h4 className="text-text-secondary">Story & UI</h4>
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => useGameStore.getState().setStoryState({ currentChapter: 2 })}
                      className="px-2 py-1 bg-background border border-text-muted rounded hover:border-accent-lantern text-accent-lantern"
                    >
                      Skip to Chapter 1 End
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('hasSeenTutorial');
                        useUIStore.getState().setShowTutorial(true);
                      }}
                      className="px-2 py-1 bg-background border border-text-muted rounded hover:border-accent-lantern text-accent-lantern"
                    >
                      Show Tutorial
                    </button>
                  </div>
                </div>

                {/* Resources */}
                <div className="space-y-2">
                  <h4 className="text-text-secondary">Resources</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => modifyResource('funds', 10)}
                      className="px-2 py-1 bg-background border border-text-muted rounded hover:border-accent-lantern"
                    >
                      +10 Funds
                    </button>
                    <button 
                      onClick={() => modifyResource('sanity', -1)}
                      className="px-2 py-1 bg-background border border-text-muted rounded hover:border-accent-moth"
                    >
                      -1 Sanity
                    </button>
                    <button 
                      onClick={() => modifyResource('health', 1)}
                      className="px-2 py-1 bg-background border border-text-muted rounded hover:border-accent-grail"
                    >
                      +1 Health
                    </button>
                  </div>
                </div>

                {/* Aspects */}
                <div className="space-y-2">
                  <h4 className="text-text-secondary">Aspects</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setAspects({ lantern: (aspects.lantern || 0) + 5 })}
                      className="px-2 py-1 bg-background border border-text-muted rounded hover:text-accent-lantern"
                    >
                      +5 Lantern
                    </button>
                    <button 
                      onClick={() => setAspects({ edge: (aspects.edge || 0) + 5 })}
                      className="px-2 py-1 bg-background border border-text-muted rounded hover:text-accent-edge"
                    >
                      +5 Edge
                    </button>
                    <button 
                      onClick={() => setAspects({ moth: (aspects.moth || 0) + 5 })}
                      className="px-2 py-1 bg-background border border-text-muted rounded hover:text-accent-moth"
                    >
                      +5 Moth
                    </button>
                    <button 
                      onClick={() => setAspects({ grail: (aspects.grail || 0) + 5 })}
                      className="px-2 py-1 bg-background border border-text-muted rounded hover:text-accent-grail"
                    >
                      +5 Grail
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <h4 className="text-text-secondary">Items</h4>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        const item = getItemTemplate('book_dream_v1');
                        if (item) addItem(item);
                      }}
                      className="flex items-center gap-2 px-2 py-1 bg-background border border-text-muted rounded hover:border-accent-lantern text-left"
                    >
                      <Plus size={12} /> Add "Dream Book"
                    </button>
                    <button 
                      onClick={() => {
                        const item = getItemTemplate('tool_knife');
                        if (item) addItem(item);
                      }}
                      className="flex items-center gap-2 px-2 py-1 bg-background border border-text-muted rounded hover:border-accent-edge text-left"
                    >
                      <Plus size={12} /> Add "Rusty Knife"
                    </button>
                    <button 
                      onClick={() => {
                        if (inventory.length > 0) {
                          // Remove the last item for testing
                          useGameStore.getState().removeItem(inventory[inventory.length - 1].id);
                        }
                      }}
                      className="flex items-center gap-2 px-2 py-1 bg-background border border-text-muted rounded hover:border-red-500 text-left"
                    >
                      <Trash2 size={12} /> Remove Last Item
                    </button>
                  </div>
                </div>

                {/* Narrative Simulation */}
                <div className="space-y-2">
                  <h4 className="text-text-secondary">Simulation</h4>
                  <button 
                    onClick={() => addHistory({
                      role: 'assistant',
                      content: '***[DEBUG]*** 这是一个测试消息。你感到一股**调试**的力量流过全身。',
                      timestamp: Date.now()
                    })}
                    className="w-full px-2 py-1 bg-background border border-text-muted rounded hover:border-accent-winter"
                  >
                    Inject Narrative
                  </button>
                </div>
            </>
        ) : (
            <div className="space-y-4">
                <div>
                    <h4 className="text-text-secondary mb-1">Last Data Input</h4>
                    <pre className="bg-black/50 p-2 rounded text-[10px] overflow-x-auto whitespace-pre-wrap text-green-400/80 max-h-40">
                        {dataInput || "No input recorded yet."}
                    </pre>
                </div>
                <div>
                    <h4 className="text-text-secondary mb-1">Last Data Output</h4>
                    <pre className="bg-black/50 p-2 rounded text-[10px] overflow-x-auto whitespace-pre-wrap text-blue-400/80 max-h-40">
                        {dataOutput || "No output recorded yet."}
                    </pre>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
