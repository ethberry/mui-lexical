/// <reference types="@testing-library/jest-dom" />

import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { Editor } from "./Editor.js";
import { editorStyles } from "./editorStyles.js";
import { playgroundEditorThemeStyles } from "./themes/playgroundEditorThemeStyles.js";

// emotion warns on these pseudo classes (unsafe with server rendering); an app's console shows the warning as an error
const unsafePseudoClasses = /:first-child|:nth-child|:nth-last-child/;

describe("editor styles", () => {
  it("use no pseudo class that emotion reports as unsafe", () => {
    expect(editorStyles.styles).not.toMatch(unsafePseudoClasses);
    expect(playgroundEditorThemeStyles.styles).not.toMatch(unsafePseudoClasses);
  });

  it("the replacement selectors match the same elements as the old ones", () => {
    document.body.innerHTML = `
      <table><tbody>
        <tr><th>h</th><td>a</td><td>b</td></tr>
        <tr><td>c</td><td>d</td></tr>
        <tr><td>e</td></tr>
        <tr><td>f</td></tr>
      </tbody></table>
      <div class="dropdown"><span>x</span><button class="item">1</button><button class="item">2</button></div>
      <div class="dropdown"><button class="item">3</button><button class="item">4</button></div>
      <ul class="typeahead-popover"><li>5</li><li>6</li></ul>`;
    const same = (before: string, after: string) =>
      expect(Array.from(document.querySelectorAll(after))).toEqual(Array.from(document.querySelectorAll(before)));

    same("tr > td:first-child", "tr > td:not(* + td)");
    same("tr > th:first-child", "tr > th:not(* + th)");
    same("tr > :first-child", "tr > :not(* + *)");
    same(".dropdown .item:first-child", ".dropdown .item:not(* + .item)");
    same(".typeahead-popover li:first-child", ".typeahead-popover li:not(* + li)");
    same("tbody > tr:nth-child(even)", "tbody > tr:nth-of-type(even)");
    document.body.innerHTML = "";
  });
});

// The editor with its toolbar must render without React or emotion warnings: an app's console shows them as errors
// (missing list keys, unknown props on a Fragment, emotion's ":first-child is potentially unsafe").
describe("Editor with the toolbar", () => {
  it("renders without console errors or warnings", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => void 0);
    const warn = jest.spyOn(console, "warn").mockImplementation(() => void 0);

    render(
      <ThemeProvider theme={createTheme()}>
        <Editor />
      </ThemeProvider>,
    );
    await screen.findByText("Enter some rich text...");

    expect(error.mock.calls.map(args => String(args[0]))).toEqual([]);
    expect(warn.mock.calls.map(args => String(args[0]))).toEqual([]);
  });
});
