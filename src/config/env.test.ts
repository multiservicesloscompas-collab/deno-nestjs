import { assertEquals } from "@std/assert";
import { z } from "zod";

// Re-definimos el esquema para poder probarlo aisladamente sin disparar Deno.exit()
const testSchema = z.object({
  WHATSAPP_ACCESS_TOKEN: z.string({
    required_error: "La variable de entorno WHATSAPP_ACCESS_TOKEN es obligatoria.",
  }).min(1, "WHATSAPP_ACCESS_TOKEN no puede estar vacía."),
  WHATSAPP_PHONE_NUMBER_ID: z.string({
    required_error: "La variable de entorno WHATSAPP_PHONE_NUMBER_ID es obligatoria.",
  }).min(1, "WHATSAPP_PHONE_NUMBER_ID no puede estar vacía."),
  WHATSAPP_VERIFY_TOKEN: z.string({
    required_error: "La variable de entorno WHATSAPP_VERIFY_TOKEN es obligatoria.",
  }).min(1, "WHATSAPP_VERIFY_TOKEN no puede estar vacía."),
  GEMINI_API_KEY: z.string({
    required_error: "La variable de entorno GEMINI_API_KEY es obligatoria.",
  }).min(1, "GEMINI_API_KEY no puede estar vacía."),
}).transform((data) => ({
  WHATSAPP: {
    ACCESS_TOKEN: data.WHATSAPP_ACCESS_TOKEN,
    PHONE_NUMBER_ID: data.WHATSAPP_PHONE_NUMBER_ID,
    VERIFY_TOKEN: data.WHATSAPP_VERIFY_TOKEN,
  },
  AI: {
    GEMINI_API_KEY: data.GEMINI_API_KEY,
  },
}));

Deno.test("Configuración de Entorno - Debe fallar si faltan variables", () => {
  const incompleteEnv = {
    WHATSAPP_ACCESS_TOKEN: "token",
    // Falta WHATSAPP_PHONE_NUMBER_ID
  };

  const result = testSchema.safeParse(incompleteEnv);
  assertEquals(result.success, false);
});

Deno.test("Configuración de Entorno - Debe ser exitosa si todas las variables están presentes", () => {
  const completeEnv = {
    WHATSAPP_ACCESS_TOKEN: "token",
    WHATSAPP_PHONE_NUMBER_ID: "123",
    WHATSAPP_VERIFY_TOKEN: "verify",
    GEMINI_API_KEY: "gemini",
  };

  const result = testSchema.safeParse(completeEnv);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.data.WHATSAPP.ACCESS_TOKEN, "token");
    assertEquals(result.data.AI.GEMINI_API_KEY, "gemini");
  }
});
