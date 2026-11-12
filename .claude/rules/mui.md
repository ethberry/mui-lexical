---
paths:
  - "**/*.tsx"
  - "**/styled.ts"
---

<!-- Shared rule (stacks: react). Maintained outside this repository; local edits are overwritten. -->

# Material UI

Adds to the `react` rule. The code base is on MUI with emotion; the legacy `@mui/styles` (`makeStyles`, `withStyles`) is gone and does not come back. Code ported from a CSS-class based UI (the Lexical playground editor) keeps its CSS classes; these rules apply to the MUI parts around it.

## Styling

- `styled()` components live in the component's own `styled.ts` next to `index.tsx`, never in the component file. Import `styled` from `@mui/material/styles`.
- `sx` is for a few local values (spacing, width, alignment) on one element. More than a handful of properties, or the same `sx` twice, goes into `styled.ts`. No inline `style={{}}`.
- Values come from the theme: `theme.spacing(n)` for sizes and gaps, `theme.palette.*` for colors, `theme.mixins.toolbar` for the app bar height, `theme.breakpoints` for media queries. No hex or named colors (`"#ccc"`, `"green"`) and no `px` literals in components; icon SVGs and brand assets are the exception.
- A styled component with own props filters them with `shouldForwardProp`, so they do not reach the DOM.
- The variable from `useTheme()` is called `theme`.

```ts
// Bad: component file, hard-coded color and size
<Box style={{ marginTop: "64px", color: "#f77423" }} />

// Good: styled.ts
export const StyledRoot = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(8),
  color: theme.palette.warning.main,
}));
```

## Theme

- The theme comes from the shared theme provider (emotion cache with RTL support, `StyledEngineProvider injectFirst`, `ThemeProvider`, `CssBaseline`). An app passes its palettes and options to it; it does not build a second `ThemeProvider`.
- Light / dark mode is the theme type in the store, switched by the shared button. Apps do not add MUI color schemes on top of it.

## Layout and props

- Grid is the v2 API only: `<Grid container>` and `<Grid size={{ xs: 12, md: 6 }}>`. No `item`, no `xs=` props, no `Grid2` / `Unstable_Grid` imports.
- Inner parts are configured through `slots` / `slotProps` (`slotProps={{ input: { … } }}`), not the deprecated `InputProps`, `inputProps`, `InputLabelProps`, `PaperProps`, `componentsProps`, `TransitionProps`.
- Icons are named imports from `@mui/icons-material`: `import { Delete } from "@mui/icons-material";`.

## Inputs

- A form input takes its state from the form (`useFormContext` + `Controller`, or `useController`), never its own `useState` for the value.
- Label, placeholder and error text follow the shared ids: `form.labels.<name>`, `form.placeholders.<name>`, and the error message id from the schema formatted with the label. A new input reuses the core inputs (`TextInput`, `NumberInput`, `SelectInput`, …) instead of a bare `TextField`.
- Inputs set `error={Boolean(error)}` and a `data-testid`; layout defaults (`variant`, `fullWidth`, margins) come from the core inputs, not from each form.

## Dialogs, progress, notifications

- Dialogs are the shared ones (`FormDialog`, `ConfirmationDialog`, `DeleteDialog`) with an i18n `message` id and a `testId`; a new dialog type goes into the dialog package, not into an app.
- Loading states use `ProgressOverlay isLoading={…}` around the content, not a local spinner.
- Notifications go through notistack with an i18n id: `enqueueSnackbar(formatMessage({ id: "snackbar.updated" }), { variant: "success" })`. Mutations report through `useApiMutation`'s `successMessage`, not a manual snackbar.
