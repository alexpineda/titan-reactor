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
    exists: view.getUint8(b + 12),
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
    isAttacking: flagsA & (1 << 7),
    isAccelerating: flagsA & (1 << 6),
    isBraking: flagsA & (1 << 5),
    isBeingConstructed: flagsA & (1 << 4),
    isBeingGathered: flagsA & (1 << 3),
    isBeingHealed: flagsA & (1 << 2),
    isBlind: flagsA & (1 << 1),
    isBurrowed: flagsA & 1,

    isCarryingGas: flagsB & (1 << 7),
    isCarryingMinerals: flagsB & (1 << 6),
    isCloaked: flagsB & (1 << 5),
    isConstructing: flagsB & (1 << 4),
    isCompleted: flagsB & (1 << 3),
    isDefenseMatrixed: flagsB & (1 << 2),
    isDetected: flagsB & (1 << 1),
    isEnsnared: flagsB & 1,

    isFlying: flagsC & (1 << 7), // floating buildings, units
    isGatheringGas: flagsC & (1 << 6), // hide if in refinery
    isGatheringMinerals: flagsC & (1 << 5), // sparks??
    isIdle: flagsC & (1 << 4),
    isIrradiated: flagsC & (1 << 3),
    isLifted: flagsC & (1 << 2), // terran buildings
    isLoaded: flagsC & (1 << 1), // hide if in dropship
    isLockedDown: flagsC & 1,

    isMaelstrommed: flagsD & (1 << 7),
    isMorphing: flagsD & (1 << 6),
    isMoving: flagsD & (1 << 5),
    isParasited: flagsD & (1 << 4),
    isPatrolling: flagsD & (1 << 3),
    isPlagued: flagsD & (1 << 2),
    isInvincible: flagsD & (1 << 1),
    isRepairing: flagsD & 1,

    isResearching: flagsE & (1 << 7),
    isSieged: flagsE & (1 << 6),
    isStartingAttack: flagsE & (1 << 5),
    isStasised: flagsE & (1 << 4),
    isStimmed: flagsE & (1 << 3),
    isTraining: flagsE & (1 << 2), // hide unit
    isUnderDarkSwarm: flagsE & (1 << 1),
    isUnderDisruptionWeb: flagsE & 1,

    isUnderStorm: flagsF & (1 << 7),
    isPowered: flagsF & (1 << 6),
    isUpgrading: flagsF & (1 << 5),
    hasNuke: flagsF & (1 << 4),
    isHallucination: flagsF & (1 << 3),
    isHoldingPosition: flagsF & (1 << 2),
    isUnderAttack: flagsF & (1 << 1),
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
