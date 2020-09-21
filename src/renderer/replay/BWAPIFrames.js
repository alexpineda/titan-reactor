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

const ConsumingDataView = (dataView, offset = 0, endianness = true) => {
  let bytesConsumed = 0;
  return new Proxy(dataView, {
    get: (target, prop, receiver) => {
      if (typeof target[prop] === "function" && prop.substr(0, 3) === "get") {
        return () => {
          const len = prop.substr(-1) === "8" ? 1 : Number(prop.substr(-2)) / 8;
          const fn = target[prop];
          let result = fn.call(target, offset + bytesConsumed, endianness);
          bytesConsumed = bytesConsumed + len;
          return result;
        };
      } else if (prop === "bytesConsumed") {
        return bytesConsumed;
      } else {
        return Reflect.get(target, prop, receiver);
      }
    },
  });
};

export function BWAPIFrameFromBuffer(dataView, offset) {
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
  const frame = view.getInt32();
  const order = view.getInt32();
  const subOrder = view.getInt32();
  const groundWeaponCooldown = view.getInt32();
  const airWeaponCooldown = view.getInt32();
  const targetRepId = view.getInt32();
  const orderTargetRepId = view.getInt32();
  const getRemainingBuildTime = view.getInt32();
  const flagsA = view.getUint8();
  const flagsB = view.getUint8();
  const flagsC = view.getUint8();
  const flagsD = view.getUint8();
  const flagsE = view.getUint8();
  const flagsF = view.getUint8();

  return {
    frameSize: view.bytesConsumed,
    frameData: new BWAPIFrame({
      playerId,
      repId,
      typeId,
      alive,
      x,
      y,
      angle,
      hp,
      shields,
      energy,
      frame,
      order,
      subOrder,
      groundWeaponCooldown,
      airWeaponCooldown,
      targetRepId,
      orderTargetRepId,
      getRemainingBuildTime,
      flagsA,
      flagsB,
      flagsC,
      flagsD,
      flagsE,
      flagsF,
    }),
  };
}
