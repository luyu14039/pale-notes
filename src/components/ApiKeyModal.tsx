import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/ui';
import { AlertTriangle, Server, Box, Key } from 'lucide-react';

export function ApiKeyModal() {
  const { apiKey, setApiKey } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // 本地表单状态
  const [inputKey, setInputKey] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [inputModel, setInputModel] = useState('');

  useEffect(() => {
    // 如果没有 API Key，强制显示弹窗
    if (!apiKey) {
      setIsOpen(true);
      setInputUrl(localStorage.getItem('game_api_url') || 'https://api.deepseek.com');
      setInputModel(localStorage.getItem('game_model_name') || 'deepseek-reasoner');
    } else {
      setIsOpen(false);
    }
  }, [apiKey]);

  const handleSave = () => {
    if (!inputKey.trim()) return;

    const finalUrl = inputUrl.trim() || 'https://api.deepseek.com';
    const finalModel = inputModel.trim() || 'deepseek-reasoner';

    localStorage.setItem('game_api_url', finalUrl);
    localStorage.setItem('game_model_name', finalModel);

    setApiKey(inputKey.trim());
  };

  if (!isOpen) return null;

  return (
    // 修改 1: z-index 提高到 100，背景色加深防止透视
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      
      {/* 修改 2: 增加 max-h-[85vh] 和 overflow-y-auto (防止超出屏幕) */}
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-lg shadow-2xl rounded-lg relative flex flex-col max-h-[90vh]">
        
        {/* 标题区 - 固定在顶部 */}
        <div className="p-6 pb-2 border-b border-neutral-800">
            <h2 className="font-serif text-2xl font-bold text-amber-500 tracking-wide">
            配置 API 服务
            </h2>
            <p className="text-neutral-400 text-xs mt-2">
            支持 DeepSeek、硅基流动、Moonshot 等 OpenAI 格式接口。
            </p>
        </div>

        {/* 内容区 - 可滚动 */}
        <div className="p-6 pt-4 overflow-y-auto custom-scrollbar space-y-4">
          
          {/* 1. API 地址输入 */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 mb-1 uppercase tracking-wider">
              <Server size={10} />
              API Base URL
            </label>
            <input 
              type="text" 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://api.deepseek.com"
              className="w-full bg-black/40 border border-neutral-700 rounded p-2.5 text-neutral-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all font-mono text-xs"
            />
            <p className="text-[10px] text-neutral-600 mt-1">
              例如: https://api.siliconflow.cn/v1
            </p>
          </div>

          {/* 2. 模型名称输入 */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 mb-1 uppercase tracking-wider">
              <Box size={10} />
              Model Name
            </label>
            <input 
              type="text" 
              value={inputModel}
              onChange={(e) => setInputModel(e.target.value)}
              placeholder="deepseek-reasoner"
              className="w-full bg-black/40 border border-neutral-700 rounded p-2.5 text-neutral-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all font-mono text-xs"
            />
            <p className="text-[10px] text-neutral-600 mt-1">
              例如: deepseek-ai/DeepSeek-V3
            </p>
          </div>

          {/* 3. API Key 输入 */}
          <div>
            <label className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 mb-1 uppercase tracking-wider">
              <Key size={10} />
              API Key
            </label>
            <input 
              type="password" 
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-black/40 border border-neutral-700 rounded p-2.5 text-neutral-200 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all font-mono text-xs"
            />
          </div>

          {/* 提示信息 */}
          <div className="p-3 bg-amber-900/10 border border-amber-900/30 rounded flex gap-3 items-start">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
            <p className="text-[10px] text-amber-600/80 leading-relaxed">
              请确保 Base URL 正确（如硅基流动需加 /v1）。Key 仅存储在本地。
            </p>
          </div>
        </div>

        {/* 底部按钮区 - 固定在底部 */}
        <div className="p-6 pt-2 border-t border-neutral-800 bg-neutral-900 rounded-b-lg">
            <button 
            onClick={handleSave}
            disabled={!inputKey}
            className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded font-medium transition-colors shadow-lg shadow-amber-900/20 text-sm"
            >
            保存并开始
            </button>
        </div>

      </div>
    </div>
  );
}
