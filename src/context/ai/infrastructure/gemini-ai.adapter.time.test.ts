import { assertEquals } from "@std/assert";

Deno.test("Timezone conversion logic - Caracas", () => {
  const date = new Date("2026-03-12T22:55:00Z");

  const formatter = new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const formatted = formatter.format(date);

  console.log("Formatted time:", formatted);

  assertEquals(formatted.toLowerCase().includes("jueves"), true);
  assertEquals(formatted.includes("12"), true);
  assertEquals(formatted.toLowerCase().includes("marzo"), true);
  assertEquals(formatted.includes("18:55:00"), true);
});
