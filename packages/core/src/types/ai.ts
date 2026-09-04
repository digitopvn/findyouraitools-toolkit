export interface AskAiMessage {
  role: 'system' | 'assistant' | 'user';
  content: string | { type: string; text?: string; [key: string]: unknown };
}

export interface AskAiRequest {
  messages: AskAiMessage[];
  model?: string;
  models?: string[];
  temperature?: number;
  response_format?: { type: string };
  debug?: boolean;
}

export interface AskAiResponse {
  status: number;
  data: {
    text?: string;
    model?: string;
    [key: string]: unknown;
  };
  messages?: string[];
}

export interface AiModel {
  id: string;
  name?: string;
  provider?: string;
  [key: string]: unknown;
}
