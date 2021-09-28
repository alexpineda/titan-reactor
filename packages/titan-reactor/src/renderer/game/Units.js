import { unitTypes } from "../../common/types/unitTypes";
import { orders } from "../../common/types/orders";
import { Color } from "three";
import { TrainingQueueType } from "./bw/BuildingQueueCountBW";

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

    this.spriteUnits = [];
    this.minimapPoints = [];

    // for minimap
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.imageData = new ImageData(mapWidth, mapHeight);
    this.resourceImageData = new ImageData(mapWidth, mapHeight);
  }

  _refreshMinimap(unit) {
    const isResourceContainer =
      unit.unitType.isResourceContainer && !unit.owner;
    if (
      !isResourceContainer &&
      !this.fogOfWar.isVisible(unit.tileX, unit.tileY)
    ) {
      return;
    }

    let color;

    if (isResourceContainer) {
      color = resourceColor;
    } else if (unit.unitType.id === unitTypes.scannerSweep) {
      color = scannerColor;
    } else if (unit.owner) {
      color = unit.recievingDamage & 1 ? flashColor : unit.owner.color.three;
    } else {
      return;
    }

    let w = Math.floor(unit.unitType.placementWidth / 32);
    let h = Math.floor(unit.unitType.placementHeight / 32);

    if (unit.unitType.isBuilding) {
      if (w > 4) w = 4;
      if (h > 4) h = 4;
    }
    if (w < 2) w = 2;
    if (h < 2) h = 2;

    if (unit.unitType.id === unitTypes.scannerSweep) {
      w = 6;
      h = 6;
    }

    const unitX = Math.floor(unit.x / 32);
    const unitY = Math.floor(unit.y / 32);
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
    this.imageData.data.fill(0);
    this.resourceImageData.data.fill(0);

    const incompleteUnits = new Map();

    for (const unitBw of unitsBW.instances()) {
      let unit;

      if (units.has(unitBw.id)) {
        unit = units.get(unitBw.id);
      } else {
        unit = {
          remainingBuildTime: 0,
          queue: null,
          idleTime: 0,
        };
        units.set(unitBw.id, unit);
      }

      unitsBySpriteId.set(unitBw.spriteIndex, unit);

      //if receiving damage, blink 3 times, hold blink 3 frames
      if (
        !unit.recievingDamage &&
        (unit.hp > unitBw.hp || unit.shields > unitBw.shields) &&
        unit.typeId === unitBw.typeId // ignore zerg units change hp from egg hp
      ) {
        unit.recievingDamage = 0b000111000111000111;
      } else if (unit.recievingDamage) {
        unit.recievingDamage = unit.recievingDamage >> 1;
      }

      //@todo get a better way to detect initial units, probably via chk or marking initial frame units
      // for use with protoss warp in buildings
      if (!unit.wasConstructing) {
        unit.wasConstructing =
          unit.remainingBuildTime !== unitBw.remainingBuildTime;
      }

      unit.wasFlying = unit.isFlying && !unitBw.isFlying;
      unit.isNowFlying = !unit.isFlying && unitBw.isFlying;
      unit.isFlyingBuilding = unitBw.unitType.isFlyingBuilding;

      // all previous assignments should not be on unitBw, and typically use comparison of old to new values
      Object.assign(unit, unitBw);

      //following assignments should append new data not relevant to previous value
      unit.queue = null;
      unit.loaded = null;
      unit.owner = this.playersById[unit.owner];

      //tank uses build time for siege transition?
      if (
        (unit.typeId === unitTypes.siegeTankSiegeMode ||
          unit.typeId === unitTypes.siegeTankTankMode) &&
        unitBw.isComplete
      ) {
        unit.remainingBuildTime = 0;
      }

      if (unit.order == orders.die && !unit.dieTime) {
        unit.dieTime = Date.now();
      }

      unit.showOnMinimap =
        unit.typeId !== unitTypes.darkSwarm &&
        unit.typeId !== unitTypes.disruptionWeb &&
        unit.order !== orders.die &&
        !unit.unitType.isSubunit;

      unit.canSelect =
        unit.showOnMinimap &&
        //do not allow unit training selection for terran and protoss
        !(
          (unit.unitType.isTerran || unit.unitType.isProtoss) &&
          !unitBw.unitType.isBuilding &&
          unit.remainingBuildTime > 0
        ) &&
        unitBw.typeId !== unitTypes.spiderMine;

      if (
        unit.unitType.isBuilding &&
        unit.unitType.isProtoss &&
        unit.remainingBuildTime < (unit.unitType.buildTime * 2) / 5 &&
        unit.wasConstructing
      ) {
        if (unit.warpingIn === undefined) {
          unit.warpingLen = (unit.unitType.buildTime * 2) / 5;
          unit.warpingIn = 150 + unit.warpingLen;
        } else if (unit.warpingIn > 0) {
          unit.warpingIn = unit.warpingIn - 1;
        }
      }

      //@todo move to worker
      if (unit.showOnMinimap) {
        this._refreshMinimap(unit);
      }

      if (!unitBw.isComplete) {
        incompleteUnits.set(unitBw.id, {
          unitId: unitBw.id,
          typeId: unitBw.typeId,
          remainingBuildTime: unitBw.remainingBuildTime,
          ownerId: unitBw.owner,
        });
      }
    }

    const buildQueue = buildQueueBW.instances();

    // for use in unit details section
    for (const queue of buildQueue) {
      const unit = units.get(queue.unitId);

      if (queue.queueType === TrainingQueueType) {
        unit.queue = queue;
      } else {
        unit.loaded = queue.units.map((id) => units.get(id));
      }
    }

    //@todo move to worker
    // reset each players production list
    unitsInProduction.length = 0;
    unitsInProduction.needsUpdate = true;

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
          existingUnit.remainingBuildTime > incompleteUnit.remainingBuildTime &&
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
}

export default Units;
