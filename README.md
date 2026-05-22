# Audio Study Helper

Extensão Chrome para transcrever áudios locais abertos no navegador e, opcionalmente, converter a transcrição para frases no passado em inglês.

O foco do MVP é ajudar no estudo de inglês com arquivos `.mp3` e `.ogg` abertos via `file://`.

## Funcionalidades

- Detecta áudios locais `.mp3` e `.ogg` abertos no Chrome.
- Exibe um painel flutuante na página do áudio.
- Salva a Groq API key localmente com `chrome.storage.local`.
- Transcreve áudio usando `whisper-large-v3-turbo`.
- Transcreve e converte o texto para passado usando `llama-3.3-70b-versatile`.
- Mostra loading, erros e resultado sem recarregar a página.

## Stack

- Chrome Extension Manifest V3
- TypeScript
- Vite
- CSS puro
- Groq API

## Requisitos

- Node.js instalado
- npm instalado
- Chave de API da Groq
- Google Chrome ou navegador compatível com extensões Chrome MV3

## Instalação

```bash
npm install
```

## Build

```bash
npm run build
```

O build da extensão será gerado na pasta `dist/`.

## Carregar No Chrome

1. Abra `chrome://extensions`.
2. Ative `Developer mode`.
3. Clique em `Load unpacked`.
4. Selecione a pasta `dist/`.
5. Na extensão carregada, habilite `Allow access to file URLs`.
6. Abra um arquivo local `.mp3` ou `.ogg` no Chrome.

Exemplo:

```txt
file:///home/lucas/Downloads/audio.ogg
```

## Como Usar

1. Abra um áudio local `.mp3` ou `.ogg` no Chrome.
2. O painel `Audio Study Helper` aparecerá no canto inferior direito.
3. Clique em `Configurar API Key`.
4. Informe sua Groq API key e clique em `Salvar`.
5. Clique em `Transcrever` para gerar apenas a transcrição.
6. Clique em `Transcrever + Passado` para ver a transcrição original e a versão no passado.

## Scripts

```bash
npm run typecheck
```

Valida os tipos TypeScript.

```bash
npm run build
```

Gera a extensão em `dist/`.

```bash
npm run dev
```

Gera build em modo watch durante desenvolvimento.

## Estrutura

```txt
extension/
├── manifest.json
├── background.ts
├── content.ts
├── styles.css
└── services/
    ├── groq.ts
    └── prompts.ts
```

## Observações

- A chave da Groq fica salva apenas localmente no navegador.
- A extensão precisa da permissão `Allow access to file URLs` para funcionar com arquivos locais.
- Este MVP não possui backend.
- O Chrome pode exigir recarregar a extensão após cada novo build.
