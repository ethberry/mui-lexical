require("@testing-library/jest-dom");

jest.mock("@lexical/react/LexicalErrorBoundary", () => {
  const React = require("react");
  return {
    LexicalErrorBoundary: ({ children }) =>
      React.createElement(React.Fragment, null, children),
  };
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

globalThis.ResizeObserver = class ResizeObserver {
  observe() {
    /* Lexical / MUI may call this in tests */
  }
  unobserve() {}
  disconnect() {}
};
