import { assertEquals } from "@std/assert";
import { makeRegisterIncomingMessageUseCase } from "../register-incoming-message.use-case.ts";
import {
  WhatsAppRepository,
  MessageBufferPort,
  MessageBufferCallback,
  IncomingMessageDedupPort,
} from "../ports.ts";
import { MetaWebhookPayload } from "../../domain/webhook-payload.interface.ts";

const makePayload = (
  overrides?: Partial<MetaWebhookPayload>,
): MetaWebhookPayload => ({
  object: "whatsapp_business_account",
  entry: [
    {
      id: "conversation-1",
      changes: [
        {
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "123",
              phone_number_id: "phone-1",
            },
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
  ...overrides,
});

const makeMockBuffer = () => {
  let callback: MessageBufferCallback | null = null;

  const messages: Array<{ conversationId: string; sender: string; text: string }> =
    [];

  const buffer: MessageBufferPort = {
    addMessage: (conversationId, sender, text) => {
      messages.push({ conversationId, sender, text });
      if (callback) {
        void callback(conversationId, sender, text);
      }
    },
    subscribe: (cb) => {
      callback = cb;
    },
  };

  return { buffer, messages };
};

Deno.test(
  "RegisterIncomingMessageUseCase sends consolidated buffer payload to AI",
  async () => {
    let aiCalls = 0;
    let lastPrompt = "";
    let lastConversationId = "";

    const mockRepo: WhatsAppRepository = {
      send: () => Promise.resolve(),
      save: async () => {},
    };

    const mockChatWithAI = (_id: string, prompt: string) => {
      aiCalls++;
      lastConversationId = _id;
      lastPrompt = prompt;
      return Promise.resolve("ai response");
    };

    const mockSendMessage = () => Promise.resolve();
    const dedup: IncomingMessageDedupPort = () => Promise.resolve(false);

    const { buffer: mockBuffer, messages: bufferedMessages } = makeMockBuffer();

    const useCase = makeRegisterIncomingMessageUseCase(
      mockRepo,
      mockChatWithAI,
      mockSendMessage,
      mockBuffer,
      dedup,
    );

    const payload = makePayload();

    await useCase(payload);

    assertEquals(bufferedMessages.length, 1);
    assertEquals(bufferedMessages[0].conversationId, "phone-1");
    assertEquals(aiCalls, 1);
    assertEquals(lastConversationId, "phone-1:user1");
    assertEquals(lastPrompt, "hola");
  },
);

Deno.test(
  "RegisterIncomingMessageUseCase skips duplicated messageId",
  async () => {
    let saveCalls = 0;
    let aiCalls = 0;
    let sendCalls = 0;

    const mockRepo: WhatsAppRepository = {
      send: () => Promise.resolve(),
      save: async () => {
        saveCalls++;
      },
    };

    const mockChatWithAI = () => {
      aiCalls++;
      return Promise.resolve("ai response");
    };

    const mockSendMessage = () => {
      sendCalls++;
      return Promise.resolve();
    };

    const dedup: IncomingMessageDedupPort = () => Promise.resolve(true);
    const { buffer: mockBuffer } = makeMockBuffer();

    const useCase = makeRegisterIncomingMessageUseCase(
      mockRepo,
      mockChatWithAI,
      mockSendMessage,
      mockBuffer,
      dedup,
    );

    await useCase(makePayload());

    assertEquals(saveCalls, 0);
    assertEquals(aiCalls, 0);
    assertEquals(sendCalls, 0);
  },
);

Deno.test(
  "RegisterIncomingMessageUseCase ignores invalid payload without sender or conversationId",
  async () => {
    let saveCalls = 0;
    let aiCalls = 0;
    let bufferCalls = 0;

    const mockRepo: WhatsAppRepository = {
      send: () => Promise.resolve(),
      save: async () => {
        saveCalls++;
      },
    };

    const mockChatWithAI = () => {
      aiCalls++;
      return Promise.resolve("ai response");
    };

    const mockSendMessage = () => Promise.resolve();
    const dedup: IncomingMessageDedupPort = () => Promise.resolve(false);

    const mockBuffer: MessageBufferPort = {
      addMessage: () => {
        bufferCalls++;
      },
      subscribe: () => {},
    };

    const useCase = makeRegisterIncomingMessageUseCase(
      mockRepo,
      mockChatWithAI,
      mockSendMessage,
      mockBuffer,
      dedup,
    );

    await useCase(
      makePayload({
        entry: [
          {
            id: "conversation-1",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "123",
                    phone_number_id: "",
                  },
                  messages: [
                    {
                      from: "",
                      id: "m-invalid",
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
      }),
    );

    assertEquals(saveCalls, 0);
    assertEquals(aiCalls, 0);
    assertEquals(bufferCalls, 0);
  },
);
