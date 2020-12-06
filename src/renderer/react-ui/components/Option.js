import React from "react";

const Option = ({ label, children = null }) => {
  return (
    <li>
      <p>{label}</p>
      {children}
    </li>
  );
};

export default Option;
