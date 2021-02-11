import BufferList from "bl";

export default class ReplayReadFile {
  constructor(file, bufferFrames = 100) {
    this.bufferFrames = bufferFrames;
    this.file = file;
    this.frames = [];
    this._buf = new BufferList();
    this._pos = 0;
    this._state = State.Header;
  }

  next() {
    const frame = this.frames.shift();

    return frame;
  }

  nextBuffer() {
    if (this.frames.length > this.bufferFrames / 2) {
      return [];
    }

    const cur = this.frames.length;
    let buf;
    while ((buf = this.stream.read())) {
      this._buf.append(buf);
      this._readHeader();
      this._readFrames();
    }
    console.log(`read frames ${cur - this.frames.length}`);
    return this.frames.slice(cur);
  }
}
