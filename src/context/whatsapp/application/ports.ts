import { WhatsAppMessage } from "../domain/whatsapp-message.interface.ts";

export interface SendMessageInput {
  to: string;
  text: string;
}

export type SendMessagePort = (input: SendMessageInput) => Promise<void>;
export type SaveMessagePort = (message: WhatsAppMessage) => Promise<void>;

export type MessageBufferCallback = (
  conversationId: string,
  sender: string,
  consolidatedText: string,
) => Promise<void>;

export type IncomingMessageDedupPort = (messageId: string) => Promise<boolean>;

export interface MessageBufferPort {
  addMessage(conversationId: string, sender: string, text: string): void;
  subscribe(callback: MessageBufferCallback): void;
}

export interface WhatsAppRepository {
  send: SendMessagePort;
  save: SaveMessagePort;
}
