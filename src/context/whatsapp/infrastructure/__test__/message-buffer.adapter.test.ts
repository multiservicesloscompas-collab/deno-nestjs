import { assertEquals } from "@std/assert";
import { makeInMemoryMessageBuffer } from "../message-buffer.adapter.ts";

Deno.test(
  "MessageBuffer groups messages and triggers callback after timeout",
  async (t) => {
    await t.step("groups multiple messages from the same sender", async () => {
      let callCount = 0;
      let receivedText = "";
      let receivedConversationId = "";

      // Create buffer with short timeout for testing
      const buffer = makeInMemoryMessageBuffer(100);

      buffer.subscribe((conversationId, _sender, text) => {
        callCount++;
        receivedConversationId = conversationId;
        receivedText = text;
        return Promise.resolve();
      });

      buffer.addMessage("conversation-1", "sender1", "hola");
      buffer.addMessage("conversation-1", "sender1", "como estas?");
      buffer.addMessage("conversation-1", "sender1", "chau");

      // Wait for buffer to trigger
      await new Promise((resolve) => setTimeout(resolve, 200));

      assertEquals(callCount, 1);
      assertEquals(receivedConversationId, "conversation-1");
      assertEquals(receivedText, "hola\ncomo estas?\nchau");
    });

    await t.step("handles different senders independently in same conversation", async () => {
      const calls: Record<string, string> = {};
      const buffer = makeInMemoryMessageBuffer(100);

      buffer.subscribe((conversationId, sender, text) => {
        calls[`${conversationId}:${sender}`] = text;
        return Promise.resolve();
      });

      buffer.addMessage("conversation-1", "userA", "A1");
      buffer.addMessage("conversation-1", "userB", "B1");

      await new Promise((resolve) => setTimeout(resolve, 50));

      buffer.addMessage("conversation-1", "userA", "A2");

      await new Promise((resolve) => setTimeout(resolve, 200));

      assertEquals(calls["conversation-1:userA"], "A1\nA2");
      assertEquals(calls["conversation-1:userB"], "B1");
    });

    await t.step("isolates same sender across different conversations", async () => {
      const calls: Record<string, string> = {};
      const buffer = makeInMemoryMessageBuffer(100);

      buffer.subscribe((conversationId, sender, text) => {
        calls[`${conversationId}:${sender}`] = text;
        return Promise.resolve();
      });

      buffer.addMessage("conversation-1", "userA", "hello from c1");
      buffer.addMessage("conversation-2", "userA", "hello from c2");

      await new Promise((resolve) => setTimeout(resolve, 200));

      assertEquals(calls["conversation-1:userA"], "hello from c1");
      assertEquals(calls["conversation-2:userA"], "hello from c2");
    });
  },
);
