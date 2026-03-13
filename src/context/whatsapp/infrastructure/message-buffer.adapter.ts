import { MessageBufferPort, MessageBufferCallback } from "../application/ports.ts";

export const makeInMemoryMessageBuffer = (timeoutMs: number = 5000): MessageBufferPort => {
  const buffers: Map<string, string[]> = new Map();
  const timers: Map<string, number> = new Map();
  let onBufferReady: MessageBufferCallback | null = null;

  return {
    addMessage: (sender, text) => {
      // Initialize or add to buffer
      const currentBuffer = buffers.get(sender) ?? [];
      currentBuffer.push(text);
      buffers.set(sender, currentBuffer);

      // Reset timer (Debounce)
      if (timers.has(sender)) {
        clearTimeout(timers.get(sender));
      }

      const timerIdx = setTimeout(async () => {
        const finalMessages = buffers.get(sender) ?? [];
        buffers.delete(sender);
        timers.delete(sender);

        if (finalMessages.length > 0 && onBufferReady) {
          const mergedText = finalMessages.join("\n");
          await onBufferReady(sender, mergedText);
        }
      }, timeoutMs);

      timers.set(sender, timerIdx);
    },
    subscribe: (callback) => {
      onBufferReady = callback;
    },
  };
};
