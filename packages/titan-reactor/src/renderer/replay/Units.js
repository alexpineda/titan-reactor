import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import { Color } from "three";
import { createMinimapPoint } from "../mesh/Minimap";

const resourceColor = new Color(0, 55, 55);
const flashColor = new Color(200, 200, 200);

class Units {
  constructor(pxToGameUnit, playersById) {
    this.pxToGameUnit = pxToGameUnit;
    this.playersById = playersById;

    this.followingUnit = false;
    this.selected = [];

    this._unitsThisFrame = [];
    this._unitsLastFrame = [];
    this.spriteUnits = [];
    this.minimapPoints = [];
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
      color = unit.recievingDamage
        ? flashColor
        : this.playersById[unitBw.owner].color.three;
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
    }
    unit.minimapPoint.color = color;
    unit.minimapPoint.position.x = this.pxToGameUnit.x(unitBw.x);
    unit.minimapPoint.position.z = this.pxToGameUnit.y(unitBw.y);
    unit.minimapPoint.position.y = 1;
    unit.minimapPoint.userData.tileX = unitBw.tileX;
    unit.minimapPoint.userData.tileY = unitBw.tileY;
    unit.minimapPoint.userData.isResourceContainer = isResourceContainer;

    unit.minimapPoint.matrixAutoUpdate = false;
    unit.minimapPoint.updateMatrix();

    return unit.minimapPoint;
  }

  *refresh(unitsBW, buildQueueBW, units, unitsBySpriteId, production) {
    this.spriteUnits = {};

    for (const unitBw of unitsBW.items()) {
      const isResourceContainer = unitBw.unitType.isResourceContainer;

      let unit;

      if (units.has(unitBw.id)) {
        unit = units.get(unitBw.id);
      } else {
        unit = {
          isResourceContainer: isResourceContainer,
        };
        units.set(unitBw.id, unit);
      }

      if (!unitsBySpriteId.has(unitBw.spriteIndex)) {
        unitsBySpriteId.set(unitBw.spriteIndex, unit);
      }

      unit.recievingDamage = unit.hp > unitBw.hp;
      unit.hp = unitBw.hp;
      unit.id = unitBw.id;
      unit.owner = this.playersById[unitBw.owner];
      unit.isBuilding = unitBw.unitType.isBuilding;
      unit.isFlying = unitBw.isFlying;
      unit.isCloaked = unitBw.isCloaked;
      unit.isFlyingBuilding = unitBw.unitType.isFlyingBuilding;
      unit.warpingIn = 0;
      unit.queue = null;
      unit.remainingBuildTime = unitBw.remainingBuildTime;

      if (
        unitBw.unitType.isBuilding &&
        unitBw.unitType.isProtoss &&
        unitBw.remainingBuildTime &&
        unitBw.remainingBuildTime < 21
      ) {
        unit.warpingIn = 1 - unitBw.remainingBuildTime / 19;
        if (unitBw.remainingBuildTime == 3) {
          unit.warpingIn = 1;
        }
      }

      yield this._refreshMinimap(unitBw, isResourceContainer, unit);
    }

    production.clear();
    for (const buildQueue of buildQueueBW.items()) {
      const unit = units.get(buildQueue.unitId);
      unit.queue = buildQueue.units;
      if (!production.has(unit.owner)) {
        production.set(unit.owner, new Map());
      }

      const player = production.get(unit.owner);
      if (player.has(unit.id)) {
        const queueUnit = player.get(unit.id);
        if (queueUnit.unit.remainingBuildTime > unit.remainingBuildTime) {
          queueUnit.unit = unit;
        }
        queueUnit.count++;
      } else {
        player.set(unit.id, { count: 1, unit });
      }
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
