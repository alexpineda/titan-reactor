export const BWAPIFrameDataStructSize = 45;

export function BWAPIFramesFromBuffer(arrayBuffer) {
  const frameData = [];
  const view = new DataView(arrayBuffer);

  console.log("start:readFrameData", arrayBuffer.byteLength);

  const frameCount = Math.floor(
    arrayBuffer.byteLength / BWAPIFrameDataStructSize
  );

  for (
    let b = 0;
    b <= arrayBuffer.byteLength - BWAPIFrameDataStructSize;
    b += BWAPIFrameDataStructSize
  ) {
    frameData.push({
      playerId: view.getInt32(b, true),
      repId: view.getInt32(b + 4, true),
      typeId: view.getInt32(b + 8, true),
      exists: view.getUint8(b + 12),
      x: view.getInt32(b + 13, true),
      y: view.getInt32(b + 17, true),
      angle: view.getFloat64(b + 21, true),
      hp: view.getInt32(b + 29, true),
      shields: view.getInt32(b + 33, true),
      energy: view.getInt32(b + 37, true),
      frame: view.getInt32(b + 41, true),
    });
    if (b % (BWAPIFrameDataStructSize * 1000) === 0) {
      console.log("progress", b / arrayBuffer.byteLength);
    }
  }
  return frameData;
}

export class FrameData {
  constructor({ playerId, repId, typeId, angle, hp, shields, energy, frame }) {
    this.playerId = playerId;
    this.repId = repId;
    this.typeId = typeId;
    this.angle = angle;
    this.hp = hp;
    this.shields = shields;
    this.energy = energy;
    this.frame = frame;
  }
}
