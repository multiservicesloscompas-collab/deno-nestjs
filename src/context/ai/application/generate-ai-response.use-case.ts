import { AIPort, GenerateAIResponseUseCase } from "./ports.ts";

export const makeGenerateAIResponseUseCase = (
  aiPort: AIPort,
): GenerateAIResponseUseCase => async (prompt) => {
  const response = await aiPort.generateText(prompt);
  return response.text;
};
