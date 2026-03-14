import { IncomingMessageDedupPort } from "../application/ports.ts";

export interface IncomingMessageDedupLocalMemoryAdapter {
  isDuplicate: IncomingMessageDedupPort;
}

export const makeLocalMemoryIncomingMessageDedupAdapter = (): IncomingMessageDedupLocalMemoryAdapter => {
  const seenMessageIds = new Set<string>();

  const isDuplicate: IncomingMessageDedupPort = async (messageId) => {
    if (seenMessageIds.has(messageId)) {
      return true;
    }

    seenMessageIds.add(messageId);
    return false;
  };

  return { isDuplicate };
};
