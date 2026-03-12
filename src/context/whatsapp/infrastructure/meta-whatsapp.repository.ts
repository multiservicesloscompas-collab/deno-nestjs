import { WhatsAppRepository } from "../application/ports.ts";
import { WhatsAppMessage } from "../domain/whatsapp-message.interface.ts";

export const makeMetaWhatsAppRepository = (): WhatsAppRepository => {
  const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const apiUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  return {
    send: async ({ to, text }) => {
      if (!accessToken || !phoneNumberId) {
        console.warn("[WhatsAppRepository] Missing credentials. Message logged only.");
        console.log(`[WhatsApp] To: ${to}, Text: ${text}`);
        return;
      }

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
