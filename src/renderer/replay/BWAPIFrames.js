export const BWAPIFrameDataStructSize = 45;

export function BWAPIFrameFromBuffer(view, frameStart) {
  const b = frameStart * BWAPIFrameDataStructSize;

  if (b + BWAPIFrameDataStructSize > view.byteLength) {
    return null;
  }

  return {
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
  };

  return BWAPIFrames;
}

export function BWAPIFramesFromBuffer(view, frameStart, numFrames = 1) {
  const BWAPIFrames = [];

  const len =
    Math.min(
      arrayBuffer.byteLength,
      (frameStart + numFrames) * BWAPIFrameDataStructSize
    ) - BWAPIFrameDataStructSize;

  for (
    let b = frameStart * BWAPIFrameDataStructSize;
    b <= len;
    b += BWAPIFrameDataStructSize
  ) {
    BWAPIFrames.push({
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
  }
  return BWAPIFrames;
}

export function AllBWAPIFramesFromBuffer(view, progressCb) {
  const BWAPIFrames = [];

  const frameCount = Math.floor(
    arrayBuffer.byteLength / BWAPIFrameDataStructSize
  );

  for (
    let b = 0;
    b <= arrayBuffer.byteLength - BWAPIFrameDataStructSize;
    b += BWAPIFrameDataStructSize
  ) {
    BWAPIFrames.push({
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
    if (b % (BWAPIFrameDataStructSize * 2000) === 0) {
      progressCb(b / arrayBuffer.byteLength);
    }
  }
  return BWAPIFrames;
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
