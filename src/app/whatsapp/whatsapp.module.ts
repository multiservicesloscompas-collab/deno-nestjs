import { Module } from "npm:@nestjs/common";
import { WhatsAppController } from "./whatsapp.controller.ts";
import { makeMetaWhatsAppRepository } from "../../context/whatsapp/infrastructure/meta-whatsapp.repository.ts";
import { makeSendMessageUseCase } from "../../context/whatsapp/application/send-message.use-case.ts";
import { makeRegisterIncomingMessageUseCase } from "../../context/whatsapp/application/register-incoming-message.use-case.ts";
import { WhatsAppRepository } from "../../context/whatsapp/application/ports.ts";

@Module({
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
      useFactory: (repo: WhatsAppRepository) => makeRegisterIncomingMessageUseCase(repo),
      inject: ["WHATSAPP_REPOSITORY"],
    },
  ],
})
export class WhatsAppModule {}
