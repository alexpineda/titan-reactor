import React from "react";

const Option = ({ label, value = undefined, children = null }) => {
  return (
    <li>
      <p>
        {label}{" "}
        {value !== undefined && <span className="text-gray-500">{value}</span>}
      </p>
      {children}
    </li>
  );
};

export default Option;
