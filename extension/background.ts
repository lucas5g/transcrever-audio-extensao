import {
  transcribeAndConvertToInterrogative,
  transcribeAndConvertToNegative,
  transcribeAndConvertToPast,
  transcribeAudio,
} from "./services/groq";

type TranscriptionMessage = {
  action:
    | "TRANSCRIBE_AUDIO"
    | "TRANSCRIBE_AUDIO_PAST_TENSE"
    | "TRANSCRIBE_AUDIO_NEGATIVE"
    | "TRANSCRIBE_AUDIO_INTERROGATIVE";
  apiKey?: string;
  audioUrl?: string;
};

type BackgroundResponse = {
  ok: boolean;
  text?: string;
  transcription?: string;
  pastTenseText?: string;
  negativeText?: string;
  interrogativeText?: string;
  error?: string;
};

function isTranscriptionMessage(message: unknown): message is TranscriptionMessage {
  if (!message || typeof message !== "object") {
    return false;
  }

  const action = (message as TranscriptionMessage).action;
  return (
    action === "TRANSCRIBE_AUDIO" ||
    action === "TRANSCRIBE_AUDIO_PAST_TENSE" ||
    action === "TRANSCRIBE_AUDIO_NEGATIVE" ||
    action === "TRANSCRIBE_AUDIO_INTERROGATIVE"
  );
}

function getFilenameFromUrl(audioUrl: string): string {
  const pathname = new URL(audioUrl).pathname;
  const filename = decodeURIComponent(pathname.split("/").pop() || "audio.ogg");
  return filename || "audio.ogg";
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, milliseconds);
  });
}

async function fetchLocalAudio(audioUrl: string): Promise<Blob> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(audioUrl);

      if (!response.ok) {
        throw new Error(`Nao foi possivel ler o audio local. HTTP ${response.status}.`);
      }

      return response.blob();
    } catch (error) {
      lastError = error;

      if (attempt < 3) {
        await wait(250 * attempt);
      }
    }
  }

  if (lastError instanceof Error) {
    throw new Error(`Nao foi possivel ler o audio local: ${lastError.message}`);
  }

  throw new Error("Nao foi possivel ler o audio local.");
}

async function handleTranscription(message: TranscriptionMessage): Promise<BackgroundResponse> {
  if (!message.apiKey?.trim()) {
    throw new Error("Groq API key nao informada.");
  }

  if (!message.audioUrl) {
    throw new Error("URL do audio nao informada.");
  }

  const audioBlob = await fetchLocalAudio(message.audioUrl);
  const filename = getFilenameFromUrl(message.audioUrl);
  if (message.action === "TRANSCRIBE_AUDIO") {
    const text = await transcribeAudio(message.apiKey, audioBlob, filename);
    return { ok: true, text };
  }

  if (message.action === "TRANSCRIBE_AUDIO_NEGATIVE") {
    const result = await transcribeAndConvertToNegative(message.apiKey, audioBlob, filename);

    return {
      ok: true,
      text: result.negativeText,
      transcription: result.transcription,
      negativeText: result.negativeText,
    };
  }

  if (message.action === "TRANSCRIBE_AUDIO_INTERROGATIVE") {
    const result = await transcribeAndConvertToInterrogative(message.apiKey, audioBlob, filename);

    return {
      ok: true,
      text: result.interrogativeText,
      transcription: result.transcription,
      interrogativeText: result.interrogativeText,
    };
  }

  const result = await transcribeAndConvertToPast(message.apiKey, audioBlob, filename);

  return {
    ok: true,
    text: result.pastTenseText,
    transcription: result.transcription,
    pastTenseText: result.pastTenseText,
  };
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse: (response: BackgroundResponse) => void) => {
  if (!isTranscriptionMessage(message)) {
    return false;
  }

  handleTranscription(message)
    .then(sendResponse)
    .catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Erro inesperado ao processar audio.";
      sendResponse({ ok: false, error: errorMessage });
    });

  return true;
});
