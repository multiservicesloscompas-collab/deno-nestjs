import { z } from "zod";

const envSchema = z.object({
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

const result = envSchema.safeParse(Deno.env.toObject());

if (!result.success) {
  console.error("❌ Error de configuración: Faltan variables de entorno obligatorias.");
  
  result.error.issues.forEach((issue) => {
    console.error(`   - ${issue.message}`);
  });

  Deno.exit(1);
}

export const env = result.data;
