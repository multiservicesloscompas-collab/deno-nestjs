import { WhatsAppRepository } from "./ports.ts";

export type SendMessageUseCase = (to: string, text: string) => Promise<void>;

export const makeSendMessageUseCase = (
  repository: WhatsAppRepository,
): SendMessageUseCase =>
async (to, text) => {
  const MAX_LENGTH = 1000;

  if (text.length <= MAX_LENGTH) {
    const formattedText = text.trim();
    const capitalizedText = formattedText.charAt(0).toUpperCase() + formattedText.slice(1);
    return await repository.send({ to, text: capitalizedText });
  }

  const chunks: string[] = [];
  let remainingText = text.trim();

  while (remainingText.length > 0) {
    if (remainingText.length <= MAX_LENGTH) {
      const capitalized = remainingText.charAt(0).toUpperCase() + remainingText.slice(1);
      chunks.push(capitalized);
      break;
    }

    let splitIndex = remainingText.lastIndexOf("\n", MAX_LENGTH);
    if (splitIndex === -1 || splitIndex === 0) {
      splitIndex = remainingText.lastIndexOf(" ", MAX_LENGTH);
    }

    if (splitIndex === -1 || splitIndex === 0) {
      splitIndex = MAX_LENGTH;
    }

    const chunk = remainingText.substring(0, splitIndex).trim();
    if (chunk.length > 0) {
      const capitalized = chunk.charAt(0).toUpperCase() + chunk.slice(1);
      chunks.push(capitalized);
    }

    remainingText = remainingText.substring(splitIndex).trim();
  }

  for (const chunk of chunks) {
    await repository.send({ to, text: chunk });
  }
};
