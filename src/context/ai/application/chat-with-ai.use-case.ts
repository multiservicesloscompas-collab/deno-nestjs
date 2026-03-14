import { AIResponse } from "../domain/ai-message.interface.ts";
import { AIMessage } from "../domain/ai-message.interface.ts";
import { AIPort, ChatWithAIUseCase } from "./ports.ts";
import { MemoryPort } from "./memory.port.ts";

export interface ChatHistoryLimits {
  maxHistoryMessages: number;
  maxHistoryChars: number;
}

const defaultHistoryLimits: ChatHistoryLimits = {
  maxHistoryMessages: 20,
  maxHistoryChars: 12000,
};

const sliceHistoryByLimits = (
  history: AIMessage[],
  limits: ChatHistoryLimits,
) => {
  const maxMessages = Math.max(0, limits.maxHistoryMessages);
  const maxChars = Math.max(0, limits.maxHistoryChars);

  if (maxMessages === 0 || maxChars === 0) {
    return [];
  }

  const reversed = [...history].reverse();
  const selected: AIMessage[] = [];
  let currentChars = 0;

  for (const message of reversed) {
    if (selected.length >= maxMessages) {
      break;
    }

    const nextChars = currentChars + message.content.length;
    if (nextChars > maxChars) {
      break;
    }

    selected.push(message);
    currentChars = nextChars;
  }

  return selected.reverse();
};

export const makeChatWithAIUseCase =
  (
    aiPort: AIPort,
    memoryPort: MemoryPort,
    historyLimits: ChatHistoryLimits = defaultHistoryLimits,
  ): ChatWithAIUseCase =>
  async (conversationId: string, prompt: string) => {
    console.info(
      `[ChatWithAI] 🎯 START | Conversation: ${conversationId}`,
    );

    try {
      const storedHistory = await memoryPort.get(conversationId);
      const history = sliceHistoryByLimits(storedHistory, historyLimits);

      await memoryPort.append(conversationId, { role: "user", content: prompt });

      console.info("[ChatWithAI] 🧠 LLM INPUT", {
        conversationId,
        prompt,
        history,
      });

      const response: AIResponse = await aiPort.generateText(prompt, history);

      await memoryPort.append(conversationId, {
        role: "model",
        content: response.text,
      });

      console.info(`[ChatWithAI] ✅ COMPLETE | Conversation: ${conversationId}`);

      return response.text;
    } catch (error) {
      console.error(
        `[ChatWithAI] ❌ ERROR | Conversation: ${conversationId}`,
        error,
      );
      throw error;
    }
  };
