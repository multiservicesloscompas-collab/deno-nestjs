import { AIResponse } from "../domain/ai-message.interface.ts";
import { AIPort, ChatWithAIUseCase } from "./ports.ts";
import { MemoryPort } from "./memory.port.ts";

export const makeChatWithAIUseCase = (
  aiPort: AIPort,
  memoryPort: MemoryPort
): ChatWithAIUseCase => async (conversationId, prompt) => {
  // 1. Get history
  const history = await memoryPort.get(conversationId);

  // 2. Generate response using history
  const response: AIResponse = await aiPort.generateText(prompt, history);

  // 3. Save conversation (append user and system messages)
  await memoryPort.append(conversationId, { role: "user", content: prompt });
  await memoryPort.append(conversationId, { role: "model", content: response.text });

  return response.text;
};
