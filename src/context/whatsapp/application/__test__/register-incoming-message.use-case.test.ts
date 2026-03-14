import { assertEquals } from "@std/assert";
import { makeRegisterIncomingMessageUseCase } from "../register-incoming-message.use-case.ts";
import {
  WhatsAppRepository,
  MessageBufferPort,
  MessageBufferCallback,
} from "../ports.ts";
import { MetaWebhookPayload } from "../../domain/webhook-payload.interface.ts";

Deno.test(
  "RegisterIncomingMessageUseCase uses buffer to group messages",
  async () => {
    let aiCalls = 0;
    let lastPrompt = "";

    const mockRepo: Partial<WhatsAppRepository> = {
      save: async () => {},
    };

    const mockChatWithAI = (_id: string, prompt: string) => {
      aiCalls++;
      lastPrompt = prompt;
      return Promise.resolve("ai response");
    };

    const mockSendMessage = () => Promise.resolve();

    // Simple manual buffer for testing
    let bufferCallback: MessageBufferCallback | null = null;
    const mockBuffer: MessageBufferPort = {
      addMessage: (_sender, text) => {
        if (bufferCallback) bufferCallback(_sender, text);
      },
      subscribe: (cb) => {
        bufferCallback = cb;
      },
    };

    const useCase = makeRegisterIncomingMessageUseCase(
      mockRepo as WhatsAppRepository,
      mockChatWithAI,
      mockSendMessage,
      mockBuffer,
    );

    const payload: MetaWebhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "1",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: { display_phone_number: "123", phone_number_id: "1" },
                messages: [
                  {
                    from: "user1",
                    id: "m1",
                    timestamp: "123",
                    text: { body: "hola" },
                    type: "text",
                  },
                ],
              },
              field: "messages",
            },
          ],
        },
      ],
    };

    await useCase(payload);

    assertEquals(aiCalls, 1);
    assertEquals(lastPrompt, "hola");
  },
);
