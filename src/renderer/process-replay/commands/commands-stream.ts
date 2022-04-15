import BufferList from "bl/BufferList";
import { commandLength } from "./commands";
import bufToCommand from "./buf-to-cmd";
import bufToSCRCommand from "./buf-to-cmd-scr";


class CommandsStream {
  #buffer: Buffer;

  constructor(buffer: Buffer) {
    this.#buffer = buffer;
  }

  *generate() {
    const buffer = new BufferList(this.#buffer);

    while (buffer.length >= 5) {
      const frame = buffer.readUInt32LE(0);
      yield frame;
      const frameLength = buffer.readUInt8(4);
      const frameEnd = 5 + frameLength;
      if (buffer.length < frameEnd) {
        return;
      }
      let pos = 5;

      while (pos < frameEnd) {
        const player = buffer.readUInt8(pos);
        pos += 1;
        const id = buffer.readUInt8(pos);
        pos += 1;
        const len = commandLength(id, buffer.shallowSlice(pos));
        if (len === null || pos + len > frameEnd) {
          console.error(frame, player, id, pos);
          return;
        }
        const data = buffer.slice(pos, pos + len);
        pos += len;

        const scrData = bufToSCRCommand(id, data);
        const bwData = bufToCommand(id, data);
        const isUnknown = !scrData && !bwData;
        yield {
          frame,
          id,
          player,
          isUnknown,
          data,
          ...bwData,
          ...scrData,
        };
      }
      buffer.consume(frameEnd);
    }
  }
}

export default CommandsStream;
