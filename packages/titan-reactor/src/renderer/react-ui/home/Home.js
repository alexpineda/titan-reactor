import React, { useState } from "react";
import { connect } from "react-redux";
import Options from "./Options";
import Maps from "./Maps";
import Replays from "./Replays";
import { ipcRenderer } from "electron";
import { OPEN_MAP_DIALOG, OPEN_REPLAY_DIALOG } from "common/handleNames";
import { MenuItem } from "../components/MenuItem";
import { OPEN_DATA_FILE } from "../../../common/handleNames";
import { exit } from "../../invoke";
import { setRemoteSettings } from "../../utils/settingsReducer";

if (module.hot) {
  module.hot.accept();
}
const Panels = {
  Home: "Home",
  Maps: "Maps",
  Replays: "Replays",
  Options: "Options",
  Credits: "Credits",
  Legal: "Legal",
};

const Home = ({ settings, errors, phrases, saveSettings }) => {
  const [activePanel, setActivePanel] = useState(Panels.Home);

  return (
    <div
      className="w-full bg-gray-900 text-white px-6 pt-3 pb-1 flex flex-col"
      style={{ minHeight: "100vh", maxHeight: "100vh" }}
    >
      <header>
        <p className="text-3xl mb-6 select-none">Titan Reactor</p>
      </header>
      <div className="flex flex-1">
        <div className="w-1/4 flex-col-reverse flex">
          <ul className="mt-auto">
            {/* <MenuItem
                label={lang["MENU_MAPS"]}
                disabled={
                  settings.errors.includes("starcraftPath") ||
                  settings.errors.includes("mapsPath")
                }
                onClick={() =>
                  ipcRenderer.send(OPEN_MAP_DIALOG, settings.mapsPath)
                }
              />

              <MenuItem
                label={lang["MENU_REPLAYS"]}
                disabled={
                  settings.errors.includes("starcraftPath") ||
                  settings.errors.includes("replaysPath")
                }
                onClick={() =>
                  ipcRenderer.send(OPEN_REPLAY_DIALOG, settings.replaysPath)
                }
              /> */}

            <MenuItem
              label={phrases["MENU_MAPS"]}
              disabled={
                errors.includes("starcraftPath") || errors.includes("mapsPath")
              }
              onClick={() => setActivePanel(Panels.Maps)}
            />

            <MenuItem
              label={phrases["MENU_REPLAYS"]}
              disabled={
                errors.includes("starcraftPath") ||
                errors.includes("replaysPath")
              }
              onClick={() => setActivePanel(Panels.Replays)}
            />

            <MenuItem
              label={phrases["MENU_OPTIONS"]}
              disabled={false}
              onClick={() => setActivePanel(Panels.Options)}
            />
            <MenuItem
              label={phrases["MENU_EXIT"]}
              disabled={false}
              onClick={exit}
            />
          </ul>
        </div>

        <div className="flex items-center w-3/4 ">
          {activePanel === Panels.Credits && (
            <div className="select-none">
              <p className="font-bold mb-6">Credits</p>
              <p className="text-gray-300">
                Created by <span className="font-medium">Dark Matter</span> aka{" "}
                <span className="font-medium">
                  Alex Pineda (alexpineda@fastmail.com)
                </span>
              </p>
              <p className="text-gray-300 mb-2">
                Lead 3D Artist: xiarobear aka Rob Bear ()
              </p>
              <p className="text-gray-300 text-sm leading-normal">
                <p>
                  Why did I make this? I made this because I could. Because
                  it&apos;s the gift I can give to the world right now. Because
                  death is at our door and you have to make the most of it, even
                  in the littlest way. Because that feeling of hope and awe as a
                  child is something I miss. Love you all.
                </p>

                <p>
                  Thanks to Mike Morheim and Blizzard for the best game ever
                  made. Thanks to the open source community. Thanks to tec27
                  (sb/inspiration), heinerman (bwapi), saint of idiocy
                  (formats), pointy girt (pyms), lazarus (casc/pkware), tcsmoo
                  (openbw), dakota (screp), sccait community, sen, threejs, and
                  all others. The broader BW community for keeping the game
                  alive, BSL, RSL, CPL, TDR, STPL, BWCL, HAY, Jeez, Rogues, and
                  anothers I may have missed. Shoop, Queen, JY, Stryker for
                  early support. And All my supporters. Thanks.{" "}
                </p>
              </p>
            </div>
          )}
          {activePanel === Panels.Maps && (
            <div className="flex-col">
              <p className="font-bold mb-6 select-none">Maps</p>
              <Maps phrases={phrases} />
            </div>
          )}
          {activePanel === Panels.Replays && (
            <div className="">
              <p className="font-bold mb-6 select-none">Replays</p>
              <Replays phrases={phrases} settings={settings} />
            </div>
          )}
          {activePanel === Panels.Options && (
            <div className="" style={{ minHeight: "65vh" }}>
              <p className="font-bold mb-6 select-none">Options</p>
              <Options
                phrases={phrases}
                settings={settings}
                errors={errors}
                saveSettings={saveSettings}
              />
            </div>
          )}
          {activePanel === Panels.Legal && (
            <div className=" select-none">
              <p className="font-bold mb-6">Legal</p>
              <p>
                Titan Reactor is released to the Public Domain. The
                documentation and functionality provided by Titan Reactor may
                only be utilized with assets provided by ownership of Starcraft.
                If you use the source code you may not charge others for access
                to it or any derivative work thereof. If you are a
                broadcaster/organization/company/institution/tournament host
                delivering/offering/contributing/donating/awarding prizes of
                over $5,000 USD, an official english speaking broadcast must be
                available to the public, or replays must be distributed, or
                clean feeds (stream or vod) must be distributed for broadcasting
                irrespective of platform/technology/software used. Starcraft® -
                Copyright © 1998 Blizzard Entertainment, Inc. All rights
                reserved. Starcraft and Blizzard Entertainment are trademarks or
                registered trademarks of Blizzard Entertainment, Inc. in the
                U.S. and/or other countries. Titan Reactor and any of its
                maintainers are in no way associated with or endorsed by
                Blizzard Entertainment®
              </p>
            </div>
          )}
        </div>
      </div>
      <footer className="flex mt-10">
        <ul className="flex">
          <li
            className="p-1 hover:bg-gray-800 cursor-pointer text-xs text-gray-500 select-none"
            onClick={() => setActivePanel(Panels.Legal)}
          >
            {phrases["MENU_LEGAL"]}
          </li>
          <li
            className="p-1 hover:bg-gray-800 cursor-pointer text-xs text-gray-500 select-none"
            onClick={() => setActivePanel(Panels.Credits)}
          >
            {phrases["MENU_CREDITS"]}
          </li>
        </ul>
      </footer>
    </div>
  );
};

export default connect(
  (state) => {
    return {
      settings: state.settings.data,
      errors: state.settings.errors,
      phrases: state.settings.phrases,
    };
  },
  (dispatch) => ({
    saveSettings: (settings) => dispatch(setRemoteSettings(settings)),
  })
)(Home);
