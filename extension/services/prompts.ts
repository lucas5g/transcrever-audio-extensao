export function buildPastTensePrompt(text: string): string {
  return `You are an English grammar assistant.

Convert the following text to the past tense.

Rules:
- Keep simple English
- Preserve original meaning
- Return only the converted text
- Do not explain anything

Text:
${text}`;
}
