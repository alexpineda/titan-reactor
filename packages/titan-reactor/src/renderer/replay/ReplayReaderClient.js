import { EventDispatcher } from "three";
import { remote } from "electron";
import path from "path";
import {
  loadReplayFromFile,
  requestNextFrames,
  stopReadingGameState,
  openFile,
} from "../invoke";
import { parseReplay, convertReplayTo116, Version } from "downgrade-replay";
import fs from "fs";

export default class ReplayReaderClient extends EventDispatcher {
  constructor(starcraftPath, minFrames = 100) {
    super();
    this.starcraftPath = starcraftPath;
    this.minFrames = minFrames;
    this.frames = [];
  }

  async loadReplay(filepath) {
    const repBin = await openFile(filepath);
    this.repFile = filepath;
    this.outFile = path.join(remote.app.getPath("temp"), "replay.out");

    let rep = await parseReplay(repBin);

    if (rep.version === Version.remastered) {
      const classicRep = await convertReplayTo116(repBin);
      this.repFile = path.join(remote.app.getPath("temp"), "replay.rep");
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
