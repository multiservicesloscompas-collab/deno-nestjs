import { assertEquals } from "@std/assert";
import { makeLocalMemoryIncomingMessageDedupAdapter } from "../incoming-message-dedup.local-memory.adapter.ts";

Deno.test("LocalMemoryIncomingMessageDedupAdapter detects duplicates in-process", async () => {
  const adapter = makeLocalMemoryIncomingMessageDedupAdapter();

  const first = await adapter.isDuplicate("message-1");
  const second = await adapter.isDuplicate("message-1");
  const third = await adapter.isDuplicate("message-2");

  assertEquals(first, false);
  assertEquals(second, true);
  assertEquals(third, false);
});

Deno.test("LocalMemoryIncomingMessageDedupAdapter instances are isolated", async () => {
  const adapterA = makeLocalMemoryIncomingMessageDedupAdapter();
  const adapterB = makeLocalMemoryIncomingMessageDedupAdapter();

  assertEquals(await adapterA.isDuplicate("same-id"), false);
  assertEquals(await adapterB.isDuplicate("same-id"), false);
});
