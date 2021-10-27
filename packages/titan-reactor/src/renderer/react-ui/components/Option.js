import React from "react";

export const Option = ({
  label,
  value = undefined,
  toggle = null,
  children = null,
  className = "",
  style = {},
}) => {
  return (
    <div className={className} style={style}>
      <div className="flex items-center">
        <span className="mr-2">{label}</span>
        {value !== undefined && <span className="text-gray-500">{value}</span>}
        {toggle}
      </div>
      {children}
    </div>
  );
};

export default Option;
