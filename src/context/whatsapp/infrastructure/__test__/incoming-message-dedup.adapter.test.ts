import { assertEquals } from "@std/assert";
import {
  makeDenoKvIncomingMessageDedupAdapter,
  makeKvIncomingMessageDedupAdapter,
} from "../incoming-message-dedup.adapter.ts";

Deno.test("IncomingMessageDedupAdapter detects duplicates", async () => {
  if (!("openKv" in Deno)) {
    return;
  }

  const kvPath = await Deno.makeTempFile();
  await Deno.remove(kvPath);
  const kv = await Deno.openKv(kvPath);

  const adapter = makeKvIncomingMessageDedupAdapter(kv);

  const first = await adapter.isDuplicate("message-1");
  const second = await adapter.isDuplicate("message-1");

  assertEquals(first, false);
  assertEquals(second, true);

  kv.close();
  await Deno.remove(kvPath);
});

Deno.test("IncomingMessageDedupAdapter persists across instances", async () => {
  if (!("openKv" in Deno)) {
    return;
  }

  const kvPath = await Deno.makeTempFile();
  await Deno.remove(kvPath);

  const adapterA = await makeDenoKvIncomingMessageDedupAdapter(kvPath);
  const adapterB = await makeDenoKvIncomingMessageDedupAdapter(kvPath);

  assertEquals(await adapterA.isDuplicate("message-2"), false);
  assertEquals(await adapterB.isDuplicate("message-2"), true);

  await adapterA.close?.();
  await adapterB.close?.();
  await Deno.remove(kvPath);
});
