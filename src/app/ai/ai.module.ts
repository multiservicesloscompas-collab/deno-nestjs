import { Module, DynamicModule } from "@nestjs/common";
import { GeminiAIAdapter } from "../../context/ai/infrastructure/gemini-ai.adapter.ts";
import { makeGenerateAIResponseUseCase } from "../../context/ai/application/generate-ai-response.use-case.ts";
import { env } from "../../config/env.ts";

export const AI_PORT = "AI_PORT";
export const GENERATE_AI_RESPONSE_USE_CASE = "GENERATE_AI_RESPONSE_USE_CASE";

@Module({})
export class AIModule {
  static register(): DynamicModule {
    return {
      module: AIModule,
      providers: [
        {
          provide: AI_PORT,
          useFactory: () => {
            return new GeminiAIAdapter(env.AI.GEMINI_API_KEY);
          },
        },
        {
          provide: GENERATE_AI_RESPONSE_USE_CASE,
          useFactory: (aiPort: GeminiAIAdapter) => makeGenerateAIResponseUseCase(aiPort),
          inject: [AI_PORT],
        },
      ],
      exports: [GENERATE_AI_RESPONSE_USE_CASE],
    };
  }
}
