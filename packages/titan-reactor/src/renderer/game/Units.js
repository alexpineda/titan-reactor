import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import { Color } from "three";
import { createMinimapPoint } from "../mesh/Minimap";

const resourceColor = new Color(0, 55, 55);
const flashColor = new Color(200, 200, 200);
const blinkRate = 4;

class Units {
  constructor(pxToGameUnit, playersById, mapWidth, mapHeight) {
    this.pxToGameUnit = pxToGameUnit;
    this.playersById = playersById;

    this.followingUnit = false;
    this.selected = [];

    this._unitsThisFrame = [];
    this._unitsLastFrame = [];
    this.spriteUnits = [];
    this.minimapPoints = [];

    // for minimap
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.imageData = new ImageData(mapWidth, mapHeight);
  }

  _refreshMinimap(unitBw, isResourceContainer, unit) {
    if (
      unitBw.unitType.id === unitTypes.darkSwarm ||
      unitBw.unitType.id === unitTypes.disruptionWeb
    ) {
      return;
    }
    let color;

    if (isResourceContainer) {
      color = resourceColor;
    } else if (unitBw.owner < 8) {
      color =
        unit.recievingDamage && Math.floor(unit.recievingDamage / blinkRate) % blinkRate === 0
          ? flashColor
          : this.playersById[unitBw.owner].color.three;
    } else {
      return;
    }

    let w = Math.floor(unitBw.unitType.placementWidth / 32);
    let h = Math.floor(unitBw.unitType.placementHeight / 32);

    if (unitBw.unitType.isBuilding) {
      if (w > 4) w = 4;
      if (h > 4) h = 4;
    }
    if (w < 2) w = 2;
    if (h < 2) h = 2;

    const unitX = Math.floor(unitBw.x / 32);
    const unitY = Math.floor(unitBw.y / 32);
    const wX = Math.floor(w / 2);
    const wY = Math.floor(w / 2);

    for (let x = -wX; x < wX; x++) {
      for (let y = -wY; y < wY; y++) {
        if (unitY + y < 0) continue;
        if (unitX + x < 0) continue;
        if (unitX + x >= this.mapWidth) continue;
        if (unitY + y >= this.mapHeight) continue;

        const pos = ((unitY + y) * this.mapWidth + unitX + x) * 4;
        this.imageData.data[pos] = Math.floor(color.r * 255);
        this.imageData.data[pos + 1] = Math.floor(color.g * 255);
        this.imageData.data[pos + 2] = Math.floor(color.b * 255);
        this.imageData.data[pos + 3] = 255;
      }
    }

    // if (!unit.minimapPoint) {
    //   unit.minimapPoint = createMinimapPoint(color, w, h);
    // }
    // unit.minimapPoint.scale.x = w;
    // unit.minimapPoint.scale.y = h;
    // unit.minimapPoint.material.color = color;
    // unit.minimapPoint.position.x = this.pxToGameUnit.x(unitBw.x);
    // unit.minimapPoint.position.z = this.pxToGameUnit.y(unitBw.y);
    // unit.minimapPoint.position.y = 1;
    // unit.minimapPoint.userData.tileX = unitBw.tileX;
    // unit.minimapPoint.userData.tileY = unitBw.tileY;
    // unit.minimapPoint.userData.isResourceContainer = isResourceContainer;

    // unit.minimapPoint.matrixAutoUpdate = false;
    // unit.minimapPoint.updateMatrix();

    // return unit.minimapPoint;
  }

  *refresh(unitsBW, buildQueueBW, units, unitsBySpriteId, production) {
    this.spriteUnits = {};

    for (let i = 0; i < this.imageData.data.length; i++) {
      this.imageData.data[i] = 0;
    }

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

      if (!unit.recievingDamage && unit.hp > unitBw.hp) {
        unit.recievingDamage = blinkRate * 6;
      } else if (unit.recievingDamage) {
        unit.recievingDamage--;
      }
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
}

export default Units;
