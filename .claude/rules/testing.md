<!-- Shared rule (stacks: base). Maintained outside this repository; local edits are overwritten. -->

# Testing

Tests are the independent check of a task: they prove the requirement, not the implementation. Stack rules (`playwright`, a repository's `.agents/rules/`) add to this one.

## Tests come from the requirement

- Derive test cases from the acceptance criteria, not from the code you just wrote.
- Each criterion maps to at least one test. When a test is impossible, do a manual check instead: record the command and its result in the plan file, say in the report why no test exists, and mark the criterion "checked manually".
- Test behaviour at the level the requirement talks about, through the public API of the unit: an HTTP response and the stored state, an emitted event or queue message, a contract's external functions and events, a component's rendered output and form state, a package's exports. Not private methods, not a call order the requirement does not care about.
- Expected values come from the requirement, the contract or the fixtures — never copied from what the new code returned.
- A bug fix starts with a test that reproduces the bug and fails on the old code; then fix. Say so in the report.
- An existing test's expectation changes only when the requirement changed; say why in the report.

## A test must fail when its criterion is broken

A green run on the first try proves nothing yet. For every criterion:

1. Name the plausible wrong implementation — the one that looks right and is easiest to write by mistake: the state is not stored, the filter is not applied, the lookup ignores the owner (merchant, user, chain), the limit is off by one, the error is swallowed.
2. Make the test fail on it: choose inputs and assertions whose expected value that implementation cannot produce.
3. Check it. For criteria about security, ownership or isolation, persistence across requests, limits and money, break the code for real (drop the condition, skip the write, widen the query), run the test, see it fail, restore it with git. For the rest, at least reason it through. Record it in the report: `broken: <what> → <test> failed`.

Two shapes of test pass on the wrong implementation and need extra care.

**Persistence: the later request must not be able to recompute the result.** If the second request repeats the first one (same input, same order), a version that stores nothing gives the same answer.

```ts
// Bad — the second request recomputes everything; passes even if nothing was stored
const first = await listTokens(merchant);
const second = await listTokens(merchant);
expect(second.ids).toEqual(first.ids);

// Good — the second request can only succeed through what the first one stored
const created = await createTemplate(merchant, { title: "Sword" });
const opened = await getTemplate(merchant, created.id); // no create in this request
expect(opened.title).toEqual("Sword");
```

**Isolation and not-found: use a value that is valid elsewhere.** A key that never existed is rejected by any implementation, including one that ignores the owner. Use a key that is real in another scope — another merchant's record, another user's token, another chain's contract — and show it works in its own.

```ts
// Bad — id 999999 never existed; a lookup that ignores the merchant also returns 404
const response = await getTemplate(merchantB, 999999);
expect(response.status).toEqual(404);

// Good — the template is real for merchant A; only the per-merchant lookup rejects it for B
const template = await createTemplate(merchantA, { title: "Sword" });
const foreign = await getTemplate(merchantB, template.id);
expect(foreign.status).toEqual(404);
const own = await getTemplate(merchantA, template.id);
expect(own.status).toEqual(200);
```

The same holds for authorization: a forbidden request uses an existing record of another user, and the same request succeeds for its owner.

## Isolation

A failed, interrupted or partially executed test must not affect any following test.

- Reset what a test may change in `beforeEach`, or clean it in `afterEach` / `finally` — not at the end of an `it`, which does not run when the test fails.
- Restore everything a test mutates: database rows, cache keys, queues, config overrides, fake timers, spies, process globals.
- Shared expensive setup goes in `beforeAll` only when no test mutates it. Use per-test unique ids, emails, addresses and nonces.
- Each new or changed test passes alone, in file order, and after a previous test failed.

## Waiting and timeouts

- No fixed waits (`setTimeout`, `sleep`, `waitForTimeout`): wait for a state.
- Never raise a timeout to get green: no `jest.setTimeout`, no timeout argument on `it` or a hook, no `--testTimeout`, no larger timeout in the runner config, no rerun with a longer one. A timeout means something is stuck (a database call, a queue, a provider, a port, a lock, a leftover process or container): find it.
- A unit or API test takes less than a second. A slower one is a defect: find where the time goes (a real delay or retry backoff, real timers, a provider that should be a stub, an app or database set up per test instead of per suite) and change the test or make the delay configuration.
- The exception is a test that waits on a real chain's blocks or a running UI stand: it may take longer, and it still waits for a state (a receipt, an event, an element), never for time.

## Assertions

- **The actual value first.** Compute every awaited value (a request, a repository query, a chain read, a helper) into a named const, then assert it. No `await` inside `expect(...)`, also not `expect((await call()).field)`.
- **Full paths.** `expect(body.list[0].merchantId).toEqual(merchantId)`, not `toHaveProperty` or `toMatchObject` when the path is known.
- **Exact counts for controlled data.** When the test created the fixture, assert the exact number (`toHaveLength(2)`, `toEqual(2)`), never `toBeGreaterThan(0)`.
- **One named const** for a value used in both setup and assertion.
- **A table for shared assertions**: many inputs with one assertion are an `it.each` (or a loop), one value and one `expect` per case.

## Guards against lost and weakened tests

- Focused tests are forbidden in every runner: `forbidOnly: true` for mocha and Playwright, `jest/no-focused-tests` as an error or `--ci` for jest. A forgotten `.only` in a shared behaviour silently drops every other test of its consumers.
- When a change touches test infrastructure, dependencies or shared behaviours, compare the number of tests per package before and after; a drop is a failure until explained.
- To watch a test fail on the old code, put the old code back with git (`git stash` of the fix, or `git checkout <base> -- <file>`) and restore it the same way, never with a second hand edit or `sed`; then check the diff before pushing.
- Do not weaken a check to get green: no skipped tests, raised timeouts, broader matchers or mocked-out code under test. A test that cannot run in CI is reported, not deleted.
- Stub only at the boundary of the system under test (another service, an external provider, a chain you do not run), through dependency injection or the module's public seam; keep your own code, validation and the test database real.
- A change to build configuration (`tsconfig*`, webpack / bundler config, `package.json` exports or scripts) is verified with the production build of every app and package it affects, not only with type checks or a dev server. Name the builds in the report.
- Test code is type-checked like production code. Test runners often only transpile (ts-jest with `isolatedModules`, Hardhat through ts-node), and `tsconfig` often excludes tests, so type errors in tests stay hidden. Each package has a `typecheck` script (`tsc --noEmit` over a config that includes the tests) and it runs in the local checks before a PR.
- Published code is tested as it is published when the packaging matters (for example `require()` and `import` of the built `dist` in a separate process).

## How test code is written

The user's rule (2026-11-21): tests follow one pattern, as the application code does. A repository's own layout and helpers are in its `.agents/rules/`.

- **Test code is code.** `kiss-dry-yagni` and the language rules apply to it as to the application. A long script-like test, steps copied between files and half-used helpers are rewritten, not extended.
- **A test body reads as the scenario**: a sequence of named steps and assertions on their results. The mechanics (locators, waits, request shapes, ABI calls) live in the steps.
- **A step used in two tests is a helper.** Helpers are grouped by domain, one file per area of the repository's tests.
- **A helper that builds data is a pure function** (values in, value out, no I/O, no module state). A helper that acts takes what it acts on as parameters and returns what the caller needs next. No module-level mutable state except a named cache.
- **The facts of the test environment** (URLs, ids, keys, chains, accounts) are defined once, in the repository's stand or fixtures module; a test never writes its own.
- **The same test over several inputs or environments** is a loop or a parameterised test, never a copy.
- **No `any`, `as unknown as` or casts to quiet the compiler** in tests; responses and chain reads are typed once, in the helper that fetches them.
- **A test file you touch** is brought to these rules in the same change for the part you touch; a file far from them is rewritten as its own change, with the same tests passing before and after.

## Which tests to run when

- **While developing:** run only the tests the change directly touches (the changed specs, the specs of the changed contract / module / package, the shared behaviour you edited). Do not run the whole suite after every edit.
- **Before every commit:** the final check runs the full suite of the repository (plus build, typecheck, lint), and the commit happens only when it is green. Name the full run and its result in the report and the PR.
- **The full suite runs once per commit.** Before starting it, the fast checks are already green: typecheck and lint of the changed files and the affected specs. A full run is not a way to find a type error or a lint error. If the final check still finds something, fix it, re-run only the fast checks and the affected specs, and then the full suite once more.

## Reporting results

- Keep apart **written** (the file exists), **run** (the command executed) and **passed** (it ran green); report each claim at the strongest level that is true, with the exact command.
- For the criteria that need a real break, list what was broken and which test failed. A criterion without it is "unproven", not "met".
- "Tests pass" covers only what was run; name what was not run and why.
- A failure is not "flaky" without evidence (it passes on a rerun with no change, and you can name the shared state). Report the failure output either way.
- A failure called pre-existing is shown failing on the base branch too.
