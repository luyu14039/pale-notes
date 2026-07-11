# Codex Project Notes

## Project Shape

- This is a React 18 + Vite + TypeScript single-page game.
- Styling uses Tailwind CSS with project theme tokens in `tailwind.config.js`.
- State is stored with Zustand in `src/stores/`, with persisted browser state in `localStorage`.
- LLM integration lives in `src/api/` and is used by `src/hooks/useGameEngine.ts`.
- Narrative and data-engine prompt contracts live in `src/constants/prompts.ts`.
- Static lore, screenshots, and public image assets are part of the game experience. Preserve them unless the task explicitly changes them.
- The Vite base path is `/pale-notes/` for GitHub Pages deployment.

## Common Commands

- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build and type-check: `npm run build`
- Lint: `npm run lint`
- Preview production build: `npm run preview`

Prefer `npm run build` as the baseline verification command after code changes. Run `npm run lint` when touching TypeScript, React components, hooks, stores, API wrappers, or prompt/data parsing logic.

On Windows, if the shell cannot `Set-Location` into the repository because the session starts from `C:\`, run commands with an explicit project prefix instead:

- Build: `npm --prefix D:\sjtuc\Github\pale-notes run build`
- Lint: `npm --prefix D:\sjtuc\Github\pale-notes run lint`
- Git: `git -C D:\sjtuc\Github\pale-notes status --short`

Prefer `Get-Content -Encoding UTF8` when reading Chinese source, prompt, README, or lore files in PowerShell so terminal output is not misdiagnosed as file corruption.

## Coding Guidelines

- Follow the existing TypeScript style: strict types, `@/*` imports for `src`, and React function components.
- Keep game state mutations inside the relevant Zustand stores or existing engine helpers.
- Do not bypass the prompt/data-engine contract with ad hoc UI logic unless the task is specifically about changing that contract.
- Keep UI changes consistent with the dark, literary game interface and the existing Tailwind theme tokens.
- Use `lucide-react` for new UI icons when an icon is needed.
- Avoid broad refactors while changing gameplay, prompt, or API behavior; those systems are tightly coupled.
- Prefer small, typed helpers near the feature they support before introducing shared abstractions.
- Keep route/base-path assumptions compatible with GitHub Pages; do not hard-code root-relative asset URLs unless they are under `public/` and tested with the configured base.

## Text, Encoding, And Localization

- Treat project text files as UTF-8. This matters for Chinese narrative text, prompt templates, lore, and README content.
- Do not rewrite Chinese prompt or lore files through tools that may change encoding.
- Preserve the established Chinese-first in-game copy unless the task asks for English copy.
- When editing `src/constants/prompts.ts`, keep JSON-output requirements precise and parseable by `JSON.parse()`.

## LLM And Secret Handling

- Never commit real API keys or tokens.
- User API keys are expected to stay in browser `localStorage` and be sent directly to the selected provider.
- DeepSeek integration is in `src/api/deepseek.ts`; SiliconFlow integration is in `src/api/siliconflow.ts`.
- When adding providers or models, update the UI store/types and the API wrapper together.
- Keep streaming and non-streaming response behavior compatible with `useGameEngine`.
- Do not log full prompts, provider responses, or user API keys in committed code.

## Git And Workspace Safety

- The worktree may contain user edits. Inspect `git status --short` before edits and do not overwrite unrelated modified files.
- Generated build output in `dist/` should not be edited by hand.
- Avoid changing `package-lock.json` unless dependencies actually change.
- Prefer small, focused commits/patches that are easy to review.
- `node_modules/`, `dist/`, local env files, and `.codex/` are local/generated and should stay out of commits.
