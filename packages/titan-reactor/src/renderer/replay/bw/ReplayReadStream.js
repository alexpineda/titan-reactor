import BufferList from "bl";
import EventEmitter from "events";
import ReadState from "./ReadState";

export default class ReplayReadStream extends EventEmitter {
  constructor(file, maxFramesLength = 50) {
    super();
    this.maxFramesLength = maxFramesLength;
    this.maxBufLength = 2000 * 1000;
    this.file = file;

    this._buf = new BufferList();
    this._state = new ReadState();
    this._stream;
    this._lastReadFrame = 0;
    this._replayPosition = 0;
    this.frames = [];
  }

  maxed() {
    return this._state.ended() || this.frames.length > this.maxFramesLength;
  }

  next() {
    const frame = this.frames.shift();
    this.readFrames();
    return frame;
  }

  all() {
    const frames = this.frames;
    this.frames = [];
    this.readFrames();
    return frames;
  }

  readFrames() {
    if (this.maxed()) {
      this.emit("paused");
      return;
    }

    this.emit("resumed");

    let newFrames = [];

    let buf;
    while ((buf = this.stream.read())) {
      this._buf.append(buf);

      while (this._state.process(this._buf)) {
        if (this._state.mode === ReadState.Frame) {
          newFrames.push({
            frame: this._state.frame,
            spriteCount: this._state.spriteCount,
            tilesCount: this._state.tilesCount,
            unitCount: this._state.unitCount,
            imageCount: this._state.imageCount,
            soundCount: this._state.soundCount,
            images: this._state.images,
            sprites: this._state.sprites,
            units: this._state.units,
            tiles: this._state.tiles,
            sounds: this._state.sounds,
          });
          this._lastReadFrame = this._state.frame;
          if (this.maxed()) {
            break;
          }
        }
      }

      if (this.maxed()) {
        break;
      }
    }

    this.frames.push(...newFrames);
    this.emit("frames", newFrames);

    if (this.maxed()) {
      this.emit("paused");
    }
  }

  async start() {}

  dispose() {}
}
