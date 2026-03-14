import { assertEquals, assertExists } from "@std/assert";
import { IncomingMessageDedupPort } from "../../context/whatsapp/application/ports.ts";

Deno.test("WhatsAppModule wires INCOMING_MESSAGE_DEDUP with local-memory adapter", async () => {
  Deno.env.set("WHATSAPP_ACCESS_TOKEN", "test-token");
  Deno.env.set("WHATSAPP_PHONE_NUMBER_ID", "test-phone-id");
  Deno.env.set("WHATSAPP_VERIFY_TOKEN", "test-verify-token");
  Deno.env.set("GEMINI_API_KEY", "test-gemini-key");

  const { whatsappProviders } = await import("./whatsapp.module.ts");

  const dedupProvider = whatsappProviders.find((provider) => {
    return (
      typeof provider === "object" &&
      provider !== null &&
      "provide" in provider &&
      provider.provide === "INCOMING_MESSAGE_DEDUP"
    );
  }) as { useFactory?: () => IncomingMessageDedupPort | Promise<IncomingMessageDedupPort> } | undefined;

  assertExists(dedupProvider);

  if (!dedupProvider?.useFactory || typeof dedupProvider.useFactory !== "function") {
    throw new Error("Expected INCOMING_MESSAGE_DEDUP provider to define useFactory");
  }

  const maybePort = dedupProvider.useFactory();
  const port: IncomingMessageDedupPort = maybePort instanceof Promise
    ? await maybePort
    : maybePort;

  assertEquals(await port("msg-1"), false);
  assertEquals(await port("msg-1"), true);
});
