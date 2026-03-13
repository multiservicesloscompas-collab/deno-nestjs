import { assertEquals } from "@std/assert";
import { makeInMemoryMessageBuffer } from "./message-buffer.adapter.ts";

Deno.test("MessageBuffer groups messages and triggers callback after timeout", async (t) => {
  await t.step("groups multiple messages from the same sender", async () => {
    let callCount = 0;
    let receivedText = "";
    
    // Create buffer with short timeout for testing
    const buffer = makeInMemoryMessageBuffer(100);
    
    buffer.subscribe((_sender, text) => {
      callCount++;
      receivedText = text;
      return Promise.resolve();
    });

    buffer.addMessage("sender1", "hola");
    buffer.addMessage("sender1", "como estas?");
    buffer.addMessage("sender1", "chau");

    // Wait for buffer to trigger
    await new Promise(resolve => setTimeout(resolve, 200));

    assertEquals(callCount, 1);
    assertEquals(receivedText, "hola\ncomo estas?\nchau");
  });

  await t.step("handles different senders independently", async () => {
    const calls: Record<string, string> = {};
    const buffer = makeInMemoryMessageBuffer(100);

    buffer.subscribe((sender, text) => {
      calls[sender] = text;
      return Promise.resolve();
    });

    buffer.addMessage("userA", "A1");
    buffer.addMessage("userB", "B1");
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    buffer.addMessage("userA", "A2");

    await new Promise(resolve => setTimeout(resolve, 200));

    assertEquals(calls["userA"], "A1\nA2");
    assertEquals(calls["userB"], "B1");
  });
});
