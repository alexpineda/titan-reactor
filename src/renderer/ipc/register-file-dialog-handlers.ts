import { ipcRenderer } from "electron";
import {
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
} from "common/ipc-handle-names";
import screenStore from "@stores/screen-store";

import * as log from "./log";
import loadMap from "../load-map";
import loadReplay from "../load-replay";

ipcRenderer.on(OPEN_MAP_DIALOG, async (_, [map]) => {
  try {
    loadMap(map);
  } catch (err: any) {
    log.error(err.message);
    screenStore().setError(err);
  }
});

ipcRenderer.on(OPEN_REPLAY_DIALOG, (_, replays) => {
  try {
    loadReplay(replays[0]);
  } catch (err: any) {
    log.error(err.message);
    screenStore().setError(err);
  }
});
