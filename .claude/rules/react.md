---
paths:
  - "**/*.tsx"
  - "**/use-*.ts"
  - "**/hooks/**/*.ts"
---

<!-- Shared rule (stacks: react). Maintained outside this repository; local edits are overwritten. -->

# React

## Components

- One component per folder in `index.tsx`; its sub-components, dialogs and styles are next to it. Named exports only, no `export default`.
- A component is `FC<I<Name>Props>` with the props interface exported next to it and destructured on the first line.
- Import from `react` by name (`import { FC, useState } from "react"`); `import type` for types only.
- Entity and DTO types come from the shared types package, never redeclared in a component.
- Use the existing building blocks (layout, inputs, dialogs, collections, wallet hooks) before writing a local component.
- Texts are i18n message ids (`<FormattedMessage id="…" />`, `formatMessage`), never literal strings; validation messages are ids too.
- Interactive elements that tests use carry `data-testid` (through the test-id provider where the component supports it).

## Server data: TanStack Query

- The app creates one `QueryClient` at module level and provides it at the top of the tree. Packages never create their own; `@tanstack/react-query` is a peer dependency.
- Reads are queries (`useApiQuery` / `useQuery`), writes are mutations (`useApiMutation` / `useMutation`). No `fetch` / `axios` in components and no "fetch in `useEffect` + `useState`" for server data.
- Query keys are arrays that start with the resource and contain every input of the request: `["erc721/templates", search]`, `["erc721/templates", id]`. A request whose inputs are not in the key serves stale data.
- After a mutation, refresh what it changed: `invalidateQueries` with the resource prefix, or `setQueryData` when the response is the new value. Do not refetch everything.
- Data copied from a list into the item cache is marked stale (`setQueryData(key, row, { updatedAt: 0 })`), so the full item is still fetched.
- Server data never goes into redux or component state; redux holds only UI state (theme, language, layout). A store or `QueryClient` is created once at module level, never inside a component.
- Errors: an HTTP 400 of a form submit is mapped onto the form fields; other errors show a snackbar. One error should show one snackbar even when several components subscribe to the same query (today `useApiQuery` shows one per hook instance — a known follow-up, not a pattern to build on).
- `enabled` for dependent queries instead of conditional hooks; `placeholderData: keepPreviousData` for paginated lists.

```tsx
// Bad: server data in component state, no cache, no cancellation
const [rows, setRows] = useState<ITemplate[]>([]);
useEffect(() => {
  void api.fetchJson({ url: "/erc721/templates" }).then(setRows);
}, []);

// Good
const { data, isLoading } = useApiQuery(["erc721/templates", search], (api, signal) =>
  api.fetchJson({ url: "/erc721/templates", data: search, signal }),
);
```

## Forms

- Forms are react-hook-form through the shared `FormWrapper` / `FormDialog`, with a zod schema. yup is not used any more: an existing yup schema is moved to zod when its form is touched, never extended. Rich text is Lexical (`@ethberry/mui-inputs-lexical`, `LexicalTextEditor`); draft-js is not used any more. The schema validates; `onSubmit` receives the values the inputs hold, not the schema's transformed output, and the API gets them as they are.
- `initialValues` contain exactly the fields the form edits; an entity from a list carries relations and timestamps the API must not receive.
- A value set by code that represents a user action uses `setValue(name, value, { shouldDirty: true, shouldValidate: true })`, otherwise the dialog's submit stays disabled. Lists of fields use `useFieldArray` with `field.id` as the key.
- Read other fields with `useWatch({ name })` for exactly the fields needed, not the whole form — except components that react to any change by design (auto-save).
- A control does not reset a form it does not own (no `form.reset` in an input's cleanup).

## Providers and packages

- The provider tree is in one file per app. Interchangeable implementations (API/auth, storage, wallet connectors) are chosen there by import; other code imports the base package (`useApi`, `useUser`, `useStorage`, `useWallet`).
- A package that owns a context is a peer of its users; the app declares it in its own dependencies.

## Performance

- Context values are memoized (`useMemo`); handlers passed to memoized children are stable (`useCallback`) only where it matters.
- No index keys for lists that can be reordered or filtered.
- Effects have complete dependency lists; an effect that only derives state from props is a computed value instead.
