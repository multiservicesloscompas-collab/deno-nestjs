import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { WhatsAppController } from "./whatsapp.controller.ts";

// Mocking Response and UseCases
const mockResponse = () => {
  const res: any = {
    status: (code: number) => {
      res.statusCode = code;
      return res;
    },
    send: (body: any) => {
      res.body = body;
      return res;
    },
    end: () => res,
    statusCode: 0,
    body: null,
  };
  return res;
};

const mockUseCase = () => async () => {};

Deno.test("WhatsAppController.verifyWebhook returns 403 if token doesn't match", () => {
  // Configurar ENV (o no configurarlo para probar el default)
  Deno.env.set("WHATSAPP_VERIFY_TOKEN", "mi_token_secreto");
  
  const controller = new WhatsAppController(mockUseCase() as any, mockUseCase() as any);
  const res = mockResponse();
  
  controller.verifyWebhook("subscribe", "wrong_token", "12345", res);
  
  assertEquals(res.statusCode, 403);
});

Deno.test("WhatsAppController.verifyWebhook returns challenge if token matches", () => {
  Deno.env.set("WHATSAPP_VERIFY_TOKEN", "mi_token_secreto");
  
  const controller = new WhatsAppController(mockUseCase() as any, mockUseCase() as any);
  const res = mockResponse();
  const challenge = "12345";
  
  controller.verifyWebhook("subscribe", "mi_token_secreto", challenge, res);
  
  assertEquals(res.statusCode, 200);
  assertEquals(res.body, challenge);
});

Deno.test("WhatsAppController.verifyWebhook returns 403 if ENV is NOT set and token is from .env", () => {
  // Asegurarse de que NO esté seteado
  Deno.env.delete("WHATSAPP_VERIFY_TOKEN");
  
  const controller = new WhatsAppController(mockUseCase() as any, mockUseCase() as any);
  const res = mockResponse();
  const tokenFromEnvFile = "mi_token_secreto_lc_loscompas-123";
  
  controller.verifyWebhook("subscribe", tokenFromEnvFile, "12345", res);
  
  // Esto debería dar 403 porque el default en el controlador es "my_token"
  assertEquals(res.statusCode, 403);
});
