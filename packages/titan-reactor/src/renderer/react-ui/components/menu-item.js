import React from "react";
export const MenuItem = ({ onClick, label, disabled = false, fat }) => {
  const menuItemStyle = fat ? { width: "24rem" } : {};

  return (
    <li
      className={`${
        fat ? "p-3 text-center" : "px-8 py-2"
      } select-none text-lg  ${
        disabled ? "text-gray-500" : "cursor-pointer hover:bg-gray-800"
      }`}
      onClick={() => !disabled && onClick()}
      style={menuItemStyle}
    >
      {label}
    </li>
  );
};
