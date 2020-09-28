import {
  Group,
  Vector3,
  DefaultLoadingManager,
  Color,
  PositionalAudio,
  AudioLoader,
} from "three";
import { disposeMesh } from "../utils/meshes/dispose";
import { IScriptRunner } from "./IScriptRunner";
import { path } from "ramda";
import { iscriptHeaders as headers } from "../../common/bwdat/iscriptHeaders";
import { orders, ordersById } from "../../common/bwdat/orders";
import { DebugLog } from "../utils/DebugLog";

const red = new Color(0x990000);
const green = new Color(0x009900);
const white = new Color(0x999999);

export class ReplayUnits {
  constructor(
    bwDat,
    renderUnit,
    getTerrainY,
    audioListener,
    audioPool = {},
    loadingManager = DefaultLoadingManager
  ) {
    this.units = new Group();
    this.deadUnits = [];
    this.getTerrainY = getTerrainY;
    this.shear = new Vector3(0, 0, 0);
    this.bwDat = bwDat;
    this.audioListener = audioListener;
    this.loadingManager = loadingManager;
    // more of a cache for the moment
    this.audioPool = audioPool;
    this.renderUnit = renderUnit;

    //@todo refactor out
    this.renderUnit.loadAssets && this.renderUnit.loadAssets();
  }

  spawnIfNotExists(frameData) {
    const exists = this.units.children.find(
      (child) => child.userData.repId === frameData.repId
    );
    return exists || this.spawn(frameData);
  }

  spawn(frameData) {
    return this._spawn(frameData);
  }

  _spawn(frameData, replacingUnitType) {
    const unit = replacingUnitType || this.renderUnit.load(frameData.typeId);
    // unit.matrixAutoUpdate = false;
    // unit.add(new AxesHelper(2));

    unit.userData.current = frameData;
    unit.userData.repId = frameData.repId;
    unit.userData.typeId = frameData.typeId;
    unit.name = this.bwDat.units[unit.userData.typeId].name;

    unit.userData.runner = new IScriptRunner(
      this.bwDat,
      path(
        ["flingy", "sprite", "image", "iscript"],
        this.bwDat.units[unit.userData.typeId]
      ),
      {
        typeId: unit.userData.typeId,
        repId: unit.userData.repId,
        lifted: () => unit.userData.current.lifted(),
        direction: () =>
          Math.floor(
            (((unit.userData.current.angle + (Math.PI * 1) / 2) %
              (Math.PI * 2)) /
              (Math.PI * 2)) *
              32
          ),
      },
      {
        image: path(
          ["flingy", "sprite", "image"],
          this.bwDat.units[unit.userData.typeId]
        ),
      }
    );
    unit.userData.runner.toAnimationBlock(headers.init);
    // unit.visible = false;

    !replacingUnitType && this._initAudio(unit);
    this.units.add(unit);
    return unit;
  }

  _initAudio(unit) {
    const unitSound = new PositionalAudio(this.audioListener);
    unit.add(unitSound);

    const playSound = (soundId) => {
      if (unitSound.isPlaying) {
        return;
      }
      if (this.audioPool[soundId]) {
        unitSound.setBuffer(this.audioPool[soundId]);
        unitSound.play();
        return;
      }

      const audioLoader = new AudioLoader(this.loadingManager);
      audioLoader.load(
        `./sound/${this.bwDat.sounds[soundId].file}`,
        (buffer) => {
          this.audioPool[soundId] = buffer;
          unitSound.setBuffer(buffer);
          unitSound.setRefDistance(10);
          unitSound.setRolloffFactor(2.2);
          unitSound.setDistanceModel("exponential");
          unitSound.setVolume(1);
          unitSound.play();
        }
      );
    };
    unit.userData.runner.on("playsnd", playSound);
    unit.userData.runner.on("playsndbtwn", playSound);
    unit.userData.runner.on("playsndrand", playSound);
    unit.userData.runner.on("attackmelee", playSound);
  }

  // zerg spawn
  replaceWith(frameData, unit) {
    unit.remove(unit.userData.unitMesh);
    //@todo dispose any children material from runner spawns

    const {
      userData: { unitMesh },
    } = this.renderUnit.load(frameData.typeId);

    unit.userData.unitMesh = unitMesh;
    unit.add(unitMesh);
    this._spawn(frameData, unit);
  }

  update(unit, frameData) {
    const logger = new DebugLog(unit);
    const previous = (unit.userData.previous = unit.userData.current);
    const current = (unit.userData.current = frameData);
    current.lastOrder = previous.lastOrder;

    if (current.frame > 0 && current.typeId != previous.typeId) {
      this.replaceWith(current, unit);
    }

    const runner = unit.userData.runner;
    const unitType = this.bwDat.units[unit.userData.typeId];

    const x = current.x / 32 - 64;
    const z = current.y / 32 - 64;

    //@todo consider setting frame floor once to the lowest frame
    const y = unitType.flyer() || current.lifted() ? 6 : this.getTerrainY(x, z);
    const position = new Vector3(x, y, z);
    const rotationY = -current.angle + Math.PI / 2;

    unit.position.copy(position);
    unit.rotation.y = rotationY;

    unit.visible = window.showAlive ? true : current.alive;
    unit.visible = unit.visible && !current.loaded();

    // const rotation = new Quaternion();
    // rotation.setFromEuler(new Euler(0, rotationY, 0));

    // const rotScaleTranslation = new Matrix4();
    // rotScaleTranslation.compose(position, rotation, new Vector3(1, 1, 1));
    // unit.matrix
    //   .makeShear(this.shear.x, 0, this.shear.z)
    //   .multiply(rotScaleTranslation);
    // unit.matrix.copy(rotScaleTranslation);
    // unit.updateMatrix();

    unit.userData.movement = new Vector3();
    unit.userData.nextPosition = new Vector3();
    unit.userData.nextPosition.copy(unit.position);

    const isNow = (prop) => current[prop]() && !previous[prop]();
    const was = (prop) => !current[prop]() && previous[prop]();
    const run = (section) => runner.toAnimationBlock(section);
    const order = (orderType) =>
      current.order !== previous.order && orderType === current.order;
    const target = this.units.children.find(
      ({ userData }) =>
        userData.repId === (current.targetRepId || current.orderTargetRepId)
    );
    const targetIsAir = () => {
      if (target) {
        return target.userData.current.flying();
      }
    };
    const usingWeaponType = (air) =>
      current.groundWeaponCooldown && air && targetIsAir();

    const toIdle = (header) => {
      if (header) {
        run(header);
      } else if (usingWeaponType()) {
        run(headers.gndAttkToIdle);
      } else if (usingWeaponType(true)) {
        run(headers.airAttkToIdle);
      } else if (current.moving()) {
        run(headers.walkingToIdle);
      }
      //workingToIdle
    };

    const toAttack = () => {
      targetIsAir() ? run(headers.airAttkInit) : run(headers.gndAttkInit);
    };

    //@todo let die order indicate deaths not other method
    if (!runner.state.noBrkCode) {
      if (current.order !== previous.order) {
        current.lastOrder = previous.order;
        logger.log("units", `order ${ordersById[current.order]}`);

        switch (current.order) {
          case orders.harvest1:
          case orders.moveToMinerals:
            run(headers.walking);
            break;
          case orders.die:
            console.log("die", unit);
            break;
          case orders.stop:
          case orders.gaurd:
          case orders.playerGaurd:
          case orders.turretGaurd:
          case orders.bunkerGaurd:
          case orders.stopReaver:
          case orders.towerGaurd:
            toIdle();
            break;
          case orders.attack1:
          case orders.attack2:
          case orders.attackUnit:
          case orders.attackFixedRange:
          case orders.attackTile:
            toAttack();
            break;
          case orders.buildingLiftOff:
            run(headers.liftOff);
            break;
          case orders.buildingLand:
            run(headers.landing);
            break;
          case orders.zergBirth:
          case orders.zergBuildingMorph:
          case orders.zergUnitMorph:
            logger.log("units", "zerg details", unit);
            break;
        }
      }

      if (current.subOrder !== previous.subOrder) {
        logger.log("units", `subOrder ${ordersById[current.subOrder]}`);
      }
      // if (
      //   current.groundWeaponCooldown &&
      //   !previous.groundWeaponCooldown &&
      //   !targetIsAir()
      // ) {
      //   run(headers.gndAttkInit);
      // } else if (
      //   current.airWeaponCooldown &&
      //   !previous.airWeaponCooldown &&
      //   targetIsAir()
      // ) {
      //   run(headers.airAttkInit);
      // }

      // if (
      //   !current.groundWeaponCooldown &&
      //   previous.groundWeaponCooldown &&
      //   !targetIsAir()
      // ) {
      //   if (runner.state.repeatAttackAfterCooldown) {
      //     run(headers.gndAttkRpt);
      //   } else {
      //     run(headers.gndAttkToIdle);
      //   }
      // } else if (
      //   !current.airWeaponCooldown &&
      //   previous.airdWeaponCooldown &&
      //   targetIsAir()
      // ) {
      //   if (runner.state.repeatAttackAfterCooldown) {
      //     run(headers.airAttkRpt);
      //   } else {
      //     run(headers.airAttkToIdle);
      //   }
      // }

      // if (isNow("moving")) {
      //   run(headers.walking);
      // } else if (was("moving")) {
      //   run(headers.walkingToIdle);
      // }

      // if (isNow("burrowed")) {
      //   run(headers.burrow);
      // } else if (was("burrowed")) {
      //   run(headers.unBurrow);
      // }

      if (isNow("completed")) {
        // unit.visible = true;
        if (unitType.building()) {
          run(headers.built);
        }
      }

      // if (current.frame === 0) {
      //   unit.visible = true;
      // }

      //@todo verify validity for zerg & protoss
      // if (
      //   current.remainingBuildTime &&
      //   unitType.building() &&
      //   (unitType.zerg() || unitType.terran()) &&
      //   current.remainingBuildTime / unitType.buildTime < 0.4 &&
      //   runner.commands.header !== headers.almostBuilt &&
      //   !runner.hasRunAnimationBlockAtLeastOnce[headers.almostBuilt]
      // ) {
      //   run(headers.almostBuilt);
      // }
    }
    /*
    iscriptHeaders.castSpell
    iscriptHeaders.specialState1
    iscriptHeaders.specialState2
    iscriptHeaders.working 
    iscriptHeaders.workingToIdle
    iscriptHeaders.warpIn

    iscriptHeaders.almostBuilt T P?Z?

    iscriptHeaders.enable
    iscriptHeaders.disable

    iscriptHeaders.unused1;
    iscriptHeaders.unused2;
    iscriptHeaders.unused3
    iscriptHeaders.starEditInit

    iscriptHeaders.init X
    iscriptHeaders.death; X
    iscriptHeaders.gndAttkInit; X
    iscriptHeaders.airAttkInit; X
    iscriptHeaders.gndAttkRpt; X
    iscriptHeaders.airAttkRpt; X
    iscriptHeaders.gndAttkToIdle; X
    iscriptHeaders.airAttkToIdle; X
    iscriptHeaders.walking; X
    iscriptHeaders.walkingToIdle; X
    iscriptHeaders.built X
    iscriptHeaders.landing X
    iscriptHeaders.liftOff X
    iscriptHeaders.burrow X
    iscriptHeaders.unBurrow X

    */

    // if (diff("idle")) {
    //   unit.userData.runner.toAnimationBlock(iscriptHeaders.init);
    // }

    runner.update();
    this.renderUnit.update(unit);
  }

  updateDeadUnits() {
    this.deadUnits.forEach((unit) => this.update(unit, unit.userData.current));
  }

  killUnit(unit) {
    unit.userData.current.alive = false;
    //@todo send kill signal to runners without interrupting them
    // unit.userData.runner.toAnimationBlock(headers.death);
    this.deadUnits.push(unit);
  }

  clear() {
    //@todo dispose without fucking up materials
    this.units.children.forEach((child) => this.units.remove(child));
    this.deadUnits = [];
  }

  cameraUpdate({ position }, { target }) {
    const delta = new Vector3();
    this.shear = delta.subVectors(position, target);
  }

  getUnits() {
    return this.units.children;
  }

  killUnits(repIds) {
    if (!repIds || !repIds.length) {
      return;
    }
    this.units.children
      .filter(({ userData }) => repIds.includes(userData.repId))
      .forEach((unit) => this.killUnit(unit));
  }

  dispose() {
    disposeMesh(this.units);
    this.clear();
  }
}

// //#region lepring movement and adjusting position according to terrain
// units.getUnits().forEach((model) => {
//     if (model.userData.nextPosition) {
//       model.position.lerpVectors(
//         model.userData.startPosition,
//         model.userData.nextPosition,
//         (worldFrame % physicsFrameSkip) / physicsFrameSkip
//       );
//     }
//   }

// displacement = {
//   image: floor.material.displacementMap.image
//     .getContext("2d")
//     .getImageData(0, 0, disp.width, disp.height),
//   width: disp.width,
//   scale: floor.material.displacementScale,
// };

// if (worldFloor && worldFrame % 50 === 0) {
//   const testPoint = new Vector3();
//   const raycaster = new THREE.Raycaster(
//     testPoint.addVectors(model.position, new Vector3(0, 20, 0)),
//     new Vector3(0, -1, 0)
//   );
//   const result = raycaster.intersectObject(worldFloor, false);
//   if (result && result.length) {
//     const point = result[0].point;
//     model.position.copy(point.add);
//   }
// }
