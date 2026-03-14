import {
  MessageBufferPort,
  MessageBufferCallback,
} from "../application/ports.ts";

export const makeInMemoryMessageBuffer = (
  timeoutMs: number = 5000,
): MessageBufferPort => {
  const buffers: Map<string, string[]> = new Map();
  const timers: Map<string, number> = new Map();
  let onBufferReady: MessageBufferCallback | null = null;

  // Helper to log buffer state for debugging
  const logBufferState = (context: string) => {
    const bufferKeys = Array.from(buffers.keys());
    console.debug(
      `[MessageBuffer] ${context} | Timeout: ${timeoutMs}ms | Active buffers: ${bufferKeys.length}`,
      bufferKeys.length > 0
        ? bufferKeys.map((key) => ({
            sender: key,
            messageCount: buffers.get(key)?.length ?? 0,
            pendingMessages: buffers.get(key) ?? [],
          }))
        : "No active buffers",
    );
  };

  return {
    addMessage: (sender, text) => {
      // Initialize or add to buffer
      const currentBuffer = buffers.get(sender) ?? [];
      currentBuffer.push(text);
      buffers.set(sender, currentBuffer);

      console.debug(
        `[MessageBuffer] ➕ ADD MESSAGE | Sender: ${sender} | Text: "${text}" | Buffer count: ${currentBuffer.length}`,
      );
      logBufferState("After add", sender);

      // Reset timer (Debounce)
      if (timers.has(sender)) {
        console.debug(
          `[MessageBuffer] ⏱️ RESET TIMER | Sender: ${sender} | Clearing previous timer`,
        );
        clearTimeout(timers.get(sender));
      }

      const timerIdx = setTimeout(async () => {
        const finalMessages = buffers.get(sender) ?? [];
        buffers.delete(sender);
        timers.delete(sender);

        console.debug(
          `[MessageBuffer] ⏰ TIMER FIRED | Sender: ${sender} | Messages to merge: ${finalMessages.length}`,
          finalMessages,
        );
        logBufferState("After timer fired", sender);

        if (finalMessages.length > 0 && onBufferReady) {
          const mergedText = finalMessages.join("\n");
          console.info(
            `[MessageBuffer] 🚀 TRIGGERING CALLBACK | Sender: ${sender} | Merged text length: ${mergedText.length} chars`,
          );
          await onBufferReady(sender, mergedText);
        } else {
          console.warn(
            `[MessageBuffer] ⚠️ TIMER FIRED BUT NO MESSAGES | Sender: ${sender} | finalMessages: ${finalMessages.length} | onBufferReady: ${!!onBufferReady}`,
          );
        }
      }, timeoutMs);

      timers.set(sender, timerIdx);
      console.debug(
        `[MessageBuffer] ✅ TIMER SET | Sender: ${sender} | Will fire in ${timeoutMs}ms`,
      );
    },
    subscribe: (callback) => {
      onBufferReady = callback;
      console.debug(
        `[MessageBuffer] 📡 SUBSCRIBE | Callback registered: ${!!callback}`,
      );
    },
  };
};
