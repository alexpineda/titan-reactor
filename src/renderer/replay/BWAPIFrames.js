export const BWAPIFrameDataStructSize = 59;

export function BWAPIFrameFromBuffer(view, frameStart) {
  const b = frameStart * BWAPIFrameDataStructSize;

  if (b + BWAPIFrameDataStructSize > view.byteLength) {
    return null;
  }

  const flagsA = view.getUint8(b + 53, true);
  const flagsB = view.getUint8(b + 54, true);
  const flagsC = view.getUint8(b + 55, true);
  const flagsD = view.getUint8(b + 56, true);
  const flagsE = view.getUint8(b + 57, true);
  const flagsF = view.getUint8(b + 58, true);

  return {
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

    flagsA,
    flagsB,
    flagsC,
    flagsD,
    flagsE,
    flagsF,
    attacking: flagsA & (1 << 7),
    accelerating: flagsA & (1 << 6),
    braking: flagsA & (1 << 5),
    beingConstructed: flagsA & (1 << 4),
    beingGathered: flagsA & (1 << 3),
    beingHealed: flagsA & (1 << 2),
    blind: flagsA & (1 << 1),
    burrowed: flagsA & 1,

    carryingGas: flagsB & (1 << 7),
    carryingMinerals: flagsB & (1 << 6),
    cloaked: flagsB & (1 << 5),
    constructing: flagsB & (1 << 4),
    completed: flagsB & (1 << 3),
    defenseMatrixed: flagsB & (1 << 2),
    detected: flagsB & (1 << 1),
    ensnared: flagsB & 1,

    flying: flagsC & (1 << 7), // floating buildings, units
    gatheringGas: flagsC & (1 << 6), // hide if in refinery
    gatheringMinerals: flagsC & (1 << 5), // sparks??
    idle: flagsC & (1 << 4),
    irradiated: flagsC & (1 << 3),
    lifted: flagsC & (1 << 2), // terran buildings
    loaded: flagsC & (1 << 1), // hide if in dropship
    lockedDown: flagsC & 1,

    maelstrommed: flagsD & (1 << 7),
    morphing: flagsD & (1 << 6),
    moving: flagsD & (1 << 5),
    parasited: flagsD & (1 << 4),
    patrolling: flagsD & (1 << 3),
    plagued: flagsD & (1 << 2),
    invincible: flagsD & (1 << 1),
    repairing: flagsD & 1,

    researching: flagsE & (1 << 7),
    sieged: flagsE & (1 << 6),
    startingAttack: flagsE & (1 << 5),
    stasised: flagsE & (1 << 4),
    stimmed: flagsE & (1 << 3),
    training: flagsE & (1 << 2), // hide unit
    underDarkSwarm: flagsE & (1 << 1),
    underDisruptionWeb: flagsE & 1,

    underStorm: flagsF & (1 << 7),
    powered: flagsF & (1 << 6),
    upgrading: flagsF & (1 << 5),
    nukeArmed: flagsF & (1 << 4),
    hallucination: flagsF & (1 << 3),
    holdingPosition: flagsF & (1 << 2),
    underAttack: flagsF & (1 << 1),
  };
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
