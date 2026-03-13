import { AIMessage, AIResponse } from "../domain/ai-message.interface.ts";

export interface AIPort {
  generateText(prompt: string, history?: AIMessage[]): Promise<AIResponse>;
}

export type GenerateAIResponseUseCase = (prompt: string) => Promise<string>;

export type ChatWithAIUseCase = (conversationId: string, prompt: string) => Promise<string>;
