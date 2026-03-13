import { AIMessage } from "../domain/ai-message.interface.ts";
import { MemoryPort } from "../application/memory.port.ts";

export const makeLocalMemoryAdapter = (): MemoryPort => {
  const conversations = new Map<string, AIMessage[]>();

  return {
    save: async (conversationId, messages) => {
      conversations.set(conversationId, [...messages]);
    },
    get: async (conversationId) => {
      const history = conversations.get(conversationId) || [];
      return [...history];
    },
    append: async (conversationId, message) => {
      const history = conversations.get(conversationId) || [];
      history.push(message);
      conversations.set(conversationId, history);
    },
  };
};
