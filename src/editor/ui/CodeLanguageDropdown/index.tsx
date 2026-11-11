import React from "react";
import { CODE_LANGUAGE_FRIENDLY_NAME_MAP, getLanguageFriendlyName } from "@lexical/code-prism";

import { DropDown, DropDownItem } from "../DropDown.js";
import { dropDownActiveClass } from "../../utils/index.js";
import { ToolbarState } from "../../context/index.js";
import { TToolbarCodeLanguagesControl } from "../../types/index.js";

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(CODE_LANGUAGE_FRIENDLY_NAME_MAP)) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

interface ICodeLanguageDropdownProps {
  toolbarState: ToolbarState;
  onCodeLanguageSelect: (value: string) => void;
  disabled?: boolean;
  controls?: Array<TToolbarCodeLanguagesControl>;
}

export const CodeLanguageDropdown = (props: ICodeLanguageDropdownProps) => {
  const { disabled, toolbarState, controls = [], onCodeLanguageSelect } = props;

  const filteredOptions = controls.length
    ? CODE_LANGUAGE_OPTIONS.filter(([value]) => controls.includes(value))
    : CODE_LANGUAGE_OPTIONS;

  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item code-language"
      buttonLabel={getLanguageFriendlyName(toolbarState.codeLanguage)}
      buttonAriaLabel="Select language"
    >
      {filteredOptions.map(([value, name]) => {
        return (
          <DropDownItem
            className={`item ${dropDownActiveClass(value === toolbarState.codeLanguage)}`}
            onClick={() => onCodeLanguageSelect(value)}
            key={value}
          >
            <span className="text">{name}</span>
          </DropDownItem>
        );
      })}
    </DropDown>
  );
};
