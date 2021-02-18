import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import { difference } from "ramda";
import { Color } from "three";
import { createMinimapPoint } from "../mesh/Minimap";

class Units {
  constructor(pxToGameUnit, playerColors, add) {
    this.pxToGameUnit = pxToGameUnit;
    this.playerColors = playerColors;
    this.add = add;
    this._unitsByRepId = {};
    this._deadUnitIds = [];

    this.followingUnit = false;
    this.selected = [];

    this._unitsThisFrame = [];
    this._unitsLastFrame = [];
    this.spriteUnits = [];
    this.minimapPoints = [];
  }

  get units() {
    return Object.values(this._unitsByRepId);
  }

  _refreshMinimap(unit, isResourceContainer) {
    let color;

    let minimapPoint = this.minimapPoints[unit.index];
    if (minimapPoint) {
      if (!minimapPoint.matrixAutoUpdate) {
        return;
      }
      minimapPoint.position.x = this.pxToGameUnit.x(unit.x);
      minimapPoint.position.z = this.pxToGameUnit.y(unit.y);
      minimapPoint.position.y = 1;
      return;
    }

    if (isResourceContainer) {
      color = new Color(0, 255, 255);
    } else if (unit.owner < 8) {
      color = new Color(this.playerColors[unit.owner]);
    } else {
      return;
    }

    let w = unit.unitType.placementWidth / 32;
    let h = unit.unitType.placementHeight / 32;

    if (unit.unitType.isBuilding) {
      if (w > 4) w = 4;
      if (h > 4) h = 4;
    }
    if (w < 2) w = 2;
    if (h < 2) h = 2;

    minimapPoint = createMinimapPoint(color, w, h);
    minimapPoint.position.x = this.pxToGameUnit.x(unit.x);
    minimapPoint.position.z = this.pxToGameUnit.y(unit.y);
    minimapPoint.position.y = 1;
    if (isResourceContainer) {
      minimapPoint.matrixAutoUpdate = false;
      minimapPoint.updateMatrix();
    }
    this.minimapPoints[unit.index] = minimapPoint;
    this.add(minimapPoint);
  }

  refresh(unitsBW, refreshMinimap) {
    this._unitsThisFrame.length = 0;
    this.spriteUnits.length = 0;

    for (const unit of unitsBW.items()) {
      const isResourceContainer = unit.unitType.isResourceContainer;

      this._unitsThisFrame.push(unit.index);
      this.spriteUnits[unit.spriteIndex] = {
        flying: unit.isFlying,
        resource: isResourceContainer,
      };
      if (refreshMinimap) {
        this._refreshMinimap(unit, isResourceContainer);
      }
    }

    for (let index of difference(this._unitsLastFrame, this._unitsThisFrame)) {
      if (this.minimapPoints[index]) {
        this.minimapPoints[index].remove();
      }
    }

    this._unitsLastFrame = [...this._unitsThisFrame];

    // if (this.selected.length) {
    //   this.selected = this.selected.filter((unit) => !deadUnits.includes(unit));
    //   if (this.selected.length === 0 && this.followingUnit) {
    //     this.followingUnit = false;
    //   }
    // }
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
