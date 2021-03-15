import { unitTypes } from "titan-reactor-shared/types/unitTypes";
import { Color } from "three";

const resourceColor = new Color(0, 55, 55);
const flashColor = new Color(200, 200, 200);
const scannerColor = new Color(0xff0000);

class Units {
  constructor(bwDat, pxToGameUnit, playersById, mapWidth, mapHeight, fogOfWar) {
    this.bwDat = bwDat;
    this.pxToGameUnit = pxToGameUnit;
    this.playersById = playersById;
    this.fogOfWar = fogOfWar;

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
    this.resourceImageData = new ImageData(mapWidth, mapHeight);
  }

  _refreshMinimap(unitBw, isResourceContainer, unit) {
    if (
      unitBw.unitType.id === unitTypes.darkSwarm ||
      unitBw.unitType.id === unitTypes.disruptionWeb
    ) {
      return;
    }
    if (
      !isResourceContainer &&
      !this.fogOfWar.isVisible(unitBw.tileX, unitBw.tileY)
    ) {
      return;
    }

    let color;

    if (isResourceContainer) {
      color = resourceColor;
    } else if (unitBw.unitType.id === unitTypes.scannerSweep) {
      color = scannerColor;
    } else if (unitBw.owner < 8) {
      color =
        unit.recievingDamage & 1
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

    if (unitBw.unitType.id === unitTypes.scannerSweep) {
      w = 6;
      h = 6;
    }

    const unitX = Math.floor(unitBw.x / 32);
    const unitY = Math.floor(unitBw.y / 32);
    const wX = Math.floor(w / 2);
    const wY = Math.floor(w / 2);

    let imageData = this.imageData;
    let alpha = 255;
    if (isResourceContainer) {
      imageData = this.resourceImageData;
      alpha = 150;
    }

    for (let x = -wX; x < wX; x++) {
      for (let y = -wY; y < wY; y++) {
        if (unitY + y < 0) continue;
        if (unitX + x < 0) continue;
        if (unitX + x >= this.mapWidth) continue;
        if (unitY + y >= this.mapHeight) continue;

        const pos = ((unitY + y) * this.mapWidth + unitX + x) * 4;

        imageData.data[pos] = Math.floor(color.r * 255);
        imageData.data[pos + 1] = Math.floor(color.g * 255);
        imageData.data[pos + 2] = Math.floor(color.b * 255);
        imageData.data[pos + 3] = alpha;
      }
    }

    return;
  }

  refresh(
    unitsBW,
    buildQueueBW,
    units,
    unitsBySpriteId,
    unitsInProduction,
    frame
  ) {
    this.spriteUnits = {};

    this.imageData.data.fill(0);
    this.resourceImageData.data.fill(0);

    const incompleteUnits = new Map();

    for (const unitBw of unitsBW.instances()) {
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

      unitsBySpriteId.set(unitBw.spriteIndex, unit);

      //if receiving damage, blink 3 times, hold blink 3 frames
      if (!unit.recievingDamage && unit.hp > unitBw.hp) {
        unit.recievingDamage = 0b000111000111000111;
      } else if (unit.recievingDamage) {
        unit.recievingDamage = unit.recievingDamage >> 1;
      }
      unit.hp = unitBw.hp;
      unit.id = unitBw.id;
      unit.id = unitBw.unitType;
      unit.owner = this.playersById[unitBw.owner];
      unit.isBuilding = unitBw.unitType.isBuilding;
      unit.wasFlying = unit.isFlying && !unitBw.isFlying;
      unit.isNowFlying = !unit.isFlying && unitBw.isFlying;
      unit.isFlying = unitBw.isFlying;
      unit.isCloaked = unitBw.isCloaked;
      unit.isFlyingBuilding = unitBw.unitType.isFlyingBuilding;
      unit.warpingIn = 0;
      unit.queue = null;
      unit.remainingBuildTime = unitBw.remainingBuildTime;
      unit.angle = unitBw.angle;

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

      this._refreshMinimap(unitBw, isResourceContainer, unit);

      if (!unitBw.isComplete) {
        incompleteUnits.set(unitBw.id, {
          unitId: unitBw.id,
          typeId: unitBw.typeId,
          remainingBuildTime: unitBw.remainingBuildTime,
          ownerId: unitBw.owner,
        });
      }
    }

    if (frame % 8 === 0) {
      // reset each players production list
      unitsInProduction.length = 0;
      unitsInProduction.needsUpdate = true;

      const buildQueue = buildQueueBW.instances();

      for (const [id, incompleteUnit] of incompleteUnits) {
        const queued = buildQueue.find(
          ({ unitId }) => unitId === incompleteUnit.unitId
        );
        const typeId = queued ? queued.units[0] : incompleteUnit.typeId;
        const unitType = this.bwDat.units[typeId];
        if (unitType.isSubunit) continue;

        const existingUnit = unitsInProduction.find(
          (u) => u.ownerId === incompleteUnit.ownerId && u.typeId === typeId
        );

        if (existingUnit) {
          existingUnit.count++;
          if (
            existingUnit.remainingBuildTime >
              incompleteUnit.remainingBuildTime &&
            incompleteUnit.remainingBuildTime
          ) {
            existingUnit.remainingBuildTime = incompleteUnit.remainingBuildTime;
          }
        } else {
          unitsInProduction.push({
            ...incompleteUnit,
            typeId,
            icon: typeId,
            count: 1,
            buildTime: unitType.buildTime,
          });
        }
      }
      unitsInProduction.sort((a, b) => {
        const ax = this.bwDat.units[a.typeId].buildScore;
        const bx = this.bwDat.units[b.typeId].buildScore;

        return bx - ax;
      });
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