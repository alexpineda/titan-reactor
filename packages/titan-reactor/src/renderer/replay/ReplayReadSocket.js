import net from "net";
import { spawn } from "child_process";
import ReplayReadStream from "./ReplayReadStream";

export default class ReplayReadSocket extends ReplayReadStream {
  constructor(file, bwPath, bufferFrames = 100) {
    super(file, bufferFrames);
    this.bwPath = bwPath;
    this.openBwBridgeExePath =
      "D:\\dev\\ChkForge\\openbw-bridge\\Debug\\openbw-bridge.exe";
  }

  async start() {
    // this.openBwBridge = spawn(this.openBwBridgeExePath, [
    //   this.bwPath,
    //   this.file,
    //   "",
    // ]);

    // await new Promise((res) => {
    //   this.openBwBridge.stdout.on("data", (data) => {
    //     if (data == 0) {
    //       res();
    //     }
    //     console.log(`stdout: ${data}`);
    //     this.framesWritten = data;
    //   });
    // });

    // this.openBwBridge.stderr.on("data", (data) => {
    //   console.error(`stderr: ${data}`);
    // });

    await new Promise((res) => {
      this._stream = net.connect(this.port, this.host, () => {});

      this._stream.on("readable", () => {
        res();
      });

      this._stream.on("end", () => {
        console.log("Reached end of stream.");
      });
    });
  }
}
