import { assertExists } from "@std/assert";
import { GeminiAIAdapter } from "./gemini-ai.adapter.ts";
import { SYSTEM_PROMPT } from "../domain/system-prompt.ts";

Deno.test("GeminiAIAdapter - should initialize properly with system prompt", () => {
  const adapter = new GeminiAIAdapter("fake-api-key");
  assertExists(adapter);
  assertExists(SYSTEM_PROMPT);
});
