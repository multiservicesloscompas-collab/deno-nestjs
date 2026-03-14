import { AIMessage } from "../domain/ai-message.interface.ts";

export interface MemoryPort {
  save(conversationId: string, messages: AIMessage[]): Promise<void>;
  get(conversationId: string): Promise<AIMessage[]>;
  append(conversationId: string, message: AIMessage): Promise<void>;
  close?(): Promise<void>;
}
