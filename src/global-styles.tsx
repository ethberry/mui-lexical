import React, { useLayoutEffect, useState, useSyncExternalStore } from "react";
import type { FC } from "react";
import { GlobalStyles } from "@mui/material";

import { muiLexicalStyles } from "./styles.js";

// emotion does not deduplicate Global styles: every GlobalStyles inserts its own copy of the rules. With a Display
// per list item that is the whole playground CSS once per item. So only one mounted instance, the first in `mounted`,
// renders the styles; when it unmounts, the next one takes over.
const mounted: symbol[] = [];
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notify = () => listeners.forEach(listener => listener());

const getOwner = () => mounted[0];

// a server render and the hydration of its markup render the styles in every instance, as the server has no mounts
const EVERY = Symbol("every");
const getServerOwner = () => EVERY;

export const MuiLexicalGlobalStyles: FC = () => {
  const [id] = useState(() => Symbol("mui-lexical-styles"));
  const owner = useSyncExternalStore(subscribe, getOwner, getServerOwner);

  // a layout effect: the first instance renders the styles before the browser paints
  useLayoutEffect(() => {
    mounted.push(id);
    notify();
    return () => {
      mounted.splice(mounted.indexOf(id), 1);
      notify();
    };
  }, [id]);

  return owner === id || owner === EVERY ? <GlobalStyles styles={muiLexicalStyles} /> : null;
};
