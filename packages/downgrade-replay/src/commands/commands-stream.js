const { commandLength } = require("./commands");
const bufToCommand = require("./buf-to-cmd");
const bufToSCRCommand = require("./buf-to-cmd-scr");

class CommandsStream {
  constructor(buffer) {
    this._buffer = buffer.duplicate();
    this.currentFrame = 0;
  }

  *generate() {
    while (this._buffer.length >= 5) {
      const frame = this._buffer.readUInt32LE(0);
      yield frame;
      const frameLength = this._buffer.readUInt8(4);
      const frameEnd = 5 + frameLength;
      if (this._buffer.length < frameEnd) {
        return;
      }
      let pos = 5;

      while (pos < frameEnd) {
        const player = this._buffer.readUInt8(pos);
        pos += 1;
        const id = this._buffer.readUInt8(pos);
        pos += 1;
        const len = commandLength(id, this._buffer.shallowSlice(pos));
        if (len === null || pos + len > frameEnd) {
          console.error(frame, player, id, pos);
          return;
        }
        const data = this._buffer.slice(pos, pos + len);
        pos += len;

        const scrData = bufToSCRCommand(id, data);
        const bwData = bufToCommand(id, data);
        const skipped = !scrData && !bwData;
        yield {
          frame,
          id,
          player,
          skipped,
          data,
          ...bwData,
          ...scrData,
        };
      }
      this._buffer.consume(frameEnd);
    }
  }
}

module.exports = CommandsStream;
