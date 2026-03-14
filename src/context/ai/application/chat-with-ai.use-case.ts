import { AIResponse } from "../domain/ai-message.interface.ts";
import { AIPort, ChatWithAIUseCase } from "./ports.ts";
import { MemoryPort } from "./memory.port.ts";

export const makeChatWithAIUseCase =
  (aiPort: AIPort, memoryPort: MemoryPort): ChatWithAIUseCase =>
  async (conversationId: string, prompt: string) => {
    console.info(
      `[ChatWithAI] 🎯 START | Conversation: ${conversationId} | Prompt length: ${prompt.length} chars`,
    );

    // 1. Get history
    const history = await memoryPort.get(conversationId);
    console.debug(
      `[ChatWithAI] 📖 History retrieved: ${history.length} messages`,
    );

    // 2. Save user message immediately so it's not lost on error
    console.debug(`[ChatWithAI] 💾 Appending user message to memory`);
    await memoryPort.append(conversationId, { role: "user", content: prompt });

    // 3. Generate response using history
    const response: AIResponse = await aiPort.generateText(prompt, history);
    console.debug(
      `[ChatWithAI] 🤖 AI response received: ${response.text.length} chars`,
    );

    // 4. Save model response
    await memoryPort.append(conversationId, {
      role: "model",
      content: response.text,
    });
    console.debug(`[ChatWithAI] 💾 Model response saved`);

    console.info(`[ChatWithAI] ✅ COMPLETE | Conversation: ${conversationId}`);

    return response.text;
  };
