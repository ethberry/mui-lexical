/// <reference types="@testing-library/jest-dom" />

import React from "react";
import { jest } from "@jest/globals";
import { act, render } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { Editor } from "./Editor.js";

// Focusing the editor from the keyboard (Tab) can leave the DOM selection on the editable root itself, not inside a
// paragraph. The toolbar must keep working then (Lexical error #51: RootNode.getTopLevelElementOrThrow).
describe("Editor with the selection on its root", () => {
  it("the toolbar updates without an error", async () => {
    const errors: unknown[] = [];
    const onError = (event: ErrorEvent) => {
      errors.push(event.error);
      event.preventDefault();
    };
    window.addEventListener("error", onError);
    const consoleError = jest.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      errors.push(args[0]);
    });

    render(
      <ThemeProvider theme={createTheme()}>
        <Editor />
      </ThemeProvider>,
    );
    const root = document.querySelector<HTMLElement>(".ContentEditable__root");
    if (!root) {
      throw new Error("no editable root");
    }

    await act(async () => {
      root.focus();
      document.getSelection()?.setBaseAndExtent(root, 0, root, 0);
      document.dispatchEvent(new Event("selectionchange"));
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    window.removeEventListener("error", onError);
    consoleError.mockRestore();
    expect(
      errors.map(String).filter(message => message.includes("getTopLevelElementOrThrow") || message.includes("#51")),
    ).toEqual([]);
  });
});
