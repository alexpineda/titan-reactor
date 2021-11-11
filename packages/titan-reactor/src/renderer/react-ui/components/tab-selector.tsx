import React from "react";

export const TabSelector = ({
  activeTab,
  setTab,
  tab,
  label,
}: {
  activeTab: string;
  setTab: (tab: string) => void;
  tab: string;
  label: string;
}) => {
  return (
    <li
      className={`py-2 px-3 hover:bg-gray-700 cursor-pointer ${
        activeTab == tab ? "bg-gray-700" : ""
      }`}
      onClick={() => setTab(tab)}
    >
      {label}
    </li>
  );
};
export default TabSelector;
