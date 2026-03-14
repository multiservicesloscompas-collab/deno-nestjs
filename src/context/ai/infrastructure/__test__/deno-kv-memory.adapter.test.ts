import { assertEquals } from "@std/assert";
import {
  makeDenoKvMemoryAdapter,
  makeKvMemoryAdapter,
} from "../deno-kv-memory.adapter.ts";

Deno.test(
  "DenoKvMemoryAdapter persists conversation across adapter instances",
  async () => {
    if (!("openKv" in Deno)) {
      return;
    }

    const kvPath = await Deno.makeTempFile();
    await Deno.remove(kvPath);

    const adapterA = await makeDenoKvMemoryAdapter(kvPath);
    const adapterB = await makeDenoKvMemoryAdapter(kvPath);
    const conversationId = "conv-persisted";

    await adapterA.append(conversationId, { role: "user", content: "Hola" });
    await adapterA.append(conversationId, { role: "model", content: "Hola!" });

    const historyFromSecondInstance = await adapterB.get(conversationId);

    assertEquals(historyFromSecondInstance.length, 2);
    assertEquals(historyFromSecondInstance[0].content, "Hola");
    assertEquals(historyFromSecondInstance[1].content, "Hola!");

    await adapterA.close?.();
    await adapterB.close?.();
    await Deno.remove(kvPath);
  },
);

Deno.test("makeKvMemoryAdapter works with provided kv instance", async () => {
  if (!("openKv" in Deno)) {
    return;
  }

  const kvPath = await Deno.makeTempFile();
  await Deno.remove(kvPath);
  const kv = await Deno.openKv(kvPath);

  const adapter = makeKvMemoryAdapter(kv);
  await adapter.save("conv-1", [
    { role: "user", content: "one" },
    { role: "model", content: "two" },
  ]);

  const history = await adapter.get("conv-1");

  assertEquals(history.length, 2);
  assertEquals(history[0].content, "one");
  assertEquals(history[1].content, "two");

  await adapter.close?.();
  await Deno.remove(kvPath);
});
