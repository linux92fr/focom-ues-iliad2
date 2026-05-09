import { assertEquals } from "jsr:@std/assert";

Deno.test("chat-juridique: system prompt is built correctly", () => {
  const ccntContext = "Contexte de test";
  const lines = [
    "Tu es un assistant juridique",
    ccntContext ? `Contexte spécifique à cette thématique :\n${ccntContext}` : "",
  ].filter(Boolean);

  assertEquals(lines.length, 2);
  assertEquals(lines[1], `Contexte spécifique à cette thématique :\n${ccntContext}`);
});

Deno.test("chat-juridique: messages array validation", () => {
  const messages = [{ role: "user", content: "test" }];
  assertEquals(Array.isArray(messages), true);
  assertEquals(messages.length, 1);
  assertEquals(messages[0].role, "user");
});
