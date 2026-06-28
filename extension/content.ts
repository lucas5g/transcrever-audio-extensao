const SUPPORTED_AUDIO_EXTENSIONS = [".mp3", ".ogg"];
const STORAGE_API_KEY = "groqApiKey";

type BackgroundAction =
  | "TRANSCRIBE_AUDIO"
  | "TRANSCRIBE_AUDIO_PAST_TENSE"
  | "TRANSCRIBE_AUDIO_NEGATIVE"
  | "TRANSCRIBE_AUDIO_INTERROGATIVE";

type BackgroundResponse = {
  ok: boolean;
  text?: string;
  transcription?: string;
  pastTenseText?: string;
  negativeText?: string;
  interrogativeText?: string;
  error?: string;
};

type PanelElements = {
  apiSection: HTMLDivElement;
  apiInput: HTMLInputElement;
  configureButton: HTMLButtonElement;
  transcribeButton: HTMLButtonElement;
  pastTenseButton: HTMLButtonElement;
  negativeButton: HTMLButtonElement;
  interrogativeButton: HTMLButtonElement;
  status: HTMLDivElement;
  result: HTMLTextAreaElement;
};

function isSupportedAudioUrl(url: string): boolean {
  const pathname = new URL(url).pathname.toLowerCase();
  return SUPPORTED_AUDIO_EXTENSIONS.some((extension) => pathname.endsWith(extension));
}

function createButton(label: string, className = "ash-button"): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  return button;
}

function setLoading(elements: PanelElements, loading: boolean): void {
  elements.transcribeButton.disabled = loading;
  elements.pastTenseButton.disabled = loading;
  elements.negativeButton.disabled = loading;
  elements.interrogativeButton.disabled = loading;
  elements.configureButton.disabled = loading;
}

function setStatus(elements: PanelElements, message: string, kind: "idle" | "loading" | "error" = "idle"): void {
  elements.status.textContent = message;
  elements.status.dataset.kind = kind;
}

function setActiveAction(elements: PanelElements, action: BackgroundAction): void {
  elements.transcribeButton.dataset.active = action === "TRANSCRIBE_AUDIO" ? "true" : "false";
  elements.pastTenseButton.dataset.active = action === "TRANSCRIBE_AUDIO_PAST_TENSE" ? "true" : "false";
  elements.negativeButton.dataset.active = action === "TRANSCRIBE_AUDIO_NEGATIVE" ? "true" : "false";
  elements.interrogativeButton.dataset.active = action === "TRANSCRIBE_AUDIO_INTERROGATIVE" ? "true" : "false";
}

function formatResult(action: BackgroundAction, response: BackgroundResponse): string {
  if (action === "TRANSCRIBE_AUDIO_PAST_TENSE" && response.transcription && response.pastTenseText) {
    return `Transcricao:\n${response.transcription}\n\nPassado:\n${response.pastTenseText}`;
  }

  if (action === "TRANSCRIBE_AUDIO_NEGATIVE" && response.transcription && response.negativeText) {
    return `Transcricao:\n${response.transcription}\n\nNegativo:\n${response.negativeText}`;
  }

  if (action === "TRANSCRIBE_AUDIO_INTERROGATIVE" && response.transcription && response.interrogativeText) {
    return `Transcricao:\n${response.transcription}\n\nInterrogativo:\n${response.interrogativeText}`;
  }

  return response.text || "";
}

function getLoadingMessage(action: BackgroundAction): string {
  if (action === "TRANSCRIBE_AUDIO") {
    return "Transcrevendo audio...";
  }

  if (action === "TRANSCRIBE_AUDIO_PAST_TENSE") {
    return "Transcrevendo e convertendo...";
  }

  if (action === "TRANSCRIBE_AUDIO_INTERROGATIVE") {
    return "Transcrevendo e convertendo para interrogativo...";
  }

  return "Transcrevendo e convertendo para negativo...";
}

function getStoredApiKey(): Promise<string> {
  return chrome.storage.local.get(STORAGE_API_KEY).then((items) => {
    const value = items[STORAGE_API_KEY];
    return typeof value === "string" ? value : "";
  });
}

function saveApiKey(apiKey: string): Promise<void> {
  return chrome.storage.local.set({ [STORAGE_API_KEY]: apiKey });
}

function sendBackgroundMessage(action: BackgroundAction, apiKey: string): Promise<BackgroundResponse> {
  return chrome.runtime.sendMessage({
    action,
    apiKey,
    audioUrl: window.location.href,
  });
}

function enableAutoReplay(audio: HTMLAudioElement): void {
  if (audio.dataset.ashAutoReplay === "true") {
    return;
  }

  audio.dataset.ashAutoReplay = "true";
  audio.loop = true;
  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    void audio.play();
  });
}

function setupAutoReplay(): void {
  const audio = document.querySelector("audio");

  if (audio) {
    enableAutoReplay(audio);
    return;
  }

  const observer = new MutationObserver(() => {
    const currentAudio = document.querySelector("audio");

    if (!currentAudio) {
      return;
    }

    enableAutoReplay(currentAudio);
    observer.disconnect();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

async function runTranscription(action: BackgroundAction, elements: PanelElements): Promise<void> {
  const apiKey = elements.apiInput.value.trim() || (await getStoredApiKey());

  if (!apiKey) {
    elements.apiSection.hidden = false;
    setStatus(elements, "Configure sua Groq API key antes de transcrever.", "error");
    return;
  }

  await saveApiKey(apiKey);
  setActiveAction(elements, action);
  setLoading(elements, true);
  setStatus(elements, getLoadingMessage(action), "loading");

  try {
    const response = await sendBackgroundMessage(action, apiKey);

    if (!response?.ok) {
      throw new Error(response?.error || "Nao foi possivel processar o audio.");
    }

    elements.result.value = formatResult(action, response);
    setStatus(elements, "Processamento concluido.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    setStatus(elements, message, "error");
  } finally {
    setLoading(elements, false);
  }
}

async function createPanel(): Promise<void> {
  if (document.getElementById("audio-study-helper-root")) {
    return;
  }

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = chrome.runtime.getURL("styles.css");
  document.documentElement.appendChild(stylesheet);

  const root = document.createElement("section");
  root.id = "audio-study-helper-root";
  root.setAttribute("aria-label", "Audio Study Helper");

  const title = document.createElement("div");
  title.className = "ash-title";
  title.textContent = "Audio Study Helper";

  const configureButton = createButton("Configurar API Key", "ash-button ash-button-secondary");

  const apiSection = document.createElement("div");
  apiSection.className = "ash-api-section";
  apiSection.hidden = true;

  const apiLabel = document.createElement("label");
  apiLabel.className = "ash-label";
  apiLabel.textContent = "Groq API Key";

  const apiInput = document.createElement("input");
  apiInput.className = "ash-input";
  apiInput.type = "password";
  apiInput.placeholder = "gsk_...";
  apiInput.autocomplete = "off";

  const apiActions = document.createElement("div");
  apiActions.className = "ash-row";

  const saveButton = createButton("Salvar");
  const cancelButton = createButton("Cancelar", "ash-button ash-button-secondary");
  apiActions.append(saveButton, cancelButton);
  apiSection.append(apiLabel, apiInput, apiActions);

  const actions = document.createElement("div");
  actions.className = "ash-actions";

  const transcribeButton = createButton("Transcrever");
  const pastTenseButton = createButton("Transcrever + Passado");
  const negativeButton = createButton("Transcrever + Negativo");
  const interrogativeButton = createButton("Transcrever + Interrogativo");
  actions.append(transcribeButton, pastTenseButton, negativeButton, interrogativeButton);

  const status = document.createElement("div");
  status.className = "ash-status";
  status.dataset.kind = "idle";

  const result = document.createElement("textarea");
  result.className = "ash-result";
  result.placeholder = "Resultado aqui...";
  result.readOnly = true;

  root.append(title, configureButton, apiSection, actions, status, result);
  document.body.appendChild(root);

  const elements: PanelElements = {
    apiSection,
    apiInput,
    configureButton,
    transcribeButton,
    pastTenseButton,
    negativeButton,
    interrogativeButton,
    status,
    result,
  };

  apiInput.value = await getStoredApiKey();

  configureButton.addEventListener("click", () => {
    apiSection.hidden = !apiSection.hidden;
    if (!apiSection.hidden) {
      apiInput.focus();
    }
  });

  saveButton.addEventListener("click", async () => {
    await saveApiKey(apiInput.value.trim());
    apiSection.hidden = true;
    setStatus(elements, "API key salva localmente.");
  });

  cancelButton.addEventListener("click", async () => {
    apiInput.value = await getStoredApiKey();
    apiSection.hidden = true;
    setStatus(elements, "");
  });

  transcribeButton.addEventListener("click", () => void runTranscription("TRANSCRIBE_AUDIO", elements));
  pastTenseButton.addEventListener("click", () => void runTranscription("TRANSCRIBE_AUDIO_PAST_TENSE", elements));
  negativeButton.addEventListener("click", () => void runTranscription("TRANSCRIBE_AUDIO_NEGATIVE", elements));
  interrogativeButton.addEventListener("click", () => void runTranscription("TRANSCRIBE_AUDIO_INTERROGATIVE", elements));
}

if (isSupportedAudioUrl(window.location.href)) {
  setupAutoReplay();
  void createPanel();
}
