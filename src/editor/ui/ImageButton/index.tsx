import React, { FC } from "react";

import { IToolbarComponentProps } from "../../../common/index.js";
import { InsertImageDialog } from "../../plugins/index.js";
import { useModal } from "../../hooks/index.js";
import { FileImageIcon } from "../../images/icons/index.js";

interface IImageButtonProps extends Omit<IToolbarComponentProps, "disabled"> {
  showModal: ReturnType<typeof useModal>[1];
}

export const ImageButton: FC<IImageButtonProps> = ({ activeEditor, showModal }) => {
  return (
    <button
      onClick={() => {
        showModal("Insert Image", onClose => <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />);
      }}
      className={"toolbar-item spaced"}
      title="Image"
      type="button"
      aria-label="Image"
    >
      <FileImageIcon />
    </button>
  );
};
