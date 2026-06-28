import { buildInterrogativePrompt, buildNegativePrompt, buildPastTensePrompt } from "./prompts";

const GROQ_API_BASE_URL = "https://api.groq.com/openai/v1";
const TRANSCRIPTION_MODEL = "whisper-large-v3-turbo";
const PAST_TENSE_MODEL = "llama-3.3-70b-versatile";

type TranscriptionResponse = {
  text?: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

async function parseGroqError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message || `Groq retornou HTTP ${response.status}.`;
  } catch {
    return `Groq retornou HTTP ${response.status}.`;
  }
}

export async function transcribeAudio(apiKey: string, audioBlob: Blob, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append("model", TRANSCRIPTION_MODEL);
  formData.append("file", audioBlob, filename);

  const response = await fetch(`${GROQ_API_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseGroqError(response));
  }

  const data = (await response.json()) as TranscriptionResponse;
  const text = data.text?.trim();

  if (!text) {
    throw new Error("A Groq nao retornou texto de transcricao.");
  }

  return text;
}

export async function convertToPastTense(apiKey: string, text: string): Promise<string> {
  const response = await fetch(`${GROQ_API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: PAST_TENSE_MODEL,
      messages: [
        {
          role: "user",
          content: buildPastTensePrompt(text),
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseGroqError(response));
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const convertedText = data.choices?.[0]?.message?.content?.trim();

  if (!convertedText) {
    throw new Error("A Groq nao retornou o texto convertido.");
  }

  return convertedText;
}

export async function convertToNegative(apiKey: string, text: string): Promise<string> {
  const response = await fetch(`${GROQ_API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: PAST_TENSE_MODEL,
      messages: [
        {
          role: "user",
          content: buildNegativePrompt(text),
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseGroqError(response));
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const convertedText = data.choices?.[0]?.message?.content?.trim();

  if (!convertedText) {
    throw new Error("A Groq nao retornou o texto convertido.");
  }

  return convertedText;
}

export async function convertToInterrogative(apiKey: string, text: string): Promise<string> {
  const response = await fetch(`${GROQ_API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: PAST_TENSE_MODEL,
      messages: [
        {
          role: "user",
          content: buildInterrogativePrompt(text),
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseGroqError(response));
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const convertedText = data.choices?.[0]?.message?.content?.trim();

  if (!convertedText) {
    throw new Error("A Groq nao retornou o texto convertido.");
  }

  return convertedText;
}

export type TranscribeAndConvertResult = {
  transcription: string;
  pastTenseText: string;
};

export type TranscribeAndConvertToNegativeResult = {
  transcription: string;
  negativeText: string;
};

export type TranscribeAndConvertToInterrogativeResult = {
  transcription: string;
  interrogativeText: string;
};

export async function transcribeAndConvertToPast(
  apiKey: string,
  audioBlob: Blob,
  filename: string,
): Promise<TranscribeAndConvertResult> {
  const transcription = await transcribeAudio(apiKey, audioBlob, filename);
  const pastTenseText = await convertToPastTense(apiKey, transcription);

  return { transcription, pastTenseText };
}

export async function transcribeAndConvertToNegative(
  apiKey: string,
  audioBlob: Blob,
  filename: string,
): Promise<TranscribeAndConvertToNegativeResult> {
  const transcription = await transcribeAudio(apiKey, audioBlob, filename);
  const negativeText = await convertToNegative(apiKey, transcription);

  return { transcription, negativeText };
}

export async function transcribeAndConvertToInterrogative(
  apiKey: string,
  audioBlob: Blob,
  filename: string,
): Promise<TranscribeAndConvertToInterrogativeResult> {
  const transcription = await transcribeAudio(apiKey, audioBlob, filename);
  const interrogativeText = await convertToInterrogative(apiKey, transcription);

  return { transcription, interrogativeText };
}
