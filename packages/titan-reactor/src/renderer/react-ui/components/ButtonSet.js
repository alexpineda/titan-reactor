import React from "react";

const ButtonSet = ({
  selected,
  onClick,
  label,
  first = false,
  last = false,
}) => {
  return (
    <button
      className={`hover:bg-blue-500 hover:text-white border border-blue-500 px-2 py-1 mx-0 outline-none focus:shadow-outline ${
        selected ? "bg-blue-500 text-white" : "bg-white text-blue-500 "
      } ${first ? "rounded-l-lg border-r-0" : ""} ${
        last ? "rounded-r-lg border-l-0" : ""
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default ButtonSet;
