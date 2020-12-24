import React, { useState } from "react";
import TabSelector from "../components/TabSelector";
import Tab from "../components/Tab";
import { ProducerWindowPosition } from "../../../common/settings";
import { selectFolder, saveSettings } from "../../invoke";

const Tabs = {
  Preview: "Preview",
  Bookmark: "Bookmarks",
  Playlist: "Playlist",
  Info: "Info",
};

const ProducerBar = ({
  position,
  size,
  gameSurface,
  previews,
  stats,
  className,
}) => {
  const [tab, setTab] = useState(Tabs.Preview);

  const style = {
    width: `${size}px`,
  };
  if (position === ProducerWindowPosition.DockRight) {
    style.right = "0px";
  }

  return (
    <div
      className={`absolute h-screen flex flex-col ${className}`}
      style={style}
    >
      <div className="flex justify-between">
        <h1>Producer</h1>
        <span>
          <span
            class={`material-icons ${
              position == ProducerWindowPosition.DockLeft
                ? "text-gray-400"
                : "text-gray-600"
            }`}
            onClick={() =>
              saveSettings({
                producerWindowPosition: ProducerWindowPosition.DockLeft,
              })
            }
          >
            vertical_split
          </span>
          <span
            class={`material-icons transform rotate-180 ${
              position == ProducerWindowPosition.DockRight
                ? "text-gray-400"
                : "text-gray-600"
            }`}
            onClick={() =>
              saveSettings({
                producerWindowPosition: ProducerWindowPosition.DockRight,
              })
            }
          >
            vertical_split
          </span>
          <span
            class={`material-icons ${
              position == ProducerWindowPosition.PopOut
                ? "text-gray-400"
                : "text-gray-600"
            }`}
            onClick={() =>
              saveSettings({
                producerWindowPosition: ProducerWindowPosition.PopOut,
              })
            }
          >
            open_in_new
          </span>
          <span
            class={`material-icons text-gray-600`}
            onClick={() =>
              saveSettings({
                producerWindowPosition: ProducerWindowPosition.None,
              })
            }
          >
            close
          </span>
        </span>
      </div>
      <div>
        <ul className="flex flex-wrap justify-center">
          <TabSelector
            activeTab={tab}
            tab={Tabs.Preview}
            setTab={setTab}
            label={"Preview"}
          />
          <TabSelector
            activeTab={tab}
            tab={Tabs.Bookmarks}
            setTab={setTab}
            label={"Bookmarks"}
          />
          <TabSelector
            activeTab={tab}
            tab={Tabs.Playlist}
            setTab={setTab}
            label={"Playlist"}
          />
          <TabSelector
            activeTab={tab}
            tab={Tabs.Info}
            setTab={setTab}
            label={"Info"}
          />
        </ul>
      </div>
      <Tab tabName={Tabs.Preview} activeTab={tab}>
        previews
      </Tab>

      <Tab tabName={Tabs.Bookmarks} activeTab={tab}>
        bookmarks
        <span class="material-icons">notes</span>
        <span class="material-icons">star</span>
      </Tab>

      <Tab tabName={Tabs.Playlist} activeTab={tab}>
        playlist
        <span class="material-icons">post_add</span>
      </Tab>

      <Tab tabName={Tabs.Info} activeTab={tab}>
        <div>
          {gameSurface.width}x{gameSurface.height}
        </div>
      </Tab>
    </div>
  );
};

export default ProducerBar;
