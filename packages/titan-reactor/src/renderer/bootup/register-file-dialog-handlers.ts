import {
  OPEN_MAP_DIALOG,
  OPEN_REPLAY_DIALOG,
} from "../../common/ipc-handle-names";
import { ipcRenderer } from "electron";
import * as log from "../ipc/log";
import { errorScreen } from "../stores";
import spawnMap from "../load-map";
import loadReplay from "../load-replay";

export default () => {
  ipcRenderer.on(OPEN_MAP_DIALOG, async (_, [map]) => {
    log.info(`opening map ${map}`);
    try {
      spawnMap(map);
    } catch (err: any) {
      log.error(err.message);
      errorScreen(err);
    }
  });

  ipcRenderer.on(OPEN_REPLAY_DIALOG, (_, replays) => {
    log.info(`opening replay ${replays[0]}`);
    try {
      loadReplay(replays[0]);
    } catch (err: any) {
      log.error(err.message);
      errorScreen(err);
    }
  });
};
