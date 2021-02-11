import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import { differenceWith } from "ramda";

class Units {
  constructor(createUnit) {
    this._unitsByRepId = {};
    this._deadUnitIds = [];
    this._createUnit = createUnit;

    //@todo quad tree

    this.followingUnit = false;
    this.selected = [];

    this._unitsThisFrame = [];
    this._unitsLastFrame = [];
  }

  get units() {
    return Object.values(this._unitsByRepId);
  }

  _update(frameData) {
    let unit = this._unitsByRepId[frameData.repId];

    if (!unit) {
      unit = this._createUnit(frameData);
      this._unitsByRepId[unit.repId] = unit;
    } else if (frameData.typeId !== unit.typeId && unit.typeId >= 0) {
      // unit morphed
      unit.sprite.destroyTitanSpriteCb(unit.sprite);
      unit.init(frameData, unit.previous);
    }

    unit.update(frameData);
    return unit;
  }

  refresh(unitsFrameData) {
    this._unitsThisFrame.length = 0;

    for (const frameData of unitsFrameData) {
      const unit = this._update(frameData);
      this._unitsThisFrame.push(unit);
    }

    const deadUnits = differenceWith(
      (x, y) => x === y,
      this._unitsLastFrame,
      this._unitsThisFrame
    );
    this._unitsLastFrame = [...this._unitsThisFrame];

    deadUnits.forEach((unit) => unit.die());

    if (this.selected.length) {
      this.selected = this.selected.filter(
        (unit) => !deadUnits.includes(unit.userData.repId)
      );
      if (this.selected.length === 0 && this.followingUnit) {
        this.followingUnit = false;
      }
    }
  }

  remove(unit) {
    const existingUnit = this._unitsByRepId[unit.repId];
    if (existingUnit) {
      delete this._unitsByRepId[unit.repId];
      this._deadUnitIds.push(unit.repId);
    } else {
      throw new Error("unit does not exist");
    }
  }

  getWorkerCount(player) {
    return this.units.reduce((sum, { playerId, typeId }) => {
      if (
        playerId === player &&
        [unitTypes.scv, unitTypes.drone, unitTypes.probe].includes(typeId)
      ) {
        return sum + 1;
      }
      return sum;
    }, 0);
  }
}

export default Units;
