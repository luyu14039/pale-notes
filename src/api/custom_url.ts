// src/api/deepseek.ts
// 通用 OpenAI 格式 API 封装 (支持 DeepSeek, 硅基流动, ChatGPT 等)

export interface DeepSeekChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DeepSeekChatOptions {
  messages: DeepSeekChatMessage[];
  apiKey: string;
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  // 允许调用方临时覆盖 model 或 url
  model?: string;
  baseUrl?: string; 
}

export async function deepseekChat({ messages, apiKey, stream = false, ...options }: DeepSeekChatOptions) {
  // 1. 获取配置：优先使用传入参数 -> 其次读取 LocalStorage -> 最后使用默认值
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('game_api_url') : null;
  const storedModel = typeof window !== 'undefined' ? localStorage.getItem('game_model_name') : null;

  // 默认配置 (DeepSeek)
  const defaultBaseUrl = 'https://api.deepseek.com';
  const defaultModel = 'deepseek-reasoner';

  let baseUrl = options.baseUrl || storedUrl || defaultBaseUrl;
  const model = options.model || storedModel || defaultModel;

  // 2. URL 规范化处理：确保以 /chat/completions 结尾
  // 移除末尾斜杠
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // 如果用户只填了域名 (如 https://api.siliconflow.cn/v1)，自动补全路径
  // 如果用户已经填了完整路径，则保持不变
  const finalUrl = baseUrl.endsWith('/chat/completions') 
    ? baseUrl 
    : `${baseUrl}/chat/completions`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
  
  // 3. 构建请求体
  // 注意：DeepSeek Reasoner 不支持 temperature，但其他模型可能需要
  // 我们只在非 reasoner 模型时添加 temp 参数，或者由服务端忽略
  const bodyPayload: any = {
    model: model,
    messages,
    stream
  };

  // 只有当不是 deepseek-reasoner 时，或者用户明确传入了 temperature 时才添加
  // 防止 deepseek-reasoner 报错
  if (model !== 'deepseek-reasoner' && options.temperature !== undefined) {
    bodyPayload.temperature = options.temperature;
  }

  const response = await fetch(finalUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  if (stream) {
    return response;
  } else {
    const data = await response.json();
    return data;
  }
}
