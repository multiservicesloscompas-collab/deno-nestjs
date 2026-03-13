import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { AIPort } from "../application/ports.ts";
import { AIMessage, AIResponse } from "../domain/ai-message.interface.ts";
import { SYSTEM_PROMPT } from "../domain/system-prompt.ts";

export class GeminiAIAdapter implements AIPort {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });
  }

  async generateText(prompt: string, history: AIMessage[] = []): Promise<AIResponse> {
    try {
      // Convert history to Gemini format if necessary
      // Google Generative AI SDK handles history in startChat
      const chat = this.model.startChat({
        history: history.map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[GeminiAIAdapter Error Details]:", error);
      throw new Error(`Failed to generate response from Gemini AI: ${errorMessage}`);
    }
  }
}
