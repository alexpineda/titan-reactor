import ConsumingDataView from "../utils/ConsumingDataView";

const buildTypes = {
  build: 1,
  research: 2,
  train: 3,
  upgrade: 4,
};

export default class BWAPIUnit {
  constructor(data) {
    Object.assign(this, data);

    if (this.remainingBuildType === buildTypes.research) {
      this.remainingResearchTime = this.remainingBuildTime;
      this.remainingBuildTime = 0;
    } else if (this.remainingBuildType === buildTypes.train) {
      this.remainingTrainTime = this.remainingBuildTime;
      this.remainingBuildTime = 0;
    } else if (this.remainingBuildType === buildTypes.upgrade) {
      this.remainingUpgradeTime = this.remainingBuildTime;
      this.remainingBuildTime = 0;
    }
  }

  _flag(flag, shift) {
    return !!(this[`flags${flag}`] & (1 << shift));
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

export function BWAPIUnitFromBuffer(dataView, offset) {
  const view = ConsumingDataView(dataView, offset);

  const playerId = view.getInt32();
  const repId = view.getInt32();
  const typeId = view.getInt32();
  const alive = view.getUint8();
  const x = view.getInt32();
  const y = view.getInt32();
  const angle = view.getFloat64();
  const hp = view.getInt32();
  const shields = view.getInt32();
  const energy = view.getInt32();
  const order = view.getInt32();
  const subOrder = view.getInt32();
  const groundWeaponCooldown = view.getInt32();
  const airWeaponCooldown = view.getInt32();
  const target = view.getInt32();
  const orderTarget = view.getInt32();
  const remainingBuildTime = view.getInt32();
  const remainingBuildType = view.getInt8();
  const orderState = view.getUint8();
  const secondaryOrderState = view.getUint8();
  const anim = view.getUint8();
  const resources = view.getInt32();

  const flagsA = view.getUint8();
  const flagsB = view.getUint8();
  const flagsC = view.getUint8();
  const flagsD = view.getUint8();
  const flagsE = view.getUint8();
  const flagsF = view.getUint8();

  return {
    frameSize: view.bytesConsumed,
    frameData: new BWAPIUnit({
      playerId,
      repId,
      typeId,
      alive,
      x,
      y,
      angle,
      angleRad: -angle + Math.PI / 2,
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
    }),
  };
}

export function BWAPIBulletFromBuffer(dataView, offset) {
  const view = ConsumingDataView(dataView, offset);

  const playerId = view.getInt32();
  const repId = view.getInt32();
  const typeId = view.getInt32();
  const alive = view.getUint8();
  const x = view.getInt32();
  const y = view.getInt32();
  const angle = view.getFloat64();
  const timer = view.getInt32();
  const sourceUnitRepId = view.getInt32();
  const targetUnitRepId = view.getInt32();

  return {
    frameSize: view.bytesConsumed,
    frameData: new BWAPIUnit({
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
    }),
  };
}
