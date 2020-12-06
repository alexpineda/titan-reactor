import React from "react";

const TabSelector = ({ activeTab, setTab, tab, label }) => {
  return (
    <li
      className={`py-2 px-3 hover:bg-gray-800 cursor-pointer ${
        activeTab === tab ? "bg-gray-800" : ""
      }`}
      onClick={(e) => setTab(tab)}
    >
      {label}
    </li>
  );
};
export default TabSelector;
