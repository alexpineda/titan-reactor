import React, { useState } from "react";

const Tabs = {
  Local: "Local",
  Pro: "Pro",
  Community: "Community",
  AI: "AI",
  Playlist: "Playlist",
};

export default ({ lang }) => {
  const [tab, setTab] = useState(Tabs.Local);

  return (
    <>
      {" "}
      <ul className="mb-6 flex">
        <li
          className={`py-2 px-3 hover:bg-gray-800 cursor-pointer select-none ${
            tab === Tabs.Local ? "bg-gray-800" : ""
          }`}
          onClick={(e) => setTab(Tabs.Local)}
        >
          {lang["LOCAL_REPLAYS"]}
        </li>
        <li
          className={`py-2 px-3 hover:bg-gray-800 cursor-pointer select-none ${
            tab === Tabs.Pro ? "bg-gray-800" : ""
          }`}
          onClick={(e) => setTab(Tabs.Pro)}
        >
          {lang["PRO_REPLAYS"]}
        </li>
        <li
          className={`py-2 px-3 hover:bg-gray-800 cursor-pointer select-none ${
            tab === Tabs.Community ? "bg-gray-800" : ""
          }`}
          onClick={(e) => setTab(Tabs.Community)}
        >
          {lang["COMMUNITY_REPLAYS"]}
        </li>
        <li
          className={`py-2 px-3 hover:bg-gray-800 cursor-pointer select-none ${
            tab === Tabs.AI ? "bg-gray-800" : ""
          }`}
          onClick={(e) => setTab(Tabs.AI)}
        >
          {lang["AI_REPLAYS"]}
        </li>
        <li
          className={`py-2 px-3 hover:bg-gray-800 cursor-pointer select-none ${
            tab === Tabs.Playlist ? "bg-gray-800" : ""
          }`}
          onClick={(e) => setTab(Tabs.Playlist)}
        >
          {lang["MY_PLAYLIST"]}
        </li>
      </ul>
    </>
  );
};
