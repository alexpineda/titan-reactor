import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import { Color } from "three";
import { createMinimapPoint } from "../mesh/Minimap";

const resourceColor = new Color(0, 155, 155);

class Units {
  constructor(pxToGameUnit, playerColors) {
    this.pxToGameUnit = pxToGameUnit;
    this.playersById = playerColors;
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

  // @todo implement openbw logic
  // bool unit_visble_on_minimap(unit_t* u) {
  //   if (u->owner < 8 && u->sprite->visibility_flags == 0) return false;
  //   if (ut_turret(u)) return false;
  //   if (unit_is_trap_or_door(u)) return false;
  //   if (unit_is(u, UnitTypes::Spell_Dark_Swarm)) return false;
  //   if (unit_is(u, UnitTypes::Spell_Disruption_Web)) return false;
  //   return true;
  // }

  _refreshMinimap(unitBw, isResourceContainer, unit) {
    let color;

    if (isResourceContainer) {
      color = resourceColor;
    } else if (unitBw.owner < 8) {
      color = this.playersById[unitBw.owner].threeColor;
    } else {
      return;
    }

    let w = unitBw.unitType.placementWidth / 32;
    let h = unitBw.unitType.placementHeight / 32;

    if (unitBw.unitType.isBuilding) {
      if (w > 4) w = 4;
      if (h > 4) h = 4;
    }
    if (w < 2) w = 2;
    if (h < 2) h = 2;

    if (!unit.minimapPoint) {
      unit.minimapPoint = createMinimapPoint(color, w, h);
      if (isResourceContainer) {
        unit.minimapPoint.position.x = this.pxToGameUnit.x(unitBw.x);
        unit.minimapPoint.position.z = this.pxToGameUnit.y(unitBw.y);
        unit.minimapPoint.position.y = 1;
        unit.minimapPoint.matrixAutoUpdate = false;
        unit.minimapPoint.updateMatrix();
      }
    }
    unit.minimapPoint.position.x = this.pxToGameUnit.x(unitBw.x);
    unit.minimapPoint.position.z = this.pxToGameUnit.y(unitBw.y);
    unit.minimapPoint.position.y = 1;

    return unit.minimapPoint;
  }

  *refresh(unitsBW, units, unitsBySpriteId) {
    this.spriteUnits = {};

    for (const unitBw of unitsBW.items()) {
      const isResourceContainer = unitBw.unitType.isResourceContainer;

      let unit;

      if (units.has(unitBw.id)) {
        unit = units.get(unitBw.id);
      } else {
        unit = {
          resource: isResourceContainer,
        };
        units.set(unitBw.id, unit);
      }

      if (!unitsBySpriteId.has(unitBw.spriteIndex)) {
        unitsBySpriteId.set(unitBw.spriteIndex, unit);
      }

      unit.isFlying = unitBw.isFlying;
      unit.isCloaked = unitBw.isCloaked;
      unit.isFlyingBuilding = unitBw.isFlyingBuilding;

      yield this._refreshMinimap(unitBw, isResourceContainer, unit);
    }

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
