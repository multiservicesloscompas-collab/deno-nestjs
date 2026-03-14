import { assertEquals } from "@std/assert";
import { makeSendMessageUseCase } from "../send-message.use-case.ts";
import { WhatsAppRepository } from "../ports.ts";

Deno.test(
  "SendMessageUseCase splits long messages at word boundaries and capitalizes",
  async () => {
    const sentMessages: string[] = [];

    const mockRepo: Partial<WhatsAppRepository> = {
      send: ({ text }) => {
        sentMessages.push(text);
        return Promise.resolve();
      },
    };

    const useCase = makeSendMessageUseCase(mockRepo as WhatsAppRepository);

    // Mensaje largo con espacios
    const part1 =
      "esto es una prueba que sobrepasa los mil caracteres y debe ser cortada en un espacio. ".repeat(
        15,
      ); // > 1000
    const part2 =
      "esta es la segunda parte que tambien debe estar capitalizada.";
    const longText = part1 + "\n" + part2;

    await useCase("12345", longText);

    assertEquals(sentMessages.length >= 2, true);

    // Verify each chunk starts with uppercase
    for (const msg of sentMessages) {
      const firstChar = msg.charAt(0);
      assertEquals(
        firstChar,
        firstChar.toUpperCase(),
        `Message should start with uppercase: ${msg.substring(0, 20)}...`,
      );
    }

    // Verify that the part after newline is present in the last chunk
    const lastMsg = sentMessages[sentMessages.length - 1];
    assertEquals(lastMsg.includes("esta es la segunda parte"), true);

    // Verify no message exceeds 1000
    for (const msg of sentMessages) {
      assertEquals(msg.length <= 1000, true);
    }
  },
);

Deno.test(
  "SendMessageUseCase sends short messages and capitalizes",
  async () => {
    const sentMessages: string[] = [];

    const mockRepo: Partial<WhatsAppRepository> = {
      send: ({ text }) => {
        sentMessages.push(text);
        return Promise.resolve();
      },
    };

    const useCase = makeSendMessageUseCase(mockRepo as WhatsAppRepository);
    const shortText = "hola";

    await useCase("12345", shortText);

    assertEquals(sentMessages.length, 1);
    assertEquals(sentMessages[0], "Hola");
  },
);
