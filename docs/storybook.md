# Storybook

A developer tool for the editor: `npm run storybook` (port 6006) or `npm run build-storybook`. Not part of CI (user's
decision 2026-11-19). The 8 stories live in `src/editor/Editor.stories.tsx` (CSF3, `const meta: Meta<typeof
Editor>`): the default editor, a bottom toolbar, in a container, a fixed height, compact, minimal controls, custom
controls, and the editor with `Display` next to it. They have no `play` functions: they are visual examples.

## Build

- `@storybook/react-webpack5` with the SWC compiler addon; SVGs are React components (`@svgr/webpack`) for imports from
  `.js` / `.ts(x)` files and plain assets otherwise.
- The sources import ESM-style `.js` paths of `.ts` / `.tsx` files; `.storybook/main.ts` maps them with webpack
  `resolve.extensionAlias` (`.js` → `.ts`, `.tsx`, `.js`). Without it the build fails with
  "Can't resolve './editor/index.js'".
- `typescript.check` is off; the stories are type-checked by `tsc` with the rest of `src`.

## Checking the stories locally

There is no test-runner in this repository. Build into a scratch folder, serve it, and render every story with a
test-runner from another repository in index-json mode:

```bash
npm run build-storybook -- --quiet -o /tmp/lexical-sb
npx http-server@14.1.1 /tmp/lexical-sb -p 6007 -a 127.0.0.1 -s
npx test-storybook --index-json --url http://127.0.0.1:6007
```

Without `--index-json` the runner takes the story files of the folder it runs in, not the served Storybook.
