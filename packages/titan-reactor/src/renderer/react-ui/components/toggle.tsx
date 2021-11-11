import React from "react";

export const Toggle = ({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (e: Event) => void;
}) => {
  return (
    <span
      className={`material-icons font-lg select-none cursor-pointer  ${
        value
          ? "text-blue-600 hover:text-blue-500"
          : "text-gray-500 hover:text-gray-400"
      }`}
      style={{ fontSize: "48px" }}
      onClick={onChange}
    >
      {value ? "toggle_on" : "toggle_off"}
    </span>
  );
};

export default Toggle;
