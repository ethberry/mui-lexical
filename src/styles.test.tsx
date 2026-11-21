/// <reference types="@testing-library/jest-dom" />

import React from "react";
import { render } from "@testing-library/react";

import { Display, Editor } from "./index.js";

// The app renders the components and nothing else: no global styles, no theme provider.
const injectedCss = () =>
  Array.from(document.styleSheets)
    .flatMap(sheet => Array.from(sheet.cssRules, rule => rule.cssText))
    .join("\n");

describe("styles", () => {
  it("Editor brings its own styles (toolbar and theme)", () => {
    const { unmount } = render(<Editor />);

    expect(injectedCss()).toContain("button.toolbar-item");
    expect(injectedCss()).toContain(".PlaygroundEditorTheme__paragraph");
    unmount();
  });

  it("the injected styles hold no @import (a browser drops one that comes after other rules)", () => {
    const { unmount } = render(<Editor />);

    expect(injectedCss()).not.toContain("@import");
    unmount();
  });

  it("Display brings its own styles (theme)", () => {
    const { unmount } = render(<Display />);

    expect(injectedCss()).toContain(".PlaygroundEditorTheme__paragraph");
    unmount();
  });

  it("two editors on a page: unmounting one keeps the styles of the other", () => {
    const first = render(<Editor />);
    const second = render(<Editor />);

    first.unmount();

    expect(injectedCss()).toContain("button.toolbar-item");
    second.unmount();
  });
});
