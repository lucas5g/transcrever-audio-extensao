# PRD — Extensão Chrome para Transcrição de Áudios

## Nome do Projeto

Sugestões:

- Audio Study Transcriber
- Whisper Study
- English Audio Helper
- Transcriptify
- Audio2Text EN

---

# 1. Visão Geral

A extensão tem como objetivo auxiliar no estudo de inglês através da transcrição automática de arquivos de áudio abertos diretamente no navegador Chrome.

O usuário normalmente baixa arquivos `.mp3` ou `.ogg` de plataformas de estudo e os abre diretamente no navegador utilizando URLs locais (`file://`).

A extensão irá detectar quando um áudio estiver aberto no navegador e disponibilizar ações rápidas para:

- Transcrever o áudio
- Transcrever e converter o texto para o passado em inglês

---

# 2. Problema

Atualmente o processo é manual:

1. Usuário baixa o áudio
2. Abre no navegador
3. Faz upload manual em alguma IA/ferramenta
4. Aguarda a transcrição
5. Opcionalmente pede adaptação para passado

Esse fluxo é lento e repetitivo para estudos diários.

---

# 3. Objetivo

Simplificar o estudo de inglês permitindo transcrever rapidamente áudios locais diretamente do navegador com apenas um clique.

---

# 4. Público-Alvo

- Estudantes de inglês
- Usuários que estudam com arquivos de áudio
- Pessoas que utilizam conteúdos offline
- Usuários que escutam diálogos e exercícios de listening

---

# 5. Escopo Inicial (MVP)

## Funcionalidades

### 5.1 Detectar arquivos de áudio locais

A extensão deverá funcionar em páginas:

```txt
file:///*.mp3
file:///*.ogg
```

Exemplo:

```txt
file:///home/lucas/Downloads/audio.ogg
```

---

### 5.2 Interface Flutuante

Ao detectar um áudio aberto, a extensão exibirá um pequeno painel flutuante.

## Botões

### Botão 1 — Transcrever

Executa:

- Captura do áudio
- Envio para API Groq
- Retorno da transcrição
- Exibição do texto

---

### Botão 2 — Transcrever + Passado

Executa:

- Transcrição do áudio
- Envio do texto para LLM
- Conversão para frases no passado
- Exibição do resultado

---

# 6. Stack Técnica

## Navegador

- Chrome
- Manifest V3

---

## Frontend

- React
- TypeScript
- TailwindCSS
- Vite

---

## IA

### Provider

- Groq

### Modelos

#### Transcrição

```txt
whisper-large-v3-turbo
```

#### Conversão para passado

```txt
llama-3.3-70b-versatile
```

---

# 7. Fluxo Principal

```txt
Usuário abre áudio local
↓
Extensão detecta o arquivo
↓
Painel flutuante aparece
↓
Usuário clica em "Transcrever"
↓
Groq Whisper processa
↓
Texto exibido
```

---

# 8. Fluxo Past Tense

```txt
Usuário abre áudio
↓
Whisper transcreve
↓
Texto enviado ao LLM
↓
LLM converte para passado
↓
Resultado exibido
```

---

# 9. Interface Inicial

```txt
┌────────────────────────┐
│ Audio Study Helper     │
├────────────────────────┤
│ [ Transcribe ]         │
│                        │
│ [ Past Tense ]         │
├────────────────────────┤
│ Result here...         │
└────────────────────────┘
```

---

# 10. Prompt para Conversão

```txt
You are an English grammar assistant.

Convert the following text to the past tense.

Rules:
- Keep simple English
- Preserve original meaning
- Return only the converted text
- Do not explain anything

Text:
{{texto}}
```

---

# 11. Permissões Chrome

```json
{
  "permissions": [
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "file:///*"
  ]
}
```

OBS:
Usuário deverá habilitar:

```txt
Allow access to file URLs
```

---

# 12. Estrutura do Projeto

```txt
extension/
├── manifest.json
├── background.ts
├── content.ts
├── popup/
├── components/
├── services/
│   ├── groq.ts
│   └── prompts.ts
└── styles/
```

---

# 13. Requisitos Funcionais

## RF01

Detectar arquivos `.mp3` e `.ogg`.

## RF02

Permitir transcrição do áudio.

## RF03

Permitir conversão para passado.

## RF04

Exibir resultado sem reload.

## RF05

Mostrar loading durante processamento.

---

# 14. Requisitos Não Funcionais

## RNF01

Resposta rápida.

## RNF02

UI leve e não intrusiva.

## RNF03

Sem backend no MVP.

## RNF04

Salvar chave API localmente.

---

# 15. Melhorias Futuras

- Tradução PT-BR
- Histórico
- Exportar TXT
- Timestamp
- Atalhos teclado
- Suporte YouTube
- Reprodução sincronizada
