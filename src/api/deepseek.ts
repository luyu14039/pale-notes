// DeepSeek API 封装
// 文档参考：https://api-docs.deepseek.com/zh-cn/

export interface DeepSeekChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DeepSeekChatOptions {
  messages: DeepSeekChatMessage[];
  apiKey: string;
  stream?: boolean;
  temperature?: number; // deepseek-reasoner 不支持 temperature (必须为 0 或不传，但 API 可能会忽略)
  top_p?: number;
}

export async function deepseekChat({ messages, apiKey, stream = false }: DeepSeekChatOptions) {
  const url = 'https://api.deepseek.com/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
  
  // deepseek-reasoner 是推理模型，通常不支持 temperature/top_p 参数，或者有特定限制
  // 根据官方文档，reasoner 模型不支持 temperature, top_p, presence_penalty, frequency_penalty, logprobs, top_logprobs
  const body = JSON.stringify({
    model: 'deepseek-reasoner', 
    messages,
    stream
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
