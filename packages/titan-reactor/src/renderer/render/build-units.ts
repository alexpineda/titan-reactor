import { Color } from "three";

import { orders, unitTypes } from "../../common/bwdat/enums";
import {
  BwDAT,
  OwnerId,
  Player,
  UnitDAT,
  UnitTag,
} from "../../common/types";
import FogOfWar from "../fogofwar/fog-of-war";
import { UnitStruct } from "../integration/data-transfer";
import { CrapUnit } from "../core";
import { EntityIterator } from "../integration/fixed-data/entity-iterator";
import { tile32 } from "../../common/utils/conversions";

const resourceColor = new Color(0, 55, 55);
const flashColor = new Color(200, 200, 200);
const scannerColor = new Color(0xff0000);

export class BuildUnits {
  private readonly bwDat: BwDAT;
  private readonly playersById: Record<OwnerId, Player>;
  private readonly fogOfWar: FogOfWar;
  private mapWidth: number;
  private mapHeight: number;

  imageData: ImageData;
  resourceImageData: ImageData;

  constructor(
    bwDat: BwDAT,
    playersById: Record<OwnerId, Player>,
    mapWidth: number,
    mapHeight: number,
    fogOfWar: FogOfWar
  ) {
    this.bwDat = bwDat;
    this.playersById = playersById;
    this.fogOfWar = fogOfWar;

    // for minimap
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.imageData = new ImageData(mapWidth, mapHeight);
    this.resourceImageData = new ImageData(mapWidth, mapHeight);
  }

  _refreshMinimap(unit: CrapUnit, unitType: UnitDAT) {
    const isResourceContainer = unitType.isResourceContainer && !unit.owner;
    if (
      !isResourceContainer &&
      !this.fogOfWar.isVisible(tile32(unit.x), tile32(unit.y))
    ) {
      return;
    }

    let color;

    if (isResourceContainer) {
      color = resourceColor;
    } else if (unitType.index === unitTypes.scannerSweep) {
      color = scannerColor;
    } else if (unit.extra.player) {
      color = unit.extra.recievingDamage & 1 ? flashColor : unit.extra.player.color.three;
    } else {
      return;
    }

    let w = Math.floor(unitType.placementWidth / 32);
    let h = Math.floor(unitType.placementHeight / 32);

    if (unitType.isBuilding) {
      if (w > 4) w = 4;
      if (h > 4) h = 4;
    }
    if (w < 2) w = 2;
    if (h < 2) h = 2;

    if (unitType.index === unitTypes.scannerSweep) {
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

  private _getUnit(units: Map<UnitTag, CrapUnit>, unitData: UnitStruct) {
    const unit = units.get(unitData.id);
    if (unit) {
      return unit;
    } else {
      const unit = unitData as CrapUnit;
      // @ts-ignore
      unit.extra = {
        recievingDamage: 0
      };
      units.set(unitData.id, unit);
      return unit;
    }
  }

  refresh(
    //prefilled buffer and accessor
    unitsBW: EntityIterator<UnitStruct>,
    units: Map<UnitTag, CrapUnit>,
    unitsBySpriteId: Map<number, CrapUnit>
  ) {
    // reset unit image data for minimap
    this.imageData.data.fill(0);

    // reset resource image data for minimap
    this.resourceImageData.data.fill(0);

    for (const unitData of unitsBW.instances()) {

      const unit = this._getUnit(units, unitData);
      const dat = this.bwDat.units[unitData.typeId];
      unitsBySpriteId.set(unit.spriteTitanIndex, unit);

      //if receiving damage, blink 3 times, hold blink 3 frames
      if (
        !unit.extra.recievingDamage &&
        (unit.hp > unitData.hp || unit.shields > unitData.shields) &&
        unit.typeId === unitData.typeId // ignore zerg units change hp from egg hp
      ) {
        unit.extra.recievingDamage = 0b000111000111000111;
      } else if (unit.extra.recievingDamage) {
        unit.extra.recievingDamage = unit.extra.recievingDamage >> 1;
      }

      //@todo sort this mess out
      // unit.wasFlying = unitBw.isFlying && !unitBw.isFlying;
      // unit.isNowFlying = !unitBw.isFlying && unitBw.isFlying;

      //following assignments should append new data not relevant to previous value
      // unit.queue = null;
      // unit.loaded = null;

      unit.extra.player = this.playersById[unitData.owner];


      //tank uses build time for siege transition?
      // if (
      //   (unit.typeId === unitTypes.siegeTankSiegeMode ||
      //     unit.typeId === unitTypes.siegeTankTankMode) &&
      //   unitData.statusFlags & UnitFlags.Completed
      // ) {
      //   unit.remainingBuildTime = 0;
      // }

      if (unit.order == orders.die && !unit.extra.timeOfDeath) {
        unit.extra.timeOfDeath = Date.now();
      }

      const showOnMinimap =
        unitData.typeId !== unitTypes.darkSwarm &&
        unitData.typeId !== unitTypes.disruptionWeb &&
        unitData.order !== orders.die &&
        !dat.isSubunit;

      // unit.canSelect =
      //   unit.showOnMinimap &&
      //   //do not allow unit training selection for terran and protoss
      //   !(
      //     (unitDat.isTerran || unitDat.isProtoss) &&
      //     !unitDat.isBuilding &&
      //     unit.remainingBuildTime > 0
      //   ) &&
      //   unitData.typeId !== unitTypes.spiderMine;

      // protoss warping logic
      // if (
      //   unitType.isBuilding &&
      //   unitType.isProtoss &&
      //   unit.remainingBuildTime < (unitType.buildTime * 2) / 5 &&
      //   unit.wasConstructing
      // ) {
      //   if (unit.warpingIn === undefined) {
      //     unit.warpingLen = (unitType.buildTime * 2) / 5;
      //     unit.warpingIn = unit.modifie;
      //   } else if (unit.warpingIn > 0) {
      //     unit.warpingIn = unit.warpingIn - 1;
      //   }
      // }

      //@todo move to worker
      if (showOnMinimap) {
        this._refreshMinimap(unit, dat);
      }

      //bulk assign ok?
      Object.assign(unit, unitData);

      //@todo why are we not returning here earlier?
      // if (!(unitData.statusFlags & UnitFlags.Completed)) {
      //   incompleteUnits.set(unitData.id, {
      //     unitId: unitData.id,
      //     typeId: unitData.typeId,
      //     remainingBuildTime: unitData.remainingBuildTime,
      //     ownerId: unitData.owner,
      //   });
      // }
    }
    // end of unit loop

    // merge units with building and training queues

    // const buildQueue = buildQueueBW.instances() as BuildingQueueStruct[];

    // for use in unit details section
    // for (const queue of buildQueue) {
    //   const unit = units.get(queue.unitId);

    //   if (!unit) continue;

    //   if (queue.queueType === TrainingQueueType) {
    //     unit.queue = queue;
    //   } else {
    //     unit.loaded = queue.units.map((id) => units.get(id));
    //   }
    // }

    //@todo move to worker
    // reset each players production list
    // unitsInProduction.length = 0;

    // for (const [, incompleteUnit] of incompleteUnits) {
    //   const queued = buildQueue.find(
    //     ({ unitId }) => unitId === incompleteUnit.unitId
    //   );
    //   const typeId = queued ? queued.units[0] : incompleteUnit.typeId;
    //   const unitType = this.bwDat.units[typeId];
    //   if (unitType.isSubunit) continue;

    //   const existingUnit = unitsInProduction.find(
    //     (u) => u.ownerId === incompleteUnit.ownerId && u.typeId === typeId
    //   );

    //   if (existingUnit) {
    //     existingUnit.count++;
    //     if (
    //       existingUnit.remainingBuildTime > incompleteUnit.remainingBuildTime &&
    //       incompleteUnit.remainingBuildTime
    //     ) {
    //       existingUnit.remainingBuildTime = incompleteUnit.remainingBuildTime;
    //     }
    //   } else {
    //     unitsInProduction.push({
    //       ...incompleteUnit,
    //       typeId,
    //       icon: typeId,
    //       count: 1,
    //       buildTime: unitType.buildTime,
    //     });
    //   }
    // }

    // // sort production units left to right based on build score
    // unitsInProduction.sort((a, b) => {
    //   const ax = this.bwDat.units[a.typeId].buildScore;
    //   const bx = this.bwDat.units[b.typeId].buildScore;
    //   return bx - ax;
    // });
  }
}

export default BuildUnits;
