import React, { useEffect, useState } from "react";
import FileDropZone from "../../../react-ui/components/FileDropZone";
import { Palette } from "./Palette";

export function readColors(data) {
  const view = new Uint8Array(data);
  let pos = 0;
  let index = 0;
  let colors = [];

  while (pos < view.byteLength) {
    colors.push([view[pos], view[pos + 1], view[pos + 2]]);
    pos = pos + 4;
    index = index + 1;
  }
  return colors;
}

export function PaletteViewer({ colors = [], setColors }) {
  const onFileDropped = (data, file) => {
    const ext = file.name.split(".").pop();
    if (ext !== "wpe") {
      return console.error("invalid file type expected wpe", file);
    }
    setColors(readColors(data));
  };

  return (
    <FileDropZone onFileDropped={onFileDropped}>
      <Palette colors={colors} />
    </FileDropZone>
  );
}
