import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { makeHealthService, makePingService } from "./health.service.ts";

Deno.test("HealthService - health should return status UP and current date", async () => {
  const healthService = makeHealthService();
  const result = await healthService();
  
  assertEquals(result.status, "UP");
  assertEquals(typeof result.date, "string");
  // Basic ISO date check
  const date = new Date(result.date);
  assertEquals(date.toISOString(), result.date);
});

Deno.test("HealthService - ping should return pong", async () => {
  const pingService = makePingService();
  const result = await pingService();
  
  assertEquals(result, "pong");
});
