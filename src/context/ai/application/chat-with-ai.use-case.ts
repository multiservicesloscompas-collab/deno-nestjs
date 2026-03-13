import { AIResponse } from "../domain/ai-message.interface.ts";
import { AIPort, ChatWithAIUseCase } from "./ports.ts";
import { MemoryPort } from "./memory.port.ts";

export const makeChatWithAIUseCase = (
  aiPort: AIPort,
  memoryPort: MemoryPort
): ChatWithAIUseCase => async (conversationId: string, prompt: string) => {
  // 1. Get history
  const history = await memoryPort.get(conversationId);

  // 2. Save user message immediately so it's not lost on error
  await memoryPort.append(conversationId, { role: "user", content: prompt });

  // 3. Generate response using history
  const response: AIResponse = await aiPort.generateText(prompt, history);

  // 4. Save model response
  await memoryPort.append(conversationId, { role: "model", content: response.text });

  return response.text;
};
