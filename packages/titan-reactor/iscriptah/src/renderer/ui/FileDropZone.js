import React from "react";
import { useDropzone } from "react-dropzone";

function FileDropZone({ onFileDropped, children }) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onFileDropped,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {children}
    </div>
  );
}

export default FileDropZone;
