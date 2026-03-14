import {
  MessageBufferPort,
  MessageBufferCallback,
} from "../application/ports.ts";

export const makeInMemoryMessageBuffer = (
  timeoutMs: number = 5000,
): MessageBufferPort => {
  const makeKey = (conversationId: string, sender: string): string =>
    `${conversationId}::${sender}`;

  const buffers: Map<string, string[]> = new Map();
  const timers: Map<string, number> = new Map();
  let onBufferReady: MessageBufferCallback | null = null;

  return {
    addMessage: (conversationId, sender, text) => {
      const key = makeKey(conversationId, sender);

      // Initialize or add to buffer
      const currentBuffer = buffers.get(key) ?? [];
      currentBuffer.push(text);
      buffers.set(key, currentBuffer);

      console.info(
        `[MessageBuffer] ➕ ADD | Conversation: ${conversationId} | Sender: ${sender} | Buffered messages: ${currentBuffer.length}`,
      );

      // Reset timer (Debounce)
      if (timers.has(key)) {
        clearTimeout(timers.get(key));
      }

      const timerIdx = setTimeout(async () => {
        const finalMessages = buffers.get(key) ?? [];
        buffers.delete(key);
        timers.delete(key);

        if (finalMessages.length > 0 && onBufferReady) {
          const mergedText = finalMessages.join("\n");
          console.info(
            `[MessageBuffer] 🚀 FLUSH | Conversation: ${conversationId} | Sender: ${sender} | Messages: ${finalMessages.length}`,
          );
          await onBufferReady(conversationId, sender, mergedText);
        } else {
          console.warn(
            `[MessageBuffer] ⚠️ FLUSH SKIPPED | Conversation: ${conversationId} | Sender: ${sender} | Messages: ${finalMessages.length} | Has callback: ${!!onBufferReady}`,
          );
        }
      }, timeoutMs);

      timers.set(key, timerIdx);
    },
    subscribe: (callback) => {
      onBufferReady = callback;
      console.info("[MessageBuffer] 📡 SUBSCRIBE | Callback registered");
    },
  };
};
