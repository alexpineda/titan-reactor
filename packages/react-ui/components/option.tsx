import React from "react";

interface OptionParams {
  label?: string;
  value?: any;
  toggle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Option = ({
  label,
  value,
  toggle,
  children = null,
  className = "",
  style = {},
}: OptionParams) => {
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
