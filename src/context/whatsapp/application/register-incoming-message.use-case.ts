import { WhatsAppRepository, MessageBufferPort } from "./ports.ts";
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
  messageBuffer: MessageBufferPort,
): RegisterIncomingMessageUseCase => {
  messageBuffer.subscribe(async (sender, mergedText) => {
    try {
      console.info(
        `[RegisterMessage] 📥 BUFFER READY | Sender: ${sender} | Text length: ${mergedText.length} chars`,
      );
      console.debug(
        `[RegisterMessage] 📥 Merged text preview: "${mergedText.substring(0, 100)}${mergedText.length > 100 ? "..." : ""}"`,
      );

      const aiResponse = await chatWithAIUseCase(sender, mergedText);
      console.debug(
        `[IA] 🤖 Response preview: "${aiResponse.substring(0, 100)}${aiResponse.length > 100 ? "..." : ""}"`,
      );

      await sendMessageUseCase(sender, aiResponse);
      console.info(`[RegisterMessage] ✅ RESPONSE SENT | Sender: ${sender}`);
    } catch (error) {
      console.error(
        "[RegisterMessage] ❌ Error procesando IA buffered o enviando respuesta:",
        error,
      );
    }
  });

  return async (payload) => {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const messageData = change?.value?.messages?.[0];

    if (!messageData) {
      console.debug(
        "[RegisterMessage] ⚠️ No message data in payload, skipping",
      );
      return;
    }

    const message: WhatsAppMessage = {
      from: messageData.from,
      to: change.value.metadata.display_phone_number,
      body: messageData.text.body,
      timestamp: Number(messageData.timestamp),
      messageId: messageData.id,
    };

    console.info(
      `[RegisterMessage] 📨 NEW MESSAGE RECEIVED | From: ${message.from} | To: ${message.to} | MessageID: ${message.messageId}`,
    );
    console.debug(
      `[RegisterMessage] 📝 Message body: "${message.body}" | Timestamp: ${message.timestamp}`,
    );

    await repository.save(message);
    console.debug(`[RegisterMessage] 💾 Message saved to repository`);

    // En lugar de procesar inmediatamente, añadimos al buffer
    console.debug(
      `[RegisterMessage] 📤 Adding to message buffer for sender: ${message.from}`,
    );
    messageBuffer.addMessage(message.from, message.body);
  };
};
