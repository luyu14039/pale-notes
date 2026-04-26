// DeepSeek API 封装
// 文档参考：https://api-docs.deepseek.com/zh-cn/

export interface DeepSeekChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const DEEPSEEK_MODEL_OPTIONS = [
  {
    value: 'deepseek-v4-pro',
    label: 'DeepSeek V4 Pro',
  },
  {
    value: 'deepseek-v4-flash',
    label: 'DeepSeek V4 Flash',
  },
] as const;

export type DeepSeekModel = (typeof DEEPSEEK_MODEL_OPTIONS)[number]['value'];
export type DeepSeekReasoningEffort = 'high' | 'max';

export interface DeepSeekChatOptions {
  messages: DeepSeekChatMessage[];
  apiKey: string;
  stream?: boolean;
  model?: DeepSeekModel;
  thinking?: boolean;
  reasoningEffort?: DeepSeekReasoningEffort;
}

export async function deepseekChat({
  messages,
  apiKey,
  stream = false,
  model = 'deepseek-v4-pro',
  thinking = true,
  reasoningEffort = 'high',
}: DeepSeekChatOptions) {
  const url = 'https://api.deepseek.com/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
  
  // DeepSeek V4 默认支持思考模式；思考强度仅在 thinking enabled 时生效。
  const body = JSON.stringify({
    model,
    messages,
    stream,
    thinking: {
      type: thinking ? 'enabled' : 'disabled',
    },
    ...(thinking ? { reasoning_effort: reasoningEffort } : {}),
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API Error: ${response.status} - ${errorText}`);
  }

  if (stream) {
    return response;
  } else {
    const data = await response.json();
    return data;
  }
}
