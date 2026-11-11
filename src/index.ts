import {
  codeActionMenuPluginStyles,
  floatLinkEditorPluginStyles,
  floatTextFormatToolbarPluginStyles,
  tableCellResizerPluginStyles,
} from "./editor/plugins/index.js";
import { playgroundEditorThemeStyles } from "./editor/themes/index.js";
import { editorStyles } from "./editor/editorStyles.js";
import { componentsStyles } from "./editor/ui/index.js";
import { imageNodeStyles, videoNodeStyles, inlineImageNodeStyles } from "./editor/nodes/index.js";

export * from "./editor/index.js";
export * from "./display/index.js";
export const muiLexicalStyles = [
  ...componentsStyles,
  editorStyles,
  imageNodeStyles,
  inlineImageNodeStyles,
  codeActionMenuPluginStyles,
  floatLinkEditorPluginStyles,
  floatTextFormatToolbarPluginStyles,
  tableCellResizerPluginStyles,
  playgroundEditorThemeStyles,
  videoNodeStyles,
];
