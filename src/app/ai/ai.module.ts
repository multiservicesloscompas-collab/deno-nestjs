import { Module, DynamicModule } from "@nestjs/common";
import { GeminiAIAdapter } from "../../context/ai/infrastructure/gemini-ai.adapter.ts";
import { makeGenerateAIResponseUseCase } from "../../context/ai/application/generate-ai-response.use-case.ts";

export const GENERATE_AI_RESPONSE_USE_CASE = "GENERATE_AI_RESPONSE_USE_CASE";
export const AI_PORT = "AI_PORT";

@Module({})
export class AIModule {
  static register(): DynamicModule {
    return {
      module: AIModule,
      providers: [
        {
          provide: AI_PORT,
          useFactory: () => {
            const apiKey = Deno.env.get("GEMINI_API_KEY");
            if (!apiKey) {
              console.warn("GEMINI_API_KEY is not defined in environment variables");
            }
            return new GeminiAIAdapter(apiKey || "");
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
