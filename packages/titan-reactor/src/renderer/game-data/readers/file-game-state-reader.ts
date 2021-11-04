import fs, { promises as fsPromises } from "fs";
import StreamGameStateReader from "./stream-game-state-reader";
import { EmptyFunc } from "../../../common/types/common";
const averageFrameSize = 100000;

/**
 * Spawns openbw-bridge.exe for replay data reading
 */
export default class FileGameStateReader extends StreamGameStateReader {
  protected readonly file: string;
  protected readonly outFile: string;

  constructor(file: string, outFile: string, maxFramesLength = 3) {
    super(maxFramesLength);
    this.file = file;
    this.outFile = outFile;
  }

  override async start() {
    await new Promise((res: EmptyFunc) => {
      this.startRead(0, res);
    });
  }

  startRead(start: number, cb: () => void) {
    this.stream = fs.createReadStream(this.outFile, {
      highWaterMark: averageFrameSize * 2,
      start,
    });
    this.stream.on("readable", () => {
      cb && cb();
      this.processFrames();
    });

    this.stream.on("error", (err) => console.error(err));

    const retryStream = (reason: string) => async () => {
      console.error(reason);
      //@todo check we're actually not just done with the file
      // if the file has closed for some reason, try re-opening from our last processed byte position.
      if ((await this.getSize(this.outFile)) > this._bytesRead) {
        this.startRead(this._bytesRead, cb);
      }
    };
    this.stream.on("end", retryStream("END"));
    this.stream.on("close", retryStream("CLOSED"));
  }

  //@todo allow canceling promise
  waitForSize(file: string, bytes: number): Promise<void> {
    return new Promise((res) => {
      const interval = setInterval(async () => {
        if ((await this.getSize(file)) > bytes) {
          clearInterval(interval);
          res();
        }
      }, 500);
    });
  }

  async getSize(file: string) {
    const { size } = await fsPromises.stat(file);
    return size;
  }

  override dispose() {
    this.stream && this.stream.destroy();
  }
}
