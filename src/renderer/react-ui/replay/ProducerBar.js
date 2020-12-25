import React, { useState } from "react";
import { connect } from "react-redux";
import TabSelector from "../components/TabSelector";
import Tab from "../components/Tab";
import { ProducerWindowPosition } from "common/settings";

import { setRemoteSettings } from "../../utils/settingsReducer";
import { hoveringOverMinimap } from "../../input/inputReducer";
import WrappedElement from "../WrappedElement";

const Tabs = {
  Preview: "Preview",
  Bookmark: "Bookmarks",
  Playlist: "Playlist",
  Info: "Info",
};

const ProducerBar = ({
  replayPosition,
  position,
  size,
  gameSurface,
  previewSurface,
  fpsCanvas,
  settings,
  saveRemoteSettings,
  className,
  isHoveringOverMinimap,
}) => {
  const [tab, setTab] = useState(Tabs.Preview);

  const saveSettings = (p) => {
    saveRemoteSettings({ ...settings, ...p });
  };

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
        {isHoveringOverMinimap ? "HOVERING" : ""}
        <span>
          <span
            className={`material-icons ${
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
            className={`material-icons transform rotate-180 ${
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
            className={`material-icons ${
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
            className={`material-icons text-gray-600`}
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
            tab={Tabs.Playlist}
            setTab={setTab}
            label={"Replays"}
          />
          <TabSelector
            activeTab={tab}
            tab={Tabs.Info}
            setTab={setTab}
            label={"Info"}
          />
        </ul>
      </div>
      <Tab
        className="flex flex-col-reverse h-full pb-10"
        tabName={Tabs.Preview}
        activeTab={tab}
      >
        <div style={{ filter: "greyscale(1)" }}>
          <WrappedElement domElement={previewSurface.canvas} />
        </div>
      </Tab>

      <Tab tabName={Tabs.Playlist} activeTab={tab}>
        playlist
        <span className="material-icons">post_add</span>
      </Tab>

      <Tab
        tabName={Tabs.Info}
        activeTab={tab}
        className="flex flex-col items-center"
      >
        <div>
          {fpsCanvas && <WrappedElement domElement={fpsCanvas} />}
          <ul>
            <li>
              {gameSurface.width}x{gameSurface.height}
            </li>
            <li>Frame: {replayPosition.bwGameFrame}</li>
            <li>Time: {replayPosition.getFriendlyTime()}</li>
            <li>
              Mem:{" "}
              {(window.performance.memory.usedJSHeapSize / 1000).toFixed(2)}
            </li>
          </ul>
        </div>
      </Tab>
    </div>
  );
};

export default connect(
  (state) => {
    return {
      isHoveringOverMinimap: state.replay.input.hoveringOverMinimap,
      settings: state.settings.data,
    };
  },
  (dispatch) => ({
    saveRemoteSettings: (settings) => dispatch(setRemoteSettings(settings)),
    hoveringOverMinimap: (val) => dispatch(hoveringOverMinimap(val)),
  })
)(ProducerBar);
