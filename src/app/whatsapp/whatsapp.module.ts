import { Module } from "@nestjs/common";
import { WhatsAppController } from "./whatsapp.controller.ts";
import { makeMetaWhatsAppRepository } from "../../context/whatsapp/infrastructure/meta-whatsapp.repository.ts";
import { makeSendMessageUseCase } from "../../context/whatsapp/application/send-message.use-case.ts";
import { makeRegisterIncomingMessageUseCase } from "../../context/whatsapp/application/register-incoming-message.use-case.ts";
import { WhatsAppRepository } from "../../context/whatsapp/application/ports.ts";
import { AIModule, GENERATE_AI_RESPONSE_USE_CASE } from "../ai/ai.module.ts";
import { GenerateAIResponseUseCase } from "../../context/ai/application/ports.ts";
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
      provide: "SEND_MESSAGE_USE_CASE",
      useFactory: (repo: WhatsAppRepository) => makeSendMessageUseCase(repo),
      inject: ["WHATSAPP_REPOSITORY"],
    },
    {
      provide: "REGISTER_INCOMING_MESSAGE_USE_CASE",
      useFactory: (
        repo: WhatsAppRepository,
        generateAI: GenerateAIResponseUseCase,
        sendMessage: SendMessageUseCase,
      ) => makeRegisterIncomingMessageUseCase(repo, generateAI, sendMessage),
      inject: ["WHATSAPP_REPOSITORY", GENERATE_AI_RESPONSE_USE_CASE, "SEND_MESSAGE_USE_CASE"],
    },
  ],
})
export class WhatsAppModule {}
