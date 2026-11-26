# Lint

How ESLint runs in this repository: the config, the local commands, the commit hook and the CI step.

## Config

- One flat config, `eslint.config.mjs`. It spreads the `@ethberry/eslint-config` preset `presets/tsx.mjs` (a
  devDependency, held on the 5.x line) and `eslint-plugin-storybook`'s `flat/recommended`; it adds no rules of its own.
- The preset's rules cover the test files (`*.test.*`, `*.spec.*`) too, including `jest/no-focused-tests` as an
  error: a committed `.only` fails lint.
- Ignored: `**/dist`, `**/storybook-static`, `eslint.config.mjs`, `jest.config.json`, `jest.setup.cjs`. A flat config
  does not read `.gitignore`: a generated folder that is not in `ignores` is linted, and a type-aware run over a built
  bundle (the Storybook build) does not finish in reasonable time. A new build output folder goes into `ignores`.
- The code ported from the Lexical playground (`src/editor`) is linted like the rest.

## Commands

- `npm run lint`: `eslint .` over the repository, without `--fix`; it exits non-zero on any error. Warnings do not
  fail it. To fix what can be fixed: `npm run lint -- --fix`. ESLint is a dependency: it runs through the npm
  scripts, never through npx.
- Commit hook: husky runs lint-staged (`.lintstagedrc`), which runs `prettier --write` and `eslint --fix` on the staged
  `js` / `jsx` / `ts` / `tsx` files. The hook can be skipped, so it is not the guard.

## CI

- `ci-test.yml` (started by hand) runs `npm run lint` after `npm ci` and before the build, so the job fails on any
  lint error, a focused test included.
