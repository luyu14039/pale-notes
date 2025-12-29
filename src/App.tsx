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
import { ChapterEndScreen } from '@/components/ChapterEndScreen';
import { useGameStore } from '@/stores/game';
import { useUIStore } from '@/stores/ui';
import { useGameEngine } from '@/hooks/useGameEngine';
import { Menu, X, Settings, Save } from 'lucide-react'; // 引入 Settings 和 Save 图标

// --- 新增：设置弹窗组件 ---
function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { apiKey, setApiKey } = useUIStore();
  
  // 本地状态
  const [url, setUrl] = useState('');
  const [model, setModel] = useState('');
  const [key, setKey] = useState('');

  // 打开时读取配置
  useEffect(() => {
    if (isOpen) {
      setUrl(localStorage.getItem('game_api_url') || 'https://api.deepseek.com');
      setModel(localStorage.getItem('game_model_name') || 'deepseek-reasoner');
      setKey(apiKey || '');
    }
  }, [isOpen, apiKey]);

  const handleSave = () => {
    localStorage.setItem('game_api_url', url);
    localStorage.setItem('game_model_name', model);
    
    // 更新 Store 和 LocalStorage 中的 Key
    setApiKey(key); 
    // 注意：useUIStore 通常会自动同步到 localStorage，
    // 但为了保险起见，如果你的 deepseek.ts 依赖 options.apiKey，确保 Store 更新即可。
    
    onClose();
    // 可选：刷新页面以确保完全生效，或者依赖 React 状态更新
    // window.location.reload(); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface border border-text-muted/30 p-6 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
          <X size={20} />
        </button>
        
        <h2 className="font-serif text-xl font-bold text-accent-lantern mb-6 flex items-center gap-2">
          <Settings size={20} />
          系统设置
        </h2>

        <div className="space-y-4 font-mono text-sm">
          <div>
            <label className="block text-text-muted mb-1">API Base URL</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.deepseek.com"
              className="w-full bg-background/50 border border-text-muted/30 p-2 text-text-primary focus:border-accent-lantern outline-none"
            />
            <p className="text-xs text-text-muted/50 mt-1">例如: https://api.siliconflow.cn/v1</p>
          </div>

          <div>
            <label className="block text-text-muted mb-1">Model Name</label>
            <input 
              type="text" 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="deepseek-reasoner"
              className="w-full bg-background/50 border border-text-muted/30 p-2 text-text-primary focus:border-accent-lantern outline-none"
            />
            <p className="text-xs text-text-muted/50 mt-1">例如: deepseek-ai/DeepSeek-V3</p>
          </div>

          <div>
            <label className="block text-text-muted mb-1">API Key</label>
            <input 
              type="password" 
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-background/50 border border-text-muted/30 p-2 text-text-primary focus:border-accent-lantern outline-none"
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full mt-4 bg-accent-lantern/10 border border-accent-lantern/30 text-accent-lantern hover:bg-accent-lantern/20 py-2 flex items-center justify-center gap-2 transition-colors"
          >
            <Save size={16} />
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
// --- 结束新增组件 ---

function App() {
  const { history, resources, isGameStarted, story } = useGameStore();
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
  // 新增：控制设置弹窗状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
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
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameStarted, history.length, isProcessing, apiKey]);

  // Combine history into a single narrative string for display
  const narrativeMessages = history
    .filter(h => h.role === 'assistant' || h.role === 'user' || h.role === 'system')
    .map(h => ({ role: h.role, content: h.content }));

  // 注意：即使未开始游戏，也允许打开设置。
  // 但原逻辑直接返回 StartScreen，我们需要在 StartScreen 上也提供设置入口，
  // 或者把 SettingsModal 放在最外层。这里为了简化，我们仅修改主要逻辑，
  // 建议在 StartScreen 组件内部也加一个按钮，或者临时允许在这里渲染 SettingsModal。
  
  const renderGameContent = () => {
    if (!isGameStarted) {
      return (
        <>
          <StartScreen />
          {/* 在开始界面右下角增加一个设置按钮 */}
          <div className="fixed bottom-4 right-4 z-50">
             <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-background/80 backdrop-blur border border-text-muted/30 text-text-muted hover:text-accent-lantern rounded-full shadow-lg transition-all"
              title="设置 API"
            >
              <Settings size={20} />
            </button>
          </div>
        </>
      );
    }

    // Check for Chapter 1 Completion
    if (story.currentChapter > 1) {
      return <ChapterEndScreen />;
    }

    return (
      <div className="flex h-screen w-full bg-background text-text-primary overflow-hidden relative">
        {/* Global Texture & Vignette */}
        <div className="absolute inset-0 bg-neutral-900 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-background/50 to-background pointer-events-none z-0" />
        
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
               <div className="flex items-center gap-2">
                 {/* 移动端菜单中的设置按钮 */}
                 <button 
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2 hover:bg-text-muted/20 rounded text-text-muted hover:text-accent-lantern"
                  >
                    <Settings size={20} />
                 </button>
                 <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-text-muted/20 rounded text-text-muted hover:text-text-primary"
                  >
                    <X size={24} />
                  </button>
               </div>
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
        <aside className="hidden md:flex flex-col w-72 flex-shrink-0 z-10 border-l border-text-muted/30 bg-surface/30 relative">
          
          {/* 桌面端设置按钮 (右上角) */}
          <div className="absolute top-2 right-2 z-20">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-text-muted hover:text-accent-lantern transition-colors rounded-full hover:bg-background/50"
              title="API设置"
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="flex border-b border-text-muted/30 pr-10"> {/* pr-10 for settings button space */}
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
  };

  return (
    <>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {renderGameContent()}
    </>
  );
}

export default App;
