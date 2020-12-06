import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import { selectFolder, saveSettings, getSettings } from "../../invoke";
import { SELECT_FOLDER } from "../../../common/handleNames";
import Option from "../components/Option";
import Tab from "../components/Tab";
import TabSelector from "../components/TabSelector";
import PathSelect from "../components/PathSelect";
import Button from "../components/Button";
import ButtonSet from "../components/ButtonSet";
import ButtonSetContainer from "../components/ButtonSetContainer";
import Visible from "../components/visible";
import ColorPicker from "../components/ColorPicker";

const tabs = {
  general: "general",
  game: "game",
  perf: "perf",
  audio: "audio",
  twitch: "twitch",
};

export default ({
  lang,
  settings,
  defaultTab = tabs.general,
  inGame = false,
}) => {
  console.log("options", lang, settings);
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    const listener = (event, { key, filePaths: [dir] }) => {
      updateSettings({
        [key]: dir,
      });
    };
    ipcRenderer.on(SELECT_FOLDER, listener);

    return () => ipcRenderer.removeListener(SELECT_FOLDER, listener);
  }, []);

  const updateSettings = (options) => {
    const newOptions = { ...settings, ...options };
    saveSettings(newOptions);
  };

  return (
    <>
      <ul className="mb-6 flex">
        <TabSelector
          activeTab={tab}
          tab={tabs.general}
          setTab={setTab}
          label={lang["SETTINGS_GENERAL"]}
        />

        <TabSelector
          activeTab={tab}
          tab={tabs.game}
          setTab={setTab}
          label={lang["SETTINGS_GAME"]}
        />

        <TabSelector
          activeTab={tab}
          tab={tabs.audio}
          setTab={setTab}
          label={lang["SETTINGS_AUDIO"]}
        />

        <TabSelector
          activeTab={tab}
          tab={tabs.perf}
          setTab={setTab}
          label={lang["SETTINGS_GRAPHICS"]}
        />

        <TabSelector
          activeTab={tab}
          tab={tabs.twitch}
          setTab={setTab}
          label={lang["SETTINGS_INTEGRATIONS"]}
        />
      </ul>

      <Tab tabName={tabs.general} activeTab={tab}>
        <Option label={lang["SETTINGS_LANGUAGE"]}>
          <select
            className="rounded text-gray-800"
            onChange={(evt) => {
              updateSettings({
                language: evt.target.value,
              });
            }}
            value={settings.language}
          >
            <option value="en-US">English</option>
            <option value="ko-KR">한국어</option>
            <option value="es-ES">Español</option>
            <option value="ru-RU">русский</option>
            <option value="pl-PL">Polskie</option>
          </select>
        </Option>

        <Visible visible={!inGame}>
          <Option label={lang["SETTINGS_STARCRAFT_PATH"]}>
            <PathSelect
              prop={"starcraftPath"}
              lang={lang}
              settings={settings}
              selectFolder={selectFolder}
            />
          </Option>

          <Option label={lang["SETTINGS_MAPS_PATH"]}>
            <PathSelect
              prop={"mapsPath"}
              lang={lang}
              settings={settings}
              selectFolder={selectFolder}
            />
          </Option>

          <Option label={lang["SETTINGS_REPLAYS_PATH"]}>
            <PathSelect
              prop={"replaysPath"}
              lang={lang}
              settings={settings}
              selectFolder={selectFolder}
            />
          </Option>

          <Option label={lang["SETTINGS_COMMUNITY_3D_MODELS_PATH"]}>
            <PathSelect
              prop={"communityModelsPath"}
              lang={lang}
              settings={settings}
              selectFolder={selectFolder}
            />
          </Option>
        </Visible>
      </Tab>

      <Tab tabName={tabs.game} activeTab={tab}>
        <Option label={lang["SETTINGS_MAX_AUTO_REPLAY_SPEED"]}>
          <input
            type="range"
            min="1.05"
            max="1.6"
            step="0.05"
            value={settings.maxAutoReplaySpeed}
            onChange={(evt) => {
              updateSettings({
                maxAutoReplaySpeed: Number(evt.target.value),
              });
            }}
          />{" "}
          <span>{settings.maxAutoReplaySpeed}</span>
        </Option>
        <Option label={lang["SETTINGS_PLAYER_COLORS"]}>
          <>
            <ButtonSetContainer>
              <ButtonSet selected={false} label={"Use Replay Colors"} first />
              <ButtonSet selected={false} label={"Use Custom Colors"} last />
            </ButtonSetContainer>
            <Visible visible={true}>
              <div className="flex">
                <ColorPicker
                  color={"#000"}
                  onChange={() => {}}
                  className="mr-4"
                />
                <ColorPicker color={"#000"} onChange={() => {}} />
              </div>
            </Visible>
          </>
        </Option>
        <Option label={lang["SETTINGS_CAMERA_SHAKE"]}>
          <input type="range" min="1" max="0" step="0.05" />{" "}
        </Option>

        <Option label={"Environmental Effects"}></Option>

        <Option label={"Start Replay: Paused, Started"}></Option>
      </Tab>

      <Tab tabName={tabs.audio} activeTab={tab}>
        <Option label={lang["SETTINGS_MUSIC_VOLUME"]}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.musicVolume}
            onChange={(evt) => {
              updateSettings({
                musicVolume: Number(evt.target.value),
              });
            }}
          />
        </Option>

        <Option label={lang["SETTINGS_SOUND_VOLUME"]}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.soundVolume}
            onChange={(evt) => {
              updateSettings({
                soundVolume: Number(evt.target.value),
              });
            }}
          />
        </Option>
      </Tab>

      <Tab tabName={tabs.perf} activeTab={tab}>
        <Option label={lang["SETTINGS_GRAPHICS_RENDER_MODE"]}>
          <ButtonSetContainer>
            <ButtonSet
              selected={settings.renderMode === 0}
              label={"SD"}
              first
              onClick={() => updateSettings({ renderMode: 0 })}
            />
            <ButtonSet
              selected={settings.renderMode === 1}
              label={"HD"}
              onClick={() => updateSettings({ renderMode: 1 })}
            />
            <ButtonSet
              selected={settings.renderMode === 2}
              label={"3D"}
              last
              onClick={() => updateSettings({ renderMode: 2 })}
            />
          </ButtonSetContainer>
        </Option>

        <Option label={lang["SETTINGS_GRAPHICS_ANTIALIAS"]}>
          <ButtonSetContainer>
            <ButtonSet
              selected={!settings.antialias}
              label={lang["BUTTON_OFF"]}
              onClick={() => updateSettings({ antialias: false })}
              first
            />
            <ButtonSet
              selected={settings.antialias}
              label={lang["BUTTON_ON"]}
              onClick={() => updateSettings({ antialias: true })}
              last
            />
          </ButtonSetContainer>
        </Option>

        <Option label={lang["SETTINGS_GRAPHICS_SHADOWS"]}>
          <ButtonSetContainer>
            <ButtonSet
              selected={!settings.shadows}
              label={lang["BUTTON_OFF"]}
              onClick={() => updateSettings({ shadows: false })}
              first
            />
            <ButtonSet
              selected={settings.shadows}
              label={lang["BUTTON_ON"]}
              onClick={() => updateSettings({ shadows: true })}
              last
            />
          </ButtonSetContainer>
        </Option>

        <Option label={lang["SETTINGS_GRAPHICS_ANISOTROPY"]}></Option>

        <Option label={lang["SETTINGS_GRAPHICS_RESOLUTION"]}></Option>
      </Tab>

      <Tab tabName={tabs.twitch} activeTab={tab}>
        <Option label={lang["TWITCH_INTEGRATION"]}>
          <Button label={lang["BUTTON_CONNECT"]} />
        </Option>

        <Option label={lang["SETTINGS_OBSERVER_LINK"]}>
          <Button label={lang["BUTTON_SHOW"]} />
        </Option>
      </Tab>
    </>
  );
};
