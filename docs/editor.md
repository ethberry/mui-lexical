# Editor and Display

`@ethberry/mui-lexical` exports two components on Lexical: `Editor` (rich text editing) and `Display` (read-only
rendering of a saved document). Both bring their own CSS: an app renders them with no setup.
The form input `LexicalTextEditor` of `@ethberry/mui-inputs-lexical` (mui-packages) wraps `Editor`.

## Data

A document is the JSON of a Lexical editor state (`JSON.stringify(state.toJSON())`). Both components take it as a
string; the node types they know are `MuiLexicalNodes` (rich text, lists, check lists, tables, code with
highlighting, links, images, inline images, videos, horizontal rules). A document with an unknown node type fails to
load.

## Media nodes: empty values

The playground code treats an empty value as missing in these places; a change must keep it:

- An image or inline image with width or height `0` (or none) is sized `"inherit"`.
- An image whose natural size is unknown or `0` (an SVG without its own size) is laid out as 200 × 200.
- The image resizer's limit is the node's `maxWidth`; `0` or none means the editor width minus 20, or 100 without an
  editor element.
- A video's start time comes from `t` (YouTube also `start`) in the query, else from `#t=` in the hash. An empty `t`
  falls through to `start`; a start of `0` means none, and the embed URL then has no start.
- An empty `className` of the select falls back to `select`; an empty `buttonAriaLabel` of a dropdown falls back to
  its `buttonLabel`.

## Editor

Props (`IEditorProps`), all optional:

- `initialEditorState`: the document to start with; an empty string or none starts empty. It is read once, when the
  editor mounts; a later change of the prop does not reload the editor.
- `readOnly`: the editor is not editable; links are clickable only then.
- `placeholder` (default "Enter some rich text..."), `autoFocus`.
- `hideToolbar`, `toolbarPlacement` (`top` by default or `bottom`), `controls`: which toolbar buttons and floating
  text-format buttons are shown (`IToolbarControls`).
- `onStateChange(state)`: every editor update, also selection changes; the caller compares the content itself.
  `onTextChange(text)`: the plain text of the root on every update.
- `onBlur`, `onFocus`: of the contenteditable.
- `data-testid`: put on the contenteditable, the element a test types into. Nothing else carries a test id.

Errors thrown inside Lexical (`onError`) are rethrown. The floating toolbars (link editor, table cell actions, code
actions, table hover actions, text format) are anchored in the editor's own element; the code / table hover and
text-format ones are hidden on narrow viewports.

## Styles

The editor is styled by the global CSS classes of the Lexical playground (toolbar, dialogs, nodes, plugins, theme).
That CSS is `muiLexicalStyles` (`src/styles.ts`), an array of emotion styles; the package does not export it.
`Editor` and `Display` each render
`<MuiLexicalGlobalStyles />` (`src/global-styles.tsx`) inside their `LexicalComposer`, and it renders MUI's
`<GlobalStyles styles={muiLexicalStyles} />` (emotion) in one of them only:

- emotion does not deduplicate Global styles: every `GlobalStyles` inserts its own copy of all the rules, and with a
  `Display` per list item the page hangs in emotion's style insertion. So the mounted instances are kept in a
  module-level list (registered in a layout effect, before the browser paints), and only the first one renders the
  styles; the others render nothing. When it unmounts, the next one renders them.
- the CSS is in the page once while at least one editor or display is mounted, and leaves with the last one
  (`src/styles.test.tsx`: 25 displays and an editor insert one copy; unmounting the first keeps one copy);
- a server render and the hydration of its markup (`useSyncExternalStore`'s server snapshot) render the styles in
  every instance, as the server registers no mounts; after hydration the client keeps one copy;
- the list is per loaded copy of the package and per JavaScript realm: one document. Components rendered into another
  document (an iframe with its own emotion cache) would get no styles while an instance in the main document owns them;
- the CSS holds no `@import`: injected after the page's other rules, a browser drops it and emotion logs an error.
  The package loads no web fonts; `.sticky-note` (playground CSS for a node this package does not have) names
  "Reenie Beanie" and falls back to the app's font.

`Display` adds MUI-theme colors (text, headings, quotes, code, links) through `StyledEditorWrapper`
(`src/display/styled.ts`). The playground CSS itself uses fixed colors, not the MUI theme.

## Console and styles

- The editor with its toolbar renders without React or emotion warnings (`src/editor/console.test.tsx`): the toolbar
  renders each control group as a keyed list (the control name is the key).
- `muiLexicalStyles` (`editorStyles`, `playgroundEditorThemeStyles`) uses no `:first-child`, `:nth-child` or
  `:nth-last-child`, which emotion reports as unsafe with server rendering. A first child is written `X:not(* + X)`
  (an `X` without a previous sibling element), even rows `tr:nth-of-type(even)`; a test checks both against the old
  selectors on the same markup.

## Display

`Display` renders `data` (a document string, empty by default) read-only. `onError` receives load errors;
`disableClickableLinks` turns links into plain text.
