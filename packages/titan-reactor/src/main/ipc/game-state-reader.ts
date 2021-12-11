import { ipcMain } from "electron";

import {
  LOAD_REPLAY_FROM_FILE,
  REQUEST_NEXT_FRAMES,
  STOP_READING_GAME_STATE,
} from "../../common/ipc";
import FileGameStateReader from "../../renderer/integration/fixed-data/readers/file-game-state-reader";

let gameStateReader: FileGameStateReader | null;

ipcMain.handle(
  LOAD_REPLAY_FROM_FILE,
  async (_, repFile, outFile, starcraftPath) => {
    gameStateReader = new FileGameStateReader(repFile, outFile, starcraftPath);
    await gameStateReader.start();
    await gameStateReader.waitForMaxed;
  }
);

ipcMain.handle(REQUEST_NEXT_FRAMES, async (_, frames) => {
  return gameStateReader?.next(frames);
});

//@todo dispose on other main process driven events, eg lost window?
ipcMain.handle(STOP_READING_GAME_STATE, async () => {
  gameStateReader?.dispose();
  gameStateReader = null;
});
