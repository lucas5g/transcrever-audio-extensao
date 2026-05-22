# AGENTS.md

## Project Shape

- Chrome Extension MV3 for local `file://` audio transcription; load the built `dist/` folder in Chrome, not `extension/`.
- Real entrypoints are `extension/background.ts` and `extension/content.ts`, wired by `vite.config.ts` to emit `dist/background.js` and `dist/content.js`.
- `extension/manifest.json` and `extension/styles.css` are copied into `dist/` only by `npm run build`; Vite does not bundle/copy them by itself.
- The current implementation is plain TypeScript DOM APIs plus CSS. The PRD mentions React/Tailwind, but those are not installed or used.

## Commands

- Install: `npm install`
- Typecheck: `npm run typecheck`
- Build extension: `npm run build`
- Watch build: `npm run dev`
- There is no configured test, lint, or formatter script.

## Runtime Gotchas

- Chrome must have `Allow access to file URLs` enabled for this extension, or local `.mp3`/`.ogg` pages will not work.
- Content script only injects the panel on `file://` URLs whose pathname ends in `.mp3` or `.ogg`.
- Groq API key is stored in `chrome.storage.local` under `groqApiKey`; do not add server-side key handling unless the project scope changes.
- Background fetches the local audio URL and sends the blob to Groq; failures around local file access are usually Chrome permission/build reload issues first.

## Verification

- Run `npm run typecheck` after TypeScript changes.
- Run `npm run build` after changes that affect extension packaging, manifest, styles, or runtime entrypoints.
- After a new build, Chrome may require reloading the unpacked extension before testing changes.

## Conventions

- Keep generated output out of source edits: `dist/` and `node_modules/` are ignored.
- TypeScript is strict with `noUnusedLocals` and `noUnusedParameters`; unused helpers or callback params fail `npm run typecheck`.
- Imports currently omit `.ts` extensions even though `allowImportingTsExtensions` is enabled; follow existing import style unless changing the build setup.
