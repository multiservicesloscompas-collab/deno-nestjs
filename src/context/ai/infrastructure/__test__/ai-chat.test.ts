import { assertEquals } from "@std/assert";
import { makeLocalMemoryAdapter } from "../local-memory.adapter.ts";
import { makeChatWithAIUseCase } from "../../application/chat-with-ai.use-case.ts";
import { AIPort } from "../../application/ports.ts";
import { AIMessage, AIResponse } from "../../domain/ai-message.interface.ts";

Deno.test(
  "AI Chat with Memory - LocalMemoryAdapter should save and retrieve history",
  async () => {
    const adapter = makeLocalMemoryAdapter();
    const conversationId = "test-conv";
    const message = { role: "user" as const, content: "Hello" };

    await adapter.append(conversationId, message);
    const history = await adapter.get(conversationId);

    assertEquals(history.length, 1);
    assertEquals(history[0], message);
  },
);

Deno.test(
  "AI Chat with Memory - ChatWithAIUseCase should use history and update memory",
  async () => {
    let promptUsed = "";
    let historyUsed: AIMessage[] = [];

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
  },
);

Deno.test(
  "AI Chat with Memory - ChatWithAIUseCase should bound history by configured limits",
  async () => {
    let historyUsed: AIMessage[] = [];

    const mockAiPort: AIPort = {
      generateText: async (_prompt, history) => {
        historyUsed = history || [];
        return { text: "bounded-response" } as AIResponse;
      },
    };

    const memoryAdapter = makeLocalMemoryAdapter();
    const conversationId = "test-history-bounds";

    await memoryAdapter.save(conversationId, [
      { role: "user", content: "1111111111" },
      { role: "model", content: "2222222222" },
      { role: "user", content: "3333333333" },
      { role: "model", content: "4444444444" },
    ]);

    const chatUseCase = makeChatWithAIUseCase(mockAiPort, memoryAdapter, {
      maxHistoryMessages: 2,
      maxHistoryChars: 20,
    });

    await chatUseCase(conversationId, "new turn prompt");

    assertEquals(historyUsed.length, 2);
    assertEquals(historyUsed[0].content, "3333333333");
    assertEquals(historyUsed[1].content, "4444444444");
  },
);

Deno.test(
  "AI Chat with Memory - ChatWithAIUseCase should log full LLM input before generateText",
  async () => {
    const infoCalls: unknown[][] = [];
    const originalConsoleInfo = console.info;

    console.info = (...args: unknown[]) => {
      infoCalls.push(args);
    };

    try {
      const conversationId = "conv-log-1";
      const prompt = "mensaje consolidado completo";

      const memoryAdapter = makeLocalMemoryAdapter();
      await memoryAdapter.save(conversationId, [
        { role: "user", content: "hola" },
        { role: "model", content: "¡hola!" },
      ]);

      const expectedHistory: AIMessage[] = [
        { role: "user", content: "hola" },
        { role: "model", content: "¡hola!" },
      ];

      const mockAiPort: AIPort = {
        generateText: async () => {
          const llmInputCall = infoCalls.find(
            (call) => call[0] === "[ChatWithAI] 🧠 LLM INPUT",
          );

          assertEquals(!!llmInputCall, true);
          if (!llmInputCall) {
            return { text: "AI Response" } as AIResponse;
          }

          assertEquals(llmInputCall[1], {
            conversationId,
            prompt,
            history: expectedHistory,
          });

          return { text: "AI Response" } as AIResponse;
        },
      };

      const chatUseCase = makeChatWithAIUseCase(mockAiPort, memoryAdapter);
      await chatUseCase(conversationId, prompt);
    } finally {
      console.info = originalConsoleInfo;
    }
  },
);
