import { convertReplayTo116, parseReplay, Version } from "downgrade-replay";
import fs from "fs";
import path from "path";
import { EventDispatcher } from "three";

import {
  loadReplayFromFile,
  openFile,
  requestNextFrames,
  stopReadingGameState,
} from "../../../ipc";
import { getSettings } from "../../../stores";

/**
 * This version is currently not used. This is the client version used for IPC with the main process, currently we use integrated node however. See StreamGameStateReader and FileGameStateReader.
 */
export default class GameStateReaderClient extends EventDispatcher {
  constructor(starcraftPath, minFrames = 100) {
    super();
    this.starcraftPath = starcraftPath;
    this.minFrames = minFrames;
    this.frames = [];
  }

  async loadReplay(filepath) {
    const repBin = await openFile(filepath);
    this.repFile = filepath;
    const settings = getSettings();
    this.outFile = path.join(settings.directories.temp, "replay.out");

    let rep = await parseReplay(repBin);

    if (rep.version === Version.remastered) {
      const classicRep = await convertReplayTo116(repBin);
      this.repFile = path.join(settings.directories.temp, "replay.rep");
      await new Promise((res) =>
        fs.writeFile(this.repFile, classicRep, (err) => {
          if (err) {
            console.error(err);
            return;
          }
          res();
        })
      );

      rep = await parseReplay(classicRep);
    }
    return rep;
  }

  async loadInitialGameState() {
    await loadReplayFromFile(this.repFile, this.outFile, this.starcraftPath);
    await this.requestNext();
  }

  next() {
    const frame = this.frames.shift();
    if (this.frames.length < this.minFrames) {
      this.requestNext();
    }
    return frame;
  }

  async requestNext() {
    const frames = await requestNextFrames(this.minFrames);
    this.frames.push(...frames);
    this.dispatchEvent({ type: "frames", frames });
  }

  dispose() {
    stopReadingGameState();
  }
}
