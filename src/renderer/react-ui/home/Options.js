import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import { selectFolder, saveSettings } from "../../invoke";
import { SELECT_FOLDER } from "../../../common/handleNames";
import Option from "../components/Option";
import Toggle from "../components/Toggle";
import Tab from "../components/Tab";
import TabSelector from "../components/TabSelector";
import PathSelect from "../components/PathSelect";
import Button from "../components/Button";
import ButtonSet from "../components/ButtonSet";
import ButtonSetContainer from "../components/ButtonSetContainer";
import Visible from "../components/visible";
import ColorPicker from "../components/ColorPicker";
import { RenderMode, ShadowLevel } from "common/settings";
import { ProducerWindowPosition, GameAspect } from "../../../common/settings";

const Tabs = {
  General: "General",
  Game: "Game",
  Advanced: "Advanced",
  Camera: "Camera",
  Graphics: "Graphics",
  Audio: "Audio",
  Integrations: "Integrations",
  Community: "Community",
};

export default ({
  lang,
  settings,
  defaultTab = Tabs.General,
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
      <ul className="mb-6 flex flex-wrap">
        <TabSelector
          activeTab={tab}
          tab={Tabs.General}
          setTab={setTab}
          label={lang["SETTINGS_GENERAL"]}
        />

        <TabSelector
          activeTab={tab}
          tab={Tabs.Game}
          setTab={setTab}
          label={lang["SETTINGS_GAME"]}
        />

        <TabSelector
          activeTab={tab}
          tab={Tabs.Audio}
          setTab={setTab}
          label={lang["SETTINGS_AUDIO"]}
        />

        <TabSelector
          activeTab={tab}
          tab={Tabs.Graphics}
          setTab={setTab}
          label={lang["SETTINGS_GRAPHICS"]}
        />

        <TabSelector
          activeTab={tab}
          tab={Tabs.Advanced}
          setTab={setTab}
          label={lang["SETTINGS_ADVANCED"]}
        />
        <TabSelector
          activeTab={tab}
          tab={Tabs.Camera}
          setTab={setTab}
          label={lang["SETTINGS_CAMERA"]}
        />
        <TabSelector
          activeTab={tab}
          tab={Tabs.Community}
          setTab={setTab}
          label={lang["SETTINGS_COMMUNITY_MAPS_AND_REPLAYS"]}
        />
      </ul>

      <Tab tabName={Tabs.General} activeTab={tab}>
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

      <Tab tabName={Tabs.Game} activeTab={tab}>
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
        <Option
          label={lang["SETTINGS_USE_CUSTOM_COLORS"]}
          toggle={
            <Toggle
              value={settings.useCustomColors}
              onChange={() =>
                updateSettings({ useCustomColors: !settings.useCustomColors })
              }
            />
          }
        >
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
        </Option>
        <Option
          label={lang["SETTINGS_ENABLE_PLAYER_SCORES"]}
          toggle={
            <Toggle
              value={settings.enablePlayerScores}
              onChange={() =>
                updateSettings({
                  enablePlayerScores: !settings.enablePlayerScores,
                })
              }
            />
          }
        />
        <Option
          label={lang["SETTINGS_SHOW_TOOLTIPS"]}
          toggle={
            <Toggle
              value={settings.showTooltips}
              onChange={() =>
                updateSettings({
                  showTooltips: !settings.showTooltips,
                })
              }
            />
          }
        />

        <Option
          label={"Start Replay Paused"}
          toggle={
            <Toggle
              value={settings.startPaused}
              onChange={() =>
                updateSettings({
                  startPaused: !settings.startPaused,
                })
              }
            />
          }
        />
      </Tab>

      <Tab tabName={Tabs.Advanced} activeTab={tab}>
        <Option label={"Constrain Aspect Ratio"}>
          <ButtonSetContainer>
            <ButtonSet
              selected={settings.gameAspect === GameAspect.Fit}
              label={"Available Space"}
              first
              onClick={() => updateSettings({ gameAspect: GameAspect.Fit })}
            />
            <ButtonSet
              selected={settings.gameAspect === GameAspect.Native}
              label={"Native Screen Resolution"}
              onClick={() => updateSettings({ gameAspect: GameAspect.Native })}
            />
            <ButtonSet
              selected={settings.gameAspect === GameAspect.FourThree}
              label={"4:3"}
              onClick={() =>
                updateSettings({ gameAspect: GameAspect.FourThree })
              }
            />
            <ButtonSet
              selected={settings.gameAspect === GameAspect.SixteenNine}
              label={"16:9"}
              last
              onClick={() =>
                updateSettings({ gameAspect: GameAspect.FourThree })
              }
            />
          </ButtonSetContainer>
        </Option>

        <Option label={"Producer Window Position"}>
          <ButtonSetContainer>
            <ButtonSet
              selected={
                settings.producerWindowPosition === ProducerWindowPosition.None
              }
              label={"Off"}
              first
              onClick={() =>
                updateSettings({
                  producerWindowPosition: ProducerWindowPosition.None,
                })
              }
            />
            <ButtonSet
              selected={
                settings.producerWindowPosition ===
                ProducerWindowPosition.DockLeft
              }
              label={"Left"}
              onClick={() =>
                updateSettings({
                  producerWindowPosition: ProducerWindowPosition.DockLeft,
                })
              }
            />
            <ButtonSet
              selected={
                settings.producerWindowPosition ===
                ProducerWindowPosition.DockRight
              }
              label={"Right"}
              onClick={() =>
                updateSettings({
                  producerWindowPosition: ProducerWindowPosition.DockRight,
                })
              }
            />
            <ButtonSet
              selected={
                settings.producerWindowPosition ===
                ProducerWindowPosition.PopOut
              }
              label={"Pop Out Window"}
              last
              onClick={() =>
                updateSettings({
                  producerWindowPosition: ProducerWindowPosition.PopOut,
                })
              }
            />
          </ButtonSetContainer>
        </Option>

        <Option label={"2D Camera"}>
          <ButtonSetContainer>
            <ButtonSet
              selected={!settings.cameraStyle2dOrtho}
              label={"Perspective"}
              first
              onClick={() => updateSettings({ cameraStyle2dOrtho: false })}
            />
            <ButtonSet
              selected={settings.cameraStyle2dOrtho}
              label={"Orthographic"}
              last
              onClick={() => updateSettings({ cameraStyle2dOrtho: true })}
            />
          </ButtonSetContainer>
        </Option>
        <Option label={"3D Camera"}>
          <ButtonSetContainer>
            <ButtonSet
              selected={!settings.cameraStyle3dOrtho}
              label={"Perspective"}
              first
              onClick={() => updateSettings({ cameraStyle3dOrtho: false })}
            />
            <ButtonSet
              selected={settings.cameraStyle3dOrtho}
              label={"Orthographic"}
              last
              onClick={() => updateSettings({ cameraStyle3dOrtho: true })}
            />
          </ButtonSetContainer>
        </Option>
      </Tab>

      <Tab tabName={Tabs.Audio} activeTab={tab}>
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

      <Tab tabName={Tabs.Graphics} activeTab={tab}>
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

        <Option
          label={lang["SETTINGS_GRAPHICS_FULLSCREEN"]}
          toggle={
            <Toggle
              value={settings.fullscreen}
              onChange={() =>
                updateSettings({
                  fullscreen: !settings.fullscreen,
                })
              }
            />
          }
        />

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

        <Option
          label={lang["SETTINGS_GRAPHICS_ANTIALIAS"]}
          toggle={
            <Toggle
              value={settings.antialias}
              onChange={() =>
                updateSettings({
                  antialias: !settings.antialias,
                })
              }
            />
          }
        />

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

      <Tab tabName={Tabs.Integrations} activeTab={tab}>
        <Option label={lang["TWITCH_INTEGRATION"]}>
          <Button label={lang["BUTTON_CONNECT"]} />
        </Option>

        <Option label={lang["SETTINGS_OBSERVER_LINK"]}>
          <Button label={lang["BUTTON_SHOW"]} />
        </Option>
      </Tab>

      <Tab tabName={Tabs.Community} activeTab={tab}>
        <Option label={lang["SETTINGS_MAPS_RSS_FEEDS"]}>
          <textarea
            className="w-full h-40 bg-gray-600"
            value={settings.mapsRss}
            onChange={(evt) =>
              updateSettings({
                mapsRss: evt.target.value,
              })
            }
          />
        </Option>

        <Option label={lang["SETTINGS_REPLAYS_RSS_FEEDS"]}>
          <textarea
            className="w-full h-40 bg-gray-600"
            value={settings.replaysRss}
            onChange={(evt) =>
              updateSettings({
                replaysRss: evt.target.value,
              })
            }
          />
        </Option>
      </Tab>
    </div>
  );
};
