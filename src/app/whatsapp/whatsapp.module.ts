import { Module } from "@nestjs/common";
import { WhatsAppController } from "./whatsapp.controller.ts";
import { makeInMemoryMessageBuffer } from "../../context/whatsapp/infrastructure/message-buffer.adapter.ts";
import { makeMetaWhatsAppRepository } from "../../context/whatsapp/infrastructure/meta-whatsapp.repository.ts";
import { makeSendMessageUseCase } from "../../context/whatsapp/application/send-message.use-case.ts";
import { makeRegisterIncomingMessageUseCase } from "../../context/whatsapp/application/register-incoming-message.use-case.ts";
import { WhatsAppRepository, MessageBufferPort } from "../../context/whatsapp/application/ports.ts";
import { AIModule, CHAT_WITH_AI_USE_CASE } from "../ai/ai.module.ts";
import { ChatWithAIUseCase } from "../../context/ai/application/ports.ts";
import { SendMessageUseCase } from "../../context/whatsapp/application/send-message.use-case.ts";

@Module({
  imports: [AIModule.register()],
  controllers: [WhatsAppController],
  providers: [
    {
      provide: "WHATSAPP_REPOSITORY",
      useFactory: () => makeMetaWhatsAppRepository(),
    },
    {
      provide: "MESSAGE_BUFFER",
      useFactory: () => makeInMemoryMessageBuffer(5000), // 5 segundos de buffer
    },
    {
      provide: "SEND_MESSAGE_USE_CASE",
      useFactory: (repo: WhatsAppRepository) => makeSendMessageUseCase(repo),
      inject: ["WHATSAPP_REPOSITORY"],
    },
    {
      provide: "REGISTER_INCOMING_MESSAGE_USE_CASE",
      useFactory: (
        repo: WhatsAppRepository,
        chatWithAI: ChatWithAIUseCase,
        sendMessage: SendMessageUseCase,
        messageBuffer: MessageBufferPort,
      ) => makeRegisterIncomingMessageUseCase(repo, chatWithAI, sendMessage, messageBuffer),
      inject: ["WHATSAPP_REPOSITORY", CHAT_WITH_AI_USE_CASE, "SEND_MESSAGE_USE_CASE", "MESSAGE_BUFFER"],
    },
  ],
})
export class WhatsAppModule {}
