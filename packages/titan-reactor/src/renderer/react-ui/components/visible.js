import React, { memo } from "react";

export const Visible = memo(({ visible, children }) => {
  return (visible && <>{children}</>) || null;
});
export default Visible;
