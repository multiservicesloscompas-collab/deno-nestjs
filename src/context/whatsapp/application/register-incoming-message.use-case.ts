import { WhatsAppRepository } from "./ports.ts";
import { MetaWebhookPayload } from "../domain/webhook-payload.interface.ts";
import { WhatsAppMessage } from "../domain/whatsapp-message.interface.ts";
import { ChatWithAIUseCase } from "../../ai/application/ports.ts";
import { SendMessageUseCase } from "./send-message.use-case.ts";

export type RegisterIncomingMessageUseCase = (
  payload: MetaWebhookPayload,
) => Promise<void>;

export const makeRegisterIncomingMessageUseCase = (
  repository: WhatsAppRepository,
  chatWithAIUseCase: ChatWithAIUseCase,
  sendMessageUseCase: SendMessageUseCase,
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
  console.info("[Mensaje recibido en webhook]: ", message)

  await repository.save(message);

  // Procesar con IA (usando memoria)
  try {
    const aiResponse = await chatWithAIUseCase(message.from, message.body);
    console.info("[IA respondió con memoria]: ", aiResponse);

    // Enviar respuesta a WhatsApp
    await sendMessageUseCase(message.from, aiResponse);
  } catch (error) {
    console.error("[Error procesando IA con memoria o enviando respuesta]:", error);
  }
};
