import {
  WhatsAppRepository,
  MessageBufferPort,
  IncomingMessageDedupPort,
} from "./ports.ts";
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
  isDuplicateMessage: IncomingMessageDedupPort,
): RegisterIncomingMessageUseCase => {
  messageBuffer.subscribe(async (conversationId, sender, mergedText) => {
    try {
      console.info(
        `[RegisterMessage] 📥 BUFFER READY | Conversation: ${conversationId} | Sender: ${sender}`,
      );

      const aiConversationId = `${conversationId}:${sender}`;
      const aiResponse = await chatWithAIUseCase(aiConversationId, mergedText);

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
      console.warn("[RegisterMessage] ⚠️ EMPTY PAYLOAD | No message data");
      return;
    }

    const sender = messageData.from;
    const conversationId = change.value.metadata.phone_number_id;
    const text = messageData.text?.body;
    const messageId = messageData.id;

    if (!sender || !conversationId || !text || !messageId) {
      console.warn(
        "[RegisterMessage] ⚠️ Invalid inbound message: missing sender/conversationId/text/messageId",
      );
      return;
    }

    if (await isDuplicateMessage(messageId)) {
      console.info(
        `[RegisterMessage] ♻️ Duplicate message ignored | MessageID: ${messageId}`,
      );
      return;
    }

    const message: WhatsAppMessage = {
      from: sender,
      to: change.value.metadata.display_phone_number,
      body: text,
      timestamp: Number(messageData.timestamp),
      messageId,
    };

    console.info(
      `[RegisterMessage] 📨 NEW MESSAGE RECEIVED | From: ${message.from} | To: ${message.to} | MessageID: ${message.messageId}`,
    );

    await repository.save(message);

    messageBuffer.addMessage(conversationId, message.from, message.body);
  };
};
