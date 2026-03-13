import { Body, Controller, Inject, Post } from "@nestjs/common";
import type { ChatWithAIUseCase } from "../../context/ai/application/ports.ts";

@Controller("ai")
export class ChatController {
  constructor(
    @Inject("CHAT_WITH_AI_USE_CASE")
    private readonly chatWithAIUseCase: ChatWithAIUseCase,
  ) {}

  @Post("chat")
  async chat(@Body() body: { conversationId: string; message: string }) {
    const response = await this.chatWithAIUseCase(body.conversationId, body.message);
    return { response };
  }
}
