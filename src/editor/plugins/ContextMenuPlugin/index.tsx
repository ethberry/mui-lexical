/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  NodeContextMenuOption,
  NodeContextMenuPlugin,
} from "@lexical/react/LexicalNodeContextMenuPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isDecoratorNode,
  $isNodeSelection,
  $isRangeSelection,
  COPY_COMMAND,
  CUT_COMMAND,
  PASTE_COMMAND,
} from "lexical";
import { useMemo, type JSX } from "react";

export { NodeContextMenuOption, NodeContextMenuSeparator } from "@lexical/react/LexicalNodeContextMenuPlugin";

export const ContextMenuPlugin = (): JSX.Element => {
  const [editor] = useLexicalComposerContext();

  const items = useMemo(
    () => [
      new NodeContextMenuOption("Remove Link", {
        $showOn: node => {
          const parent = node.getParent();
          return parent !== null && $isLinkNode(parent);
        },
        $onSelect: () => {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        },
      }),
      new NodeContextMenuOption("Copy", {
        $onSelect: () => {
          editor.dispatchCommand(COPY_COMMAND, null);
        },
      }),
      new NodeContextMenuOption("Cut", {
        $onSelect: () => {
          editor.dispatchCommand(CUT_COMMAND, null);
        },
      }),
      new NodeContextMenuOption("Paste", {
        $onSelect: () => {
          void navigator.clipboard.read().then(async () => {
            const data = new DataTransfer();

            const clipboardItems = await navigator.clipboard.read();
            const item = clipboardItems[0];

            const permission = await navigator.permissions.query({
              // @ts-expect-error These types are incorrect.
              name: "clipboard-read",
            });
            if (permission.state === "denied") {
              alert("Not allowed to paste from clipboard.");
              return;
            }

            for (const type of item.types) {
              const dataString = await (await item.getType(type)).text();
              data.setData(type, dataString);
            }

            const event = new ClipboardEvent("paste", {
              clipboardData: data,
            });

            editor.dispatchCommand(PASTE_COMMAND, event);
          });
        },
      }),
      new NodeContextMenuOption("Paste as Plain Text", {
        $onSelect: () => {
          void navigator.clipboard.read().then(async () => {
            const permission = await navigator.permissions.query({
              // @ts-expect-error These types are incorrect.
              name: "clipboard-read",
            });

            if (permission.state === "denied") {
              alert("Not allowed to paste from clipboard.");
              return;
            }

            const data = new DataTransfer();
            const text = await navigator.clipboard.readText();
            data.setData("text/plain", text);

            const event = new ClipboardEvent("paste", {
              clipboardData: data,
            });
            editor.dispatchCommand(PASTE_COMMAND, event);
          });
        },
      }),
      new NodeContextMenuOption("Delete Node", {
        $onSelect: () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const currentNode = selection.anchor.getNode();
            const parents = currentNode.getParents();
            const ancestorNodeWithRootAsParent = parents.at(-2);
            ancestorNodeWithRootAsParent?.remove();
          } else if ($isNodeSelection(selection)) {
            const selectedNodes = selection.getNodes();
            selectedNodes.forEach(node => {
              if ($isDecoratorNode(node)) {
                node.remove();
              }
            });
          }
        },
      }),
    ],
    [editor],
  );

  return (
    <NodeContextMenuPlugin
      className="typeahead-popover lexical-node-context-menu"
      itemClassName="lexical-node-context-menu__item"
      items={items}
    />
  );
};
