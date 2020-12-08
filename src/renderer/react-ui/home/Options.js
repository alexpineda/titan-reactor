import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import { selectFolder, saveSettings } from "../../invoke";
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
import { RenderMode, ShadowLevel } from "common/settings";

const tabs = {
  general: "general",
  game: "game",
  perf: "perf",
  audio: "audio",
  twitch: "twitch",
  feeds: "feeds",
};

export default ({
  lang,
  settings,
  defaultTab = tabs.general,
  inGame = false,
  className = "",
  style = {},
}) => {
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
    <div className={className} style={style}>
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
        <TabSelector
          activeTab={tab}
          tab={tabs.feeds}
          setTab={setTab}
          label={lang["SETTINGS_RSS_FEEDS"]}
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
        <Option
          label={lang["SETTINGS_MAX_AUTO_REPLAY_SPEED"]}
          value={`${
            settings.maxAutoReplaySpeed > 1
              ? `${settings.maxAutoReplaySpeed}x`
              : lang["BUTTON_OFF"]
          }`}
        >
          <input
            type="range"
            min="1"
            max="1.8"
            step="0.05"
            value={settings.maxAutoReplaySpeed}
            onChange={(evt) => {
              updateSettings({
                maxAutoReplaySpeed: Number(evt.target.value),
              });
            }}
          />{" "}
        </Option>
        <Option label={lang["SETTINGS_PLAYER_COLORS"]}>
          <>
            <ButtonSetContainer>
              <ButtonSet
                selected={settings.useCustomColors}
                label={lang["SETTINGS_USE_CUSTOM_COLORS"]}
                onClick={() => updateSettings({ useCustomColors: true })}
                first
              />
              <ButtonSet
                selected={!settings.useCustomColors}
                label={lang["SETTINGS_USE_REPLAY_COLORS"]}
                onClick={() => updateSettings({ useCustomColors: false })}
                last
              />
            </ButtonSetContainer>
            <Visible visible={settings.useCustomColors}>
              <div className="flex">
                <ColorPicker
                  color={settings.player1Color}
                  onChange={(value) => console.log(value)}
                  className="mr-4"
                />
                <ColorPicker
                  color={settings.player2Color}
                  onChange={(value) => console.log(value)}
                />
              </div>
            </Visible>
          </>
        </Option>
        <Option label={lang["SETTINGS_CAMERA_SHAKE"]}>
          <input type="range" min="1" max="0" step="0.05" />{" "}
        </Option>

        <Option label={"Environmental Effects"}>
          <ButtonSetContainer>
            <ButtonSet selected={false} label={lang["BUTTON_OFF"]} first />
            <ButtonSet selected={false} label={lang["BUTTON_ON"]} last />
          </ButtonSetContainer>
        </Option>

        <Option label={"Start Replay Paused"}>
          <ButtonSetContainer>
            <ButtonSet
              selected={!settings.startPaused}
              label={lang["BUTTON_OFF"]}
              onClick={() => updateSettings({ startPaused: false })}
              first
            />
            <ButtonSet
              selected={settings.startPaused}
              label={lang["BUTTON_ON"]}
              onClick={() => updateSettings({ startPaused: true })}
              last
            />
          </ButtonSetContainer>
        </Option>
      </Tab>

      <Tab tabName={tabs.audio} activeTab={tab}>
        <Option
          label={lang["SETTINGS_MUSIC_VOLUME"]}
          value={`${Math.floor(settings.musicVolume * 100)}%`}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.musicVolume}
            onChange={(evt) => {
              updateSettings({
                musicVolume: Number(evt.target.value),
              });
            }}
          />
        </Option>

        <Option
          label={lang["SETTINGS_SOUND_VOLUME"]}
          value={`${Math.floor(settings.soundVolume * 100)}%`}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
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
              selected={settings.renderMode === RenderMode.SD}
              label={"SD"}
              first
              onClick={() => updateSettings({ renderMode: RenderMode.SD })}
            />
            <ButtonSet
              selected={settings.renderMode === RenderMode.HD}
              label={"HD"}
              onClick={() => updateSettings({ renderMode: RenderMode.HD })}
            />
            <ButtonSet
              selected={settings.renderMode === RenderMode.ThreeD}
              label={"3D"}
              last
              onClick={() => updateSettings({ renderMode: RenderMode.ThreeD })}
            />
          </ButtonSetContainer>
        </Option>

        <Option label={lang["SETTINGS_GRAPHICS_RENDER_MODE"]}>
          <ButtonSetContainer>
            <ButtonSet
              selected={!settings.orthoCamera}
              label={"Perspective"}
              first
              onClick={() => updateSettings({ orthoCamera: false })}
            />
            <ButtonSet
              selected={settings.orthoCamera}
              label={"Orthographic"}
              last
              onClick={() => updateSettings({ orthoCamera: true })}
            />
          </ButtonSetContainer>
        </Option>

        <Option label={lang["SETTINGS_GRAPHICS_GAMMA"]} value={settings.gamma}>
          <input
            type="range"
            min="1"
            max="6"
            step="0.1"
            value={settings.gamma}
            onChange={(evt) => {
              updateSettings({
                gamma: Number(evt.target.value),
              });
            }}
          />
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
              onClick={() => updateSettings({ shadows: ShadowLevel.Off })}
              first
            />
            <ButtonSet
              selected={!settings.shadows}
              label={lang["BUTTON_LOW"]}
              onClick={() => updateSettings({ shadows: ShadowLevel.Low })}
            />
            <ButtonSet
              selected={!settings.shadows}
              label={lang["BUTTON_MED"]}
              onClick={() => updateSettings({ shadows: ShadowLevel.Medium })}
            />
            <ButtonSet
              selected={settings.shadows}
              label={lang["BUTTON_HIGH"]}
              onClick={() => updateSettings({ shadows: ShadowLevel.High })}
              last
            />
          </ButtonSetContainer>
        </Option>

        <Option
          label={lang["SETTINGS_GRAPHICS_ANISOTROPY"]}
          value={settings.anisotropy}
        >
          <input
            type="range"
            min="0"
            max={settings.maxAnisotropy}
            step="2"
            value={settings.anisotropy}
            onChange={(evt) => {
              updateSettings({
                anisotropy: Number(evt.target.value),
              });
            }}
          />
        </Option>

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

      <Tab tabName={tabs.feeds} activeTab={tab}>
        <Option label={"Maps RSS Feeds"}>
          <textarea
            className="w-full h-40 bg-gray-600"
            value={"hi"}
            onChange={() => {}}
          />
        </Option>

        <Option label={"Replays RSS Feeds"}>
          <textarea
            className="w-full h-40 bg-gray-600"
            value={"hi"}
            onChange={() => {}}
          />
        </Option>
      </Tab>
    </div>
  );
};
