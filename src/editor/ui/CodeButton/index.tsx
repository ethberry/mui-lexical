import React, { FC } from "react";
import { FORMAT_TEXT_COMMAND } from "lexical";

import { SHORTCUTS } from "../../plugins/ShortcutsPlugin/shortcuts.js";
import { IToolbarComponentProps } from "../../../common/index.js";
import { CodeIcon } from "../../images/icons/index.js";

interface ICodeButtonProps extends IToolbarComponentProps {
  isCode: boolean;
}

export const CodeButton: FC<ICodeButtonProps> = ({ activeEditor, isCode, disabled }) => {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
      }}
      className={"toolbar-item spaced " + (isCode ? "active" : "")}
      title={`Insert code block (${SHORTCUTS.INSERT_CODE_BLOCK})`}
      type="button"
      aria-label="Insert code block"
    >
      <CodeIcon />
    </button>
  );
};
