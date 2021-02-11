import fs from "fs";
import BufferList from "bl";
import { angleToDirection } from "titan-reactor-shared/utils/conversions";

const State = {
  Header: 0,
  Frames: 1,
};

class ReplayReadStream {
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

  _readInt32(buf) {
    const v = buf.readInt32LE(this._pos);
    this._pos += 4;
    return v;
  }

  _readUInt32(buf) {
    const v = buf.readUInt32LE(this._pos);
    this._pos += 4;
    return v;
  }

  _readUInt8(buf) {
    const v = buf.readUInt8(this._pos);
    this._pos += 1;
    return v;
  }

  _readInt8(buf) {
    const v = buf.readInt8(this._pos);
    this._pos += 1;
    return v;
  }

  _readDoubleLE(buf) {
    const v = buf.readDoubleLE(this._pos);
    this._pos += 8;
    return v;
  }

  _readFrame(buf) {
    this._lastPos = this._pos;
    try {
      const bwGameFrame = this._readInt32(buf);
      const player1Gas = this._readInt32(buf);
      const player2Gas = this._readInt32(buf);
      const player1Minerals = this._readInt32(buf);
      const player2Minerals = this._readInt32(buf);
      const numUnitsThisFrame = this._readInt32(buf);
      const unitsFrameData = [];
      for (let i = 0; i < numUnitsThisFrame; i++) {
        unitsFrameData.push(this.BWAPIUnitFromBuffer(buf));
      }

      const numBulletsThisFrame = this._readUInt32(buf);
      const bulletsFrameData = [];
      for (let i = 0; i < numBulletsThisFrame; i++) {
        bulletsFrameData.push(this.BWAPIBulletFromBuffer(buf));
      }

      return {
        bwGameFrame,
        player1Gas,
        player1Minerals,
        player2Gas,
        player2Minerals,
        unitsFrameData,
        bulletsFrameData,
      };
    } catch (e) {
      this._pos = this._lastPos;
      return null;
    }
  }

  BWAPIUnitFromBuffer(buf) {
    const playerId = this._readInt32(buf);
    const repId = this._readInt32(buf);
    const typeId = this._readInt32(buf);
    const alive = this._readUInt8(buf);
    const x = this._readInt32(buf);
    const y = this._readInt32(buf);
    const angle = this._readDoubleLE(buf);
    const hp = this._readInt32(buf);
    const shields = this._readInt32(buf);
    const energy = this._readInt32(buf);
    const order = this._readInt32(buf);
    const subOrder = this._readInt32(buf);
    const groundWeaponCooldown = this._readInt32(buf);
    const airWeaponCooldown = this._readInt32(buf);
    const target = this._readInt32(buf);
    const orderTarget = this._readInt32(buf);
    const remainingBuildTime = this._readInt32(buf);
    const remainingBuildType = this._readInt8(buf);
    const orderState = this._readUInt8(buf);
    const secondaryOrderState = this._readUInt8(buf);
    const anim = this._readUInt8(buf);
    const resources = this._readInt32(buf);

    const flagsA = this._readUInt8(buf);
    const flagsB = this._readUInt8(buf);
    const flagsC = this._readUInt8(buf);
    const flagsD = this._readUInt8(buf);
    const flagsE = this._readUInt8(buf);
    const flagsF = this._readUInt8(buf);

    const angleRad = -angle + Math.PI / 2;
    const direction = angleToDirection(angle);

    return {
      playerId,
      repId,
      typeId,
      alive,
      x,
      y,
      angle,
      angleRad,
      direction,
      hp,
      shields,
      energy,
      order,
      subOrder,
      orderState,
      secondaryOrderState,
      anim,
      groundWeaponCooldown,
      airWeaponCooldown,
      target,
      orderTarget,
      remainingBuildTime,
      remainingBuildType,
      resources,
      flagsA,
      flagsB,
      flagsC,
      flagsD,
      flagsE,
      flagsF,
    };
  }

  BWAPIBulletFromBuffer(buf) {
    const playerId = this._readInt32(buf);
    const repId = this._readInt32(buf);
    const typeId = this._readInt32(buf);
    const alive = this._readUInt8(buf);
    const x = this._readInt32(buf);
    const y = this._readInt32(buf);
    const angle = this._readDoubleLE(buf);
    const timer = this._readInt32(buf);
    const sourceUnitRepId = this._readInt32(buf);
    const targetUnitRepId = this._readInt32(buf);

    return {
      playerId,
      repId,
      typeId,
      alive,
      x,
      y,
      angle,
      timer,
      sourceUnitRepId,
      targetUnitRepId,
    };
  }

  _readFrames() {
    if (this._state === State.Frames) {
      let frame;
      while (
        this.frames.length < this.bufferFrames &&
        (frame = this._readFrame(this._buf))
      ) {
        this.frames.push(frame);
      }

      this._buf.consume(this._pos);
      this._pos = 0;
    }
  }

  _readHeader() {
    if (this._state === State.Header) {
      this.version = this._readInt32(this._buf);
      if (this.version !== 5) {
        throw new Error("invalid rep.bin version");
      }
      this.maxFrame = this._readInt32(this._buf);
      this._state = State.Frames;
    }
  }

  start() {
    return new Promise((res) => {
      this.stream = fs.createReadStream(this.file, {
        highWaterMark: 64 * 1024 * 12,
      });
      this.stream.on("readable", () => {
        res();
      });

      this.stream.on("end", () => {
        console.log("Reached end of stream.");
      });
    });
  }

  restart() {}
}

export default ReplayReadStream;
