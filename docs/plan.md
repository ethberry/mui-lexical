# Plan — mui-lexical

The work that is left in this repository: findings outside a task's scope, follow-ups, and the user's decisions that steer them. Owned by the Packages session; one of the four session files (the workspace rule Resume point).

**Checked:** 2026-11-19 (Packages, Editor `data-testid`).

- **Pre-existing lint error** — `src/editor/Editor.tsx`, `initialEditorState || null`
  (`@typescript-eslint/prefer-nullish-coalescing`). The `||` is intended (an empty string starts an empty editor);
  `??` would pass `""` to Lexical. Fix: an explicit `initialEditorState ? initialEditorState : null`, or `!== ""`.
  Lint is not in CI. Waits: the next change of this file.
