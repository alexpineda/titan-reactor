export const BWAPIFrameDataStructSize = 67;

class BWAPIFrame {
  constructor(data) {
    Object.assign(this, data);
  }

  direction() {}

  _flag(flag, shift) {
    return !!(this[`flag${flag}`] & (1 << shift));
  }
  attacking() {
    return this._flag("A", 7);
  }

  accelerating() {
    return this._flag("A", 6);
  }

  braking() {
    return this._flag("A", 5);
  }

  beingConstructed() {
    return this._flag("A", 4);
  }

  beingGathered() {
    return this._flag("A", 3);
  }

  beingHealed() {
    return this._flag("A", 2);
  }

  blind() {
    return this._flag("A", 1);
  }

  burrowed() {
    return this._flag("A", 0);
  }

  carryingGas() {
    return this._flag("B", 7);
  }

  carryingMinerals() {
    return this._flag("B", 6);
  }

  cloaked() {
    return this._flag("B", 5);
  }

  constructing() {
    return this._flag("B", 4);
  }

  completed() {
    return this._flag("B", 3);
  }

  defenseMatrixed() {
    return this._flag("B", 2);
  }

  detected() {
    return this._flag("B", 1);
  }

  ensnared() {
    return this._flag("B", 0);
  }

  flying() {
    return this._flag("C", 7);
  }

  gatheringGas() {
    return this._flag("C", 6);
  }

  gatheringMinerals() {
    return this._flag("C", 5);
  }

  idle() {
    return this._flag("C", 4);
  }

  irradiated() {
    return this._flag("C", 3);
  }

  lifted() {
    return this._flag("C", 2);
  }

  loaded() {
    return this._flag("C", 1);
  }

  lockedDown() {
    return this._flag("C", 0);
  }

  maelstrommed() {
    return this._flag("D", 7);
  }

  morphing() {
    return this._flag("D", 6);
  }

  moving() {
    return this._flag("D", 5);
  }

  parasited() {
    return this._flag("D", 4);
  }

  patrolling() {
    return this._flag("D", 3);
  }

  plagued() {
    return this._flag("D", 2);
  }

  invincible() {
    return this._flag("D", 1);
  }

  repairing() {
    return this._flag("D", 0);
  }

  researching() {
    return this._flag("E", 7);
  }

  sieged() {
    return this._flag("E", 6);
  }

  startingAttack() {
    return this._flag("E", 5);
  }

  stasised() {
    return this._flag("E", 4);
  }

  stimmed() {
    return this._flag("E", 3);
  }

  training() {
    return this._flag("E", 2);
  }

  underDarkSwarm() {
    return this._flag("E", 1);
  }

  underDisruptionWeb() {
    return this._flag("E", 0);
  }

  underStorm() {
    return this._flag("F", 7);
  }

  powered() {
    return this._flag("F", 6);
  }

  upgrading() {
    return this._flag("F", 5);
  }

  nukeArmed() {
    return this._flag("F", 4);
  }

  hallucination() {
    return this._flag("F", 3);
  }

  holdingPosition() {
    return this._flag("F", 2);
  }

  underAttack() {
    return this._flag("F", 1);
  }
}

export function BWAPIFrameFromBuffer(view, frameStart) {
  const b = frameStart * BWAPIFrameDataStructSize;

  if (b + BWAPIFrameDataStructSize > view.byteLength) {
    return null;
  }

  const flagsA = view.getUint8(b + 61, true);
  const flagsB = view.getUint8(b + 62, true);
  const flagsC = view.getUint8(b + 63, true);
  const flagsD = view.getUint8(b + 64, true);
  const flagsE = view.getUint8(b + 65, true);
  const flagsF = view.getUint8(b + 66, true);

  return new BWAPIFrame({
    playerId: view.getInt32(b, true),
    repId: view.getInt32(b + 4, true),
    typeId: view.getInt32(b + 8, true),
    alive: view.getUint8(b + 12),
    x: view.getInt32(b + 13, true),
    y: view.getInt32(b + 17, true),
    angle: view.getFloat64(b + 21, true),
    hp: view.getInt32(b + 29, true),
    shields: view.getInt32(b + 33, true),
    energy: view.getInt32(b + 37, true),
    frame: view.getInt32(b + 41, true),
    order: view.getInt32(b + 45, true),
    subOrder: view.getInt32(b + 49, true),
    groundWeaponCooldown: view.getInt32(b + 53, true),
    airWeaponCooldown: view.getInt32(b + 57, true),

    flagsA,
    flagsB,
    flagsC,
    flagsD,
    flagsE,
    flagsF,
  });
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
