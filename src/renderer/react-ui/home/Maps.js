import React, { useState } from "react";

const Tabs = {
  Maps: "Maps",
  Community: "Community",
};

export default ({ lang }) => {
  const [tab, setTab] = useState(Tabs.Maps);

  return (
    <>
      <ul className="mb-6 flex">
        <li
          className={`py-2 px-3 hover:bg-gray-800 cursor-pointer select-none ${
            tab === Tabs.Maps ? "bg-gray-800" : ""
          }`}
          onClick={(e) => setTab(Tabs.Maps)}
        >
          {lang["INSTALLED_MAPS"]}
        </li>
        <li
          className={`py-2 px-3 hover:bg-gray-800 cursor-pointer select-none ${
            tab === Tabs.Community ? "bg-gray-800" : ""
          }`}
          onClick={(e) => setTab(Tabs.Community)}
        >
          {lang["COMMUNITY_MAPS"]}
        </li>
      </ul>
      <div>
        <div>Folder</div>
        <div>File</div>
      </div>
      <button className="mt-auto g-btn--yellow-to-orange">
        {lang["BUTTON_LAUNCH"]}
      </button>
    </>
  );
};
