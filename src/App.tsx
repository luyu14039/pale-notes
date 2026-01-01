import { useState, useEffect, useRef } from 'react';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { NarrativeView } from '@/components/NarrativeView';
import { ChoicePanel } from '@/components/ChoicePanel';
import { StatusPanel } from '@/components/StatusPanel';
import { InventoryPanel } from '@/components/InventoryPanel';
import { RelationshipPanel } from '@/components/RelationshipPanel';
import { DebugPanel } from '@/components/DebugPanel';
import { StartScreen } from '@/components/StartScreen';
import { StatusBar } from '@/components/StatusBar';
import { ChapterOverlay } from '@/components/ChapterOverlay';
import { NewYearModal } from '@/components/NewYearModal';
import { useGameStore } from '@/stores/game';
import { useUIStore } from '@/stores/ui';
import { useGameEngine } from '@/hooks/useGameEngine';
import { Menu, X } from 'lucide-react';

function App() {
  const { history, resources, isGameStarted } = useGameStore();
  const { apiKey } = useUIStore();
  const { 
    handleAction, 
    retryLastAction,
    isProcessing, 
    isAnalyzingData,
    currentOptions, 
    streamingContent, 
    streamingReasoning,
    debugDataInput,
    debugDataOutput,
    isInputAllowed
  } = useGameEngine();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'inventory' | 'relationships'>('inventory');
  const [mobileTab, setMobileTab] = useState<'status' | 'inventory' | 'relationships'>('status');
  
  const hasInitialized = useRef(false);

  // One-time cleanup for legacy API key
  useEffect(() => {
    const CLEANUP_KEY = 'has_cleared_legacy_api_key_v1';
    if (!localStorage.getItem(CLEANUP_KEY)) {
      useUIStore.getState().setApiKey('');
      localStorage.setItem(CLEANUP_KEY, 'true');
    }
  }, []);

  // Reset initialization flag when API key changes, allowing retry
  useEffect(() => {
    if (apiKey && isGameStarted && history.length === 0) {
       hasInitialized.current = false;
    }
  }, [apiKey, isGameStarted, history.length]);

  // Initialize game if started but no history
  useEffect(() => {
    // Only attempt initialization if we have an API key
    if (isGameStarted && history.length === 0 && !isProcessing && !hasInitialized.current && apiKey) {
      hasInitialized.current = true;
      handleAction('init', '开始游戏').catch(() => {
        console.error("Initialization failed.");
        // If failed, we don't reset hasInitialized immediately to avoid loop.
        // User needs to update API key or refresh.
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameStarted, history.length, isProcessing, apiKey]);

  // Combine history into a single narrative string for display
  const narrativeMessages = history
    .filter(h => h.role === 'assistant' || h.role === 'user' || h.role === 'system')
    .map(h => ({ role: h.role, content: h.content }));

  if (!isGameStarted) {
    return <StartScreen />;
  }

  /* 
   * [DEV NOTE - STORY EXTENSION INTERFACE]
   * Previously, we blocked progress after Chapter 1 with:
   * if (story.currentChapter > 1) { return <ChapterEndScreen />; }
   * 
   * This was removed to allow "Infinite Play" (Free Mode) where the AI continues the story indefinitely.
   * 
   * To add more SCRIPTED content (Chapter 2+):
   * 1. Open `src/data/storyEvents.ts`
   * 2. Create a new event with id: 'chapter_2_start'
   *    (The last event 'bookshop_dilemma' points to this ID)
   * 3. The StorySystem will automatically detect this event and trigger it, 
   *    seamlessly transitioning from AI generation back to scripted plot.
   */

  return (
    <div className="flex h-screen w-full bg-background text-text-primary overflow-hidden relative">
      {/* Global Texture & Vignette */}
      <div className="absolute inset-0 bg-neutral-900 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-background/50 to-background pointer-events-none z-0" />
      
      <NewYearModal />
      <ApiKeyModal />
      
      {/* Desktop Left Panel (Status) */}
      <aside className="hidden md:block w-64 flex-shrink-0 z-10 relative border-r border-text-muted/30">
        <StatusPanel />
      </aside>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        <ChapterOverlay />
        <StatusBar />
        
      {/* Mobile Header */}
      <header className="md:hidden h-14 border-b border-text-muted/30 flex items-center px-4 justify-between bg-surface/80 backdrop-blur z-20">
        <span className="font-serif text-accent-lantern font-bold">苍白卷宗</span>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-xs font-mono text-text-secondary">
            <span title="资金">£{resources.funds}</span>
            <span title="Sanity" className="text-accent-moth">{resources.sanity}</span>
            <span title="Health" className="text-accent-grail">{resources.health}</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 hover:bg-text-muted/20 rounded"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background/95 z-50 flex flex-col animate-fade-in">
          {/* Mobile Menu Header */}
          <div className="h-14 border-b border-text-muted/30 flex items-center px-4 justify-between bg-surface/80 backdrop-blur">
             <span className="font-serif text-accent-lantern font-bold">菜单</span>
             <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-text-muted/20 rounded text-text-muted hover:text-text-primary"
              >
                <X size={24} />
              </button>
          </div>

          {/* Mobile Tabs */}
          <div className="flex border-b border-text-muted/20 bg-surface/50">
            <button
              onClick={() => setMobileTab('status')}
              className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${mobileTab === 'status' ? 'text-accent-lantern border-b-2 border-accent-lantern bg-white/5' : 'text-text-muted'}`}
            >
              状态
            </button>
            <button
              onClick={() => setMobileTab('inventory')}
              className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${mobileTab === 'inventory' ? 'text-accent-lantern border-b-2 border-accent-lantern bg-white/5' : 'text-text-muted'}`}
            >
              物品
            </button>
            <button
              onClick={() => setMobileTab('relationships')}
              className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${mobileTab === 'relationships' ? 'text-accent-lantern border-b-2 border-accent-lantern bg-white/5' : 'text-text-muted'}`}
            >
              关系
            </button>
          </div>

          {/* Mobile Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 pb-20">
            {mobileTab === 'status' && (
              <StatusPanel className="h-auto overflow-visible border-none p-0 bg-transparent" />
            )}
            {mobileTab === 'inventory' && (
              <InventoryPanel className="h-auto overflow-visible border-none p-0 bg-transparent" />
            )}
            {mobileTab === 'relationships' && (
              <RelationshipPanel className="h-auto overflow-visible border-none p-0 bg-transparent" />
            )}
          </div>
        </div>
      )}

        {/* Narrative Scroll Area */}
        <div className="flex-1 relative min-h-0 overflow-hidden">
          <NarrativeView 
            messages={narrativeMessages} 
            isTyping={isProcessing} 
            isAnalyzingData={isAnalyzingData}
            streamingContent={streamingContent}
            streamingReasoning={streamingReasoning}
          />
        </div>

        {/* Choice Area */}
        <div className="flex-shrink-0 z-10 bg-background relative">
          {/* Retry Button */}
          {!isProcessing && history.length > 1 && (
            <div className="absolute -top-10 right-6 z-20">
              <button 
                onClick={retryLastAction}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-text-muted hover:text-accent-lantern border border-text-muted/30 hover:border-accent-lantern/50 rounded bg-background/80 backdrop-blur transition-all"
                title="重新生成本次回应"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                REGENERATE
              </button>
            </div>
          )}
          
          <ChoicePanel 
            options={currentOptions} 
            disabled={isProcessing}
            isInputAllowed={isInputAllowed}
            onCustomAction={(text) => handleAction('custom_action', text)}
            onSelect={(id) => {
              const opt = currentOptions.find(o => o.id === id);
              handleAction(id, opt?.text || id);
            }} 
          />
        </div>
      </main>

      {/* Desktop Right Panel (Inventory & Relationships) */}
      <aside className="hidden md:flex flex-col w-72 flex-shrink-0 z-10 border-l border-text-muted/30 bg-surface/30">
        <div className="flex border-b border-text-muted/30">
            <button 
                onClick={() => setRightPanelTab('inventory')}
                className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${rightPanelTab === 'inventory' ? 'bg-background text-accent-lantern border-b-2 border-accent-lantern' : 'text-text-muted hover:text-text-primary'}`}
            >
                Inventory
            </button>
            <button 
                onClick={() => setRightPanelTab('relationships')}
                className={`flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${rightPanelTab === 'relationships' ? 'bg-background text-accent-grail border-b-2 border-accent-grail' : 'text-text-muted hover:text-text-primary'}`}
            >
                People
            </button>
        </div>
        <div className="flex-1 overflow-hidden">
            {rightPanelTab === 'inventory' ? <InventoryPanel /> : <RelationshipPanel />}
        </div>
        <DebugPanel 
          dataInput={debugDataInput} 
          dataOutput={debugDataOutput} 
        />
      </aside>
    </div>
  );
}

export default App;
