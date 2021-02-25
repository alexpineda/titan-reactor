import BufferList from "bl";
import { range } from "ramda";
import EventEmitter from "events";
import ReadState from "./ReadState";
import MarkedList from "./MarkedList";
import FrameBW from "./FrameBW";

export default class ReplayReadStream extends EventEmitter {
  constructor(file, maxFramesLength) {
    super();
    this.maxFramesLength = maxFramesLength;
    this.maxBufLength = 2000 * 1000;
    this.file = file;
    this._buf = new BufferList();
    this._state = new ReadState();
    this._lastReadFrame = 0;
    this._bytesRead = 0;
    this.frames = new MarkedList(
      range(0, maxFramesLength).map(() => new FrameBW())
    );

    this.waitForMaxed = new Promise((res) => {
      this.on("paused", () => {
        // console.log(
        //   `${this.frames.length} frames byte size`,
        //   this.frames.reduce((size, frame) => size + frame.size, 0)
        // );
        res();
      });
    });
  }

  maxed() {
    return this._state.ended() || this.frames.unmarked.length === 0;
  }

  next(frameCount = 1) {
    this.processFrames();
    const frames = this.frames.free(frameCount);
    return frames;
  }

  nextOne() {
    this.processFrames();
    const frame = this.frames.free(1);
    return frame[0];
  }

  processFrames() {
    if (this.maxed()) {
      this.emit("paused");
      return;
    }

    this.emit("resumed");

    let newFrames = [];

    let buf;
    while ((buf = this.stream.read())) {
      this._bytesRead += buf.byteLength;
      this._buf.append(buf);

      while (this._state.process(this._buf, this.frames.currentUnmarked)) {
        if (this._state.mode === ReadState.Frame) {
          newFrames.push(this.frames.currentUnmarked);
          this.frames.mark();
          this._lastReadFrame = this._state.currentFrame;
          if (this.maxed()) {
            // global.gc();
            break;
          }
        }
      }

      if (this.maxed()) {
        break;
      }
    }

    this.emit("frames", newFrames);

    if (this.maxed()) {
      this.emit("paused");
    }
  }

  async start() {}

  dispose() {}
}
