import { AIResponse } from "../domain/ai-message.interface.ts";

export interface AIPort {
  generateText(prompt: string): Promise<AIResponse>;
}

export type GenerateAIResponseUseCase = (prompt: string) => Promise<string>;
