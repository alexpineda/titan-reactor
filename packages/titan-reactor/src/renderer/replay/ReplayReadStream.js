import BufferList from "bl";
import EventEmitter from "events";
import ReadState from "./ReadState";

export default class ReplayReadStream extends EventEmitter {
  constructor(file, maxFramesLength = 100) {
    super();
    this.maxFramesLength = maxFramesLength;
    this.maxBufLength = 4000 * 1000;
    this.file = file;

    this._buf = new BufferList();
    this._state = new ReadState();
    this._stream;
    this._lastReadFrame = 0;
    this._replayPosition = 0;
    this.paused = false;
  }

  _pauseReading() {
    return (
      this._state.ended() ||
      this._lastReadFrame - this._replayPosition > this.maxFramesLength ||
      this.paused
    );
  }

  get replayPosition() {
    return this._replayPosition;
  }

  set replayPosition(val) {
    this._replayPosition = val;
  }

  readFrames() {
    if (this._pauseReading()) {
      this.emit("paused");
      return;
    }

    this.emit("resumed");

    let newFrames = [];

    let buf;
    while ((buf = this.stream.read())) {
      console.log(`read ${buf.byteLength}`);
      this._buf.append(buf);

      while (this._state.process(this._buf)) {
        if (this._state.mode === ReadState.Frame) {
          newFrames.push({
            frame: this._state.frame,
            numSprites: this._state.numSprites,
            numTiles: this._state.numTiles,
            numUnits: this._state.numUnits,
            sprites: this._state.sprites,
            units: this._state.units,
            tiles: this._state.tiles,
          });
          this._lastReadFrame = this._state.frame;
          if (this._pauseReading()) {
            break;
          }
        }
      }

      if (this._pauseReading()) {
        break;
      }
    }

    //@todo account for possible no listeners here, save backup
    this.emit("new-frames", newFrames);

    if (this._pauseReading()) {
      this.emit("paused");
    }
  }

  async start() {}

  dispose() {}
}
