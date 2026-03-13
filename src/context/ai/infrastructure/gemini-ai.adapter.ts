import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { AIPort } from "../application/ports.ts";
import { AIResponse } from "../domain/ai-message.interface.ts";

export class GeminiAIAdapter implements AIPort {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-3-flash" });
  }

  async generateText(prompt: string): Promise<AIResponse> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text,
      };
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      console.error("[GeminiAIAdapter Error Details]:", error);
      throw new Error(`Failed to generate response from Gemini AI: ${errorMessage}`);
    }
  }
}
