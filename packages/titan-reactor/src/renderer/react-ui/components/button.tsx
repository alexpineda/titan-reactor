import React from "react";

export const Button = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => {
  return (
    <button
      className="flex-shrink-0 bg-orange-600 text-white text-base font-semibold py-1 px-2 rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-orange-200"
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Button;
