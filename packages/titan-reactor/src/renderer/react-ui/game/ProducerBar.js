import React, { useState } from "react";
import TabSelector from "../components/TabSelector";
import Tab from "../components/Tab";
import { ProducerWindowPosition } from "common/settings";
import WrappedElement from "../WrappedElement";
import useSettingsStore from "../../stores/settingsStore";
import useGameStore from "../../stores/gameStore";

const Tabs = {
  Preview: "Preview",
  Bookmark: "Bookmarks",
  Playlist: "Playlist",
  Info: "Info",
};

const ProducerBar = ({ className }) => {
  const [tab, setTab] = useState(Tabs.Preview);
  const { save, producerWindowPosition, producerDockSize } = useSettingsStore(
    (state) => ({
      save: state.save,
      producerWindowPosition: state.data.producerWindowPosition,
      producerDockSize: state.data.producerDockSize,
    })
  );

  const { dimensions, replayPosition, previewSurfaces } = useGameStore(
    (state) => ({
      dimensions: state.dimensions,
      replayPosition: state.game.replayPosition,
      previewSurfaces: state.game.previewSurfaces,
    })
  );

  const style = {
    width: `${producerDockSize}px`,
  };
  if (producerWindowPosition === ProducerWindowPosition.DockRight) {
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
            className={`material-icons ${
              producerWindowPosition == ProducerWindowPosition.DockLeft
                ? "text-gray-400"
                : "text-gray-600"
            }`}
            onClick={() =>
              save({
                producerWindowPosition: ProducerWindowPosition.DockLeft,
              })
            }
          >
            vertical_split
          </span>
          <span
            className={`material-icons transform rotate-180 ${
              producerWindowPosition == ProducerWindowPosition.DockRight
                ? "text-gray-400"
                : "text-gray-600"
            }`}
            onClick={() =>
              save({
                producerWindowPosition: ProducerWindowPosition.DockRight,
              })
            }
          >
            vertical_split
          </span>
          <span
            className={`material-icons ${
              producerWindowPosition == ProducerWindowPosition.PopOut
                ? "text-gray-400"
                : "text-gray-600"
            }`}
            onClick={() =>
              save({
                producerWindowPosition: ProducerWindowPosition.PopOut,
              })
            }
          >
            open_in_new
          </span>
          <span
            className={"material-icons text-gray-600"}
            onClick={() =>
              save({
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
        className="flex flex-col h-full pb-10 justify-around"
        tabName={Tabs.Preview}
        activeTab={tab}
      >
        <div>
          <span className="text-gray-200">
            {replayPosition.getFriendlyTime()}
          </span>
        </div>

        <div className="flex-col-reverse  h-full">
          {previewSurfaces.map((previewSurface) => {
            return (
              <WrappedElement
                className="pt-10"
                key={previewSurface}
                style={{ filter: "grayscale(0.2) brightness(0.9)" }}
                domElement={previewSurface.canvas}
              />
            );
          })}
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
          <ul>
            <li>
              {dimensions.width}x{dimensions.height}
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

export default ProducerBar;
