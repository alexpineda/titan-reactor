import {
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
} from "../../common/ipc-handle-names";
import { ipcRenderer } from "electron";
import * as log from "./log";
import screenStore from "../stores/screen-store";
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
