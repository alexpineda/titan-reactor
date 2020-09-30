import {
  Group,
  Vector3,
  DefaultLoadingManager,
  Color,
  PositionalAudio,
  AudioLoader,
  Mesh,
  MeshBasicMaterial,
  ConeGeometry,
} from "three";
import { disposeMesh } from "../utils/meshes/dispose";
import { IScriptRunner } from "./IScriptRunner";
import { path } from "ramda";
import { iscriptHeaders as headers } from "../../common/bwdat/iscriptHeaders";
import { orders, ordersById } from "../../common/bwdat/orders";
import { DebugLog } from "../utils/DebugLog";
import { angleToDirection } from "../utils/conversions";
import { unitTypeIdByName } from "../../common/bwdat/unitTypes";
const { zergEgg } = unitTypeIdByName;

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
    this.logger = new DebugLog("units");
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

  _spawn(frameData, replaceUnit, skippingFrames) {
    const unit =
      replaceUnit ||
      this.renderUnit.load(
        this.renderUnit.loadFromUnitType
          ? frameData.typeId
          : this.bwDat.units[frameData.typeId].flingy.sprite.image.index
      );

    // unit.matrixAutoUpdate = false;
    // unit.add(new AxesHelper(2));
    unit.userData.current = frameData;
    unit.userData.repId = frameData.repId;
    unit.userData.typeId = frameData.typeId;
    unit.userData.currentOrder = {};
    unit.name = this.bwDat.units[unit.userData.typeId].name;

    unit.userData._active = new Mesh(
      new ConeGeometry(0.5, 2),
      new MeshBasicMaterial({ color: 0xffff00 })
    );
    unit.userData._active.position.y = 4;
    unit.userData._active.rotation.x = Math.PI;
    unit.userData._active.visible = false;
    unit.add(unit.userData._active);

    unit.userData.runner = this._initRunner(
      unit.userData.typeId,
      unit.userData.repId,
      replaceUnit ? replaceUnit.userData.runner.listeners : []
    );
    unit.userData.runner.toAnimationBlock(headers.init);

    // if (this.bwDat.units[frameData.typeId].subUnit1 !== unitTypeIdByName.none) {
    //   const subUnitTypeId = this.bwDat.units[frameData.typeId].subUnit1;

    //   const subUnit = this.renderUnit.load(
    //     this.renderUnit.loadFromUnitType
    //       ? subUnitTypeId
    //       : this.bwDat.units[subUnitTypeId].flingy.sprite.image.index
    //   );
    //   subUnit.position.z = 0.01;
    //   subUnit.userData.runner = this._initRunner( this.bwDat.units[frameData.typeId].subUnit1);
    //   unit.userData.subUnit = subUnit;
    //   unit.add(subUnit);
    // }

    unit.userData.unitMesh.material.opacity = this.bwDat.units[
      frameData.typeId
    ].permanentCloak()
      ? 0.6
      : 1;

    !replaceUnit && this._initAudio(unit);
    this.units.add(unit);
    return unit;
  }

  // zerg spawn
  replaceWith(frameData, unit) {
    unit.remove(unit.userData.unitMesh);
    //@todo dispose any children material from runner spawns

    const {
      userData: { unitMesh },
    } = this.renderUnit.load(
      this.renderUnit.loadFromUnitType
        ? frameData.typeId
        : this.bwDat.units[frameData.typeId].flingy.sprite.image.index
    );

    unit.userData.unitMesh = unitMesh;
    unit.add(unitMesh);
    this._spawn(frameData, unit);
  }

  _initRunner(typeId, repId, listeners = []) {
    return new IScriptRunner(
      this.bwDat,
      path(["flingy", "sprite", "image", "iscript"], this.bwDat.units[typeId]),
      {
        typeId,
        repId,
      },
      {
        image: path(["flingy", "sprite", "image"], this.bwDat.units[typeId]),
      },
      listeners
    );
  }

  //@todo refactor out of event model
  _initAudio(unit) {
    this.logger.assign(unit.userData);
    const unitSound = new PositionalAudio(this.audioListener);
    unit.add(unitSound);

    const playSound = (soundId) => {
      if (unitSound.isPlaying) {
        this.logger.log(
          `%c 🔊 ${soundId}`,
          "background: #ffff00; color: #000000"
        );
        return;
      } else {
        this.logger.log(
          `%c 🔇 ${soundId}`,
          "background: #990000; color: #ffffff"
        );
      }

      this.logger.log(`play sound ${soundId}`);
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

  update(unit, frameData, skippingFrames) {
    this.logger.assign(unit.userData);

    const previous = (unit.userData.previous = unit.userData.current);
    const current = (unit.userData.current = frameData);
    const currentOrder = unit.userData.currentOrder;

    if (window.dbg) {
      unit.userData._active.visible = window.dbg.repId === current.repId;
    }

    if (current.frame > 0 && current.typeId != previous.typeId) {
      this.logger.log(
        `%c ${current.repId} change type ${previous.typeId}->${current.typeId}`,
        "background: #ffff00; color: #000000"
      );
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
    const target = () =>
      this.units.children.find(({ userData }) =>
        [currentOrder.target, currentOrder.orderTarget].includes(userData.repId)
      );
    const targetIsAir = () => {
      const t = target();
      return t && t.userData.current.flying();
    };

    const toAttack = () => {
      targetIsAir() ? run(headers.airAttkInit) : run(headers.gndAttkInit);
    };

    const toIdle = () => {
      if (previous.airWeaponCooldown && currentOrder.lastTargetWasAir) {
        run(headers.airAttkToIdle);
      } else if (
        previous.groundWeaponCooldown &&
        !currentOrder.lastTargetWasAir
      ) {
        run(headers.gndAttkToIdle);
      } else {
        run(headers.walkingToIdle);
      }
    };

    if (angleToDirection(current.angle) !== angleToDirection(previous.angle)) {
      runner.setDirection(angleToDirection(current.angle));
    }
    runner.update();

    //@todo what are teh cases where these get overwritten if these are dispatched on the first frame??
    if (runner.dispatched["gotorepeatattk"]) {
      currentOrder.repeatAttackAfterCooldown = true;
    }

    //@todo needed?
    if (runner.dispatched["attackwith"]) {
      currentOrder.usingWeaponType = runner.dispatched["attackwith"];
    }

    //@todo let die order indicate deaths not other method
    // if (!runner.state.noBrkCode) {
    if (current.order !== previous.order) {
      this.logger.log(
        `%c order ${ordersById[current.order]} <- ${
          ordersById[previous.order]
        }`,
        "background: #222; color: #bada55"
      );

      //items like target are not persisted in bwapi frames, just the initial change
      Object.assign(currentOrder, {
        order: current.order,
        prevOrder: previous.order,
        target: current.target,
        orderTarget: current.orderTarget,
        repeatAttackAfterCooldown: null,
        usingWeaponType: null,
      });

      //for cool down reasons
      if (current.target !== -1 || current.orderTarget !== -1) {
        currentOrder.lastTargetWasAir = targetIsAir();
      }

      switch (current.order) {
        case orders.move:
        case orders.harvest1:
        case orders.harvest2:
        case orders.moveToMinerals:
        case orders.moveToGas:
        case orders.returnMinerals:
        case orders.attackMove:
        case orders.placeBuilding:
        case orders.attack1:
        case orders.attack2:
        case orders.medicHealMove:
          run(headers.walking);
          break;
        case orders.incompleteBuilding:
          //just before zerg drone becomes building
          break;
        case orders.harvestGas:
          break;
        case orders.returnGas:
          break;
        case orders.waitForMinerals:
        case orders.waitForGas:
          run(headers.walkingToIdle);
          break;
        case orders.constructingBuilding:
        case orders.miningMinerals:
          run(headers.almostBuilt);
          break;
        case orders.harvest3:
          run(headers.walkingToIdle);
          break;
        case orders.harvest4:
          break;
        case orders.die:
          console.log("die", unit);
          break;
        case orders.stop:
        case orders.gaurd:
        case orders.playerGaurd:
        case orders.holdPosition:
        case orders.medicHealToIdle:
        case orders.medicHoldPosition:
          toIdle();
          break;
        case orders.medicHeal:
          run(headers.specialState1);
          break;
        case orders.turretGaurd:
        case orders.bunkerGaurd:
        case orders.stopReaver:
        case orders.towerGaurd:
          // toIdle();
          break;
        case orders.attackUnit:
        // if (unit.userData.repId === 3583) {
        //   debugger;
        // }
        case orders.attackFixedRange:
        case orders.attackTile:
          toAttack();
          break;
        case orders.upgrade:
          unitType.terran() && run(headers.working);
          break;
        case orders.buildingLiftOff:
          run(headers.liftOff);
          break;
        case orders.buildingLand:
          run(headers.landing);
          break;
        case orders.zergBirth: //egg->unit or coccoon -> unit
        case orders.zergBuildingMorph:
        case orders.zergUnitMorph: //larva->egg
          break;
        case orders.burrowing:
          run(headers.burrow);
          break;
        case orders.unburrowing:
          run(headers.unBurrow);
          break;
        case orders.burrowed:
          run(headers.specialState2);
          break;
        case orders.larva:
          run(headers.walking);
          break;
      }
      // }

      if (current.subOrder !== previous.subOrder) {
        this.logger.log(`subOrder ${ordersById[current.subOrder]}`);
      }
    }

    this.logger.log(`build time ${current.remainingBuildTime}`);

    if (current.remainingBuildTime) {
      this.logger.log(`build time ${current.remainingBuildTime}`);
    }

    if (current.remainingBuildTime === 17 && current.typeId === zergEgg) {
      run(headers.specialState1);
    }

    if (
      current.remainingBuildTime &&
      unitType.building() &&
      (unitType.zerg() || unitType.terran()) &&
      current.remainingBuildTime / unitType.buildTime < 0.4 &&
      !runner.hasRunAnimationBlockAtLeastOnce[headers.almostBuilt]
    ) {
      run(headers.almostBuilt);
    }

    //@todo check getRemainingBuildType
    if (previous.remainingBuildTime === 1 && unitType.building()) {
      run(headers.built);
    }

    //@todo have a attktoIdle when there is no use weapon type
    // note: airweapon and groundweapon cool down will always equal each other, so don't use them in else if blocks!!
    if (previous.groundWeaponCooldown === 1 && !currentOrder.lastTargetWasAir) {
      if (currentOrder.repeatAttackAfterCooldown) {
        run(headers.gndAttkRpt);
      } else {
        run(headers.gndAttkToIdle);
      }
    }

    if (previous.airWeaponCooldown === 1 && currentOrder.lastTargetWasAir) {
      if (currentOrder.repeatAttackAfterCooldown) {
        run(headers.airAttkRpt);
      } else {
        run(headers.airAttkToIdle);
      }
    }

    let visible = true;
    visible = visible && !current.loaded();
    visible = visible && !(current.order === orders.harvestGas);
    visible = visible && (window.showAlive ? true : current.alive);

    unit.visible = visible;

    this.renderUnit.update(unit);
  }

  updateDeadUnits() {
    this.deadUnits.forEach((unit) => this.update(unit, unit.userData.current));
  }

  killUnit(unit) {
    unit.userData.current.alive = false;
    //@todo send kill signal to runners without interrupting them
    unit.userData.runner.toAnimationBlock(headers.death);
    this.deadUnits.push(unit);
  }

  clear() {
    //@todo dispose without fucking up materials
    this.units.children.forEach((child) => this.units.remove(child));
    this.units.children = [];
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
