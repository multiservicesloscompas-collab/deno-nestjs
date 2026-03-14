import { AIMessage } from "../domain/ai-message.interface.ts";
import { MemoryPort } from "../application/memory.port.ts";

const conversationKey = (conversationId: string): Deno.KvKey => [
  "conversation-memory",
  conversationId,
];

const toStoredValue = (messages: AIMessage[]) => ({
  messages,
});

const fromStoredValue = (value: unknown): AIMessage[] => {
  if (!value || typeof value !== "object") {
    return [];
  }

  const maybeRecord = value as { messages?: unknown };
  if (!Array.isArray(maybeRecord.messages)) {
    return [];
  }

  return maybeRecord.messages.filter((message): message is AIMessage => {
    if (!message || typeof message !== "object") {
      return false;
    }

    const maybeMessage = message as { role?: unknown; content?: unknown };
    const isRoleValid =
      maybeMessage.role === "user" ||
      maybeMessage.role === "model" ||
      maybeMessage.role === "system";

    return isRoleValid && typeof maybeMessage.content === "string";
  });
};

export const makeKvMemoryAdapter = (kv: Deno.Kv): MemoryPort => {
  return {
    save: async (conversationId: string, messages: AIMessage[]) => {
      await kv.set(conversationKey(conversationId), toStoredValue(messages));
    },
    get: async (conversationId: string) => {
      const entry = await kv.get(conversationKey(conversationId));
      return fromStoredValue(entry.value);
    },
    append: async (conversationId: string, message: AIMessage) => {
      const key = conversationKey(conversationId);

      while (true) {
        const current = await kv.get(key);
        const messages = fromStoredValue(current.value);
        const updated = [...messages, message];

        const result = await kv.atomic()
          .check(current)
          .set(key, toStoredValue(updated))
          .commit();

        if (result.ok) {
          return;
        }
      }
    },
    close: async () => {
      kv.close();
    },
  };
};

export const makeDenoKvMemoryAdapter = async (
  path?: string,
): Promise<MemoryPort> => {
  if (!("openKv" in Deno)) {
    throw new Error(
      "Deno KV no está disponible en este runtime. Ejecuta con --unstable-kv o usa otro MemoryPort.",
    );
  }

  const kv = await Deno.openKv(path);
  return makeKvMemoryAdapter(kv);
};
