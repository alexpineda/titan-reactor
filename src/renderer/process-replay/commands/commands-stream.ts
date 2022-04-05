import BufferList from "bl/BufferList";
import { commandLength } from "./commands";
import bufToCommand from "./buf-to-cmd";
import bufToSCRCommand from "./buf-to-cmd-scr";


class CommandsStream {
  #buffer: BufferList;

  constructor(buffer: Buffer) {
    this.#buffer = new BufferList(buffer);
  }

  *generate() {
    while (this.#buffer.length >= 5) {
      const frame = this.#buffer.readUInt32LE(0);
      yield frame;
      const frameLength = this.#buffer.readUInt8(4);
      const frameEnd = 5 + frameLength;
      if (this.#buffer.length < frameEnd) {
        return;
      }
      let pos = 5;

      while (pos < frameEnd) {
        const player = this.#buffer.readUInt8(pos);
        pos += 1;
        const id = this.#buffer.readUInt8(pos);
        pos += 1;
        const len = commandLength(id, this.#buffer.shallowSlice(pos));
        if (len === null || pos + len > frameEnd) {
          console.error(frame, player, id, pos);
          return;
        }
        const data = this.#buffer.slice(pos, pos + len);
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
      this.#buffer.consume(frameEnd);
    }
  }
}

export default CommandsStream;
