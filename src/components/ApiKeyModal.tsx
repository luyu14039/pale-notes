import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/ui';
import { deepseekChat } from '@/api/deepseek';

export function ApiKeyModal() {
  const { apiKey, setApiKey, isApiKeyModalOpen, setApiKeyModalOpen } = useUIStore();
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  
  // 显示条件提前定义
  const shouldShow = isApiKeyModalOpen || (!apiKey && status !== 'success');
  
  const [inputKey, setInputKey] = useState('');

  // 每次显示时清空输入框
  useEffect(() => {
    if (shouldShow) {
      setInputKey('');
    }
  }, [shouldShow]);

  const verifyAndSave = async (key: string) => {
    setStatus('testing');
    try {
      // 简单测试 API Key 是否有效
      await deepseekChat({
        messages: [{ role: 'user', content: 'Hello' }],
        apiKey: key,
        stream: false
      });
      setApiKey(key);
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

  const handleSave = () => verifyAndSave(inputKey);

  const handleClose = () => {
    if (apiKey) {
      setApiKeyModalOpen(false);
      setStatus('idle');
    }
  };

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
        <h2 className="text-xl font-serif text-accent-lantern">欢迎来到苍白卷宗</h2>
        <div className="space-y-4 text-sm text-text-secondary">
          <p className="text-text-primary font-bold text-base">
            感谢大家的访问和支持！
          </p>
          <p>
            由于访问量激增，作者提供的公共 Key 额度已耗尽。为了继续您的旅程，请在下方填入您自己的 DeepSeek API Key。
          </p>
          <p className="text-xs text-text-muted bg-surface/50 p-2 rounded border border-text-muted/20">
            您的 Key 仅存储在本地浏览器中，直接发送至 DeepSeek 官方接口，不会经过任何第三方服务器。
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
