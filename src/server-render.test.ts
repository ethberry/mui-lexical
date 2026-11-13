import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// A server render (Next.js App Router, any SSR) loads the package in Node, where there is no document or window.
// The built package is imported and the editor rendered to a string in a node process of its own (this suite runs
// in jsdom). It reads dist: run the build first.

const dist = pathToFileURL(resolve(dirname(fileURLToPath(import.meta.url)), "..", "dist", "index.js")).href;

const render = (props: string) =>
  spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
      import { createElement } from "react";
      import { renderToString } from "react-dom/server";
      const { Editor } = await import(${JSON.stringify(dist)});
      console.log(renderToString(createElement(Editor, ${props})));
      `,
    ],
    { encoding: "utf8" },
  );

describe("server render", () => {
  it("the package loads in Node without a DOM and renders the editor with its toolbar", () => {
    const result = render("{}");

    expect(result.stderr).not.toMatch(/ReferenceError|is not defined/);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("contenteditable");
  });

  it("renders a read-only editor without the toolbar", () => {
    const result = render("{ readOnly: true, hideToolbar: true }");

    expect(result.status).toBe(0);
  });
});
