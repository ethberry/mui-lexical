import React, { FC } from "react";

import { IToolbarComponentProps } from "../../../common/index.js";
import { InsertTableDialog } from "../../plugins/index.js";
import { useModal } from "../../hooks/index.js";
import { TableIcon } from "../../images/icons/index.js";

interface ITableButtonProps extends Omit<IToolbarComponentProps, "disabled"> {
  showModal: ReturnType<typeof useModal>[1];
}

export const TableButton: FC<ITableButtonProps> = ({ activeEditor, showModal }) => {
  return (
    <button
      onClick={() => {
        showModal("Insert Table", onClose => <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />);
      }}
      className={"toolbar-item spaced"}
      title="Table"
      type="button"
      aria-label="Table"
    >
      <TableIcon />
    </button>
  );
};
