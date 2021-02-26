import fs, { promises as fsPromises } from "fs";
import { spawn } from "child_process";
import ReplayReadStream from "./ReplayReadStream";

const averageFrameSize = 100000;

/**
 * Uses a separate process to dump bw data frames for reading
 * @todo: this will likely require more robust handling of errors and edge cases
 */
export default class ReplayReadFile extends ReplayReadStream {
  /**
   *
   * @param {String} file The replay file
   * @param {String} outFile The replay bin output file the process will write to, and we will read from
   * @param {String} bwPath Starcraft path
   * @param {Number} maxFramesLength Max number of frames to buffer
   */
  constructor(file, outFile, bwPath, maxFramesLength = 3) {
    super(maxFramesLength);
    this.file = file;
    this.outFile = outFile;
    this.bwPath = bwPath;
    this.openBwBridgeExePath =
      "D:\\dev\\ChkForge\\openbw-bridge\\Debug\\openbw-bridge.exe";
  }

  /**
   * Spawn the process to dump bw frame data
   * @param {Boolean} withProcess whether or not to spawn a replay bin generating process
   */
  async start(withProcess = true) {
    if (withProcess) {
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
          if (data > this.maxFramesLength) {
            res();
          }
          this.framesWritten = data;
        });
      });
    }

    await new Promise((res) => {
      this.startRead(0, res);
    });
  }

  /**
   * Start reading at a start position
   * @param {Number} start
   * @param {Function} cb
   */
  startRead(start, cb) {
    this.stream = fs.createReadStream(this.outFile, {
      highWaterMark: averageFrameSize * 2,
      start,
    });
    this.stream.on("readable", () => {
      cb && cb();
      this.processFrames();
    });

    this.stream.on("error", (err) => console.error(err));
    this.stream.on("end", () => {
      // restart read process where we left off on condition
      // that we hit the end of the read and the process is still active
      // @todo other cases? retry limits?
      // this.startRead(this._bytesRead);
      console.log("ENDED");
    });
    this.stream.on("close", () => {
      console.log("CLOSED");
      if (this.getSize(this.outFile) > this._bytesRead) {
        // this.startRead(this._bytesRead);
      }
    });
  }

  //@todo allow canceling promise
  waitForSize(file, bytes) {
    return new Promise((res) => {
      const interval = setInterval(async () => {
        if ((await this.getSize(file)) > bytes) {
          clearInterval(interval);
          res();
        }
      }, 500);
    });
  }

  async getSize(file) {
    const { size } = await fsPromises.stat(file);
    return size;
  }

  /**
   * Dispose the underlying read stream and kill the process if it is still running
   */
  dispose() {
    this.stream && this.stream.destroy();
    if (this.openBwBridge && this.openBwBridge.exitCode === null) {
      this.openBwBridge.kill();
    }
  }
}
