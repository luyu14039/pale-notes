// GLM-4.6 API 封装
// 文档参考：https://docs.bigmodel.cn/cn/guide/develop/http/introduction

export interface GLMChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GLMChatOptions {
  messages: GLMChatMessage[];
  apiKey: string;
  stream?: boolean;
  temperature?: number;
  top_p?: number;
}

export async function glmChat({ messages, apiKey, stream = false, temperature = 0.7, top_p = 0.95 }: GLMChatOptions) {
  const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
  const body = JSON.stringify({
    model: 'glm-4',
    messages,
    stream,
    temperature,
    top_p,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    throw new Error(`GLM API Error: ${response.status}`);
  }

  if (stream) {
    // 流式处理（后续可扩展）
    // 这里只返回 Response，前端需用 ReadableStream 处理
    return response;
  } else {
    const data = await response.json();
    return data;
  }
}
