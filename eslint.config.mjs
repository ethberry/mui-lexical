import storybook from "eslint-plugin-storybook";

import typescriptRules from "@ethberry/eslint-config/presets/tsx.mjs";

// DON'T ADD ANY RULES!
// FIX YOUR SHIT!!!

export default [
  {
    ignores: [
      "**/dist",
      "**/storybook-static",
      "eslint.config.mjs",
      "jest.config.json",
      "jest.setup.cjs",
    ],
  },

  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  ...typescriptRules,
  ...storybook.configs["flat/recommended"],
];
