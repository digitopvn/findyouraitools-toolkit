import { BaseService } from './base-service';
import type { AskAiRequest, AskAiResponse, AiModel } from '../types/ai';

export class AiService extends BaseService {
  async ask(req: AskAiRequest): Promise<AskAiResponse> {
    return this.post<AskAiResponse>('/ask-ai', req);
  }

  async getModels(): Promise<AiModel[]> {
    const res = await this.get<{ data: AiModel[] }>('/ask-ai/models');
    return res.data;
  }
}
