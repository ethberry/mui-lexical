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

  // the theme's paragraph rules stand for the whole CSS; one copy of the CSS is what a single Display inserts
  const themeParagraphRules = () =>
    Array.from(document.styleSheets)
      .flatMap(sheet => Array.from(sheet.cssRules, rule => rule.cssText))
      .filter(rule => rule.startsWith(".PlaygroundEditorTheme__paragraph")).length;

  const oneCopy = () => {
    const { unmount } = render(<Display />);
    const count = themeParagraphRules();
    unmount();
    return count;
  };

  it("25 Displays and an Editor on a page insert the CSS once", () => {
    const copy = oneCopy();
    expect(copy).toBeGreaterThan(0);

    const { unmount } = render(
      <>
        {Array.from({ length: 25 }, (_, i) => (
          <Display key={i} />
        ))}
        <Editor />
      </>,
    );

    expect(themeParagraphRules()).toBe(copy);
    unmount();
    expect(themeParagraphRules()).toBe(0);
  });

  it("unmounting the Display that inserted the CSS keeps one copy for the others", () => {
    const copy = oneCopy();
    const first = render(<Display />);
    const second = render(<Display />);
    const third = render(<Display />);

    first.unmount();

    expect(themeParagraphRules()).toBe(copy);
    second.unmount();
    third.unmount();
  });

  it("two editors on a page: unmounting one keeps the styles of the other", () => {
    const first = render(<Editor />);
    const second = render(<Editor />);

    first.unmount();

    expect(injectedCss()).toContain("button.toolbar-item");
    second.unmount();
  });
});
