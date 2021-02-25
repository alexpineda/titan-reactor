import BufferList from "bl";
import { range } from "ramda";
import EventEmitter from "events";
import ReadState from "./ReadState";
import MarkedQueue from "./MarkedQueue";
import FrameBW from "./FrameBW";

/**
 * Converts a stream buffer into frames on request
 */
export default class ReplayReadStream extends EventEmitter {
  /**
   * @param {*} maxFramesLength
   */
  constructor(maxFramesLength) {
    super();
    this.maxFramesLength = maxFramesLength;
    this._buf = new BufferList();
    this._state = new ReadState();
    this._lastReadFrame = 0;
    this._bytesRead = 0;
    this.frames = new MarkedQueue(
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
    const frames = this.frames.unshift(frameCount);
    return frames;
  }

  nextOne() {
    this.processFrames();
    const frame = this.frames.unshift(1);
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
          this._lastReadFrame = this._state.currentFrame;
          if (this._lastReadFrame % 40 === 0) {
            console.log(`read ${this._lastReadFrame}`);
          }
          newFrames.push(this.frames.currentUnmarked);
          this.frames.mark();

          this._buf = this._buf.duplicate();
          this._buf.consume(this._state.pos);
          console.log(`frame size ${this._state.pos}`);

          if (this.maxed()) {
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
