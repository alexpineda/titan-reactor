import React, { useState, useEffect } from "react";
import Visible from "../../utils/visible";
import { ipcRenderer } from "electron";
import { selectFolder, saveSettings, getSettings } from "../../invoke";
import { SELECT_FOLDER } from "../../../common/handleNames";

const tabs = {
  general: "general",
  perf: "perf",
  audio: "audio",
  twitch: "twitch",
};

const Tab = ({ tabName, activeTab, children }) => (
  <Visible visible={tabName === activeTab}>{children}</Visible>
);

export default ({ context, lang, defaultTab = tabs.general }) => {
  const [tab, setTab] = useState(defaultTab);
  const [localOptions, setLocalOptions] = useState({});

  const initSettings = async () => {
    const settings = await getSettings();
    setLocalOptions(settings);

    const listener = (event, { key, filePaths: [dir] }) => {
      console.log("s", localOptions);
      updateLocalOptions({
        [key]: dir,
      });
    };
    ipcRenderer.on(SELECT_FOLDER, listener);
    return listener;
  };

  useEffect(() => {
    const listener = initSettings();

    return () => ipcRenderer.removeListener(SELECT_FOLDER, listener);
  }, []);

  const updateLocalOptions = (options) => {
    const newOptions = { ...localOptions, ...options };
    console.log("new Options", localOptions, newOptions);
    setLocalOptions(newOptions);
    saveSettings(newOptions);
  };

  return (
    <>
      <ul className="mb-6 flex">
        <li
          className={`py-2 px-3 hover:bg-gray-800 cursor-pointer ${
            tab === tabs.general ? "bg-gray-800" : ""
          }`}
          onClick={(e) => setTab(tabs.general)}
        >
          {lang["SETTINGS_GENERAL"]}
        </li>
        <li
          className={`py-2 px-3 hover:bg-gray-800 cursor-pointer ${
            tab === tabs.audio ? "bg-gray-800" : ""
          }`}
          onClick={(e) => setTab(tabs.audio)}
        >
          {lang["SETTINGS_AUDIO"]}
        </li>
        <li
          className={`py-2 px-3 hover:bg-gray-800 cursor-pointer ${
            tab === tabs.perf ? "bg-gray-800" : ""
          }`}
          onClick={(e) => setTab(tabs.perf)}
        >
          {lang["SETTINGS_GRAPHICS"]}
        </li>
        <li
          className={`py-2 px-3 hover:bg-gray-800 cursor-pointer ${
            tab === tabs.twitch ? "bg-gray-800" : ""
          }`}
          onClick={(e) => setTab(tabs.twitch)}
        >
          {lang["SETTINGS_INTEGRATIONS"]}
        </li>
      </ul>

      <Tab tabName={tabs.general} activeTab={tab}>
        <ul className="tab-content divide-y-8 divide-transparent leading-relaxed">
          <li>
            <p>{lang["SETTINGS_LANGUAGE"]}</p>
            <select
              className="rounded text-gray-800"
              onChange={(evt) => {
                updateLocalOptions({
                  language: evt.target.value,
                });
              }}
              value={localOptions.language}
            >
              <option value="en-US">English</option>
              <option value="ko-KR">한국어</option>
              <option value="es-ES">Español</option>
              <option value="ru-RU">русский</option>
              <option value="pl-PL">Polskie</option>
            </select>
          </li>
          <li>
            <p>{lang["SETTINGS_STARCRAFT_PATH"]}</p>
            {!localOptions.starcraftPath && (
              <button
                className="flex-shrink-0 bg-orange-600 text-white text-base font-semibold py-1 px-2 rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-orange-200"
                onClick={() => selectFolder("starcraftPath")}
              >
                {lang["BUTTON_SELECT"]}
              </button>
            )}
            {localOptions.starcraftPath && (
              <p className="italic text-sm text-gray-300">
                {localOptions.starcraftPath}{" "}
                <button
                  className="text-blue-300"
                  onClick={() => selectFolder("starcraftPath")}
                >
                  ({lang["BUTTON_CHANGE"]})
                </button>
              </p>
            )}
          </li>
          <li>
            <p>{lang["SETTINGS_MAPS_PATH"]}</p>
            {!localOptions.mapsPath && (
              <button
                className="flex-shrink-0 bg-orange-600 text-white text-base font-semibold py-1 px-2 rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-orange-200"
                onClick={() => selectFolder("mapsPath")}
              >
                {lang["BUTTON_SELECT"]}
              </button>
            )}
            {localOptions.mapsPath && (
              <p className="italic text-sm text-gray-300">
                {localOptions.mapsPath}{" "}
                <button
                  className="text-blue-300"
                  onClick={() => selectFolder("mapsPath")}
                >
                  ({lang["BUTTON_CHANGE"]})
                </button>
              </p>
            )}
          </li>
          <li>
            <p>{lang["SETTINGS_REPLAYS_PATH"]}</p>
            {!localOptions.replaysPath && (
              <button
                className="flex-shrink-0 bg-orange-600 text-white text-base font-semibold py-1 px-2 rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-orange-200"
                onClick={() => selectFolder("replaysPath")}
              >
                {lang["BUTTON_SELECT"]}
              </button>
            )}
            {localOptions.replaysPath && (
              <p className="italic text-sm text-gray-300">
                {localOptions.replaysPath}{" "}
                <button
                  className="text-blue-300"
                  onClick={() => selectFolder("replaysPath")}
                >
                  ({lang["BUTTON_CHANGE"]})
                </button>
              </p>
            )}
          </li>
          <li>
            <p>{lang["SETTINGS_COMMUNITY_3D_MODELS_PATH"]}</p>
            {!localOptions.communityModelsPath && (
              <button
                className="flex-shrink-0 bg-orange-600 text-white text-base font-semibold py-1 px-2 rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-orange-200"
                onClick={() => selectFolder("communityModelsPath")}
              >
                {lang["BUTTON_SELECT"]}
              </button>
            )}
            {localOptions.communityModelsPath && (
              <p className="italic text-sm text-gray-300">
                {localOptions.communityModelsPath}{" "}
                <button
                  className="text-blue-300"
                  onClick={() => selectFolder("communityModelsPath")}
                >
                  ({lang["BUTTON_CHANGE"]})
                </button>
              </p>
            )}
          </li>

          <li>
            <p>{lang["SETTINGS_MAX_AUTO_REPLAY_SPEED"]}</p>
            <input
              type="range"
              min="1.05"
              max="1.6"
              step="0.05"
              value={localOptions.maxAutoReplaySpeed}
              onChange={(evt) => {
                updateLocalOptions({
                  maxAutoReplaySpeed: Number(evt.target.value),
                });
              }}
            />{" "}
            <span>{localOptions.maxAutoReplaySpeed}</span>
          </li>
        </ul>
      </Tab>

      <Tab tabName={tabs.audio} activeTab={tab}>
        <ul className="divide-y-8 divide-transparent leading-relaxed">
          <li>
            <p>{lang["SETTINGS_MUSIC_VOLUME"]}</p>{" "}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={localOptions.musicVolume}
              onChange={(evt) => {
                updateLocalOptions({
                  musicVolume: Number(evt.target.value),
                });
              }}
            />
          </li>
          <li>
            <p>{lang["SETTINGS_SOUND_VOLUME"]}</p>{" "}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={localOptions.soundVolume}
              onChange={(evt) => {
                updateLocalOptions({
                  soundVolume: Number(evt.target.value),
                });
              }}
            />
          </li>
        </ul>
      </Tab>

      <Tab tabName={tabs.perf} activeTab={tab}>
        <ul className="divide-y-8 divide-transparent leading-relaxed">
          <li>
            <p>{lang["SETTINGS_GRAPHICS_RENDER_MODE"]}</p>
            <div className="flex rounded-lg text-lg" role="group">
              <button
                className={`border border-r-0 border-blue-500 rounded-l-lg px-4 py-2 mx-0 outline-none focus:shadow-outline hover:bg-blue-500 hover:text-white ${
                  localOptions.renderMode === 0
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 "
                }`}
                onClick={() => updateLocalOptions({ renderMode: 0 })}
              >
                SD
              </button>
              <button
                className={`hover:bg-blue-500 hover:text-white border border-blue-500  px-4 py-2 mx-0 outline-none focus:shadow-outline ${
                  localOptions.renderMode === 1
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 "
                }`}
                onClick={() => updateLocalOptions({ renderMode: 1 })}
              >
                HD
              </button>
              <button
                className={`hover:bg-blue-500 hover:text-white border border-l-0 border-blue-500 rounded-r-lg px-4 py-2 mx-0 outline-none focus:shadow-outline ${
                  localOptions.renderMode === 2
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 "
                }`}
                onClick={() => updateLocalOptions({ renderMode: 2 })}
              >
                3D
              </button>
            </div>
          </li>
          <li>
            <p>{lang["SETTINGS_GRAPHICS_ANTIALIAS"]}</p>{" "}
            <div className="flex rounded-lg text-lg" role="group">
              <button
                className={`hover:bg-blue-500 hover:text-white border border-r-0 border-blue-500 rounded-l-lg px-4 py-2 mx-0 outline-none focus:shadow-outline ${
                  !localOptions.antialias
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 "
                }`}
                onClick={() => updateLocalOptions({ antialias: false })}
              >
                {lang["BUTTON_OFF"]}
              </button>
              <button
                className={`hover:bg-blue-500 hover:text-white border border-l-0 border-blue-500 rounded-r-lg px-4 py-2 mx-0 outline-none focus:shadow-outline ${
                  localOptions.antialias
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 "
                }`}
                onClick={() => updateLocalOptions({ antialias: true })}
              >
                {lang["BUTTON_ON"]}
              </button>
            </div>
          </li>
          <li>
            <p>{lang["SETTINGS_GRAPHICS_SHADOWS"]}</p>{" "}
            <div className="flex rounded-lg text-lg" role="group">
              <button
                className={`border border-r-0 border-blue-500 rounded-l-lg px-4 py-2 mx-0 outline-none focus:shadow-outline hover:bg-blue-500 hover:text-white ${
                  localOptions.shadows === 0
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 "
                }`}
                onClick={() => updateLocalOptions({ shadows: 0 })}
              >
                {lang["BUTTON_OFF"]}
              </button>
              <button
                className={`hover:bg-blue-500 hover:text-white border border-blue-500  px-4 py-2 mx-0 outline-none focus:shadow-outline ${
                  localOptions.shadows === 1
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 "
                }`}
                onClick={() => updateLocalOptions({ shadows: 1 })}
              >
                Low
              </button>
              <button
                className={`hover:bg-blue-500 hover:text-white border border-blue-500  px-4 py-2 mx-0 outline-none focus:shadow-outline ${
                  localOptions.shadows === 2
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 "
                }`}
                onClick={() => updateLocalOptions({ shadows: 2 })}
              >
                Med
              </button>
              <button
                className={`hover:bg-blue-500 hover:text-white border border-l-0 border-blue-500 rounded-r-lg px-4 py-2 mx-0 outline-none focus:shadow-outline ${
                  localOptions.shadows === 3
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 "
                }`}
                onClick={() => updateLocalOptions({ shadows: 3 })}
              >
                High
              </button>
            </div>
          </li>
          <li>
            <p>{lang["SETTINGS_GRAPHICS_ANISOTROPY"]}</p>{" "}
          </li>
          <li>
            <p>{lang["SETTINGS_GRAPHICS_RESOLUTION"]}</p>{" "}
          </li>
        </ul>
      </Tab>

      <Tab tabName={tabs.twitch} activeTab={tab}>
        <ul className="divide-y-8 divide-transparent leading-relaxed">
          <li>
            <p>{lang["TWITCH_INTEGRATION"]}</p>{" "}
            <button className="flex-shrink-0 bg-orange-600 text-white text-base font-semibold py-1 px-2 rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-orange-200">
              {lang["BUTTON_CONNECT"]}
            </button>
          </li>
          <li>
            <p>{lang["SETTINGS_OBSERVER_LINK"]}</p>
            <button className="flex-shrink-0 bg-orange-600 text-white text-base font-semibold py-1 px-2 rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-orange-200">
              {lang["BUTTON_SHOW"]}
            </button>
          </li>
        </ul>
      </Tab>
    </>
  );
};
