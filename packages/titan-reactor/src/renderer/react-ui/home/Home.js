import React, { useState } from "react";
import Options from "./Options";
import Maps from "./Maps";
import Replays from "./Replays";
import { ipcRenderer } from "electron";
import {
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
  OPEN_DEMO_REPLAY,
} from "common/handleNames";
import { MenuItem } from "../components/MenuItem";
import { exit } from "../../invoke";
import useSettingsStore from "../../stores/settingsStore";

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

const Home = () => {
  const [activePanel, setActivePanel] = useState(Panels.Home);
  const { phrases, errors, settings } = useSettingsStore((state) => ({
    phrases: state.phrases,
    errors: state.errors,
    settings: state.data,
  }));

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
            <MenuItem
              label={phrases["OPEN_DEMO_REPLAY"]}
              disabled={errors.includes("starcraftPath")}
              onClick={() => ipcRenderer.send(OPEN_DEMO_REPLAY)}
            />
            <MenuItem
              label={phrases["OPEN_REPLAY"]}
              disabled={errors.includes("starcraftPath")}
              onClick={() =>
                ipcRenderer.send(OPEN_REPLAY_DIALOG, settings.replaysPath)
              }
            />
            <MenuItem
              label={phrases["OPEN_MAP"]}
              disabled={errors.includes("starcraftPath")}
              onClick={() =>
                ipcRenderer.send(OPEN_MAP_DIALOG, settings.mapsPath)
              }
            />

            {/* 
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
            /> */}

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
                Created by{" "}
                <span className="font-medium">Alex Pineda (darkmatter)</span>
              </p>
              <p className="text-gray-300 mb-2">
                Lead 3D Artist{" "}
                <span className="font-medium">Robert Rose (xiaorobear)</span>
              </p>
              <p className="text-gray-300 leading-normal">
                <p>
                  Thanks to Mike Morheim and Blizzard for the best game ever
                  made. Thanks to the open source community. Thanks to tec27
                  (sb/inspiration), heinerman (bwapi), saint of idiocy
                  (formats), poiuy qwert (pyms), zezula (casc/pkware), tcsmoo
                  (openbw), dakota (screp), neiv (animosity), sccait community,
                  sen, threejs, and all others. The broader BW community for
                  keeping the game alive, BSL, RSL, CPL, TDR, STPL, BWCL, HAY,
                  Jeez, Rogues, and anothers I may have missed. Stryker, Shoop,
                  Queen, JY, Snipe for early support. Enjoy.{" "}
                </p>
              </p>
            </div>
          )}
          {activePanel === Panels.Maps && (
            <div className="flex-col">
              <p className="font-bold mb-6 select-none">Maps</p>
              {/* <Maps phrases={phrases} /> */}
            </div>
          )}
          {activePanel === Panels.Replays && (
            <div className="">
              <p className="font-bold mb-6 select-none">Replays</p>
              {/* <Replays phrases={phrases} settings={settings} /> */}
            </div>
          )}
          {activePanel === Panels.Options && (
            <div className="" style={{ minHeight: "65vh" }}>
              <p className="font-bold mb-6 select-none">Options</p>
              <Options />
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
                to it or any derivative work thereof. Starcraft® - Copyright ©
                1998 Blizzard Entertainment, Inc. All rights reserved. Starcraft
                and Blizzard Entertainment are trademarks or registered
                trademarks of Blizzard Entertainment, Inc. in the U.S. and/or
                other countries. Titan Reactor and any of its maintainers are in
                no way associated with or endorsed by Blizzard Entertainment®
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

export default Home;
// export default connect(
//   (state) => {
//     return {
//       settings: state.settings.data,
//       errors: state.settings.errors,
//       phrases: state.settings.phrases,
//     };
//   },
//   (dispatch) => ({
//     saveSettings: (settings) => dispatch(setRemoteSettings(settings)),
//   })
// )(Home);
