import { useState } from 'react';
import { useUIStore } from '@/stores/ui';
import { deepseekChat } from '@/api/deepseek';

export function ApiKeyModal() {
  const { apiKey, setApiKey, isApiKeyModalOpen, setApiKeyModalOpen } = useUIStore();
  const [inputKey, setInputKey] = useState(apiKey);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setStatus('testing');
    try {
      // 简单测试 API Key 是否有效
      await deepseekChat({
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: inputKey,
        stream: false
      });
      setApiKey(inputKey);
      setStatus('success');
      setTimeout(() => {
        setApiKeyModalOpen(false);
        setStatus('idle');
      }, 1000);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const handleClose = () => {
    if (apiKey) {
      setApiKeyModalOpen(false);
      setStatus('idle');
    }
  };

  // 显示条件：
  // 1. 显式打开 (isApiKeyModalOpen)
  // 2. 没有 apiKey 且不在测试/错误状态 (强制显示)
  const shouldShow = isApiKeyModalOpen || (!apiKey && status !== 'success');

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
      <div className="bg-surface border border-text-muted p-6 rounded-lg max-w-md w-full space-y-4 shadow-2xl relative">
        {apiKey && (
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
          >
            ✕
          </button>
        )}
        <h2 className="text-xl font-serif text-accent-lantern">配置 DeepSeek API Key</h2>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>
            本游戏基于 DeepSeek R1 模型生成剧情。
          </p>
          <p className="text-accent-forge">
            注意：目前公共 Key 额度非常有限，强烈建议使用您自己的 API Key 以获得最佳体验。
          </p>
          <p>
            您的 Key 仅存储在本地浏览器中，不会上传到任何服务器。
          </p>
        </div>
        
        <input
          type="password"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="sk-..."
          className="w-full bg-background border border-text-muted rounded p-2 text-text-primary focus:border-accent-lantern outline-none font-mono"
        />

        <div className="flex justify-end gap-2">
          <button 
            onClick={handleSave}
            disabled={status === 'testing' || !inputKey}
            className="px-4 py-2 bg-accent-lantern/20 text-accent-lantern border border-accent-lantern/50 rounded hover:bg-accent-lantern/30 disabled:opacity-50 transition-colors"
          >
            {status === 'testing' ? '验证中...' : '保存并开始'}
          </button>
        </div>

        {status === 'error' && (
          <p className="text-xs text-accent-grail">验证失败，请检查 Key 是否正确或额度是否充足。</p>
        )}
      </div>
    </div>
  );
}
