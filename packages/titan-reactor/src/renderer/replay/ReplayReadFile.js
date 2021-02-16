import fs from "fs";
import { spawn } from "child_process";
import ReplayReadStream from "./ReplayReadStream";

export default class ReplayReadFile extends ReplayReadStream {
  constructor(file, outFile, bwPath, maxFramesLength = 100) {
    super(file, maxFramesLength);
    this.outFile = outFile;
    this.bwPath = bwPath;
    this.openBwBridgeExePath =
      "D:\\dev\\ChkForge\\openbw-bridge\\Debug\\openbw-bridge.exe";
  }

  async start() {
    this.openBwBridge = spawn(this.openBwBridgeExePath, [
      this.bwPath,
      this.file,
      this.outFile,
    ]);

    this.openBwBridge.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    await new Promise((res) => {
      this.openBwBridge.stdout.on("data", (data) => {
        if (data > 100) {
          res();
        }
        this.framesWritten = data;
        console.log(`written ${data}`);
      });
    });

    await new Promise((res) => {
      this.stream = fs.createReadStream(this.outFile, {
        highWaterMark: 2000 * 1000,
      });
      this.stream.on("readable", () => {
        res();
        this.readFrames();
      });
    });
  }

  dispose() {
    this.stream && this.stream.destroy();
    if (this.openBwBridge.exitCode === null) {
      this.openBwBridge.kill();
    }
  }
}
