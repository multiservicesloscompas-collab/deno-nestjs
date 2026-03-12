import { WhatsAppRepository } from "./ports.ts";
import { MetaWebhookPayload } from "../domain/webhook-payload.interface.ts";
import { WhatsAppMessage } from "../domain/whatsapp-message.interface.ts";
import { GenerateAIResponseUseCase } from "../../ai/application/ports.ts";
import { SendMessageUseCase } from "./send-message.use-case.ts";

export type RegisterIncomingMessageUseCase = (
  payload: MetaWebhookPayload,
) => Promise<void>;

export const makeRegisterIncomingMessageUseCase = (
  repository: WhatsAppRepository,
  generateAIResponseUseCase: GenerateAIResponseUseCase,
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

  // Procesar con IA
  try {
    const aiResponse = await generateAIResponseUseCase(message.body);
    console.info("[IA respondió]: ", aiResponse);

    // Enviar respuesta a WhatsApp
    await sendMessageUseCase(message.from, aiResponse);
  } catch (error) {
    console.error("[Error procesando IA o enviando respuesta]:", error);
  }
};
