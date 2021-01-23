import React from "react";

export default ({ children, top, left }) => {
  return <ul style={{ top, left }}>{children}</ul>;
};
