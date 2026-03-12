import { WhatsAppRepository } from "./ports.ts";

export type SendMessageUseCase = (to: string, text: string) => Promise<void>;

export const makeSendMessageUseCase = (
  repository: WhatsAppRepository,
): SendMessageUseCase =>
async (to, text) => {
  // Aquí podríamos añadir lógica de negocio adicional (validaciones, etc.)
  await repository.send({ to, text });
};
