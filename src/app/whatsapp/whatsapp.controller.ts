import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, Res } from "npm:@nestjs/common";
import type { Response } from "npm:express";
import type { SendMessageUseCase } from "../../context/whatsapp/application/send-message.use-case.ts";
import type { RegisterIncomingMessageUseCase } from "../../context/whatsapp/application/register-incoming-message.use-case.ts";
import type { MetaWebhookPayload } from "../../context/whatsapp/domain/webhook-payload.interface.ts";

@Controller("whatsapp")
export class WhatsAppController {
  constructor(
    @Inject("SEND_MESSAGE_USE_CASE")
    private readonly sendMessageUseCase: SendMessageUseCase,
    @Inject("REGISTER_INCOMING_MESSAGE_USE_CASE")
    private readonly registerIncomingMessageUseCase: RegisterIncomingMessageUseCase,
  ) {}

  @Get("webhook")
  verifyWebhook(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "my_token";

    if (mode === "subscribe" && token === verifyToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: MetaWebhookPayload) {
    await this.registerIncomingMessageUseCase(payload);
    return { status: "received" };
  }

  @Post("send")
  async sendMessage(@Body() body: { to: string; message: string }) {
    await this.sendMessageUseCase(body.to, body.message);
    return { status: "sent" };
  }
}
