import { assertRejects } from "@std/assert";
import { makeMetaWhatsAppRepository } from "../meta-whatsapp.repository.ts";

Deno.test(
  "MetaWhatsAppRepository.send throws specific error for Meta code 190",
  async () => {
    // Mock fetch
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: () =>
          Promise.resolve({
            error: {
              message: "Authentication Error",
              code: 190,
              type: "OAuthException",
            },
          }),
      } as Response);

    const repository = makeMetaWhatsAppRepository();

    try {
      const promise = repository.send({ to: "12345", text: "hola" });
      await assertRejects(
        () => promise,
        Error,
        "Meta API Authentication Error (190): El WHATSAPP_ACCESS_TOKEN ha expirado o es inválido. Genera uno nuevo en el portal de Meta for Developers.",
      );
    } finally {
      // Restore fetch
      globalThis.fetch = originalFetch;
    }
  },
);

Deno.test(
  "MetaWhatsAppRepository.send throws generic error for other Meta errors",
  async () => {
    // Mock fetch
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: {
              message: "Some other error",
              code: 100,
            },
          }),
      } as Response);

    const repository = makeMetaWhatsAppRepository();

    try {
      const promise = repository.send({ to: "12345", text: "hola" });
      await assertRejects(
        () => promise,
        Error,
        'Meta API Error: {"error":{"message":"Some other error","code":100}}',
      );
    } finally {
      // Restore fetch
      globalThis.fetch = originalFetch;
    }
  },
);
