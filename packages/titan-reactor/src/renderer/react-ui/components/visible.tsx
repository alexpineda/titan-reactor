import React, { memo } from "react";

export const Visible = memo(
  ({ visible, children }: { visible: boolean; children: React.ReactNode }) => {
    return (visible && <>{children}</>) || null;
  }
);
export default Visible;
