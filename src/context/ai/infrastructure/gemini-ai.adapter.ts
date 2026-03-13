import { GoogleGenerativeAI, GenerativeModel, SchemaType } from "@google/generative-ai";
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
      tools: [
        {
          functionDeclarations: [
            {
              name: "getCurrentTime",
              description: "Retorna el día y la hora actual en formato ISO.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {},
                required: [],
              },
            },
          ],
        },
      ],
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

      let result = await chat.sendMessage(prompt);
      let response = await result.response;
      let text = response.text();

      // Handle function calls
      const functionCalls = response.candidates?.[0].content.parts.filter(part => part.functionCall);

      if (functionCalls && functionCalls.length > 0) {
        const responses = [];
        for (const call of functionCalls) {
          if (call.functionCall?.name === "getCurrentTime") {
            const currentTime = new Intl.DateTimeFormat('es-VE', {
              timeZone: 'America/Caracas',
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            }).format(new Date());
            responses.push({
              functionResponse: {
                name: "getCurrentTime",
                response: { currentTime },
              },
            });
          }
        }

        if (responses.length > 0) {
          result = await chat.sendMessage(responses);
          response = await result.response;
          text = response.text();
        }
      }

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
