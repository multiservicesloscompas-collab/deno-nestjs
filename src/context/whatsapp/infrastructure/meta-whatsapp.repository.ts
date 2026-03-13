import { WhatsAppRepository } from "../application/ports.ts";
import { WhatsAppMessage } from "../domain/whatsapp-message.interface.ts";
import { env } from "../../../config/env.ts";

export const makeMetaWhatsAppRepository = (): WhatsAppRepository => {
  const { ACCESS_TOKEN: accessToken, PHONE_NUMBER_ID: phoneNumberId } = env.WHATSAPP;
  const apiUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  return {
    send: async ({ to, text }) => {

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta API Error: ${JSON.stringify(error)}`);
      }
    },
    save: (message: WhatsAppMessage) => {
      // Por ahora solo logueamos, aquí iría la persistencia en DB si fuera necesario
      console.log("[WhatsAppRepository] Message received and saved:", message);
      return Promise.resolve();
    },
  };
};
