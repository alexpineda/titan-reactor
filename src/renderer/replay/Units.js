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
import {
  headersById,
  iscriptHeaders as headers,
} from "../../common/bwdat/iscriptHeaders";
import { orders, ordersById } from "../../common/bwdat/orders";
import { DebugLog } from "../utils/DebugLog";
import { angleToDirection } from "../utils/conversions";
import { unitTypeIdByName } from "../../common/bwdat/unitTypes";
import { buildTypes, buildTypesById } from "./BWAPIFrames";
const { zergEgg } = unitTypeIdByName;

const red = new Color(0x990000);
const green = new Color(0x009900);
const white = new Color(0x999999);

export class Units {
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
    // for 2d sprites only
    this.cameraDirection = {
      direction: 0,
      previousDirection: 0,
    };
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

  _spawn(frameData, replaceUnit) {
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

    //unit morphed and its not first frame
    if (current.typeId != previous.typeId && current !== previous) {
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

    if (
      angleToDirection(current.angle) !== angleToDirection(previous.angle) ||
      this.cameraDirection.direction !== this.cameraDirection.previousDirection
    ) {
      runner.setDirection(
        (angleToDirection(current.angle) + this.cameraDirection.direction) % 32
      );
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

    if (current.anim !== previous.anim && headersById[current.anim]) {
      run(current.anim);
    }

    //@todo let die order indicate deaths not other method
    if (!runner.state.noBrkCode) {
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
          case orders.incompleteBuilding:
          case orders.harvestGas:
          case orders.returnGas:
          case orders.waitForMinerals:
          case orders.waitForGas:
          case orders.constructingBuilding:
          case orders.miningMinerals:
          case orders.harvest3:
          case orders.harvest4:
          case orders.die:
          case orders.stop:
          case orders.gaurd:
          case orders.playerGaurd:
          case orders.holdPosition:
          case orders.medicHealToIdle:
          case orders.medicHoldPosition:
          case orders.medic:
          case orders.medicHeal:
          case orders.turretGaurd:
          case orders.bunkerGaurd:
          case orders.stopReaver:
          case orders.towerGaurd:
          case orders.attackFixedRange:
          case orders.attackTile:
          case orders.upgrade:
          case orders.buildingLiftOff:
          case orders.buildingLand:
          case orders.zergBirth: //egg->unit or coccoon -> unit
          case orders.zergBuildingMorph:
          case orders.zergUnitMorph: //larva->egg
          case orders.burrowing:
          case orders.unburrowing:
          case orders.burrowed:
          case orders.larva:
            break;
        }
      }

      if (current.subOrder !== previous.subOrder) {
        this.logger.log(`subOrder ${ordersById[current.subOrder]}`);
      }
    }

    if (current.remainingBuildTime) {
      this.logger.log(`build time ${current.remainingBuildTime}`);
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
    // unit.userData.runner.toAnimationBlock(headers.death);
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
