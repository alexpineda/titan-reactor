import React from "react";

export const LoadingProgress = ({ progress, total }) => {
  return (
    <div>
      {progress}/{total}
    </div>
  );
};
