import React, { memo } from "react";

const ReplayPosition = ({ className }: { className: string }) => (
  <div
    className={`replay-parent flex self-end select-none ${className}`}
    style={{ minWidth: "18vw" }}
  ></div>
);

export default memo(ReplayPosition);
