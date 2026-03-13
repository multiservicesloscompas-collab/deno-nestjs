import { AIMessage } from "../domain/ai-message.interface.ts";
import { MemoryPort } from "../application/memory.port.ts";

const conversations = new Map<string, AIMessage[]>();

export const makeLocalMemoryAdapter = (): MemoryPort => {
  return {
    save: async (conversationId: string, messages: AIMessage[]) => {
      conversations.set(conversationId, [...messages]);
    },
    get: async (conversationId: string) => {
      const history = conversations.get(conversationId) || [];
      return [...history];
    },
    append: async (conversationId: string, message: AIMessage) => {
      const history = conversations.get(conversationId) || [];
      history.push(message);
      conversations.set(conversationId, history);
    },
  };
};
