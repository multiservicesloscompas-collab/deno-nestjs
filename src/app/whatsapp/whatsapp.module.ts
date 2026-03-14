import { Module } from "@nestjs/common";
import { WhatsAppController } from "./whatsapp.controller.ts";
import { makeInMemoryMessageBuffer } from "../../context/whatsapp/infrastructure/message-buffer.adapter.ts";
import { makeMetaWhatsAppRepository } from "../../context/whatsapp/infrastructure/meta-whatsapp.repository.ts";
import { makeSendMessageUseCase } from "../../context/whatsapp/application/send-message.use-case.ts";
import { makeRegisterIncomingMessageUseCase } from "../../context/whatsapp/application/register-incoming-message.use-case.ts";
import {
  WhatsAppRepository,
  MessageBufferPort,
  IncomingMessageDedupPort,
} from "../../context/whatsapp/application/ports.ts";
import { AIModule, CHAT_WITH_AI_USE_CASE } from "../ai/ai.module.ts";
import { ChatWithAIUseCase } from "../../context/ai/application/ports.ts";
import { SendMessageUseCase } from "../../context/whatsapp/application/send-message.use-case.ts";
import { makeLocalMemoryIncomingMessageDedupAdapter } from "../../context/whatsapp/infrastructure/incoming-message-dedup.local-memory.adapter.ts";

export const whatsappProviders = [
  {
    provide: "WHATSAPP_REPOSITORY",
    useFactory: () => makeMetaWhatsAppRepository(),
  },
  {
    provide: "MESSAGE_BUFFER",
    useFactory: () => makeInMemoryMessageBuffer(5000), // 5 segundos de buffer
  },
  {
    provide: "INCOMING_MESSAGE_DEDUP",
    useFactory: (): IncomingMessageDedupPort => {
      const adapter = makeLocalMemoryIncomingMessageDedupAdapter();
      return adapter.isDuplicate;
    },
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
      incomingMessageDedup: IncomingMessageDedupPort,
    ) =>
      makeRegisterIncomingMessageUseCase(
        repo,
        chatWithAI,
        sendMessage,
        messageBuffer,
        incomingMessageDedup,
      ),
    inject: [
      "WHATSAPP_REPOSITORY",
      CHAT_WITH_AI_USE_CASE,
      "SEND_MESSAGE_USE_CASE",
      "MESSAGE_BUFFER",
      "INCOMING_MESSAGE_DEDUP",
    ],
  },
];

@Module({
  imports: [AIModule.register()],
  controllers: [WhatsAppController],
  providers: whatsappProviders,
})
export class WhatsAppModule {}
