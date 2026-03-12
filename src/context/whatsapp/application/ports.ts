import { WhatsAppMessage } from "../domain/whatsapp-message.interface.ts";

export interface SendMessageInput {
  to: string;
  text: string;
}

export type SendMessagePort = (input: SendMessageInput) => Promise<void>;
export type SaveMessagePort = (message: WhatsAppMessage) => Promise<void>;

export interface WhatsAppRepository {
  send: SendMessagePort;
  save: SaveMessagePort;
}
