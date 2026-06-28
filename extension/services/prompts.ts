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

export function buildNegativePrompt(text: string): string {
  return `You are an English grammar assistant.

Convert the following text to the negative form.

Rules:
- Keep simple English
- Preserve original meaning as much as possible
- Prefer contracted negative forms, such as didn't, don't, doesn't, isn't, aren't, wasn't, weren't, won't, can't
- Return only the converted text
- Do not explain anything

Text:
${text}`;
}

export function buildInterrogativePrompt(text: string): string {
  return `You are an English grammar assistant.

Convert the following text to the interrogative form.

Rules:
- Keep simple English
- Preserve original meaning as much as possible
- Use yes/no questions when they are the clearest option
- Use what, where, when, why, who, or how questions when they are more natural
- Return only the converted text
- Do not explain anything

Text:
${text}`;
}
