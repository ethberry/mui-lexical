---
paths:
  - "**/*.stories.tsx"
  - "**/*.stories.ts"
  - ".storybook/**"
---

<!-- Shared rule (stacks: storybook). Maintained outside this repository; local edits are overwritten. -->

# Storybook

Stories are optional; a component that has them keeps them working, because `test-storybook` runs every story in CI against the built `storybook-static`.

## Files and typing

- A story file is `src/<component>/index.stories.tsx` next to the component and imports it as `./index.js`.
- CSF3 with real types: `import type { Meta, StoryObj } from "@storybook/react-webpack5";`, then `const meta = { … } satisfies Meta<typeof X>; export default meta;` and `type Story = StoryObj<typeof meta>`. No `// @ts-ignore` above the imports, no `ComponentStory` / `Template.bind`. Today almost every story still has `export default { … } as Meta` with `// @ts-ignore`: that is debt, not a pattern — convert the file you touch.
- `title` is `"<Group>/<Name>"` with an existing group (`Input`, `Dialog`, `FileInput`, `MaskedInput`, `Progress`, `Component`, …).

```tsx
// Bad
// @ts-ignore
import { Meta, StoryObj } from "@storybook/react-webpack5";
export default { title: "Input/Text", component: TextInput } as Meta<typeof TextInput>;

// Good
import type { Meta, StoryObj } from "@storybook/react-webpack5";
const meta = { title: "Input/Text", component: TextInput, decorators: [withForm] } satisfies Meta<typeof TextInput>;
export default meta;
type Story = StoryObj<typeof meta>;
```

## Providers

- Theme and license are global decorators in `.storybook/preview.tsx`. Everything else a story needs (i18n, test ids, form, snackbar, storage, query client) is a decorator of that story file.
- A provider wrapper used by several story files is shared from one place in the repository, not copied per file. A form input story wraps the input in a form provider; it does not render the input without one.
- Stories never call real services: storage, API and wallet contexts get in-memory implementations.

## Args and interactions

- Shared `args` / `argTypes` are in the meta; callbacks are actions (`onConfirm: { action: "confirmed" }`); each story overrides only what it shows.
- A `play` function is a test: it acts through `userEvent` / `within(canvasElement)` from `storybook/test` where the interaction allows it (drag-and-drop may need native events) and ends with an `expect`. A `play` without an assertion is not a test.

## Tags and CI

- A story that cannot run in CI gets `tags: ["!test"]` with a comment saying why. No other way of skipping.
- Secrets the stories need (the license key) come from CI secrets, and locally from the git-ignored `.env`; never from a committed file.
- A Storybook config change (webpack aliases, fallbacks, addons) is checked with `build-storybook` and `storybook:test` before it is pushed.
