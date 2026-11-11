import React, { FC } from "react";

import { IToolbarComponentProps } from "../../../common/index.js";
import { InsertVideoDialog } from "../../plugins/index.js";
import { useModal } from "../../hooks/index.js";
import { YoutubeIcon } from "../../images/icons/index.js";

interface IVideoButtonProps extends Omit<IToolbarComponentProps, "disabled"> {
  showModal: ReturnType<typeof useModal>[1];
}

export const VideoButton: FC<IVideoButtonProps> = ({ activeEditor, showModal }) => {
  return (
    <button
      onClick={() => {
        showModal("Insert Video", onClose => <InsertVideoDialog activeEditor={activeEditor} onClose={onClose} />);
      }}
      className={"toolbar-item spaced"}
      title="Video"
      type="button"
      aria-label="Image"
    >
      <YoutubeIcon />
    </button>
  );
};
