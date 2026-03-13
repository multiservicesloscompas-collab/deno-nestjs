import { assertEquals } from "@std/assert";
import { makeLocalMemoryAdapter } from "./local-memory.adapter.ts";
import { makeChatWithAIUseCase } from "../application/chat-with-ai.use-case.ts";
import { AIPort } from "../application/ports.ts";
import { AIResponse } from "../domain/ai-message.interface.ts";

Deno.test("AI Chat with Memory - LocalMemoryAdapter should save and retrieve history", async () => {
  const adapter = makeLocalMemoryAdapter();
  const conversationId = "test-conv";
  const message = { role: "user" as const, content: "Hello" };

  await adapter.append(conversationId, message);
  const history = await adapter.get(conversationId);

  assertEquals(history.length, 1);
  assertEquals(history[0], message);
});

Deno.test("AI Chat with Memory - ChatWithAIUseCase should use history and update memory", async () => {
  let promptUsed = "";
  let historyUsed: any[] = [];

  const mockAiPort: AIPort = {
    generateText: async (prompt, history) => {
      promptUsed = prompt;
      historyUsed = history || [];
      return { text: "AI Response" } as AIResponse;
    },
  };

  const memoryAdapter = makeLocalMemoryAdapter();
  const chatUseCase = makeChatWithAIUseCase(mockAiPort, memoryAdapter);
  const conversationId = "test-chat";

  // First message
  await chatUseCase(conversationId, "Hello");
  assertEquals(promptUsed, "Hello");
  assertEquals(historyUsed.length, 0);

  // Second message
  await chatUseCase(conversationId, "How are you?");
  assertEquals(promptUsed, "How are you?");
  assertEquals(historyUsed.length, 2); // Prompt 1 + AI Response 1
  assertEquals(historyUsed[0].content, "Hello");
  assertEquals(historyUsed[1].content, "AI Response");
});
