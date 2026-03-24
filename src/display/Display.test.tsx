/// <reference types="@testing-library/jest-dom" />

import type { ReactElement } from "react";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { Display } from "./index";

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

describe("Display", () => {
  it("renders the read-only editor surface", () => {
    const { container } = renderWithTheme(<Display />);

    expect(container.querySelector(".editor-input")).toBeInTheDocument();
  });

  it("loads serialized editor state and shows text", async () => {
    renderWithTheme(<Display data={docWithHello} />);

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });
  });
});
