import { WhatsAppMessage } from "../domain/whatsapp-message.interface.ts";

export interface SendMessageInput {
  to: string;
  text: string;
}

export type SendMessagePort = (input: SendMessageInput) => Promise<void>;
export type SaveMessagePort = (message: WhatsAppMessage) => Promise<void>;

export type MessageBufferCallback = (sender: string, text: string) => Promise<void>;

export interface MessageBufferPort {
  addMessage(sender: string, text: string): void;
  subscribe(callback: MessageBufferCallback): void;
}

export interface WhatsAppRepository {
  send: SendMessagePort;
  save: SaveMessagePort;
}
