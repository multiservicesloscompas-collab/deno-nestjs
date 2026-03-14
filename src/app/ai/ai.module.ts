import { Module, DynamicModule } from "@nestjs/common";
import { GeminiAIAdapter } from "../../context/ai/infrastructure/gemini-ai.adapter.ts";
import { makeGenerateAIResponseUseCase } from "../../context/ai/application/generate-ai-response.use-case.ts";
import { makeChatWithAIUseCase } from "../../context/ai/application/chat-with-ai.use-case.ts";
import { AIPort } from "../../context/ai/application/ports.ts";
import { makeLocalMemoryAdapter } from "../../context/ai/infrastructure/local-memory.adapter.ts";
import { MemoryPort } from "../../context/ai/application/memory.port.ts";
import { ChatController } from "./chat.controller.ts";
import { env } from "../../config/env.ts";

export const AI_PORT = "AI_PORT";
export const MEMORY_PORT = "MEMORY_PORT";
export const GENERATE_AI_RESPONSE_USE_CASE = "GENERATE_AI_RESPONSE_USE_CASE";
export const CHAT_WITH_AI_USE_CASE = "CHAT_WITH_AI_USE_CASE";

@Module({})
export class AIModule {
  static register(): DynamicModule {
    return {
      module: AIModule,
      controllers: [ChatController],
      providers: [
        {
          provide: AI_PORT,
          useFactory: () => {
            return new GeminiAIAdapter(env.AI.GEMINI_API_KEY);
          },
        },
        {
          provide: MEMORY_PORT,
          useFactory: () => makeLocalMemoryAdapter(),
        },
        {
          provide: GENERATE_AI_RESPONSE_USE_CASE,
          useFactory: (aiPort: AIPort) => makeGenerateAIResponseUseCase(aiPort),
          inject: [AI_PORT],
        },
        {
          provide: CHAT_WITH_AI_USE_CASE,
          useFactory: (aiPort: AIPort, memoryPort: MemoryPort) =>
            makeChatWithAIUseCase(aiPort, memoryPort, {
              maxHistoryMessages: 20,
              maxHistoryChars: 12000,
            }),
          inject: [AI_PORT, MEMORY_PORT],
        },
      ],
      exports: [GENERATE_AI_RESPONSE_USE_CASE, CHAT_WITH_AI_USE_CASE],
    };
  }
}
