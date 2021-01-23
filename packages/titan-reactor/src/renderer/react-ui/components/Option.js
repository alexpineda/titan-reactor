import React from "react";

const Option = ({
  label,
  value = undefined,
  toggle = null,
  children = null,
}) => {
  return (
    <li>
      <p className="flex items-center">
        <span className="mr-2">{label}</span>
        {value !== undefined && <span className="text-gray-500">{value}</span>}
        {toggle}
      </p>
      {children}
    </li>
  );
};

export default Option;
