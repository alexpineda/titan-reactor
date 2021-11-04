import { ChildProcessWithoutNullStreams, spawn } from "child_process";

import { EmptyFunc } from "../../../common/types/common";
import FileGameStateReader from "./file-game-state-reader";

class OpenBwBridgeReader extends FileGameStateReader {
  private readonly bwPath: string;
  private readonly openBwBridgeExePath = `${__static}/openbw-bridge.exe`;
  private openBwBridge?: ChildProcessWithoutNullStreams;
  private framesWritten = 0;

  constructor(
    bwPath: string,
    file: string,
    outFile: string,
    maxFramesLength = 3
  ) {
    super(file, outFile, maxFramesLength);
    this.bwPath = bwPath;

    this.openBwBridgeExePath =
      "D:\\dev\\ChkForge\\openbw-bridge\\Debug\\openbw-bridge.exe";
    // this.openBwBridgeExePath =
    //   "D:\\dev\\ChkForge\\openbw-bridge\\Release\\openbw-bridge.exe";
    console.log(this.openBwBridgeExePath);
  }

  override async start() {
    this.openBwBridge = spawn(this.openBwBridgeExePath, [
      this.bwPath,
      this.file,
      this.outFile,
    ]);

    this.openBwBridge.on("error", (err) => {
      console.error("Failed to start subprocess.", err.message);
    });

    this.openBwBridge.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    await new Promise((res: EmptyFunc) => {
      (this.openBwBridge as ChildProcessWithoutNullStreams).stdout.on(
        "data",
        (data) => {
          if (data > this.maxFramesLength) {
            res();
          }
          this.framesWritten = data;
        }
      );
    });
    return super.start();
  }

  override dispose() {
    super.dispose();
    if (this.openBwBridge && this.openBwBridge.exitCode === null) {
      this.openBwBridge.kill();
    }
  }
}

export default OpenBwBridgeReader;
