// SiliconFlow API 封装

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  apiKey: string;
  stream?: boolean;
}

export type SiliconFlowChatMessage = ChatMessage;

export const SILICONFLOW_MODEL_OPTIONS = [
  {
    value: 'Pro/deepseek-ai/DeepSeek-V3.2',
    label: 'DeepSeek V3.2（推荐）',
    description: '平衡推理和中文输出，适合当前故事生成。',
  },
  {
    value: 'Pro/zai-org/GLM-4.7',
    label: 'GLM-4.7',
    description: '通用能力较强，适合备选。',
  },
  {
    value: 'Qwen/Qwen3-32B',
    label: 'Qwen3-32B',
    description: '更均衡的通用模型。',
  },
] as const;

export type SiliconFlowModel = (typeof SILICONFLOW_MODEL_OPTIONS)[number]['value'];

export interface SiliconFlowChatOptions extends ChatOptions {
  model?: SiliconFlowModel;
  enableThinking?: boolean;
}

export async function siliconflowChat({
  messages,
  apiKey,
  stream = false,
  model = SILICONFLOW_MODEL_OPTIONS[0].value,
  enableThinking = true,
}: SiliconFlowChatOptions) {
  const url = 'https://api.siliconflow.cn/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  const body = JSON.stringify({
    model,
    messages,
    stream,
    enable_thinking: enableThinking,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SiliconFlow API Error: ${response.status} - ${errorText}`);
  }

  if (stream) {
    return response;
  }

  const data = await response.json();
  return data;
}