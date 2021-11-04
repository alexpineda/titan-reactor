import { ipcRenderer } from "electron";
import React, { useEffect, useState } from "react";
import shallow from "zustand/shallow";

import { SELECT_FOLDER } from "../../../common/ipc";
import { selectFolder } from "../../ipc";
import { useSettingsStore } from "../../stores";
import {
  Button,
  ButtonSet,
  ButtonSetContainer,
  ColorPicker,
  Option,
  PathSelect,
  Tab,
  TabSelector,
  Toggle,
  Visible,
} from "../components";

export const Tabs = {
  Setup: "Setup",
  Layout: "Layout",
  Producer: "Producer",
  Camera: "Camera",
  Graphics: "Graphics",
  MapViewer: "MapViewer",
  Audio: "Audio",
  Integrations: "Integrations",
  Community: "Community",
};

export default ({
  defaultTab = Tabs.Setup,
  inGame = false,
  className = "",
  style = {},
}) => {
  const [tab, setTab] = useState(defaultTab);

  const { phrases, errors, save, settings } = useSettingsStore(
    (state) => ({
      phrases: state.phrases,
      errors: state.errors,
      save: state.save,
      settings: state.data,
    }),
    shallow
  );

  useEffect(() => {
    const listener = (_, { key, filePaths: [dir] }) => {
      save({
        [key]: dir,
      });
    };
    ipcRenderer.on(SELECT_FOLDER, listener);

    return () => ipcRenderer.removeListener(SELECT_FOLDER, listener);
  }, []);

  return (
    <div className={className} style={style}>
      <ul className="mb-8 flex flex-wrap">
        {!inGame && (
          <TabSelector
            activeTab={tab}
            tab={Tabs.Setup}
            setTab={setTab}
            label={phrases["SETTINGS_SETUP"]}
          />
        )}
        <TabSelector
          activeTab={tab}
          tab={Tabs.Layout}
          setTab={setTab}
          label={phrases["SETTINGS_LAYOUT"]}
        />
        <TabSelector
          activeTab={tab}
          tab={Tabs.Audio}
          setTab={setTab}
          label={phrases["SETTINGS_AUDIO"]}
        />
        <TabSelector
          activeTab={tab}
          tab={Tabs.Graphics}
          setTab={setTab}
          label={phrases["SETTINGS_GRAPHICS"]}
        />
        <TabSelector
          activeTab={tab}
          tab={Tabs.MapViewer}
          setTab={setTab}
          label={phrases["SETTINGS_MAP_VIEWER"]}
        />

        {/* <TabSelector
          activeTab={tab}
          tab={Tabs.Camera}
          setTab={setTab}
          label={phrases["SETTINGS_CAMERA"]}
        /> */}
      </ul>

      <Tab tabName={Tabs.Setup} activeTab={tab}>
        <Option label={phrases["SETTINGS_LANGUAGE"]}>
          <select
            className="rounded text-gray-800"
            onChange={(evt) => {
              save({
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
          <Option label={phrases["SETTINGS_STARCRAFT_PATH"]}>
            <PathSelect
              prop={"starcraftPath"}
              phrases={phrases}
              settings={settings}
              errors={errors}
              selectFolder={selectFolder}
            />
          </Option>

          <Option label={phrases["SETTINGS_MAPS_PATH"]}>
            <PathSelect
              prop={"mapsPath"}
              phrases={phrases}
              settings={settings}
              errors={errors}
              selectFolder={selectFolder}
            />
          </Option>

          <Option label={phrases["SETTINGS_REPLAYS_PATH"]}>
            <PathSelect
              prop={"replaysPath"}
              phrases={phrases}
              errors={errors}
              settings={settings}
              selectFolder={selectFolder}
            />
          </Option>

          <Option label={phrases["SETTINGS_COMMUNITY_3D_MODELS_PATH"]}>
            <PathSelect
              prop={"communityModelsPath"}
              phrases={phrases}
              errors={errors}
              settings={settings}
              selectFolder={selectFolder}
            />
            <p>A directory containing zero or more 3d models.</p>
          </Option>

          <Option label={phrases["SETTINGS_COMMUNITY_3D_MODELS_PATH"]}>
            <PathSelect
              prop={"tempPath"}
              phrases={phrases}
              errors={errors}
              settings={settings}
              selectFolder={selectFolder}
            />
            <p>A temporary directory used for large temporary files.</p>
          </Option>
        </Visible>
      </Tab>

      <Tab tabName={Tabs.Layout} activeTab={tab}>
        {!inGame && (
          <Option
            label={phrases["SETTINGS_USE_CUSTOM_COLORS"]}
            toggle={
              <Toggle
                value={settings.useCustomColors}
                onChange={() =>
                  save({ useCustomColors: !settings.useCustomColors })
                }
              />
            }
          >
            <Visible visible={settings.useCustomColors}>
              <Option
                className="ml-4"
                label={phrases["SETTINGS_RANDOMIZE_COLORS"]}
                toggle={
                  <Toggle
                    value={settings.randomizeColorOrder}
                    onChange={() =>
                      save({
                        randomizeColorOrder: !settings.randomizeColorOrder,
                      })
                    }
                  />
                }
              />
              <div className="flex flex-wrap">
                {settings.playerColors.map((color, i) => (
                  <ColorPicker
                    key={i}
                    color={`${color}`}
                    onChange={({ hex }) => {
                      const clrs = [...settings.playerColors];
                      clrs[i] = hex;
                      save({ playerColors: clrs });
                    }}
                    className="mr-4"
                  />
                ))}
              </div>
            </Visible>
          </Option>
        )}
        <Option
          label={phrases["SETTINGS_ENABLE_PLAYER_SCORES"]}
          toggle={
            <Toggle
              value={settings.enablePlayerScores}
              onChange={() =>
                save({
                  enablePlayerScores: !settings.enablePlayerScores,
                })
              }
            />
          }
        />
        <Option
          label={phrases["SETTINGS_RESOURCES_FONT_SIZE"]}
          toggle={
            <ButtonSetContainer>
              <ButtonSet
                selected={settings.hudFontSize === "sm"}
                label={phrases["BUTTON_SMALL"]}
                first
                onClick={() =>
                  save({
                    hudFontSize: "sm",
                  })
                }
              />
              <ButtonSet
                selected={settings.hudFontSize === "base"}
                label={phrases["BUTTON_MED"]}
                onClick={() =>
                  save({
                    hudFontSize: "base",
                  })
                }
              />
              <ButtonSet
                selected={settings.hudFontSize === "lg"}
                label={phrases["BUTTON_LARGE"]}
                last
                onClick={() =>
                  save({
                    hudFontSize: "lg",
                  })
                }
              />
            </ButtonSetContainer>
          }
        />

        <Option
          label={phrases["SETTINGS_ESPORTS_HUD_STYLE"]}
          toggle={
            <Toggle
              value={settings.esportsHud}
              onChange={() =>
                save({
                  esportsHud: !settings.esportsHud,
                })
              }
            />
          }
        />
        {settings.esportsHud && (
          <Option
            className="ml-4"
            label={phrases["SETTINGS_INLINE_PRODUCTION"]}
            toggle={
              <Toggle
                value={settings.embedProduction}
                onChange={() =>
                  save({
                    embedProduction: !settings.embedProduction,
                  })
                }
              />
            }
          />
        )}

        <Option
          label={phrases["SETTINGS_CLOCK_STYLE"]}
          toggle={
            <Toggle
              value={settings.classicClock}
              onChange={() =>
                save({
                  classicClock: !settings.classicClock,
                })
              }
            />
          }
        />
        <Option
          label={phrases["SETTINGS_ALWAYS_HIDE_REPLAY_CONTROLS"]}
          toggle={
            <Toggle
              value={settings.alwaysHideReplayControls}
              onChange={() =>
                save({
                  alwaysHideReplayControls: !settings.alwaysHideReplayControls,
                })
              }
            />
          }
        />
      </Tab>

      <Tab tabName={Tabs.MapViewer} activeTab={tab}>
        <Option label={phrases["SETTINGS_MAP_VIEWER_BACKGROUND_COLOR"]}>
          <ColorPicker
            color={`${settings.mapBackgroundColor}`}
            onChange={({ hex }) => {
              save({ mapBackgroundColor: hex });
            }}
            className="mr-4"
          />
        </Option>

        <Option
          label={phrases["SETTINGS_MAP_VIEWER_SHOW_DISABLED_DOODADS"]}
          toggle={
            <Toggle
              value={settings.showDisabledDoodads}
              onChange={() =>
                save({
                  showDisabledDoodads: !settings.showDisabledDoodads,
                })
              }
            />
          }
        />

        <Option
          label={phrases["SETTINGS_MAP_VIEWER_SHOW_CRITTERS"]}
          toggle={
            <Toggle
              value={settings.showCritters}
              onChange={() =>
                save({
                  showCritters: !settings.showCritters,
                })
              }
            />
          }
        />

        <Option
          label={phrases["SETTINGS_MAP_VIEWER_MOUSE_ROTATE_SPEED"]}
          value={settings.mouseRotateSpeed}
        >
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={settings.mouseRotateSpeed}
            onChange={(evt) => {
              save({
                mouseRotateSpeed: Number(evt.target.value),
              });
            }}
          />
        </Option>
      </Tab>

      <Tab tabName={Tabs.Audio} activeTab={tab}>
        <Option
          label={phrases["SETTINGS_MUSIC_VOLUME"]}
          value={`${Math.floor(settings.musicVolume * 100)}%`}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.musicVolume}
            onChange={(evt) => {
              save({
                musicVolume: Number(evt.target.value),
              });
            }}
          />
        </Option>
        <Option
          label={phrases["SETTINGS_SOUND_VOLUME"]}
          value={`${Math.floor(settings.soundVolume * 100)}%`}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.soundVolume}
            onChange={(evt) => {
              save({
                soundVolume: Number(evt.target.value),
              });
            }}
          />
        </Option>
        <Option className="pl-4">
          <ButtonSetContainer>
            <ButtonSet
              selected={settings.musicAllTypes}
              label={phrases["SETTINGS_MUSIC_ALL_TYPES"]}
              first
              onClick={() => save({ musicAllTypes: true })}
            />
            <ButtonSet
              selected={!settings.musicAllTypes}
              label={phrases["SETTINGS_MUSIC_RACES_TYPES"]}
              last
              onClick={() => save({ musicAllTypes: false })}
            />
          </ButtonSetContainer>
        </Option>
      </Tab>

      <Tab tabName={Tabs.Graphics} activeTab={tab}>
        <Option
          label={phrases["SETTINGS_GRAPHICS_FULLSCREEN"]}
          toggle={
            <Toggle
              value={settings.fullscreen}
              onChange={() =>
                save({
                  fullscreen: !settings.fullscreen,
                })
              }
            />
          }
        />

        <Option
          label={phrases["SETTINGS_GRAPHICS_ANTIALIAS"]}
          toggle={
            <Toggle
              value={settings.antialias}
              onChange={() =>
                save({
                  antialias: !settings.antialias,
                })
              }
            />
          }
        />

        {/* <Option
          label={phrases["SETTINGS_GRAPHICS_GAMMA"]}
          value={settings.gamma}
        >
          <input
            type="range"
            min="1"
            max="2"
            step="0.02"
            value={settings.gamma}
            onChange={(evt) => {
              save({
                gamma: Number(evt.target.value),
              });
            }}
          />
        </Option>

        <Option label={"Anisotropy TODO"} value={settings.gamma}>
          <input
            type="range"
            min="1"
            max="2"
            step="0.02"
            value={settings.gamma}
            onChange={(evt) => {
              save({
                gamma: Number(evt.target.value),
              });
            }}
          />
        </Option>


        <Option
          label={"Bloom TODO"}
          toggle={
            <Toggle
              value={settings.antialias}
              onChange={() =>
                save({
                  antialias: !settings.antialias,
                })
              }
            />
          }
        />

        <Option
          label={"Depth Of Field Effect TODO"}
          toggle={
            <Toggle
              value={settings.antialias}
              onChange={() =>
                save({
                  antialias: !settings.antialias,
                })
              }
            />
          }
        /> */}
      </Tab>

      <Tab tabName={Tabs.Integrations} activeTab={tab}>
        <Option label={phrases["TWITCH_INTEGRATION"]}>
          <Button label={phrases["BUTTON_CONNECT"]} />
        </Option>

        <Option label={phrases["SETTINGS_OBSERVER_LINK"]}>
          <Button label={phrases["BUTTON_SHOW"]} />
        </Option>
      </Tab>

      <Tab tabName={Tabs.Community} activeTab={tab}>
        <Option label={phrases["SETTINGS_MAPS_RSS_FEEDS"]}>
          <textarea
            className="w-full h-40 bg-gray-600"
            value={settings.mapsRss}
            onChange={(evt) =>
              save({
                mapsRss: evt.target.value,
              })
            }
          />
        </Option>

        <Option label={phrases["SETTINGS_REPLAYS_RSS_FEEDS"]}>
          <textarea
            className="w-full h-40 bg-gray-600"
            value={settings.replaysRss}
            onChange={(evt) =>
              save({
                replaysRss: evt.target.value,
              })
            }
          />
        </Option>
      </Tab>
    </div>
  );
};
