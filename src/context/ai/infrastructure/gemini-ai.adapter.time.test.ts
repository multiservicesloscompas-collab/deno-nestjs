import { assertEquals } from "@std/assert";

Deno.test("Timezone conversion logic - Caracas", () => {
  const date = new Date("2026-03-12T22:55:00Z"); // Thursday, March 12, 2026, 22:55:00 UTC
  
  // Format for Caracas (UTC-4)
  // 22:55:00 UTC -> 18:55:00 Caracas
  const formatter = new Intl.DateTimeFormat('es-VE', {
    timeZone: 'America/Caracas',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formatted = formatter.format(date);
  
  // Depending on the environment, the exact string might vary slightly (e.g., punctuation)
  // so we check for key components
  console.log("Formatted time:", formatted);
  
  // jueves, 12 de marzo de 2026, 18:55:00
  assertEquals(formatted.toLowerCase().includes("jueves"), true);
  assertEquals(formatted.includes("12"), true);
  assertEquals(formatted.toLowerCase().includes("marzo"), true);
  assertEquals(formatted.includes("18:55:00"), true);
});
