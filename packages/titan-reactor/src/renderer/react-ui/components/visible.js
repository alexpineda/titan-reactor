import React, { memo } from "react";

export default memo(({ visible, children }) => {
  return (visible && <>{children}</>) || null;
});
