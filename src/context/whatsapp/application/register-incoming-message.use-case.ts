import { WhatsAppRepository } from "./ports.ts";
import { MetaWebhookPayload } from "../domain/webhook-payload.interface.ts";
import { WhatsAppMessage } from "../domain/whatsapp-message.interface.ts";

export type RegisterIncomingMessageUseCase = (
  payload: MetaWebhookPayload,
) => Promise<void>;

export const makeRegisterIncomingMessageUseCase = (
  repository: WhatsAppRepository,
): RegisterIncomingMessageUseCase =>
async (payload) => {
  const entry = payload.entry?.[0];
  const change = entry?.changes?.[0];
  const messageData = change?.value?.messages?.[0];

  if (!messageData) return;

  const message: WhatsAppMessage = {
    from: messageData.from,
    to: change.value.metadata.display_phone_number,
    body: messageData.text.body,
    timestamp: Number(messageData.timestamp),
    messageId: messageData.id,
  };

  await repository.save(message);
};
