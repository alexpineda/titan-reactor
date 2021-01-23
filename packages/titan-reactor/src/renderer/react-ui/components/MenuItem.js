import React from "react";
export const MenuItem = ({ onClick, label, disabled = false }) => {
  return (
    <li
      className={`p-1 select-none text-lg ${
        disabled ? "text-gray-500" : "cursor-pointer hover:bg-gray-800"
      }`}
      onClick={() => !disabled && onClick()}
    >
      {label}
    </li>
  );
};
