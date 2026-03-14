import { assertEquals, assertExists } from "@std/assert";
import { MemoryPort } from "../../context/ai/application/memory.port.ts";

Deno.test("AIModule wires MEMORY_PORT with LocalMemoryAdapter", async () => {
    Deno.env.set("WHATSAPP_ACCESS_TOKEN", "test-token");
    Deno.env.set("WHATSAPP_PHONE_NUMBER_ID", "test-phone-id");
    Deno.env.set("WHATSAPP_VERIFY_TOKEN", "test-verify-token");
    Deno.env.set("GEMINI_API_KEY", "test-gemini-key");

    const { AIModule, MEMORY_PORT } = await import("./ai.module.ts");

    const dynamicModule = AIModule.register();
    const providers = dynamicModule.providers ?? [];

    const memoryProvider = providers.find((provider) => {
      return (
        typeof provider === "object" &&
        provider !== null &&
        "provide" in provider &&
        provider.provide === MEMORY_PORT
      );
    });

    assertExists(memoryProvider);
    if (
      typeof memoryProvider !== "object" ||
      memoryProvider === null ||
      !("useFactory" in memoryProvider) ||
      typeof memoryProvider.useFactory !== "function"
    ) {
      throw new Error("Expected MEMORY_PORT provider to define useFactory");
    }

    const memoryPort = memoryProvider.useFactory() as MemoryPort;

    await memoryPort.append("conversation-local", {
      role: "user",
      content: "Hola",
    });

    const history = await memoryPort.get("conversation-local");

    assertEquals(history, [{ role: "user", content: "Hola" }]);
});
