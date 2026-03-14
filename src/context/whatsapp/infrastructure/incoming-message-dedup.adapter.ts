import { IncomingMessageDedupPort } from "../application/ports.ts";

const dedupKey = (messageId: string): Deno.KvKey => [
  "incoming-message-dedup",
  messageId,
];

export interface IncomingMessageDedupAdapter {
  isDuplicate: IncomingMessageDedupPort;
  close?: () => Promise<void>;
}

export const makeKvIncomingMessageDedupAdapter = (
  kv: Deno.Kv,
): IncomingMessageDedupAdapter => {
  const isDuplicate: IncomingMessageDedupPort = async (messageId) => {
    const key = dedupKey(messageId);
    const now = Date.now();

    const result = await kv.atomic()
      .check({ key, versionstamp: null })
      .set(key, { seenAt: now })
      .commit();

    return !result.ok;
  };

  return {
    isDuplicate,
    close: async () => {
      kv.close();
    },
  };
};

export const makeDenoKvIncomingMessageDedupAdapter = async (
  path?: string,
): Promise<IncomingMessageDedupAdapter> => {
  if (!("openKv" in Deno)) {
    throw new Error(
      "Deno KV no está disponible en este runtime. Ejecuta con --unstable-kv o usa otro dedup adapter.",
    );
  }

  const kv = await Deno.openKv(path);
  return makeKvIncomingMessageDedupAdapter(kv);
};
