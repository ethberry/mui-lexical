# mui-lexical

Peers: `lexical` and `@lexical/react` (0.53), `react`, `react-dom`, `@mui/material`, `@mui/icons-material`,
`@mui/system`. The app declares them in its own dependencies; the other `@lexical/*` packages come with this one.

# Installation

```bash
npm run install
```

# Storybook Configuration

Storybook is configured to work with:
- **Webpack 5** - bundler
- **TypeScript** - type checking
- **Material-UI** - UI library
- **Emotion** - CSS-in-JS
- **Lexical Editor** - rich text editor

## Running

```bash
npm run storybook
```

Storybook will be available at: http://localhost:6006

## Build

```bash
npm run build-storybook
```

## Structure

- `.storybook/main.ts` - main Storybook configuration
- `.storybook/preview.ts` - preview settings (MUI Theme Provider)
- `.storybook/manager.ts` - Storybook UI settings

## Stories

Stories are located in `src/**/*.stories.tsx`

Example: `src/components/LexicalEditorWrapper/LexicalEditorWrapper.stories.tsx`

