import BufferList from "bl";
import EventEmitter from "events";
import ReadState from "./ReadState";
import MarkedObjectPool from "./MarkedObjectPool";

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
    this.frames = new MarkedObjectPool(maxFramesLength);

    this.waitForMaxed = new Promise((res) => {
      const listener = () => {
        res();
        this.off("maxed", listener);
      };
      this.on("maxed", listener);
    });
  }

  peekAvailableFrames() {
    return this.frames.marked;
  }

  currentAvailableFrame() {
    return this.frames.currentUnmarked;
  }

  markCurrentAvailableFrame() {
    this.frames.mark();
  }

  getAvailableFrames(frameCount) {
    return this.frames.unmark(frameCount);
  }

  get isMaxed() {
    return Boolean(this._state.isEndOfFile || this.frames.isMaxed);
  }

  next(frameCount = 1) {
    this.processFrames();
    const frames = this.getAvailableFrames(frameCount);
    return frames;
  }

  nextOne() {
    this.processFrames();
    const frame = this.getAvailableFrames(1);
    return frame[0];
  }

  _processBuffer(newFrames) {
    if (this.isMaxed) return true;
    while (this._state.process(this._buf, this.currentAvailableFrame())) {
      if (this._state.mode === ReadState.FrameComplete) {
        this._lastReadFrame = this._state.currentFrame;

        newFrames.push(this.currentAvailableFrame());
        this.markCurrentAvailableFrame();

        this._buf.consume(this._state.pos);

        if (this.isMaxed) {
          return true;
        }
      }
    }
    return false;
  }

  processFrames() {
    if (this.isMaxed) {
      this.emit("maxed");
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

    // used by the asset preloader
    this.emit("frames", newFrames);

    if (this.isMaxed) {
      this.emit("maxed");
    }
  }

  async start() {}

  dispose() {}
}
