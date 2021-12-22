import {
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
} from "../../common/ipc-handle-names";
import { ipcRenderer } from "electron";
import { log } from "../ipc";
import { errorUIType } from "../stores";
import spawnMap from "../load-map";
import loadReplay from "../load-replay";

export default () => {
  ipcRenderer.on(OPEN_MAP_DIALOG, async (_, [map]) => {
    log(`opening map ${map}`);
    try {
      spawnMap(map);
    } catch (err: any) {
      log(err.message, "error");
      errorUIType(err);
    }
  });

  ipcRenderer.on(OPEN_REPLAY_DIALOG, (_, replays) => {
    log(`opening replay ${replays[0]}`);
    try {
      loadReplay(replays[0]);
    } catch (err: any) {
      log(err.message, "error");
      errorUIType(err);
    }
  });
};
