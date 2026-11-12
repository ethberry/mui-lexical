# mui-lexical

`@ethberry/mui-lexical`: a rich text editor on Lexical for MUI apps. A single package, not a monorepo. `mui-packages` (`mui-inputs-lexical`) wraps it as a form input.

## Place in the package levels

Level 1: no dependencies on other `@ethberry/*` runtime packages. Released before `mui-packages`.

## Commands

- Base branch: `main`.
- Install: `npm ci`.
- Build: `npm run build` (`tsc`). Test: `npm run test`. Lint: `npm run lint` (not in CI; run it locally).
- Storybook: `npm run storybook` (port 6006), `npm run build-storybook`. There are no story tests in CI.
- CI (`ci-test.yml`) on a PR: `npm ci`, build, test.
- Release: `gh workflow run manual.yml --repo ethberry/mui-lexical --ref main -f bump=patch|minor|major` (default `patch`). The workflow runs `npm version` and publishes to GitHub Packages and to npmjs (public).

## Gotchas

- Most of the editor (`src/editor`: nodes, plugins, UI) is ported from the Lexical playground and styled with its own CSS classes. It keeps them; the MUI styling rules apply only to the MUI wrapper around the editor.
- All `lexical` / `@lexical/*` packages are on one exact version; update them together in one change.
- ESM only (`nodenext`, `.js` in relative imports). Jest runs with `NODE_OPTIONS=--experimental-vm-modules`.
- The version is set by the release workflow (`npm version`), not by conventional commits.

## Docs

Usage is in `README.md`. Rules are in `.claude/rules/`, synced from the shared agent kit.
