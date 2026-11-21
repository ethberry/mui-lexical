# Editor and Display

`@ethberry/mui-lexical` exports two components on Lexical: `Editor` (rich text editing) and `Display` (read-only
rendering of a saved document). Both bring their own CSS: an app renders them with no setup.
The form input `LexicalTextEditor` of `@ethberry/mui-inputs-lexical` (mui-packages) wraps `Editor`.

## Data

A document is the JSON of a Lexical editor state (`JSON.stringify(state.toJSON())`). Both components take it as a
string; the node types they know are `MuiLexicalNodes` (rich text, lists, check lists, tables, code with
highlighting, links, images, inline images, videos, horizontal rules). A document with an unknown node type fails to
load.

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
`<GlobalStyles styles={muiLexicalStyles} />` (MUI, emotion) inside their `LexicalComposer`:

- the CSS is in the page while at least one editor or display is mounted, and leaves with the last one;
- each mounted component inserts its own copy of the same rules; identical copies do not change the result, and
  unmounting one leaves the others' copies in place (`src/styles.test.tsx`).

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
