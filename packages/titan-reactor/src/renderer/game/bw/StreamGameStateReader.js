import BufferList from "bl";
import { range } from "ramda";
import EventEmitter from "events";
import ReadState from "./ReadState";
import MarkedObjectPool from "./MarkedObjectPool";
import FrameBW from "./FrameBW";

/**
 * Abstract class for reading from a stream into ReadState
 */
export default class StreamGameStateReader extends EventEmitter {
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
    this.frames = new MarkedObjectPool(
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

  _processBuffer(newFrames) {
    if (this.maxed()) return true;
    while (this._state.process(this._buf, this.frames.currentUnmarked)) {
      if (this._state.mode === ReadState.Frame) {
        this._lastReadFrame = this._state.currentFrame;

        newFrames.push(this.frames.currentUnmarked);
        this.frames.mark();

        this._buf = this._buf.duplicate();
        this._buf.consume(this._state.pos);

        if (this.maxed()) {
          return true;
        }
      }
    }
    return false;
  }

  processFrames() {
    if (this.maxed()) {
      this.emit("paused");
      return;
    }

    this.emit("resumed");

    let newFrames = [];

    // process what we have
    if (!this._processBuffer(newFrames)) {
      let buf;
      while ((buf = this.stream.read())) {
        this._bytesRead += buf.byteLength;
        this._buf.append(buf);

        if (this._processBuffer(newFrames)) {
          break;
        }
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
