/// <reference types="@testing-library/jest-dom" />

import type { ReactElement } from "react";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { Editor } from "./Editor";

const theme = createTheme();

/** Minimal Lexical serialized document: one paragraph containing "Hello". */
const docWithHello = JSON.stringify({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Hello",
            type: "text",
            version: 1,
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe("Editor", () => {
  it("renders the rich-text surface with the default placeholder", () => {
    renderWithTheme(<Editor hideToolbar />);

    expect(screen.getByText("Enter some rich text...")).toBeInTheDocument();
    expect(document.querySelector(".ContentEditable__root")).toBeInTheDocument();
  });

  it("shows content from initialEditorState", async () => {
    renderWithTheme(<Editor hideToolbar initialEditorState={docWithHello} />);

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });
  });
});
